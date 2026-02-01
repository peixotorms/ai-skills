---
name: gdpr-compliance
description: Use when handling personal data, user registration, consent forms, cookie banners, data export, account deletion, privacy policies, or any code processing EU/EEA user data — GDPR coding patterns, consent management, data subject rights, privacy by design
---

# GDPR Compliance Coding Guidelines

## 1. Overview

The General Data Protection Regulation (GDPR), effective 25 May 2018, governs how organizations collect, store, process, and delete personal data of individuals in the EU/EEA. It applies to ANY service that processes data of EU/EEA residents, regardless of where the service is hosted. Non-compliance carries penalties of up to 4% of annual global turnover or EUR 20 million, whichever is greater. Every developer writing code that touches user data — names, emails, IP addresses, cookies, device IDs, location data, or any information that can identify a natural person — must follow these patterns.

## 2. The 7 Principles (Art. 5)

| # | Principle | What Developers Must Do |
|---|-----------|------------------------|
| 1 | **Lawfulness, fairness, transparency** | Collect data only with a valid lawful basis (Art. 6). Show clear consent UI. Link to a readable privacy policy before any data collection. |
| 2 | **Purpose limitation** | Collect data for specified, explicit purposes. Use separate consent checkboxes per purpose. Never repurpose collected data without new consent. |
| 3 | **Data minimization** | Collect only what is strictly needed. Remove "nice to have" fields from forms and database schemas. If you do not need a birthdate, do not ask for it. |
| 4 | **Accuracy** | Provide edit-profile endpoints. Validate inputs at collection. Allow users to correct their data at any time. |
| 5 | **Storage limitation** | Define retention periods per data type. Implement automated cleanup jobs. Delete or anonymize data when the retention period expires. |
| 6 | **Integrity & confidentiality** | Encrypt PII at rest and in transit. Enforce role-based access control. Maintain audit logs of data access. |
| 7 | **Accountability** | Document all processing activities. Maintain a Record of Processing Activities (ROPA). Log consent events with timestamps and versions. |

## 3. Lawful Bases for Processing (Art. 6)

| Lawful Basis | When to Use | Code Implication |
|---|---|---|
| **Consent** (Art. 6(1)(a)) | Marketing emails, analytics cookies, non-essential data collection | Explicit opt-in UI, granular per purpose, must be withdrawable |
| **Contract** (Art. 6(1)(b)) | Processing necessary to deliver a service the user signed up for | User registration data, order processing, account management |
| **Legal obligation** (Art. 6(1)(c)) | Tax records, fraud prevention mandated by law | Retain invoices for statutory period even after account deletion |
| **Vital interests** (Art. 6(1)(d)) | Emergency medical situations | Rare in software — almost never the correct basis |
| **Public task** (Art. 6(1)(e)) | Government or public authority functions | Only applies to public sector applications |
| **Legitimate interests** (Art. 6(1)(f)) | Fraud prevention, network security, internal analytics | Requires documented balance test — user rights vs. business need |

### 3.1 Consent Collection Patterns

Consent checkboxes must NEVER be pre-checked. Each purpose requires a separate checkbox.

**HTML — Granular consent form:**

```html
<form id="registration-form" method="POST" action="/api/register">
  <label for="email">Email address *</label>
  <input type="email" id="email" name="email" required>

  <label for="name">Name *</label>
  <input type="text" id="name" name="name" required>

  <!-- Each consent purpose is a separate, unchecked checkbox -->
  <fieldset>
    <legend>Consent preferences</legend>

    <label>
      <input type="checkbox" name="consent_terms" value="1" required>
      I agree to the <a href="/terms" target="_blank">Terms of Service</a> *
    </label>

    <label>
      <input type="checkbox" name="consent_privacy" value="1" required>
      I have read the <a href="/privacy" target="_blank">Privacy Policy</a> *
    </label>

    <label>
      <input type="checkbox" name="consent_marketing" value="0">
      I agree to receive marketing emails (optional)
    </label>

    <label>
      <input type="checkbox" name="consent_analytics" value="0">
      I agree to analytics tracking for service improvement (optional)
    </label>
  </fieldset>

  <button type="submit">Create Account</button>
</form>
```

**SQL — Consent storage schema:**

```sql
CREATE TABLE user_consents (
    id            BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id       BIGINT NOT NULL REFERENCES users(id),
    purpose       VARCHAR(50) NOT NULL,   -- 'marketing', 'analytics', 'third_party_sharing'
    granted       BOOLEAN NOT NULL,
    consent_text  TEXT NOT NULL,           -- exact wording shown to user
    policy_version VARCHAR(20) NOT NULL,  -- 'v2.3' — links consent to specific policy
    ip_address    VARCHAR(45),            -- IPv4 or IPv6
    user_agent    TEXT,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    withdrawn_at  TIMESTAMP NULL,
    INDEX idx_user_purpose (user_id, purpose),
    INDEX idx_purpose_granted (purpose, granted)
);
```

**PHP — Recording consent:**

