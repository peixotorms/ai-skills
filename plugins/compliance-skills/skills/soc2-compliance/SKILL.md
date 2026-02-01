---
name: soc2-compliance
description: Use when building SaaS platforms, cloud services, customer-facing APIs, multi-tenant systems, or any service handling customer data that requires SOC 2 certification — Trust Services Criteria, Common Criteria CC1-CC9, access controls, change management, incident response, evidence collection, vendor management
---

# SOC 2 Compliance Coding Guidelines

## 1. Overview

SOC 2 (Service Organization Control 2) is an auditing framework developed by the AICPA for service organizations that store, process, or transmit customer data. It evaluates controls based on five Trust Services Criteria: Security, Availability, Processing Integrity, Confidentiality, and Privacy. SOC 2 Type I assesses control design at a single point in time; Type II evaluates operating effectiveness over a 3-to-12-month observation period and is the standard customers demand. Audits typically cost $20K-$100K+ depending on scope and complexity. The core principle for developers: "Say something, do something, prove you always do what you say." Every control you implement must be documented, consistently enforced, and produce evidence that auditors can verify.

## 2. The 5 Trust Services Criteria

| Criterion | Required? | What Developers Must Do |
|---|---|---|
| **Security** (CC1-CC9) | REQUIRED for all SOC 2 | Implement access controls, encrypt data, monitor systems, follow change management, build incident response capabilities |
| **Availability** | Optional | Build uptime monitoring, disaster recovery, backup automation, health checks, capacity planning |
| **Processing Integrity** | Optional | Validate all inputs, handle errors completely, ensure transaction atomicity, reconcile data between systems |
| **Confidentiality** | Optional | Classify data, encrypt at rest and in transit, enforce retention policies, implement secure deletion |
| **Privacy** | Optional | Implement consent management, data minimization, disclosure controls, subject access/correction endpoints |

Security is always in scope. The other four are selected based on what your service does. A SaaS platform handling customer data typically includes Security + Availability + Confidentiality at minimum.

## 3. Common Criteria (CC1-CC9) — Security Deep Dive

| CC | Name | Developer Responsibility |
|---|---|---|
| CC1 | Control Environment | Understand and follow security policies; complete required security training; acknowledge acceptable use policies |
| CC2 | Communication & Information | Document system architecture, data flows, and security procedures; maintain runbooks in version control |
| CC3 | Risk Assessment | Participate in risk assessments; maintain asset and data inventory; flag new risks during design reviews |
| CC4 | Monitoring Activities | Implement monitoring dashboards; review control effectiveness quarterly; report control failures |
| CC5 | Control Activities | Implement technical controls (auth, encryption, validation); automate enforcement where possible |
| CC6 | Logical & Physical Access | RBAC, MFA, encryption, access reviews, network segmentation, least privilege, session management |
| CC7 | System Operations | Monitoring, alerting, incident detection and response, disaster recovery, backup verification |
| CC8 | Change Management | Branch protection, code review, CI/CD gates, deployment tracking, rollback procedures, segregation of duties |
| CC9 | Risk Mitigation | Vendor assessment, third-party risk management, business continuity, insurance, contractual protections |

## 4. Access Controls (CC6)

### 4.1 RBAC Implementation

Define roles with explicit permissions. Never check for specific users — always check roles or permissions.

```python
# Python — Role-based access middleware
from functools import wraps
from enum import Enum

class Permission(Enum):
    READ_DATA = "read:data"
    WRITE_DATA = "write:data"
    MANAGE_USERS = "manage:users"
    ADMIN_SETTINGS = "admin:settings"
    VIEW_AUDIT_LOG = "view:audit_log"

ROLE_PERMISSIONS = {
    "viewer":  [Permission.READ_DATA],
    "editor":  [Permission.READ_DATA, Permission.WRITE_DATA],
    "admin":   [Permission.READ_DATA, Permission.WRITE_DATA, Permission.MANAGE_USERS,
                Permission.VIEW_AUDIT_LOG],
    "owner":   [p for p in Permission],
}

def require_permission(permission: Permission):
    def decorator(func):
        @wraps(func)
        def wrapper(request, *args, **kwargs):
            user = get_authenticated_user(request)
            user_permissions = ROLE_PERMISSIONS.get(user.role, [])
            if permission not in user_permissions:
                audit_log("authorization_denied", user=user.id,
                          resource=request.path, permission=permission.value)
                raise ForbiddenError("Insufficient permissions")
            audit_log("authorization_granted", user=user.id,
                      resource=request.path, permission=permission.value)
            return func(request, *args, **kwargs)
        return wrapper
    return decorator

@require_permission(Permission.MANAGE_USERS)
def create_user(request):
    # Only admin and owner roles reach here
    pass
```

```javascript
// Node.js — Express middleware for RBAC
function requirePermission(permission) {
  return (req, res, next) => {
    const user = req.authenticatedUser;
    const userPerms = getRolePermissions(user.role);

    if (!userPerms.includes(permission)) {
      auditLog({
        event: "authorization_denied",
        userId: user.id,
        resource: req.path,
        permission,
        ip: req.ip,
        timestamp: new Date().toISOString(),
      });
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    auditLog({
      event: "authorization_granted",
      userId: user.id,
      resource: req.path,
      permission,
      ip: req.ip,
      timestamp: new Date().toISOString(),
    });
    next();
  };
}

router.post("/users", requirePermission("manage:users"), createUser);
router.get("/data", requirePermission("read:data"), getData);
```

### 4.2 Session Management

