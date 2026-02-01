---
name: hipaa-compliance
description: Use when handling health data, patient records, medical systems, ePHI, healthcare APIs, EHR integrations, telehealth, health apps, or any code processing Protected Health Information — HIPAA Security Rule technical safeguards, PHI identification, de-identification, audit controls, BAA requirements
---

# HIPAA Compliance Coding Guidelines

## 1. Overview

HIPAA (Health Insurance Portability and Accountability Act) applies to **Covered Entities** (healthcare providers, health plans, healthcare clearinghouses) and **Business Associates** (any entity that creates, receives, maintains, or transmits PHI on behalf of a Covered Entity). Three rules: the **Privacy Rule** (who can access PHI), the **Security Rule** (technical/admin/physical safeguards for ePHI), and the **Breach Notification Rule** (requirements when unsecured PHI is compromised). Penalties: $137-$68,928 per violation, annual caps of $2,067,813 per violation category, criminal penalties up to $250,000 and 10 years imprisonment.

## 2. What is PHI (Protected Health Information)?

PHI is **individually identifiable health information** relating to health condition, healthcare provision, or payment that identifies or could identify the individual. **ePHI** = PHI in electronic form (databases, APIs, files, logs, backups) — the developer's primary concern.

**Critical distinction:** Health data alone is NOT PHI. A blood pressure of 140/90 is not PHI. A blood pressure of 140/90 linked to patient John Smith, DOB 1985-03-15, IS PHI. PHI exists only when health data is linked to identifiers.

### The 18 HIPAA Identifiers

| # | Identifier | Examples |
|---|-----------|----------|
| 1 | Names | First, last, maiden, aliases |
| 2 | Geographic data smaller than state | Street address, city, ZIP code, county |
| 3 | Dates (except year) related to individual | Birth, admission, discharge, death dates; ages over 89 |
| 4 | Phone numbers | Home, mobile, work |
| 5 | Fax numbers | Any fax linked to individual |
| 6 | Email addresses | Personal or work email |
| 7 | Social Security Numbers | Full or partial SSN |
| 8 | Medical record numbers | MRN, chart numbers |
| 9 | Health plan beneficiary numbers | Insurance member IDs |
| 10 | Account numbers | Billing, financial accounts |
| 11 | Certificate/license numbers | Driver's license, professional licenses |
| 12 | Vehicle identifiers/serial numbers | VIN, license plates |
| 13 | Device identifiers/serial numbers | Medical device UDIs, implant serials |
| 14 | Web URLs | Patient portal URLs with identifiers |
| 15 | IP addresses | Client IPs associated with patient activity |
| 16 | Biometric identifiers | Fingerprints, voiceprints, retinal scans |
| 17 | Full-face photographs | Photos, medical imaging with facial features |
| 18 | Any other unique identifying number | Custom patient IDs, research subject numbers |

## 3. The Three Rules (Developer View)

| Rule | CFR Reference | What Developers Must Do |
|------|--------------|------------------------|
| **Privacy Rule** | 45 CFR 164 Subpart E | Enforce minimum necessary access. Build consent management. Role-based data filtering. Patient right-of-access APIs. |
| **Security Rule** | 45 CFR 164 Subpart C | Technical safeguards: encryption, access controls, audit logging, integrity checks, transmission security. |
| **Breach Notification** | 45 CFR 164.400-414 | Breach detection, audit trails for forensics, notification workflows. 60-day window. 500+ records = HHS + media. |

## 4. Technical Safeguards (45 CFR 164.312) — The Developer Core

### 4.1 Access Control — 164.312(a)(1)

**Unique User Identification (REQUIRED)** — no shared accounts, every action tied to a unique user:

```python
# CORRECT — unique user identity on every ePHI access
class PHIAccessMiddleware:
    def process_request(self, request):
        if not request.user or not request.user.is_authenticated:
            raise PermissionDenied("Authentication required for ePHI access")
        request.phi_access_context = {
            "user_id": request.user.id,
            "session_id": request.session.session_key,
            "ip_address": request.META.get("REMOTE_ADDR"),
            "timestamp": datetime.utcnow().isoformat(),
        }

# WRONG — shared credentials
# admin_user = "clinic_admin"
# admin_pass = "shared_password_2024"
```