```php
function recordConsent(int $userId, string $purpose, bool $granted, string $policyVersion): void
{
    $stmt = $pdo->prepare('
        INSERT INTO user_consents (user_id, purpose, granted, consent_text, policy_version, ip_address, user_agent)
        VALUES (:user_id, :purpose, :granted, :consent_text, :policy_version, :ip_address, :user_agent)
    ');
    $stmt->execute([
        'user_id'        => $userId,
        'purpose'        => $purpose,
        'granted'        => $granted ? 1 : 0,
        'consent_text'   => getConsentTextForPurpose($purpose, $policyVersion),
        'policy_version' => $policyVersion,
        'ip_address'     => $_SERVER['REMOTE_ADDR'] ?? null,
        'user_agent'     => $_SERVER['HTTP_USER_AGENT'] ?? null,
    ]);
}
```

**Python — Consent withdrawal:**

```python
def withdraw_consent(user_id: int, purpose: str) -> None:
    """Withdraw consent for a specific purpose. Must be as easy as granting it."""
    db.execute(
        """
        UPDATE user_consents
        SET withdrawn_at = NOW(), granted = FALSE
        WHERE user_id = %s AND purpose = %s AND granted = TRUE AND withdrawn_at IS NULL
        """,
        (user_id, purpose),
    )
    # Stop processing immediately upon withdrawal
    if purpose == "marketing":
        remove_from_mailing_list(user_id)
    elif purpose == "analytics":
        delete_analytics_data(user_id)
```

**Double opt-in for email marketing:**

```python
def request_marketing_consent(email: str) -> None:
    token = secrets.token_urlsafe(32)
    db.execute(
        "INSERT INTO consent_confirmations (email, token, purpose, expires_at) "
        "VALUES (%s, %s, 'marketing', NOW() + INTERVAL 48 HOUR)",
        (email, token),
    )
    send_email(
        to=email,
        subject="Please confirm your subscription",
        body=f"Click to confirm: https://example.com/confirm-consent?token={token}",
    )

def confirm_consent(token: str) -> bool:
    row = db.fetch_one(
        "SELECT email, purpose FROM consent_confirmations "
        "WHERE token = %s AND expires_at > NOW() AND confirmed_at IS NULL",
        (token,),
    )
    if not row:
        return False
    db.execute(
        "UPDATE consent_confirmations SET confirmed_at = NOW() WHERE token = %s",
        (token,),
    )
    user = get_user_by_email(row["email"])
    record_consent(user["id"], row["purpose"], granted=True, policy_version=CURRENT_POLICY)
    return True
```

## 4. Data Subject Rights (Developer Patterns)

### 4.1 Right to Access (Art. 15)

The user can request a copy of ALL personal data you hold about them. Respond within 30 days.

**Python — Data export endpoint:**

```python
@app.route("/api/me/data-export", methods=["POST"])
@login_required
def export_user_data():
    user_id = current_user.id
    data = {
        "profile": db.fetch_one("SELECT name, email, created_at FROM users WHERE id = %s", (user_id,)),
        "consents": db.fetch_all(
            "SELECT purpose, granted, policy_version, created_at, withdrawn_at "
            "FROM user_consents WHERE user_id = %s ORDER BY created_at",
            (user_id,),
        ),
        "orders": db.fetch_all(
            "SELECT order_id, total, currency, created_at FROM orders WHERE user_id = %s",
            (user_id,),
        ),
        "activity_log": db.fetch_all(
            "SELECT action, ip_address, created_at FROM activity_log WHERE user_id = %s",
            (user_id,),
        ),
        "export_metadata": {
            "exported_at": datetime.utcnow().isoformat(),
            "format_version": "1.0",
        },
    }
    return jsonify(data), 200, {"Content-Disposition": "attachment; filename=my-data.json"}
```

**PHP — CSV export:**

```php
function exportUserDataCsv(int $userId): void
{
    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="my-data.csv"');

    $output = fopen('php://output', 'w');

    // Profile
    fputcsv($output, ['Section: Profile']);
    fputcsv($output, ['Name', 'Email', 'Created At']);
    $user = $pdo->prepare('SELECT name, email, created_at FROM users WHERE id = ?');
    $user->execute([$userId]);
    fputcsv($output, $user->fetch(PDO::FETCH_NUM));

    // Consents
    fputcsv($output, []);
    fputcsv($output, ['Section: Consents']);
    fputcsv($output, ['Purpose', 'Granted', 'Policy Version', 'Created At', 'Withdrawn At']);
    $consents = $pdo->prepare('SELECT purpose, granted, policy_version, created_at, withdrawn_at FROM user_consents WHERE user_id = ?');
    $consents->execute([$userId]);
    while ($row = $consents->fetch(PDO::FETCH_NUM)) {
        fputcsv($output, $row);
    }

    fclose($output);
}
```

### 4.2 Right to Rectification (Art. 16)

Users must be able to correct inaccurate personal data.