```python
SESSION_CONFIG = {
    "max_idle_timeout_minutes": 15,         # CC6: Auto-logout after inactivity
    "max_absolute_timeout_hours": 12,       # CC6: Force re-auth after 12 hours
    "max_concurrent_sessions": 3,           # CC6: Limit parallel sessions
    "require_mfa_for_sensitive_actions": True,
    "rotate_session_id_on_auth": True,      # Prevent session fixation
    "secure_cookie_flags": {
        "httponly": True,
        "secure": True,
        "samesite": "Strict",
    },
}

def validate_session(session):
    now = datetime.utcnow()
    if now - session.last_activity > timedelta(minutes=15):
        terminate_session(session.id, reason="idle_timeout")
        audit_log("session_expired", session_id=session.id, reason="idle_timeout")
        raise SessionExpiredError()
    if now - session.created_at > timedelta(hours=12):
        terminate_session(session.id, reason="absolute_timeout")
        audit_log("session_expired", session_id=session.id, reason="absolute_timeout")
        raise SessionExpiredError()
    session.last_activity = now
```

### 4.3 API Key Management

```python
def create_api_key(user_id, scopes, expires_days=90):
    """Create scoped, expiring API key with audit trail."""
    key_id = generate_uuid()
    raw_key = generate_secure_random(32)
    hashed_key = hash_with_salt(raw_key)

    store_api_key({
        "key_id": key_id,
        "hashed_key": hashed_key,
        "user_id": user_id,
        "scopes": scopes,               # Least privilege: only needed permissions
        "created_at": utcnow(),
        "expires_at": utcnow() + timedelta(days=expires_days),
        "last_used_at": None,
        "last_rotated_at": utcnow(),
    })
    audit_log("api_key_created", user_id=user_id, key_id=key_id, scopes=scopes)
    return {"key_id": key_id, "key": raw_key}  # Raw key shown once only

def validate_api_key(raw_key):
    hashed = hash_with_salt(raw_key)
    key_record = find_key_by_hash(hashed)
    if not key_record:
        raise AuthenticationError("Invalid API key")
    if key_record.expires_at < utcnow():
        audit_log("api_key_expired", key_id=key_record.key_id)
        raise AuthenticationError("API key expired")
    key_record.last_used_at = utcnow()
    return key_record
```

### 4.4 Access Review Queries

```sql
-- CC6: Quarterly access review — who has access and when they last used it
SELECT
    u.id,
    u.email,
    u.role,
    u.created_at,
    u.last_login_at,
    u.mfa_enabled,
    DATEDIFF(CURRENT_DATE, u.last_login_at) AS days_since_last_login
FROM users u
WHERE u.is_active = TRUE
ORDER BY u.last_login_at ASC;

-- Flag accounts inactive for 90+ days for deprovisioning review
SELECT id, email, role, last_login_at
FROM users
WHERE is_active = TRUE
  AND (last_login_at IS NULL OR last_login_at < DATE_SUB(CURRENT_DATE, INTERVAL 90 DAY));

-- Audit: all permission changes in the last quarter
SELECT
    al.timestamp,
    al.actor_user_id,
    al.target_user_id,
    al.action,
    al.old_role,
    al.new_role
FROM audit_log al
WHERE al.action IN ('role_changed', 'user_activated', 'user_deactivated')
  AND al.timestamp >= DATE_SUB(CURRENT_DATE, INTERVAL 90 DAY)
ORDER BY al.timestamp DESC;
```

### 4.5 User Deprovisioning

```python
def deprovision_user(user_id, reason, actor_id):
    """Immediately revoke all access when an employee leaves or role changes."""
    user = get_user(user_id)

    # 1. Deactivate account
    user.is_active = False
    user.deactivated_at = utcnow()
    user.deactivated_by = actor_id
    user.deactivation_reason = reason

    # 2. Terminate all active sessions
    terminate_all_sessions(user_id)

    # 3. Revoke all API keys
    revoke_all_api_keys(user_id)

    # 4. Revoke all OAuth tokens
    revoke_all_oauth_tokens(user_id)

    # 5. Remove from all groups/teams
    remove_from_all_groups(user_id)

    audit_log("user_deprovisioned", target_user=user_id, actor=actor_id,
              reason=reason, actions=["deactivated", "sessions_terminated",
              "api_keys_revoked", "oauth_revoked", "groups_removed"])
```

## 5. Encryption Standards

### 5.1 Encryption at Rest

```python
# AES-256 encryption for sensitive fields before database storage
import os
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
import base64

def derive_key(master_key: bytes, salt: bytes) -> bytes:
    """Derive encryption key from master key using PBKDF2."""
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=480000,
    )
    return base64.urlsafe_b64encode(kdf.derive(master_key))

def encrypt_field(plaintext: str, master_key: bytes) -> str:
    """Encrypt a sensitive field. Store the result in the database."""
    salt = os.urandom(16)
    key = derive_key(master_key, salt)
    f = Fernet(key)
    encrypted = f.encrypt(plaintext.encode())
    # Store salt + encrypted together
    return base64.urlsafe_b64encode(salt + encrypted).decode()

def decrypt_field(stored_value: str, master_key: bytes) -> str:
    """Decrypt a sensitive field retrieved from the database."""
    raw = base64.urlsafe_b64decode(stored_value)
    salt = raw[:16]
    encrypted = raw[16:]
    key = derive_key(master_key, salt)
    f = Fernet(key)
    return f.decrypt(encrypted).decode()

# Key rotation: decrypt with old key, encrypt with new key
def rotate_encryption_key(stored_value, old_key, new_key):
    plaintext = decrypt_field(stored_value, old_key)
    return encrypt_field(plaintext, new_key)
```

### 5.2 Encryption in Transit