```php
function validatePHIAccess(int $userId, string $resource): bool {
    if ($userId <= 0) {
        throw new AccessDeniedException('Anonymous access to ePHI prohibited');
    }
    $user = User::find($userId);
    if ($user->is_service_account && !$user->has_phi_authorization) {
        throw new AccessDeniedException('Service account lacks ePHI authorization');
    }
    return RBACPolicy::check($userId, $resource, 'read');
}
```

**Emergency Access Procedure (REQUIRED)** — "break glass" mechanism with full audit:

```python
def emergency_phi_access(requesting_user_id, patient_id, reason):
    """Bypasses normal RBAC but logs extensively and notifies compliance."""
    if not reason or len(reason) < 20:
        raise ValueError("Emergency access requires detailed justification")
    audit_log.critical("EMERGENCY_PHI_ACCESS", {
        "user_id": requesting_user_id, "patient_id": patient_id,
        "reason": reason, "requires_review": True,
    })
    notify_compliance_team(event="emergency_phi_access", user_id=requesting_user_id)
    grant_temporary_access(user_id=requesting_user_id, patient_id=patient_id,
                           duration_hours=4, access_level="read_only")
```

**Automatic Logoff (ADDRESSABLE)** — session timeout for unattended workstations:

```javascript
const PHI_SESSION_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
function phiSessionMiddleware(req, res, next) {
  if (!req.session?.lastActivity) {
    return res.status(401).json({ error: "Session expired" });
  }
  if (Date.now() - req.session.lastActivity > PHI_SESSION_TIMEOUT_MS) {
    auditLog("SESSION_TIMEOUT", { userId: req.session.userId });
    req.session.destroy();
    return res.status(401).json({ error: "Session expired due to inactivity" });
  }
  req.session.lastActivity = Date.now();
  next();
}
```

**Encryption and Decryption (ADDRESSABLE)** — AES-256 for ePHI at rest:

```python
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os

class PHIEncryption:
    """AES-256-GCM encryption for ePHI fields at rest."""
    def __init__(self, key: bytes):
        if len(key) != 32:
            raise ValueError("AES-256 requires a 32-byte key")
        self._gcm = AESGCM(key)

    def encrypt(self, plaintext: str) -> bytes:
        nonce = os.urandom(12)
        ciphertext = self._gcm.encrypt(nonce, plaintext.encode("utf-8"), None)
        return nonce + ciphertext

    def decrypt(self, data: bytes) -> str:
        return self._gcm.decrypt(data[:12], data[12:], None).decode("utf-8")

phi_crypto = PHIEncryption(key=load_key_from_hsm_or_kms())
encrypted_ssn = phi_crypto.encrypt("123-45-6789")
```

```javascript
const crypto = require("crypto");
function encryptPHI(plaintext, keyBuffer) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", keyBuffer, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]);
}
function decryptPHI(buf, keyBuffer) {
  const decipher = crypto.createDecipheriv("aes-256-gcm", keyBuffer, buf.subarray(0, 12));
  decipher.setAuthTag(buf.subarray(12, 28));
  return decipher.update(buf.subarray(28), null, "utf8") + decipher.final("utf8");
}
```

### 4.2 Audit Controls — 164.312(b) (REQUIRED)

Log ALL access to ePHI. Retain logs for 6+ years. **What to log:** who, what resource, when, from where, action, outcome. **What NEVER to log:** the PHI content itself.