```python
@app.route("/api/me/profile", methods=["PATCH"])
@login_required
def update_profile():
    allowed_fields = {"name", "email", "phone", "address"}
    updates = {k: v for k, v in request.json.items() if k in allowed_fields}
    if not updates:
        return jsonify({"error": "No valid fields provided"}), 400

    # Validate before updating
    if "email" in updates and not is_valid_email(updates["email"]):
        return jsonify({"error": "Invalid email format"}), 400

    set_clause = ", ".join(f"{k} = %s" for k in updates)
    values = list(updates.values()) + [current_user.id]

    db.execute(f"UPDATE users SET {set_clause}, updated_at = NOW() WHERE id = %s", values)

    # Audit log
    db.execute(
        "INSERT INTO audit_log (user_id, action, details, created_at) VALUES (%s, 'profile_update', %s, NOW())",
        (current_user.id, json.dumps({"fields_updated": list(updates.keys())})),
    )
    return jsonify({"status": "updated"})
```

### 4.3 Right to Erasure / Right to be Forgotten (Art. 17)

Delete personal data. Some data must be retained for legal obligations (e.g., invoices for tax law). Anonymize what you cannot delete.

**Python — Account deletion with selective retention:**

```python
def delete_user_account(user_id: int) -> dict:
    report = {"deleted": [], "anonymized": [], "retained": []}

    # 1. Delete data with no retention requirement
    for table in ["activity_log", "sessions", "password_reset_tokens", "user_preferences"]:
        db.execute(f"DELETE FROM {table} WHERE user_id = %s", (user_id,))
        report["deleted"].append(table)

    # 2. Anonymize data tied to business records
    db.execute(
        "UPDATE orders SET user_name = 'DELETED', user_email = 'DELETED', "
        "ip_address = NULL, user_agent = NULL WHERE user_id = %s",
        (user_id,),
    )
    report["anonymized"].append("orders")

    # 3. Retain invoices for legal obligation (tax law — typically 7 years)
    db.execute(
        "UPDATE invoices SET user_name = 'DELETED', user_email = 'DELETED' WHERE user_id = %s",
        (user_id,),
    )
    report["retained"].append("invoices (anonymized, retained for tax compliance)")

    # 4. Record consent withdrawal
    db.execute(
        "UPDATE user_consents SET withdrawn_at = NOW(), granted = FALSE "
        "WHERE user_id = %s AND withdrawn_at IS NULL",
        (user_id,),
    )

    # 5. Delete the user record
    db.execute("DELETE FROM users WHERE id = %s", (user_id,))
    report["deleted"].append("users")

    # 6. Log the deletion event (without PII)
    db.execute(
        "INSERT INTO deletion_log (user_id_hash, deleted_at, report) VALUES (%s, NOW(), %s)",
        (hashlib.sha256(str(user_id).encode()).hexdigest(), json.dumps(report)),
    )

    return report
```

**SQL — Cascading deletion procedure:**

```sql
-- Run inside a transaction
BEGIN;

DELETE FROM user_sessions WHERE user_id = ?;
DELETE FROM user_consents WHERE user_id = ?;
DELETE FROM activity_log WHERE user_id = ?;
DELETE FROM password_resets WHERE user_id = ?;
DELETE FROM user_preferences WHERE user_id = ?;

-- Anonymize order history (retained for accounting)
UPDATE orders SET
    customer_name = 'DELETED_USER',
    customer_email = NULL,
    shipping_address = NULL,
    ip_address = NULL
WHERE user_id = ?;

-- Delete the user
DELETE FROM users WHERE id = ?;

COMMIT;
```

### 4.4 Right to Data Portability (Art. 20)

Provide data in a structured, commonly used, machine-readable format.

```python
@app.route("/api/me/portable-export", methods=["POST"])
@login_required
def portable_export():
    """Export user data in machine-readable JSON conforming to a documented schema."""
    user_id = current_user.id
    export = {
        "schema_version": "1.0",
        "exported_at": datetime.utcnow().isoformat() + "Z",
        "user": {
            "name": current_user.name,
            "email": current_user.email,
            "created_at": current_user.created_at.isoformat(),
        },
        "content": db.fetch_all(
            "SELECT title, body, created_at, updated_at FROM posts WHERE user_id = %s",
            (user_id,),
        ),
        "files": [
            {"name": f["name"], "url": generate_temp_download_url(f["path"])}
            for f in db.fetch_all("SELECT name, path FROM uploads WHERE user_id = %s", (user_id,))
        ],
    }
    return jsonify(export), 200
```

### 4.5 Right to Restriction of Processing (Art. 18)

Allow users to pause processing of their data without deleting it.

```sql
ALTER TABLE users ADD COLUMN processing_restricted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN restriction_reason TEXT NULL;
ALTER TABLE users ADD COLUMN restricted_at TIMESTAMP NULL;
```

```python
@app.route("/api/me/restrict-processing", methods=["POST"])
@login_required
def restrict_processing():
    reason = request.json.get("reason", "")
    db.execute(
        "UPDATE users SET processing_restricted = TRUE, restriction_reason = %s, "
        "restricted_at = NOW() WHERE id = %s",
        (reason, current_user.id),
    )
    return jsonify({"status": "processing_restricted"})

# Guard in every processing function
def can_process_user_data(user_id: int) -> bool:
    user = db.fetch_one("SELECT processing_restricted FROM users WHERE id = %s", (user_id,))
    if user and user["processing_restricted"]:
        return False  # Data exists but must not be processed
    return True
```