```python
# TLS 1.2+ enforcement — server configuration
TLS_CONFIG = {
    "minimum_version": "TLSv1.2",
    "cipher_suites": [
        "TLS_AES_256_GCM_SHA384",
        "TLS_CHACHA20_POLY1305_SHA256",
        "TLS_AES_128_GCM_SHA256",
    ],
    "hsts_max_age": 31536000,          # 1 year
    "hsts_include_subdomains": True,
    "hsts_preload": True,
}

# Internal service-to-service: always use TLS, verify certificates
import ssl

def create_internal_ssl_context():
    ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
    ctx.minimum_version = ssl.TLSVersion.TLSv1_2
    ctx.verify_mode = ssl.CERT_REQUIRED
    ctx.load_verify_locations("/etc/ssl/internal-ca.pem")
    return ctx
```

### 5.3 Secrets Management

```python
# NEVER do this:
# DATABASE_URL = "postgresql://admin:s3cr3t@db.example.com/prod"  # CC6 violation
# API_SECRET = "hardcoded-secret-value"                            # CC6 violation

# DO: Load secrets from environment or vault service
import os

def get_secret(name: str) -> str:
    """Retrieve secret from vault service, fall back to environment variable."""
    # Option 1: Vault service
    try:
        return vault_client.read(f"secret/data/{name}")["data"]["value"]
    except VaultError:
        pass

    # Option 2: Environment variable
    value = os.environ.get(name)
    if not value:
        raise ConfigurationError(f"Required secret '{name}' not configured")
    return value

DATABASE_URL = get_secret("DATABASE_URL")
API_SECRET = get_secret("API_SECRET")
```

```javascript
// Node.js — never commit .env files; load from vault at runtime
function getSecret(name) {
  // Try vault service first
  const vaultValue = vaultClient.read(`secret/data/${name}`);
  if (vaultValue) return vaultValue;

  // Fall back to environment
  const value = process.env[name];
  if (!value) {
    throw new Error(`Required secret '${name}' not configured`);
  }
  return value;
}

// .gitignore MUST include:
// .env
// .env.*
// *.pem
// *.key
// credentials.*
```

## 6. Logging and Monitoring (CC7)

### 6.1 What to Log

Every SOC 2 audit will request evidence from your logs. Ensure the following events are captured:

| Event Category | Specific Events |
|---|---|
| Authentication | Login success, login failure, logout, MFA challenge, MFA failure, password reset, account lockout |
| Authorization | Permission granted, permission denied, role change, privilege escalation |
| Data Access | Customer data read, data export, data download, bulk query, API data access |
| Data Modification | Record created, updated, deleted, bulk operations, schema changes |
| Configuration | Setting changed, feature toggled, threshold modified, policy updated |
| Administrative | User created, user deactivated, role assigned, API key issued/revoked |
| System | Service start/stop, deployment, health check failure, dependency failure |
| Security | Suspicious activity, rate limit hit, blocked request, invalid token |

### 6.2 Structured Log Format

```python
import json
import logging
from datetime import datetime, timezone

class SOC2AuditLogger:
    """Structured audit logger meeting SOC 2 evidence requirements."""

    def __init__(self, service_name: str):
        self.service_name = service_name
        self.logger = logging.getLogger("audit")

    def log(self, event: str, **kwargs):
        entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "service": self.service_name,
            "event": event,
            "level": kwargs.pop("level", "info"),
            "actor": {
                "user_id": kwargs.pop("user_id", None),
                "ip_address": kwargs.pop("ip", None),
                "user_agent": kwargs.pop("user_agent", None),
                "session_id": kwargs.pop("session_id", None),
            },
            "resource": {
                "type": kwargs.pop("resource_type", None),
                "id": kwargs.pop("resource_id", None),
            },
            "action": kwargs.pop("action", event),
            "outcome": kwargs.pop("outcome", "success"),
            "request_id": kwargs.pop("request_id", None),
            "details": kwargs,  # Remaining fields
        }
        # Remove None values for cleaner logs
        entry = {k: v for k, v in entry.items() if v is not None}
        self.logger.info(json.dumps(entry, default=str))

audit = SOC2AuditLogger("my-service")

# Usage examples:
audit.log("user_login",
    user_id="usr_123", ip="203.0.113.42", outcome="success",
    user_agent="Mozilla/5.0", session_id="sess_abc")

audit.log("data_access",
    user_id="usr_123", ip="203.0.113.42",
    resource_type="customer_record", resource_id="cust_456",
    action="read", fields_accessed=["name", "email", "plan"])

audit.log("permission_denied",
    user_id="usr_789", ip="198.51.100.1",
    resource_type="admin_panel", action="access",
    outcome="denied", reason="insufficient_role",
    level="warning")
```

```javascript
// Node.js structured audit logger
class AuditLogger {
  constructor(serviceName) {
    this.serviceName = serviceName;
  }

  log(event, data = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      service: this.serviceName,
      event,
      level: data.level || "info",
      actor: {
        userId: data.userId,
        ip: data.ip,
        userAgent: data.userAgent,
        sessionId: data.sessionId,
      },
      resource: {
        type: data.resourceType,
        id: data.resourceId,
      },
      action: data.action || event,
      outcome: data.outcome || "success",
      requestId: data.requestId,
      details: data.details || {},
    };
    // Ship to log aggregation — stdout for container-based collection
    process.stdout.write(JSON.stringify(entry) + "\n");
  }
}

const audit = new AuditLogger("my-service");

audit.log("config_changed", {
  userId: "usr_admin",
  ip: "10.0.0.1",
  resourceType: "system_setting",
  resourceId: "session_timeout",
  details: { oldValue: 30, newValue: 15 },
});
```

### 6.3 Log Retention and Immutability

```python
LOG_RETENTION_POLICY = {
    "audit_logs": {
        "retention_days": 365,             # CC7: 1-year minimum retention
        "storage": "append_only",          # CC7: Immutable — no edits or deletes
        "encryption": "AES-256",           # CC6: Encrypted at rest
        "access_control": ["admin", "auditor"],  # CC6: Restricted access
    },
    "application_logs": {
        "retention_days": 90,
        "storage": "append_only",
    },
    "security_logs": {
        "retention_days": 365,
        "storage": "append_only",
        "alerting": True,                  # CC7: Real-time alerting on security events
    },
}
```