```python
def phi_audit_log(event_type, user_id, resource_type, resource_id,
                  action, outcome, ip_address, details=None):
    """
    Structured audit log. NEVER include PHI content in details.
    Log resource_id (e.g., patient_id=4821) but NEVER
    resource content (e.g., patient_name="John Smith").
    """
    entry = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "event_type": event_type,
        "user_id": user_id,
        "resource_type": resource_type,   # "patient_record", "lab_result"
        "resource_id": resource_id,       # numeric ID only
        "action": action,                 # "read", "write", "delete", "export"
        "outcome": outcome,               # "success", "denied", "error"
        "ip_address": ip_address,
        "details": details,               # non-PHI metadata only
    }
    append_to_immutable_log(json.dumps(entry))  # append-only, no UPDATE/DELETE

# CORRECT
phi_audit_log("PHI_READ", 42, "patient_record", 4821, "read", "success",
              "10.0.1.50", details={"fields_accessed": ["dob", "diagnosis"]})
# WRONG — never log PHI content
# phi_audit_log(..., details={"patient_name": "John Smith", "ssn": "123-45-6789"})
```

```php
function phiAuditLog(string $eventType, int $userId, string $resourceType,
                     int $resourceId, string $action, string $outcome, array $details = []): void {
    $prohibited = ['name', 'ssn', 'dob', 'address', 'phone', 'email', 'diagnosis'];
    foreach ($prohibited as $field) {
        if (isset($details[$field])) {
            throw new InvalidArgumentException("PHI field '{$field}' prohibited in audit logs");
        }
    }
    DB::table('phi_audit_log')->insert([
        'timestamp' => gmdate('Y-m-d\TH:i:s\Z'), 'event_type' => $eventType,
        'user_id' => $userId, 'resource_type' => $resourceType,
        'resource_id' => $resourceId, 'action' => $action,
        'outcome' => $outcome, 'details' => json_encode($details),
    ]);
    // Table must have NO UPDATE or DELETE grants for application users
}
```

### 4.3 Integrity Controls — 164.312(c)(1) (REQUIRED)

Protect ePHI from unauthorized alteration. Verify data has not been tampered with.

```python
import hmac, hashlib, json

class PHIIntegrity:
    def __init__(self, key: bytes):
        self._key = key

    def compute_checksum(self, record: dict) -> str:
        canonical = json.dumps(record, sort_keys=True, separators=(",", ":"))
        return hmac.new(self._key, canonical.encode(), hashlib.sha256).hexdigest()

    def verify(self, record: dict, expected: str) -> bool:
        if not hmac.compare_digest(self.compute_checksum(record), expected):
            phi_audit_log("INTEGRITY_VIOLATION", ...)
            raise IntegrityError("ePHI record integrity check failed")
        return True
```

```sql
-- Version tracking prevents unauthorized alteration
CREATE TABLE patient_records (
    id BIGINT PRIMARY KEY,
    version INT NOT NULL DEFAULT 1,
    checksum VARCHAR(64) NOT NULL,
    modified_by INT NOT NULL REFERENCES users(id),
    modified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- Trigger: reject updates where NEW.version <= OLD.version
```

### 4.4 Person or Entity Authentication — 164.312(d) (REQUIRED)

MFA strongly recommended. Short-lived tokens for ePHI access.

```python
def issue_phi_access_token(user_id, roles, mfa_verified):
    if not mfa_verified:
        raise AuthenticationError("MFA required for ePHI access")
    return jwt.encode({
        "sub": str(user_id), "roles": roles, "mfa": True,
        "exp": datetime.utcnow() + timedelta(minutes=30),
    }, PHI_JWT_SECRET, algorithm="HS256")

def verify_phi_access(token):
    payload = jwt.decode(token, PHI_JWT_SECRET, algorithms=["HS256"])
    if not payload.get("mfa"):
        raise AuthenticationError("Token lacks MFA verification")
    return payload
```

```javascript
// System-to-system auth: signed requests, never API keys in query strings
function signPHIRequest(method, path, body, secretKey) {
  const timestamp = Date.now().toString();
  const signature = crypto.createHmac("sha256", secretKey)
    .update(`${method}\n${path}\n${timestamp}\n${body || ""}`)
    .digest("hex");
  return { "X-PHI-Timestamp": timestamp, "X-PHI-Signature": signature };
}
```

### 4.5 Transmission Security — 164.312(e)(1) (ADDRESSABLE)

TLS 1.2+ mandatory. Never transmit PHI in URLs or query parameters.