### 4.6 Right to Object (Art. 21)

Users can object to processing based on legitimate interests, including profiling and direct marketing.

```python
@app.route("/api/me/object", methods=["POST"])
@login_required
def object_to_processing():
    purpose = request.json.get("purpose")  # 'marketing', 'profiling', 'analytics'
    if purpose not in ("marketing", "profiling", "analytics"):
        return jsonify({"error": "Invalid purpose"}), 400

    withdraw_consent(current_user.id, purpose)

    if purpose == "marketing":
        remove_from_all_mailing_lists(current_user.id)
    elif purpose == "profiling":
        delete_user_profile_scores(current_user.id)
    elif purpose == "analytics":
        anonymize_analytics_data(current_user.id)

    return jsonify({"status": f"objection_to_{purpose}_recorded"})
```

### 4.7 Right Not to be Subject to Automated Decision-Making (Art. 22)

If you make decisions with legal or significant effects based solely on automated processing, you must offer human review.

```python
def automated_credit_decision(user_id: int) -> dict:
    score = calculate_credit_score(user_id)
    decision = "approved" if score >= 700 else "denied"

    # Store the decision with explanation
    decision_id = db.insert(
        "INSERT INTO automated_decisions "
        "(user_id, decision_type, result, score, factors, created_at) "
        "VALUES (%s, 'credit', %s, %s, %s, NOW())",
        (user_id, decision, score, json.dumps(get_scoring_factors(user_id))),
    )

    return {
        "decision": decision,
        "decision_id": decision_id,
        "explanation": f"Based on your credit score of {score}",
        "human_review_url": f"/api/decisions/{decision_id}/request-review",
    }

@app.route("/api/decisions/<int:decision_id>/request-review", methods=["POST"])
@login_required
def request_human_review(decision_id: int):
    db.execute(
        "UPDATE automated_decisions SET human_review_requested = TRUE, "
        "review_requested_at = NOW() WHERE id = %s AND user_id = %s",
        (decision_id, current_user.id),
    )
    return jsonify({"status": "review_requested", "expected_response_days": 5})
```

## 5. Privacy by Design (Art. 25)

### 5.1 Data Minimization in Schemas

```sql
-- BAD: collecting unnecessary data
CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    gender VARCHAR(20),          -- do you actually need this?
    date_of_birth DATE,          -- do you actually need this?
    social_security_number TEXT, -- almost certainly not
    mother_maiden_name TEXT,     -- no
    favorite_color VARCHAR(50),  -- no
    shoe_size INT                -- absolutely not
);

-- GOOD: collect only what is needed
CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### 5.2 Pseudonymization

Replace direct identifiers with pseudonyms in analytics and logs.

```python
import hashlib

def pseudonymize_user_id(user_id: int, salt: str) -> str:
    """One-way hash for analytics. Store the salt separately with access controls."""
    return hashlib.sha256(f"{salt}:{user_id}".encode()).hexdigest()[:16]

def log_page_view(user_id: int, page: str) -> None:
    pseudo_id = pseudonymize_user_id(user_id, get_analytics_salt())
    db.execute(
        "INSERT INTO page_views (pseudo_user_id, page, viewed_at) VALUES (%s, %s, NOW())",
        (pseudo_id, page),
    )
    # Never log the real user_id in analytics tables
```

### 5.3 Encryption

```python
from cryptography.fernet import Fernet

# Encrypt PII at rest
class EncryptedField:
    def __init__(self, key: bytes):
        self.cipher = Fernet(key)

    def encrypt(self, value: str) -> str:
        return self.cipher.encrypt(value.encode()).decode()

    def decrypt(self, token: str) -> str:
        return self.cipher.decrypt(token.encode()).decode()

# Usage in model
cipher = EncryptedField(key=get_encryption_key())

def store_user(name: str, email: str, phone: str) -> None:
    db.execute(
        "INSERT INTO users (name, email, phone_encrypted) VALUES (%s, %s, %s)",
        (name, email, cipher.encrypt(phone)),
    )
```

### 5.4 Privacy-Friendly Defaults

```javascript
// Default settings for new users — most restrictive
const DEFAULT_PRIVACY_SETTINGS = {
    profile_visibility: "private",   // not "public"
    show_email: false,               // not true
    show_activity: false,            // not true
    allow_marketing: false,          // not true
    allow_analytics: false,          // not true
    allow_third_party_sharing: false // not true
};