## 7. Change Management (CC8)

### 7.1 Branch Protection

```yaml
# Git branch protection rules — enforce in your repository settings
# These configurations produce auditable evidence of CC8 compliance

protected_branches:
  main:
    required_pull_request_reviews:
      required_approving_review_count: 1    # At minimum one peer review
      dismiss_stale_reviews: true           # Re-review after new commits
      require_code_owner_reviews: true
    required_status_checks:
      strict: true                          # Branch must be up to date
      contexts:
        - "unit-tests"
        - "integration-tests"
        - "security-lint"
    enforce_admins: true                    # No bypasses, even for admins
    restrictions:
      users: []                             # No direct push
    allow_force_pushes: false
    allow_deletions: false
    require_linear_history: true            # No merge commits — clean audit trail
```

### 7.2 Commit and Deployment Tracking

```python
# Every deployment must link to a tracked change (ticket, PR, or CR)
DEPLOYMENT_RECORD = {
    "deployment_id": "deploy_20250115_001",
    "environment": "production",
    "deployed_at": "2025-01-15T14:30:00Z",
    "deployed_by": "deployer_service_account",   # Not a personal account
    "change_request": "CR-1234",                 # Linked tracking ticket
    "pull_request": "PR-567",
    "commit_sha": "abc123def456",
    "approved_by": "usr_reviewer",               # Different from author (CC8)
    "author": "usr_developer",                   # Different from approver (CC8)
    "tests_passed": True,
    "rollback_plan": "Revert commit abc123 and redeploy previous SHA",
    "changes_summary": "Updated session timeout from 30 to 15 minutes",
}

def validate_deployment(record):
    """Gate deployment on CC8 requirements."""
    errors = []
    if record["author"] == record["approved_by"]:
        errors.append("CC8: Author cannot approve their own change")
    if not record["tests_passed"]:
        errors.append("CC8: All tests must pass before deployment")
    if not record["change_request"]:
        errors.append("CC8: Deployment must link to a tracked change request")
    if not record["rollback_plan"]:
        errors.append("CC8: Rollback plan required")
    if errors:
        raise DeploymentBlockedError(errors)
```

### 7.3 Emergency Change Procedure

```python
EMERGENCY_CHANGE_POLICY = {
    "requires": [
        "Verbal approval from on-call lead (documented within 24 hours)",
        "Post-deployment review within 48 hours",
        "Retroactive change request ticket created",
        "Root cause analysis completed",
    ],
    "allowed_when": [
        "Active security incident",
        "Service outage affecting customers",
        "Data integrity issue in production",
    ],
    "documentation": "Emergency changes must be reviewed and documented "
                     "retroactively within 48 hours with full audit trail.",
}
```

## 8. Incident Response (CC7)

### 8.1 Health Check Endpoints

```python
from datetime import datetime, timezone

def health_check():
    """
    Health endpoint for monitoring systems.
    Returns component-level status for incident detection.
    """
    checks = {
        "database": check_database_connection(),
        "cache": check_cache_connection(),
        "storage": check_storage_access(),
        "external_api": check_external_dependencies(),
    }
    all_healthy = all(c["status"] == "healthy" for c in checks.values())
    return {
        "status": "healthy" if all_healthy else "degraded",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": get_deployed_version(),
        "checks": checks,
    }

def check_database_connection():
    try:
        start = datetime.now(timezone.utc)
        db.execute("SELECT 1")
        latency_ms = (datetime.now(timezone.utc) - start).total_seconds() * 1000
        return {"status": "healthy", "latency_ms": round(latency_ms, 2)}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}
```

### 8.2 Anomaly Detection Patterns

```python
ALERT_THRESHOLDS = {
    "failed_logins_per_user_per_hour": 10,       # Brute force detection
    "failed_logins_per_ip_per_hour": 50,          # Credential stuffing
    "api_errors_per_minute": 100,                 # System instability
    "data_export_size_mb": 500,                   # Data exfiltration
    "admin_actions_per_hour": 50,                 # Compromised admin account
    "new_api_keys_per_day": 10,                   # Unauthorized automation
    "after_hours_admin_logins": 1,                # Suspicious timing
}

def check_anomaly(metric_name, current_value, context):
    threshold = ALERT_THRESHOLDS.get(metric_name)
    if threshold and current_value > threshold:
        alert = {
            "type": "anomaly_detected",
            "metric": metric_name,
            "value": current_value,
            "threshold": threshold,
            "context": context,
            "timestamp": utcnow().isoformat(),
            "severity": classify_severity(metric_name, current_value, threshold),
        }
        send_alert(alert)
        audit_log("security_anomaly", **alert)
```

### 8.3 Severity Classification

```python
SEVERITY_LEVELS = {
    "P1": {
        "name": "Critical",
        "description": "Active breach, data loss, or complete service outage",
        "response_time": "15 minutes",
        "examples": ["Confirmed data breach", "All customers affected",
                      "Credentials exposed publicly"],
        "actions": ["Page on-call team", "Notify leadership", "Begin containment"],
    },
    "P2": {
        "name": "High",
        "description": "Security vulnerability exploited, partial outage, data at risk",
        "response_time": "1 hour",
        "examples": ["Active exploitation attempt", "Single-tenant data exposure",
                      "Authentication bypass discovered"],
        "actions": ["Alert security team", "Begin investigation"],
    },
    "P3": {
        "name": "Medium",
        "description": "Vulnerability found but not exploited, degraded performance",
        "response_time": "4 hours",
        "examples": ["Unpatched vulnerability", "Elevated error rates",
                      "Suspicious but unconfirmed activity"],
    },
    "P4": {
        "name": "Low",
        "description": "Minor issue, policy violation, improvement needed",
        "response_time": "1 business day",
        "examples": ["Failed access review followup", "Minor config drift",
                      "Documentation gap"],
    },
}
```