```python
def create_phi_ssl_context():
    ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
    ctx.minimum_version = ssl.TLSVersion.TLSv1_2
    ctx.set_ciphers("ECDHE+AESGCM:ECDHE+CHACHA20:DHE+AESGCM:!aNULL:!MD5:!DSS")
    ctx.check_hostname = True
    ctx.verify_mode = ssl.CERT_REQUIRED
    return ctx
```

```javascript
// WRONG: GET /api/patients?ssn=123-45-6789&name=John+Smith
// CORRECT: POST with PHI in encrypted body only
app.post("/api/patients/search", requireHTTPS, phiAuth, (req, res) => {
  const { criteria } = req.body; // PHI in body, never in URL
});

function requireHTTPS(req, res, next) {
  if (!req.secure && req.headers["x-forwarded-proto"] !== "https") {
    auditLog("INSECURE_PHI_ATTEMPT", { path: req.path, ip: req.ip });
    return res.status(403).json({ error: "ePHI endpoints require HTTPS" });
  }
  next();
}
```

## 5. Administrative Safeguards for Developers (45 CFR 164.308)

**Risk Analysis (164.308(a)(1))** — map every location where ePHI lives: database tables, file storage, cache layers, message queues, log files, backups, third-party services, temporary files.

**Access Management (164.308(a)(4))** — RBAC with minimum necessary:

```python
PHI_PERMISSIONS = {
    "receptionist": {"patient_record": ["read:demographics"]},
    "nurse":        {"patient_record": ["read:demographics", "read:vitals", "write:vitals"]},
    "physician":    {"patient_record": ["read:demographics", "read:vitals", "read:diagnosis",
                                        "write:diagnosis", "write:prescriptions"]},
    "billing":      {"patient_record": ["read:demographics", "read:billing"]},
    "researcher":   {"patient_record": ["read:de_identified"]},
}

def check_phi_permission(role, resource, action_scope):
    allowed = PHI_PERMISSIONS.get(role, {}).get(resource, [])
    if action_scope not in allowed:
        phi_audit_log("PHI_ACCESS_DENIED", ...)
        raise PermissionDenied(f"Role '{role}' lacks '{action_scope}' on '{resource}'")
```

**Incident Response (164.308(a)(6))** — anomaly detection:

```python
def check_access_anomaly(user_id, resource_type):
    recent_count = count_phi_accesses(user_id, resource_type, last_hours=1)
    baseline = get_user_baseline(user_id, resource_type)
    if recent_count > baseline * 3:
        alert_security_team(event="PHI_ACCESS_ANOMALY", user_id=user_id,
                            recent_count=recent_count, baseline=baseline)
```

**Contingency Plan (164.308(a)(7))** — encrypted backups with verification:

```python
def backup_phi_database(db_path, backup_path, key):
    raw = create_database_dump(db_path)
    encrypted = phi_encrypt(raw, key)
    checksum = hashlib.sha256(encrypted).hexdigest()
    write_file(backup_path, encrypted)
    write_file(backup_path + ".sha256", checksum)
    verify_backup(backup_path, checksum)
    phi_audit_log("PHI_BACKUP_CREATED", details={"size": len(encrypted), "checksum": checksum})
```

## 6. De-identification (Safe Harbor Method)

Remove all 18 identifiers per 45 CFR 164.514(b). De-identified data is NOT PHI.

### SQL View for De-identified Dataset

```sql
CREATE VIEW patient_records_deidentified AS
SELECT
    MD5(CONCAT(id, 'salt_stored_separately')) AS research_id,
    state AS geographic_region,
    CASE WHEN zip_population_over_20k THEN LEFT(zip_code, 3) ELSE '000' END AS zip_3digit,
    YEAR(admission_date) AS admission_year,
    diagnosis_code, procedure_code,
    CASE WHEN age_at_encounter > 89 THEN 90 ELSE age_at_encounter END AS age,
    gender, lab_results_json
FROM patient_records;
-- All 18 identifiers removed: no names, full dates, phone, fax, email, SSN,
-- MRN, health plan #, account #, license #, vehicle/device IDs, URLs, IPs,
-- biometrics, photos, or unique IDs
```

### PHI Detection Patterns