function createUserSettings(userId) {
    return db.insert("user_settings", {
        user_id: userId,
        ...DEFAULT_PRIVACY_SETTINGS,
        created_at: new Date().toISOString()
    });
}
```

### 5.5 Separate Storage for Sensitive Data

```sql
-- Main user table (non-sensitive)
CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Sensitive data in separate table with stricter access controls
CREATE TABLE user_pii (
    user_id BIGINT PRIMARY KEY REFERENCES users(id),
    full_name_encrypted BLOB,
    phone_encrypted BLOB,
    address_encrypted BLOB,
    date_of_birth_encrypted BLOB,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Different database credentials for PII table access
-- Application services that do not need PII never get PII DB credentials
```

### 5.6 Purpose-Based Access Control

```python
class DataAccessGuard:
    PURPOSES = {
        "order_fulfillment": ["name", "email", "shipping_address"],
        "billing": ["name", "email", "billing_address", "tax_id"],
        "support": ["name", "email"],
        "analytics": ["pseudo_user_id"],  # no PII
        "marketing": ["email"],  # only if consent granted
    }

    @staticmethod
    def get_allowed_fields(purpose: str) -> list:
        return DataAccessGuard.PURPOSES.get(purpose, [])

    @staticmethod
    def fetch_user_data(user_id: int, purpose: str) -> dict:
        allowed = DataAccessGuard.get_allowed_fields(purpose)
        if not allowed:
            raise PermissionError(f"Unknown purpose: {purpose}")

        if purpose == "marketing":
            if not has_active_consent(user_id, "marketing"):
                raise PermissionError("User has not consented to marketing")

        columns = ", ".join(allowed)
        return db.fetch_one(f"SELECT {columns} FROM users WHERE id = %s", (user_id,))
```

## 6. Consent Management Patterns

### 6.1 Cookie Consent Implementation

```javascript
const COOKIE_CATEGORIES = {
    necessary: {
        label: "Strictly Necessary",
        description: "Required for the website to function. Cannot be disabled.",
        required: true,
        cookies: ["session_id", "csrf_token"]
    },
    analytics: {
        label: "Analytics",
        description: "Help us understand how visitors use our site.",
        required: false,
        cookies: ["_ga", "_gid"]
    },
    marketing: {
        label: "Marketing",
        description: "Used to deliver relevant advertisements.",
        required: false,
        cookies: ["_fbp", "ads_session"]
    }
};

function getConsentState() {
    const stored = getCookie("cookie_consent");
    if (!stored) return null;
    try {
        return JSON.parse(atob(stored));
    } catch {
        return null;
    }
}

function saveConsent(preferences) {
    const record = {
        categories: preferences,
        timestamp: new Date().toISOString(),
        version: PRIVACY_POLICY_VERSION
    };
    setCookie("cookie_consent", btoa(JSON.stringify(record)), 365);

    // Send to server for audit trail
    fetch("/api/consent/cookies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record)
    });

    applyConsentPreferences(preferences);
}

function applyConsentPreferences(preferences) {
    // Load scripts only for consented categories
    if (preferences.analytics) {
        loadAnalyticsScripts();
    } else {
        removeAnalyticsCookies();
    }
    if (preferences.marketing) {
        loadMarketingScripts();
    } else {
        removeMarketingCookies();
    }
}

function removeAnalyticsCookies() {
    COOKIE_CATEGORIES.analytics.cookies.forEach(name => deleteCookie(name));
}

// Show banner only if no consent has been recorded
function initCookieBanner() {
    const consent = getConsentState();
    if (!consent) {
        showCookieBanner();  // must not block access to the site (no cookie wall)
    } else {
        applyConsentPreferences(consent.categories);
    }
}
```

### 6.2 Consent API Endpoints

```python
@app.route("/api/consent", methods=["POST"])
@login_required
def grant_consent():
    purpose = request.json["purpose"]
    granted = request.json["granted"]  # True or False

    recordConsent(
        user_id=current_user.id,
        purpose=purpose,
        granted=granted,
        policy_version=CURRENT_POLICY_VERSION,
    )
    return jsonify({"status": "recorded"})

@app.route("/api/consent", methods=["GET"])
@login_required
def get_consent_status():
    consents = db.fetch_all(
        """
        SELECT purpose, granted, policy_version, created_at, withdrawn_at
        FROM user_consents
        WHERE user_id = %s
        ORDER BY created_at DESC
        """,
        (current_user.id,),
    )
    # Return the latest consent per purpose
    latest = {}
    for c in consents:
        if c["purpose"] not in latest:
            latest[c["purpose"]] = c
    return jsonify({"consents": latest})

@app.route("/api/consent/withdraw", methods=["POST"])
@login_required
def withdraw():
    purpose = request.json["purpose"]
    withdraw_consent(current_user.id, purpose)
    return jsonify({"status": "withdrawn"})
```

### 6.3 Consent Validation Before Processing

```python
def send_marketing_email(user_id: int, campaign_id: int) -> bool:
    consent = db.fetch_one(
        "SELECT granted, withdrawn_at FROM user_consents "
        "WHERE user_id = %s AND purpose = 'marketing' AND granted = TRUE AND withdrawn_at IS NULL "
        "ORDER BY created_at DESC LIMIT 1",
        (user_id,),
    )
    if not consent:
        return False  # No valid consent — do not send

    # Proceed with sending
    queue_email(user_id, campaign_id)
    return True