### 8.4 Containment Automation

```python
def contain_compromised_account(user_id, incident_id, actor_id):
    """Automated containment for suspected account compromise."""
    actions_taken = []

    # 1. Disable the account
    disable_account(user_id)
    actions_taken.append("account_disabled")

    # 2. Terminate all active sessions
    count = terminate_all_sessions(user_id)
    actions_taken.append(f"sessions_terminated:{count}")

    # 3. Revoke all API keys and tokens
    revoke_all_api_keys(user_id)
    revoke_all_oauth_tokens(user_id)
    actions_taken.append("credentials_revoked")

    # 4. Block source IPs associated with suspicious activity
    suspicious_ips = get_recent_ips(user_id, hours=24)
    for ip in suspicious_ips:
        add_to_blocklist(ip, reason=f"incident:{incident_id}", duration_hours=24)
    actions_taken.append(f"ips_blocked:{len(suspicious_ips)}")

    # 5. Preserve evidence
    snapshot_user_activity(user_id, incident_id)
    actions_taken.append("evidence_preserved")

    audit_log("incident_containment",
        incident_id=incident_id,
        target_user=user_id,
        actor=actor_id,
        actions=actions_taken)

    return actions_taken
```

### 8.5 Post-Incident Review Template

```python
POST_INCIDENT_TEMPLATE = {
    "incident_id": "",
    "severity": "",                     # P1-P4
    "title": "",
    "timeline": {
        "detected_at": "",
        "acknowledged_at": "",
        "contained_at": "",
        "resolved_at": "",
        "post_mortem_completed_at": "",
    },
    "impact": {
        "customers_affected": 0,
        "data_exposed": False,
        "data_types_exposed": [],
        "service_downtime_minutes": 0,
    },
    "root_cause": "",
    "contributing_factors": [],
    "remediation": {
        "immediate_actions": [],          # What was done to stop the bleeding
        "long_term_fixes": [],            # Systemic improvements
        "prevention_measures": [],        # How to prevent recurrence
    },
    "lessons_learned": [],
    "action_items": [
        # {"owner": "", "task": "", "due_date": "", "status": ""}
    ],
}
```

## 9. Availability Controls

### 9.1 Circuit Breaker Pattern

```python
import time
from enum import Enum

class CircuitState(Enum):
    CLOSED = "closed"           # Normal operation
    OPEN = "open"               # Failing — reject requests immediately
    HALF_OPEN = "half_open"     # Testing if service recovered

class CircuitBreaker:
    def __init__(self, failure_threshold=5, recovery_timeout=30,
                 success_threshold=3):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.success_threshold = success_threshold
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.success_count = 0
        self.last_failure_time = None

    def call(self, func, *args, **kwargs):
        if self.state == CircuitState.OPEN:
            if time.time() - self.last_failure_time > self.recovery_timeout:
                self.state = CircuitState.HALF_OPEN
                self.success_count = 0
            else:
                audit_log("circuit_breaker_rejected",
                          service=func.__name__, state="open")
                raise ServiceUnavailableError("Circuit breaker is open")

        try:
            result = func(*args, **kwargs)
            if self.state == CircuitState.HALF_OPEN:
                self.success_count += 1
                if self.success_count >= self.success_threshold:
                    self.state = CircuitState.CLOSED
                    self.failure_count = 0
                    audit_log("circuit_breaker_closed", service=func.__name__)
            return result
        except Exception as e:
            self.failure_count += 1
            self.last_failure_time = time.time()
            if self.failure_count >= self.failure_threshold:
                self.state = CircuitState.OPEN
                audit_log("circuit_breaker_opened",
                          service=func.__name__, failures=self.failure_count)
            raise
```

### 9.2 Retry with Exponential Backoff

```javascript
async function retryWithBackoff(fn, options = {}) {
  const {
    maxRetries = 3,
    baseDelayMs = 1000,
    maxDelayMs = 30000,
    retryableErrors = [502, 503, 504, "ECONNRESET", "ETIMEDOUT"],
  } = options;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isRetryable = retryableErrors.some(
        (e) => error.status === e || error.code === e
      );
      if (!isRetryable || attempt === maxRetries) {
        throw error;
      }
      const delay = Math.min(
        baseDelayMs * Math.pow(2, attempt) + Math.random() * 1000,
        maxDelayMs
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
```

### 9.3 Backup Verification

```python
def verify_backup(backup_id):
    """
    CC7: Regularly test backup restoration.
    Run monthly; log results as SOC 2 evidence.
    """
    result = {
        "backup_id": backup_id,
        "test_date": utcnow().isoformat(),
        "steps": [],
    }

    # 1. Verify backup exists and is not corrupted
    backup = get_backup(backup_id)
    checksum_valid = verify_checksum(backup)
    result["steps"].append({
        "step": "checksum_verification",
        "passed": checksum_valid,
    })

    # 2. Restore to isolated test environment
    test_env = create_isolated_restore_environment()
    restore_success = restore_backup(backup, test_env)
    result["steps"].append({
        "step": "restore_to_test",
        "passed": restore_success,
    })

    # 3. Verify data integrity after restore
    record_count_match = verify_record_counts(test_env)
    sample_data_valid = verify_sample_records(test_env)
    result["steps"].append({
        "step": "data_integrity",
        "passed": record_count_match and sample_data_valid,
    })

    # 4. Clean up
    destroy_environment(test_env)

    result["overall_passed"] = all(s["passed"] for s in result["steps"])
    audit_log("backup_verification", **result)
    return result
```