```python
import re

PHI_PATTERNS = {
    "ssn":      re.compile(r"\b\d{3}-\d{2}-\d{4}\b"),
    "phone":    re.compile(r"\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b"),
    "email":    re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"),
    "mrn":      re.compile(r"\bMRN[:\s#]*\d{4,}\b", re.IGNORECASE),
    "date":     re.compile(r"\b(?:0[1-9]|1[0-2])[/-](?:0[1-9]|[12]\d|3[01])[/-]\d{4}\b"),
    "ip":       re.compile(r"\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b"),
}

def scan_for_phi(text):
    """Scan text for PHI before logging or exporting. Returns types found, never values."""
    return [{"type": name, "count": len(p.findall(text))}
            for name, p in PHI_PATTERNS.items() if p.findall(text)]
```

### Date Shifting (preserve relative intervals per patient)

```python
def date_shift(original_date, patient_id, secret):
    hash_val = int(hashlib.sha256(f"{patient_id}:{secret}".encode()).hexdigest()[:8], 16)
    offset_days = (hash_val % 731) - 365  # -365 to +365
    return original_date + timedelta(days=offset_days)
```

### Complete De-identification Function

```python
def deidentify_record(record, patient_id, secret):
    d = {}
    # Keep clinical data (not identifiers)
    for field in ["diagnosis_codes", "procedure_codes", "lab_results", "medications"]:
        d[field] = record.get(field)
    d["gender"] = record.get("gender")
    # Age: aggregate >89
    age = record.get("age")
    d["age"] = 90 if age and age > 89 else age
    # Geographic: state + ZIP first 3 digits (000 if population <20K)
    d["state"] = record.get("state")
    zip3 = record.get("zip_code", "")[:3] or "000"
    d["zip_3digit"] = "000" if zip3 in LOW_POPULATION_ZIP3_SET else zip3
    # Dates: shift consistently per patient
    for f in ["admission_date", "discharge_date", "procedure_date"]:
        if record.get(f):
            d[f] = date_shift(record[f], patient_id, secret)
    # Research ID: not linkable to original
    d["research_id"] = hashlib.sha256(f"{patient_id}:{secret}:r".encode()).hexdigest()[:16]
    return d  # All 18 identifiers excluded
```

## 7. Minimum Necessary Rule

Query only needed fields. No `SELECT *` on PHI tables. Return only fields required for the user's role.

```python
# WRONG: cursor.execute("SELECT * FROM patients WHERE id = %s", (pid,))

# Billing staff — billing fields only
def get_patient_for_billing(pid, user):
    check_phi_permission(user.role, "patient_record", "read:billing")
    return db.execute("SELECT id, insurance_provider, policy_number, billing_code "
                      "FROM patients WHERE id = %s", (pid,))

# Nurse — demographics and vitals only
def get_patient_for_nursing(pid, user):
    check_phi_permission(user.role, "patient_record", "read:vitals")
    return db.execute("SELECT id, first_name, last_name, dob, blood_pressure, "
                      "heart_rate, temperature FROM patients WHERE id = %s", (pid,))
```

```javascript
function filterPHIResponse(record, role) {
  const allowed = {
    receptionist: ["id", "firstName", "lastName", "phone", "appointmentDate"],
    nurse: ["id", "firstName", "lastName", "dob", "vitals", "allergies", "medications"],
    physician: ["id", "firstName", "lastName", "dob", "vitals", "diagnoses", "labResults"],
    billing: ["id", "firstName", "lastName", "insuranceProvider", "billingCodes"],
  }[role] || [];
  return Object.fromEntries(allowed.filter(f => f in record).map(f => [f, record[f]]));
}
```

```php
class PatientRecord extends Model {
    public function scopeForRole($query, string $role) {
        $columns = match ($role) {
            'receptionist' => ['id', 'first_name', 'last_name', 'phone', 'email'],
            'nurse'        => ['id', 'first_name', 'last_name', 'dob', 'vitals', 'allergies'],
            'physician'    => ['id', 'first_name', 'last_name', 'dob', 'vitals', 'diagnoses'],
            'billing'      => ['id', 'first_name', 'last_name', 'insurance_provider'],
            default        => throw new AccessDeniedException("Unknown role: {$role}"),
        };
        return $query->select($columns);
    }
}
```