```

## 7. Data Retention & Deletion

### 7.1 Retention Policy Definition

```python
RETENTION_POLICIES = {
    "sessions":             {"days": 30,   "action": "delete"},
    "activity_log":         {"days": 90,   "action": "delete"},
    "analytics_events":     {"days": 365,  "action": "anonymize"},
    "support_tickets":      {"days": 730,  "action": "anonymize"},  # 2 years
    "invoices":             {"days": 2555, "action": "retain"},     # 7 years (tax law)
    "deleted_user_backups": {"days": 30,   "action": "delete"},
    "consent_records":      {"days": 2555, "action": "retain"},     # 7 years (accountability)
    "password_reset_tokens":{"days": 1,    "action": "delete"},
}
```

### 7.2 Automated Cleanup Job

```python
def run_retention_cleanup():
    """Run daily via cron or scheduled task."""
    for data_type, policy in RETENTION_POLICIES.items():
        cutoff = datetime.utcnow() - timedelta(days=policy["days"])

        if policy["action"] == "delete":
            count = db.execute(
                f"DELETE FROM {data_type} WHERE created_at < %s", (cutoff,)
            )
            log_retention_action(data_type, "deleted", count)

        elif policy["action"] == "anonymize":
            count = db.execute(
                f"UPDATE {data_type} SET user_id = NULL, ip_address = NULL, "
                f"user_agent = NULL WHERE created_at < %s AND user_id IS NOT NULL",
                (cutoff,),
            )
            log_retention_action(data_type, "anonymized", count)

        # "retain" action: do nothing — data is kept for legal obligation
```

### 7.3 Soft Delete vs Hard Delete vs Anonymization

```python
# SOFT DELETE — marks as deleted but data remains (use for grace period)
def soft_delete_user(user_id: int) -> None:
    db.execute(
        "UPDATE users SET deleted_at = NOW(), email = CONCAT('deleted_', id, '@removed.invalid') "
        "WHERE id = %s",
        (user_id,),
    )
    # Schedule hard delete after 30-day grace period
    schedule_job("hard_delete_user", user_id=user_id, run_at=datetime.utcnow() + timedelta(days=30))

# HARD DELETE — permanent removal
def hard_delete_user(user_id: int) -> None:
    for table in ["sessions", "activity_log", "user_preferences", "password_resets"]:
        db.execute(f"DELETE FROM {table} WHERE user_id = %s", (user_id,))
    db.execute("DELETE FROM users WHERE id = %s", (user_id,))

# ANONYMIZE — remove PII but keep the record for analytics/business
def anonymize_user(user_id: int) -> None:
    db.execute(
        "UPDATE users SET name = 'Anonymous', email = CONCAT('anon_', id, '@removed.invalid'), "
        "phone = NULL, address = NULL, ip_address = NULL WHERE id = %s",
        (user_id,),
    )
```

### 7.4 Anonymization Patterns

```sql
-- Replace PII with non-identifying values
UPDATE orders SET
    customer_name = CONCAT('Customer_', MD5(customer_name)),
    customer_email = CONCAT(MD5(customer_email), '@anon.invalid'),
    shipping_address = NULL,
    phone = NULL,
    ip_address = NULL
WHERE user_id = ? AND created_at < DATE_SUB(NOW(), INTERVAL 2 YEAR);

-- For aggregate analytics, remove the ability to re-identify
UPDATE analytics_events SET
    user_id = NULL,
    ip_address = NULL,
    user_agent = NULL,
    session_id = NULL
WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);
```

## 8. Data Breach Notification (Art. 33, Art. 34)

### 8.1 Requirements

- Report to supervisory authority within **72 hours** of becoming aware of a breach (Art. 33).
- Notify affected users **without undue delay** if the breach poses a **high risk** to their rights (Art. 34).

### 8.2 Breach Report Contents

The notification must include:
1. Nature of the breach (what data, how many records, how many individuals).
2. Contact details of the Data Protection Officer.
3. Likely consequences of the breach.
4. Measures taken or proposed to address the breach.

### 8.3 Incident Response Code Patterns

```python
def handle_data_breach(breach_description: str, affected_user_ids: list, severity: str) -> dict:
    breach_id = str(uuid.uuid4())
    detected_at = datetime.utcnow()

    # 1. Log the breach
    db.execute(
        "INSERT INTO breach_log (breach_id, description, severity, affected_count, detected_at) "
        "VALUES (%s, %s, %s, %s, %s)",
        (breach_id, breach_description, severity, len(affected_user_ids), detected_at),
    )

    # 2. Immediate containment — revoke all sessions for affected users
    for user_id in affected_user_ids:
        db.execute("DELETE FROM sessions WHERE user_id = %s", (user_id,))
        db.execute(
            "INSERT INTO forced_actions (user_id, action, breach_id, created_at) "
            "VALUES (%s, 'password_reset_required', %s, NOW())",
            (user_id, breach_id),
        )

    # 3. Revoke API tokens
    db.execute(
        "UPDATE api_tokens SET revoked_at = NOW() WHERE user_id IN %s AND revoked_at IS NULL",
        (tuple(affected_user_ids),),
    )

    # 4. Calculate notification deadline (72 hours from detection)
    notification_deadline = detected_at + timedelta(hours=72)

    # 5. If high severity, notify users directly
    if severity == "high":
        for user_id in affected_user_ids:
            send_breach_notification_email(user_id, breach_id, breach_description)

    return {
        "breach_id": breach_id,
        "detected_at": detected_at.isoformat(),
        "authority_notification_deadline": notification_deadline.isoformat(),
        "affected_users": len(affected_user_ids),
        "actions_taken": ["sessions_revoked", "password_reset_required", "tokens_revoked"],
    }