## 10. Processing Integrity Controls

### 10.1 Input Validation

```python
from pydantic import BaseModel, validator, constr
from typing import Optional

class CreateCustomerRequest(BaseModel):
    """Validate all inputs at API boundary. Reject invalid data early."""
    name: constr(min_length=1, max_length=255, strip_whitespace=True)
    email: constr(regex=r"^[^@\s]+@[^@\s]+\.[^@\s]+$", max_length=254)
    plan: str
    metadata: Optional[dict] = None

    @validator("plan")
    def validate_plan(cls, v):
        allowed = ["free", "starter", "professional", "enterprise"]
        if v not in allowed:
            raise ValueError(f"Plan must be one of: {allowed}")
        return v

    @validator("metadata")
    def validate_metadata(cls, v):
        if v and len(str(v)) > 10000:
            raise ValueError("Metadata too large")
        return v
```

```javascript
// Node.js — validate at every API boundary
function validateCreateCustomer(body) {
  const errors = [];

  if (!body.name || typeof body.name !== "string") {
    errors.push("name is required and must be a string");
  } else if (body.name.length > 255) {
    errors.push("name must be 255 characters or fewer");
  }

  if (!body.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(body.email)) {
    errors.push("valid email is required");
  }

  const allowedPlans = ["free", "starter", "professional", "enterprise"];
  if (!allowedPlans.includes(body.plan)) {
    errors.push(`plan must be one of: ${allowedPlans.join(", ")}`);
  }

  if (errors.length > 0) {
    auditLog("validation_failed", {
      endpoint: "/customers",
      errors,
      ip: req.ip,
    });
    throw new ValidationError(errors);
  }
}
```

### 10.2 Idempotency

```python
def process_payment(idempotency_key, payment_data):
    """
    Idempotency ensures processing integrity — the same request
    produces the same result regardless of how many times it is sent.
    """
    # Check for existing result with this key
    existing = db.query(
        "SELECT result FROM idempotency_keys WHERE key = %s AND expires_at > NOW()",
        [idempotency_key]
    )
    if existing:
        audit_log("idempotent_replay", key=idempotency_key)
        return existing.result

    # Process the payment
    result = execute_payment(payment_data)

    # Store result for future duplicate requests
    db.execute(
        """INSERT INTO idempotency_keys (key, result, created_at, expires_at)
           VALUES (%s, %s, NOW(), NOW() + INTERVAL '24 hours')""",
        [idempotency_key, serialize(result)]
    )

    audit_log("payment_processed", key=idempotency_key,
              amount=payment_data["amount"], outcome="success")
    return result
```

### 10.3 Data Reconciliation

```python
def reconcile_billing(period_start, period_end):
    """
    Processing integrity check: reconcile usage records
    against invoices to detect discrepancies.
    """
    usage_records = get_usage_records(period_start, period_end)
    invoices = get_invoices(period_start, period_end)

    discrepancies = []
    for customer_id in set(r.customer_id for r in usage_records):
        usage_total = sum(r.amount for r in usage_records
                         if r.customer_id == customer_id)
        invoice_total = sum(i.amount for i in invoices
                           if i.customer_id == customer_id)

        if abs(usage_total - invoice_total) > 0.01:
            discrepancies.append({
                "customer_id": customer_id,
                "usage_total": usage_total,
                "invoice_total": invoice_total,
                "difference": usage_total - invoice_total,
            })

    result = {
        "period": f"{period_start} to {period_end}",
        "records_checked": len(usage_records),
        "invoices_checked": len(invoices),
        "discrepancies_found": len(discrepancies),
        "discrepancies": discrepancies,
        "status": "pass" if not discrepancies else "fail",
    }

    audit_log("billing_reconciliation", **result)
    if discrepancies:
        send_alert("billing_discrepancy", result)
    return result
```

## 11. Data Handling

### 11.1 Data Classification

| Level | Examples | Required Controls |
|---|---|---|
| **Public** | Marketing pages, public docs, blog posts | No special controls |
| **Internal** | Employee directory, internal metrics, sprint boards | Access control, authentication required |
| **Confidential** | Customer data, financial records, contracts, analytics | Encryption at rest + in transit, access control, audit logging, retention policy |
| **Restricted** | Credentials, PII, health records, payment card data, encryption keys | All of Confidential + MFA for access, strict need-to-know, automated retention enforcement, secure deletion |

### 11.2 Retention and Deletion

```python
DATA_RETENTION_POLICIES = {
    "customer_data": {
        "active": "retained while account is active",
        "after_deletion": "30 days grace period, then permanent deletion",
        "deletion_method": "hard_delete_with_verification",
    },
    "audit_logs": {
        "minimum_retention": "365 days",
        "deletion_method": "automated_after_retention",
    },
    "session_data": {
        "retention": "24 hours after expiry",
        "deletion_method": "automated_cleanup",
    },
    "backups": {
        "retention": "90 days",
        "deletion_method": "automated_with_verification",
    },
}

def secure_delete_customer_data(customer_id, request_id):
    """
    Delete all customer data with verification and audit trail.
    Required for Confidentiality TSC.
    """
    tables = [
        "customer_records", "customer_files", "customer_metadata",
        "customer_api_keys", "customer_sessions",
    ]
    deleted_counts = {}

    for table in tables:
        count = db.execute(
            f"DELETE FROM {table} WHERE customer_id = %s", [customer_id]
        )
        deleted_counts[table] = count

    # Verify deletion
    for table in tables:
        remaining = db.query(
            f"SELECT COUNT(*) FROM {table} WHERE customer_id = %s", [customer_id]
        )
        if remaining > 0:
            raise DeletionVerificationError(
                f"Data remains in {table} after deletion")

    audit_log("customer_data_deleted",
        customer_id=customer_id,
        request_id=request_id,
        tables_cleaned=deleted_counts,
        verified=True)
```