## 8. BAA (Business Associate Agreement) Requirements

A BAA is required whenever a third party creates, receives, maintains, or transmits PHI on your behalf. Using a service without a BAA to process PHI is a violation regardless of breach.

| Service | HIPAA-Eligible | Notes |
|---------|---------------|-------|
| AWS | Yes | Must enable BAA, eligible services only |
| Google Cloud | Yes | Must sign BAA, eligible services only |
| Azure | Yes | Must sign BAA |
| Firebase (standard) | No | Not HIPAA-eligible |
| Google Analytics | No | Cannot process PHI |
| Sentry (standard) | No | PHI may leak into error reports |
| Datadog | Yes (Enterprise) | Requires HIPAA add-on |
| Twilio / SendGrid | Yes | BAA available |
| Stripe | Yes | BAA for health-related payments |
| MongoDB Atlas | Yes | Dedicated tier with BAA |
| Vercel / Netlify | No | Not HIPAA-eligible |
| Supabase | Yes | Pro plan with BAA |
| Auth0 | Yes | Enterprise plan with BAA |

```python
# WRONG — PHI leaks into error tracking without BAA
try:
    process_patient(patient)
except Exception as e:
    sentry_sdk.capture_exception(e)  # sends patient data to Sentry

# CORRECT — scrub PHI before reporting
def before_send(event, hint):
    if "request" in event and "data" in event["request"]:
        event["request"]["data"] = "[REDACTED — may contain PHI]"
    if "exception" in event:
        for exc in event["exception"].get("values", []):
            for frame in exc.get("stacktrace", {}).get("frames", []):
                frame.pop("vars", None)
    return event

sentry_sdk.init(dsn="...", before_send=before_send)
```

## 9. Mobile and API Considerations

**No PHI in push notifications** (visible on lock screen):

```javascript
// WRONG: body: "Your HIV test result is negative. Dr. Smith reviewed on 01/15."
// CORRECT:
sendPushNotification(deviceToken, {
  title: "New Message",
  body: "You have a new message from your care team. Tap to view.",
  data: { type: "lab_result", requiresAuth: true },
});
```

**No PHI in client-side storage without encryption:**

```javascript
// WRONG: localStorage.setItem("patientData", JSON.stringify(record));
// CORRECT: store reference only, fetch PHI on demand with auth
sessionStorage.setItem("currentPatientId", patientId);
```

**No PHI in URLs** — use POST with body. PHI in URLs leaks to browser history, server logs, Referer headers.

**Rate limiting on PHI endpoints** to detect bulk extraction:

```python
PHI_RATE_LIMITS = {
    "patient_read": {"requests": 60, "window_seconds": 60},
    "patient_export": {"requests": 5, "window_seconds": 3600},
}
```

## 10. Breach Response Coding Patterns

### Detection

```python
def detect_potential_breach(user_id, action, resource_count):
    alerts = []
    if resource_count > 100:
        alerts.append({"type": "BULK_ACCESS", "severity": "high"})
    hour = datetime.utcnow().hour
    if hour < 6 or hour > 22:
        alerts.append({"type": "OFF_HOURS_ACCESS", "severity": "medium"})
    if is_new_ip_for_user(user_id):
        alerts.append({"type": "NEW_IP_ACCESS", "severity": "medium"})
    for a in alerts:
        phi_audit_log("BREACH_INDICATOR", user_id=user_id, details=a)
        if a["severity"] == "high":
            notify_security_team(a)
```

### Containment

```python
def contain_potential_breach(user_id, reason):
    revoke_all_sessions(user_id)
    revoke_all_tokens(user_id)
    lock_user_account(user_id, reason=reason)
    snapshot_audit_logs(user_id, reason=reason)
    phi_audit_log("BREACH_CONTAINMENT", user_id=user_id,
                  details={"reason": reason, "actions": [
                      "sessions_revoked", "tokens_revoked", "account_locked"]})
```

### Breach Log Schema