```

### 8.4 Breach Log Schema

```sql
CREATE TABLE breach_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    breach_id VARCHAR(36) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') NOT NULL,
    affected_count INT NOT NULL,
    data_categories TEXT,              -- 'email, password_hash, name'
    detected_at TIMESTAMP NOT NULL,
    authority_notified_at TIMESTAMP NULL,
    users_notified_at TIMESTAMP NULL,
    resolution TEXT,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

## 9. Cross-Border Data Transfers (Art. 44-49)

### 9.1 Adequacy Decisions

Countries with an EU adequacy decision (data can flow freely): Andorra, Argentina, Canada (PIPEDA), Faroe Islands, Guernsey, Israel, Isle of Man, Japan, Jersey, New Zealand, Republic of Korea, Switzerland, United Kingdom, Uruguay, and the US (EU-US Data Privacy Framework, for certified companies).

### 9.2 When Standard Contractual Clauses (SCCs) Are Needed

If transferring data to a country WITHOUT an adequacy decision, you must implement SCCs or another transfer mechanism (Art. 46).

### 9.3 Data Residency Patterns

```python
# Configuration — restrict data storage to EU regions
DATA_RESIDENCY = {
    "default_region": "eu-west-1",
    "allowed_regions": ["eu-west-1", "eu-central-1", "eu-north-1"],
    "blocked_regions": ["us-east-1", "ap-southeast-1"],
}

def get_storage_region(user_country: str) -> str:
    """Determine storage region based on user location."""
    if user_country in EU_EEA_COUNTRIES:
        return DATA_RESIDENCY["default_region"]
    # For non-EU users, still store in EU if that is your policy
    return DATA_RESIDENCY["default_region"]

def validate_storage_region(region: str) -> bool:
    if region in DATA_RESIDENCY["blocked_regions"]:
        raise ValueError(f"Data storage in {region} is not permitted under GDPR policy")
    return region in DATA_RESIDENCY["allowed_regions"]
```

```sql
-- Add region tracking to user data
ALTER TABLE users ADD COLUMN data_region VARCHAR(20) NOT NULL DEFAULT 'eu-west-1';

-- Ensure queries only access data in permitted regions
-- Application layer must enforce this
```

### 9.4 Third-Party Data Processor Checks

```python
def register_third_party_processor(processor_name: str, country: str, has_scc: bool) -> None:
    """Record third-party processors and their transfer basis."""
    is_adequate = country in ADEQUATE_COUNTRIES

    if not is_adequate and not has_scc:
        raise ValueError(
            f"Cannot register processor in {country} without SCCs or adequacy decision"
        )

    db.execute(
        "INSERT INTO data_processors (name, country, adequate, has_scc, registered_at) "
        "VALUES (%s, %s, %s, %s, NOW())",
        (processor_name, country, is_adequate, has_scc),
    )
```

## 10. Data Protection Impact Assessment (DPIA) (Art. 35)

### 10.1 When a DPIA Is Required

A DPIA is mandatory before processing that is likely to result in a high risk to individuals:
- Large-scale processing of special categories of data (health, biometrics, religion, political opinions).
- Systematic monitoring of a publicly accessible area (CCTV).
- Large-scale profiling with legal or significant effects.
- Automated decision-making with legal effects.
- Processing of children's data at scale.
- Combining datasets from different sources.

### 10.2 What to Document

```python
DPIA_TEMPLATE = {
    "project_name": "",
    "description": "",
    "data_categories": [],             # personal, special category, children
    "processing_purposes": [],
    "lawful_basis": "",                # consent, contract, legitimate interest, etc.
    "data_subjects": "",               # customers, employees, children, etc.
    "data_volume": "",                 # approximate number of records
    "retention_period": "",
    "third_parties": [],               # processors and their countries
    "risks": [
        {
            "risk": "",
            "likelihood": "",          # low, medium, high
            "impact": "",              # low, medium, high
            "mitigation": "",
        }
    ],
    "security_measures": [],           # encryption, access control, pseudonymization
    "dpo_consulted": False,
    "supervisory_authority_consulted": False,
    "assessment_date": "",
    "review_date": "",                 # DPIAs must be reviewed periodically
}
```

### 10.3 Risk Assessment in Code Reviews

When reviewing code that processes personal data, check:

```text
[ ] Is there a lawful basis for this processing?
[ ] Is the data minimized — only collecting what is needed?
[ ] Is there a defined retention period?
[ ] Is the data encrypted at rest and in transit?
[ ] Are access controls in place (who can read this data)?
[ ] Is there a deletion path for this data?
[ ] If consent-based, can the user withdraw consent?
[ ] Is the data exported to any third party? If so, is there an SCC or adequacy basis?
[ ] Are there audit logs for access to this data?
[ ] If this involves automated decisions, is there a human review path?
```

## 11. Common Mistakes