### 11.3 Test Data Policy

```python
# NEVER use production customer data in non-production environments

def generate_synthetic_customer():
    """Generate realistic but fake customer data for testing."""
    return {
        "name": fake.name(),
        "email": f"test_{uuid4().hex[:8]}@example.com",
        "company": fake.company(),
        "phone": fake.phone_number(),
        "address": fake.address(),
        "plan": random.choice(["free", "starter", "professional"]),
    }

def mask_for_staging(record):
    """Mask production data if it must be used in staging (avoid if possible)."""
    return {
        **record,
        "name": f"User {hash(record['name']) % 10000}",
        "email": f"masked_{hash(record['email']) % 10000}@example.com",
        "phone": "555-0000",
        "address": "123 Test Street, Testville, TS 00000",
        # Preserve: id, plan, created_at (non-PII structural data)
    }
```

## 12. Vendor Management (CC9)

### 12.1 Vendor Inventory

```python
VENDOR_REGISTRY = {
    "vendor_id": "v_001",
    "name": "Cloud Provider",
    "service": "Infrastructure hosting",
    "data_access": "customer_data",        # What customer data they access
    "data_classification": "confidential",
    "soc2_report": {
        "has_report": True,
        "type": "Type II",
        "report_date": "2025-03-15",
        "next_review_date": "2026-03-15",  # Annual review required
        "findings": 0,
    },
    "contract": {
        "data_protection_clause": True,
        "audit_rights": True,
        "breach_notification_hours": 72,
        "data_deletion_on_termination": True,
        "subprocessor_notification": True,
    },
    "risk_rating": "low",                  # low, medium, high, critical
    "last_review_date": "2025-01-15",
    "next_review_date": "2026-01-15",
    "owner": "security-team",
}
```

### 12.2 Vendor Security Requirements

```python
VENDOR_REQUIREMENTS_CHECKLIST = [
    "SOC 2 Type II report available and reviewed",
    "Data encryption at rest (AES-256 or equivalent)",
    "Data encryption in transit (TLS 1.2+)",
    "Access controls with least privilege",
    "Incident response plan with notification SLA",
    "Business continuity and disaster recovery plan",
    "Background checks for employees accessing data",
    "Data deletion capability upon contract termination",
    "Subprocessor disclosure and notification",
    "Right to audit clause in contract",
    "Data residency and jurisdiction compliance",
    "Vulnerability management program",
]

def assess_vendor(vendor_id):
    """Annual vendor security assessment."""
    vendor = get_vendor(vendor_id)
    results = []

    for requirement in VENDOR_REQUIREMENTS_CHECKLIST:
        results.append({
            "requirement": requirement,
            "met": None,         # To be filled during review
            "evidence": None,
            "notes": None,
        })

    assessment = {
        "vendor_id": vendor_id,
        "assessment_date": utcnow().isoformat(),
        "assessor": get_current_user(),
        "requirements": results,
        "overall_risk": None,    # Determined after review
        "next_review": None,
    }

    audit_log("vendor_assessment_initiated",
        vendor_id=vendor_id, vendor_name=vendor["name"])
    return assessment
```

## 13. Type I vs Type II — Developer Impact

| Aspect | Type I | Type II |
|---|---|---|
| **Scope** | Control design at a single point in time | Operating effectiveness over 3-12 months |
| **Evidence needed** | Policies, configurations, screenshots, architecture diagrams | Everything in Type I + logs, incident records, review records, change history over time |
| **Developer burden** | Implement controls, write policies, configure systems | Continuously operate controls, generate evidence, respond to findings |
| **Audit duration** | 2-4 weeks | 6-12 weeks (plus observation period) |
| **What breaks it** | Missing controls, incomplete policies | Controls that exist but are not consistently followed |
| **Typical timeline** | 2-3 months to prepare | 3-6 months prep + 3-12 months observation |
| **Key developer tasks** | Set up logging, RBAC, encryption, branch protection, monitoring | Prove you did quarterly access reviews, responded to incidents within SLA, never self-merged, rotated keys on schedule |

Type I answers: "Are your controls designed properly?"
Type II answers: "Do your controls actually work, consistently, over time?"

## 14. Evidence Generation Patterns

Auditors typically request 200-300 evidence items. Automate collection wherever possible.

### 14.1 Evidence Categories and Sources

```python
EVIDENCE_MAP = {
    "access_controls": {
        "sources": [
            "User list with roles and last login dates (quarterly export)",
            "Access review records (quarterly)",
            "Deprovisioned user list with dates",
            "MFA enrollment report",
            "API key inventory with expiration dates",
            "Service account inventory",
        ],
        "automated": True,
        "query": "SELECT id, email, role, mfa_enabled, last_login_at, "
                 "created_at FROM users WHERE is_active = TRUE",
    },
    "change_management": {
        "sources": [
            "Branch protection configuration export",
            "Pull request history with reviewers",
            "Deployment log with approvals",
            "Emergency change records",
            "Rollback history",
        ],
        "automated": True,
        "source_system": "git_and_deployment_pipeline",
    },
    "incident_response": {
        "sources": [
            "Incident tickets with timelines",
            "Post-incident reviews",
            "Annual IR test results",
            "Alert configurations",
            "On-call rotation schedule",
        ],
        "automated": "partial",
    },
    "monitoring": {
        "sources": [
            "Uptime reports",
            "Alert configuration exports",
            "Dashboard screenshots",
            "Log retention configuration",
            "Anomaly detection rules",
        ],
        "automated": True,
    },
    "encryption": {
        "sources": [
            "TLS configuration and certificate inventory",
            "Encryption-at-rest configuration",
            "Key rotation records",
            "Key management policy",
        ],
        "automated": "partial",
    },
    "vendor_management": {
        "sources": [
            "Vendor inventory with risk ratings",
            "Vendor SOC 2 reports on file",
            "Annual vendor review records",
            "Contract review records",
        ],
        "automated": False,
    },
}
```