```sql
CREATE TABLE breach_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    detected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    detected_by VARCHAR(100) NOT NULL,
    breach_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    affected_record_count INT,
    affected_record_type VARCHAR(100),
    description TEXT NOT NULL,                  -- no PHI in description
    containment_actions TEXT,
    notification_required BOOLEAN DEFAULT FALSE,
    hhs_notified_at TIMESTAMP NULL,            -- within 60 days
    individuals_notified_at TIMESTAMP NULL,
    media_notified_at TIMESTAMP NULL,           -- required if 500+ records
    resolved_at TIMESTAMP NULL
);
```

## 11. Common Mistakes

| # | Mistake | Why It Violates HIPAA | Fix |
|---|---------|----------------------|-----|
| 1 | Logging PHI content | Logs are less protected than DBs; violates 164.312(b) | Log resource IDs and actions only |
| 2 | PHI in URLs/query params | Leaks to browser history, server logs, Referer headers | Use POST with encrypted body |
| 3 | `SELECT *` on PHI tables | Violates minimum necessary rule | Select only columns needed for role |
| 4 | Shared service accounts | No accountability; violates 164.312(a)(2)(i) | Unique identity per user/service |
| 5 | No audit trail | Directly violates 164.312(b) | Log every ePHI read/write/delete/export |
| 6 | PHI in error messages | May display to users or send to error tracking | Generic errors; scrub PHI from payloads |
| 7 | Unencrypted backups | Unsecured PHI; violates 164.312(a)(2)(iv) | Encrypt all backups at rest |
| 8 | PHI in push notifications | Visible on lock screen to anyone | Generic notifications; auth before PHI display |
| 9 | Services without BAA | Violation regardless of breach | Verify BAA with every third-party service |
| 10 | No session timeout | Unattended workstation risk; violates 164.312(a)(2)(iii) | 15-minute idle timeout |
| 11 | PHI in analytics events | Analytics platforms lack BAAs, store indefinitely | Opaque IDs only in analytics |
| 12 | PHI in client storage unencrypted | localStorage/cookies accessible to JS | Encrypt or fetch on demand |
| 13 | No de-identification for research | Sharing identifiable data without authorization | Safe Harbor: remove all 18 identifiers |
| 14 | EXIF metadata in medical images | GPS, device IDs, timestamps in metadata | Strip all EXIF before storage |

## 12. Quick Reference

### DO

- Encrypt ePHI at rest (AES-256) and in transit (TLS 1.2+)
- Assign unique user IDs to every person/system accessing ePHI
- Implement MFA for ePHI access
- Log every ePHI access: who, what, when, where, outcome
- Enforce automatic session timeout (15 minutes or less)
- Use POST for PHI data; never put PHI in URLs
- Apply RBAC with minimum necessary field filtering
- Sign BAAs with every third-party service handling PHI
- Encrypt all backups containing ePHI
- Strip EXIF metadata from medical images
- Implement "break glass" emergency access with audit trail
- Retain audit logs for 6+ years
- Map all ePHI locations via risk analysis
- De-identify using Safe Harbor (remove all 18 identifiers) for research
- Rate-limit PHI endpoints to detect bulk extraction
- Implement HMAC integrity checks on ePHI records
- Build breach detection and containment capabilities
- Send generic push notifications; require auth before showing PHI

### DON'T

- Don't log PHI content in application/error/debug logs
- Don't put PHI in URLs, query parameters, or fragments
- Don't use `SELECT *` on tables containing PHI
- Don't use shared accounts for ePHI access
- Don't send PHI through services lacking a signed BAA
- Don't store PHI in localStorage/sessionStorage/cookies unencrypted
- Don't include PHI in push notifications or email subject lines
- Don't send PHI in analytics events or tracking pixels
- Don't transmit PHI over plain HTTP
- Don't return PHI in error messages or stack traces
- Don't skip audit logging for any ePHI operation
- Don't store unencrypted backups of ePHI
- Don't cache PHI in unprotected layers (CDN, browser cache, shared Redis)
- Don't use SMS for PHI transmission (not end-to-end encrypted)
- Don't retain PHI longer than necessary; enforce data retention policies