| # | Mistake | Why It Violates GDPR | Fix |
|---|---------|---------------------|-----|
| 1 | Pre-checked consent checkboxes | Consent must be a clear affirmative act (Art. 4(11), Recital 32) | All consent checkboxes must default to unchecked |
| 2 | No account deletion endpoint | Violates Right to Erasure (Art. 17) | Implement delete account API with cascading cleanup |
| 3 | Collecting unnecessary fields | Violates Data Minimization (Art. 5(1)(c)) | Audit forms — remove every field that is not strictly necessary |
| 4 | No data retention policy | Violates Storage Limitation (Art. 5(1)(e)) | Define retention periods and implement automated cleanup |
| 5 | Storing consent without timestamp | Cannot prove when consent was given (Accountability, Art. 5(2)) | Always store timestamp, policy version, IP, and exact consent text |
| 6 | Cookie wall (blocking site access without consent) | Consent is not freely given if access depends on it (Art. 7(4)) | Allow access with only necessary cookies; make consent optional |
| 7 | Bundled consent (one checkbox for everything) | Consent must be granular and purpose-specific (Art. 6(1)(a)) | Separate checkbox per purpose |
| 8 | No data export feature | Violates Right to Portability (Art. 20) | Provide JSON or CSV export of user data |
| 9 | Logging PII in application logs | Uncontrolled processing, no retention, hard to delete | Pseudonymize or exclude PII from logs; use user ID hashes |
| 10 | Storing EU data outside EU without SCCs | Violates Transfer rules (Art. 44-49) | Use EU regions or ensure valid SCCs are in place |
| 11 | No way to withdraw consent | Withdrawal must be as easy as giving consent (Art. 7(3)) | Provide withdraw button next to each consent preference |
| 12 | Sharing data with third parties without disclosure | Violates transparency (Art. 13(1)(e)) | List all recipients in privacy policy; get consent if needed |
| 13 | No breach notification process | Must notify authority within 72 hours (Art. 33) | Implement breach detection, logging, and notification workflow |
| 14 | Using personal data for a new purpose without consent | Violates Purpose Limitation (Art. 5(1)(b)) | Get new consent before repurposing data |
| 15 | Hardcoded deletion without anonymization option | Some records must be retained (invoices for tax law) | Implement selective deletion: delete PII, anonymize business records, retain legal records |

## 12. Quick Reference

### DO

```text
[x] Collect explicit, granular, unchecked opt-in consent for each purpose
[x] Store consent records with timestamp, version, IP, and exact text shown
[x] Provide data export in JSON and CSV formats (Art. 15, Art. 20)
[x] Implement account deletion with cascading cleanup (Art. 17)
[x] Define and enforce retention periods for every data type
[x] Encrypt PII at rest and in transit
[x] Pseudonymize user IDs in analytics and logs
[x] Set privacy-friendly defaults for new accounts
[x] Implement consent withdrawal that is as easy as consent granting
[x] Separate sensitive PII into isolated storage with stricter access
[x] Log all access to personal data for audit purposes
[x] Validate that third-party processors have SCCs or adequacy decisions
[x] Run a DPIA before large-scale processing of sensitive data
[x] Implement 72-hour breach notification workflow
[x] Provide human review for automated decisions with legal effects
[x] Allow users to restrict processing without deleting their data
[x] Document all processing activities (Record of Processing Activities)
[x] Run automated retention cleanup jobs on a schedule
```

### DON'T

```text
[ ] Pre-check consent checkboxes
[ ] Bundle multiple consent purposes into one checkbox
[ ] Collect data "just in case" — remove unnecessary form fields
[ ] Store PII in application logs or error tracking systems
[ ] Use cookie walls that block site access without consent
[ ] Transfer data to non-adequate countries without SCCs
[ ] Repurpose collected data without obtaining new consent
[ ] Make consent withdrawal harder than consent granting
[ ] Skip the deletion endpoint — every app needs one
[ ] Forget to include timestamps and versions in consent records
[ ] Log full IP addresses in analytics without consent or legitimate interest
[ ] Store passwords in plaintext (not GDPR-specific but relevant to Art. 32 security)
[ ] Ignore data subject access requests — you have 30 days to respond
[ ] Deploy profiling or automated decisions without a human review fallback
[ ] Assume GDPR does not apply because your servers are outside the EU
```

### Key GDPR Articles Reference

| Article | Topic |
|---------|-------|
| Art. 4 | Definitions (personal data, processing, consent, controller, processor) |
| Art. 5 | Principles (lawfulness, minimization, accuracy, storage limitation, integrity) |
| Art. 6 | Lawful bases for processing |
| Art. 7 | Conditions for consent |
| Art. 12-14 | Transparency and information obligations |
| Art. 15 | Right of access |
| Art. 16 | Right to rectification |
| Art. 17 | Right to erasure |
| Art. 18 | Right to restriction of processing |
| Art. 20 | Right to data portability |
| Art. 21 | Right to object |
| Art. 22 | Automated individual decision-making |
| Art. 25 | Data protection by design and by default |
| Art. 32 | Security of processing |
| Art. 33 | Notification of breach to supervisory authority (72 hours) |
| Art. 34 | Communication of breach to data subject |
| Art. 35 | Data protection impact assessment |
| Art. 44-49 | Transfers to third countries |
| Art. 83 | Penalties (up to 4% turnover or EUR 20M) |