### 14.2 Automated Evidence Export

```python
def generate_quarterly_evidence():
    """
    Automated quarterly evidence package for SOC 2 audit.
    Run via scheduled job; store output in evidence repository.
    """
    quarter = get_current_quarter()
    evidence = {}

    # Access control evidence
    evidence["active_users"] = db.query(
        "SELECT id, email, role, mfa_enabled, last_login_at, created_at "
        "FROM users WHERE is_active = TRUE ORDER BY role, email")

    evidence["access_reviews"] = db.query(
        "SELECT * FROM access_review_records "
        "WHERE review_date >= %s ORDER BY review_date DESC",
        [quarter.start])

    evidence["deprovisioned_users"] = db.query(
        "SELECT id, email, deactivated_at, deactivated_by, reason "
        "FROM users WHERE is_active = FALSE AND deactivated_at >= %s",
        [quarter.start])

    # Change management evidence
    evidence["deployments"] = db.query(
        "SELECT * FROM deployment_log "
        "WHERE deployed_at >= %s ORDER BY deployed_at DESC",
        [quarter.start])

    evidence["emergency_changes"] = db.query(
        "SELECT * FROM change_requests "
        "WHERE type = 'emergency' AND created_at >= %s",
        [quarter.start])

    # Incident evidence
    evidence["incidents"] = db.query(
        "SELECT * FROM incidents WHERE detected_at >= %s",
        [quarter.start])

    # Store with timestamp for audit trail
    store_evidence(quarter=quarter.label, data=evidence,
                   generated_at=utcnow().isoformat())

    audit_log("evidence_generated", quarter=quarter.label,
              categories=list(evidence.keys()))
```

## 15. Common Mistakes

| Mistake | TSC / CC Violation | Fix |
|---|---|---|
| Hardcoded secrets in source code | CC6 (Access Controls) | Use vault service or environment variables; scan repos for leaked secrets |
| Self-merged pull requests | CC8 (Change Management) | Enforce branch protection: author cannot be approver |
| No deployment tracking | CC8 (Change Management) | Log every deployment with commit SHA, approver, ticket link |
| No quarterly access reviews | CC6 (Access Controls) | Schedule automated access reports; review and sign off quarterly |
| Unencrypted customer data at rest | CC6 (Access Controls), Confidentiality | AES-256 encryption for all customer data in databases and storage |
| No log retention policy | CC7 (System Operations) | Define retention (1 year minimum for audit logs), configure immutable storage |
| Shared service accounts | CC6 (Access Controls) | Unique service accounts per application/function with minimum required scope |
| No incident response plan | CC7 (System Operations) | Document and test IR plan annually; define severity levels and response SLAs |
| Production customer data in test environments | Confidentiality, Privacy | Use synthetic data or properly anonymized datasets |
| No vendor inventory | CC9 (Risk Mitigation) | Maintain registry of all third parties; review SOC 2 reports annually |
| Manual deployments without audit trail | CC8 (Change Management) | Automate deployments; log who deployed what, when, and why |
| Missing input validation | Processing Integrity | Validate at every API boundary; reject malformed data early |
| No backup testing | Availability | Test backup restoration monthly; log results as evidence |
| No session timeout | CC6 (Access Controls) | 15-minute idle timeout, 12-hour absolute timeout |
| Missing error handling | Processing Integrity | Catch all errors; log with correlation IDs; never swallow exceptions silently |
| Logging PII in plain text | Confidentiality, Privacy | Mask or hash PII in logs; log user IDs instead of names/emails |
| No MFA for admin accounts | CC6 (Access Controls) | Require MFA for all privileged access; enforce via application logic |
| Permissive CORS configuration | CC6 (Access Controls) | Whitelist specific origins; never use `Access-Control-Allow-Origin: *` for authenticated endpoints |

## 16. Quick Reference

### DO

- Encrypt all customer data at rest (AES-256) and in transit (TLS 1.2+)
- Implement RBAC with least privilege — check permissions, not usernames
- Log all authentication, authorization, data access, and configuration changes
- Use structured JSON logs with timestamps, user IDs, IPs, and request IDs
- Require peer review for all code changes — no self-merges
- Link every deployment to a tracked change request
- Rotate secrets and API keys on a defined schedule (90 days maximum)
- Set session timeouts (15-minute idle, 12-hour absolute)
- Validate all inputs at API boundaries
- Use idempotency keys for state-changing operations
- Test backup restoration monthly and log results
- Run quarterly access reviews and deactivate unused accounts
- Maintain a vendor inventory with annual security reviews
- Classify data and apply controls matching the classification level
- Generate automated evidence exports for auditors
- Document and test incident response procedures annually
- Use unique service accounts with minimum necessary scope
- Mask or exclude PII from log entries

### DO NOT

- Hardcode secrets, API keys, or credentials in source code
- Use production customer data in test or staging environments
- Allow self-approval of code changes or deployments
- Deploy without automated tests passing
- Share service accounts or credentials between people or systems
- Store logs in mutable storage where entries can be edited or deleted
- Skip input validation because "the frontend handles it"
- Swallow exceptions without logging them
- Use `Access-Control-Allow-Origin: *` on authenticated endpoints
- Grant admin access by default — start with minimum permissions
- Ignore failed login attempts — alert on brute force patterns
- Delete audit logs before the retention period expires
- Skip vendor security reviews because "they are a big company"
- Deploy emergency changes without retroactive documentation
- Assume encryption is handled by the infrastructure — verify it
- Log raw credentials, tokens, or full credit card numbers
