---
name: sox-compliance
description: Use when building financial reporting systems, accounting software, ERP integrations, payment reconciliation, ledger systems, audit trails, or any code handling financial data at publicly traded companies — SOX Section 302/404 controls, ITGC, segregation of duties, change management, audit logging
---

# SOX (Sarbanes-Oxley) Compliance Coding Guidelines

## 1. Overview

The Sarbanes-Oxley Act of 2002 (SOX) was enacted after major corporate accounting scandals (Enron, WorldCom) to protect investors by improving the accuracy and reliability of corporate financial disclosures. It applies to all publicly traded companies in the United States (and foreign companies listed on US exchanges), as well as companies preparing for an IPO. Under SOX, CEOs and CFOs personally certify the accuracy of financial reports -- penalties for willful violations include fines up to $5 million and imprisonment up to 20 years. For developers, this means every system that feeds into financial reporting must have documented, tested internal controls with complete audit trails. SOX compliance is framework-based, built on COSO (Committee of Sponsoring Organizations -- 5 components, 17 principles for internal control) and COBIT (Control Objectives for Information and Related Technologies) for IT governance.

## 2. Key Sections for Developers

| Section | Requirement | Developer Impact |
|---------|-------------|------------------|
| Section 302 | CEO/CFO must certify accuracy of financial reports | Software producing financial reports must guarantee data integrity -- calculations must be verifiable, inputs validated, outputs reconciled |
| Section 404 | Internal Controls over Financial Reporting (ICFR) must be documented, tested, and audited annually | Every system in the financial reporting chain needs documented controls, automated tests proving those controls work, and audit evidence |
| Section 802 | Criminal penalties for altering, destroying, or concealing records | Financial records must be retained for 7 years minimum; audit logs must be immutable (append-only); penalties include up to 20 years imprisonment |
| Section 906 | Criminal penalties for false financial certification | Systems must produce accurate, complete, and timely financial data -- bugs that cause misstatement are compliance violations |

## 3. IT General Controls (ITGC) -- The Four Domains

### 3.1 Domain 1: Access to Programs and Data

Every financial system must enforce unique identification, least privilege, and periodic access review.

**RBAC middleware with role enforcement:**

**Python:**
```python
from enum import Enum
from functools import wraps
from datetime import datetime, timezone

class FinancialRole(Enum):
    VIEWER = "viewer"              # Read-only access to reports
    DATA_ENTRY = "data_entry"      # Create journal entries (not approve)
    APPROVER = "approver"          # Approve journal entries (not create)
    RECONCILER = "reconciler"      # Perform reconciliations
    ADMIN = "admin"                # System configuration (not financial data)
    AUDITOR = "auditor"            # Read-only access to all data and logs

# Map permissions -- note segregation of duties built in
ROLE_PERMISSIONS = {
    FinancialRole.VIEWER: {"report:read"},
    FinancialRole.DATA_ENTRY: {"journal:create", "journal:edit_draft", "report:read"},
    FinancialRole.APPROVER: {"journal:approve", "journal:reject", "report:read"},
    FinancialRole.RECONCILER: {"reconciliation:perform", "reconciliation:read", "report:read"},
    FinancialRole.ADMIN: {"system:configure", "user:manage", "report:read"},
    FinancialRole.AUDITOR: {"report:read", "journal:read", "audit_log:read",
                            "reconciliation:read", "user:read"},
}

def require_permission(permission: str):
    """Decorator enforcing RBAC on financial system endpoints."""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            user = get_authenticated_user()  # Must return unique user, never shared
            if user is None:
                audit_log("access_denied", detail="unauthenticated request",
                          resource=permission)
                raise AuthenticationError("Authentication required")

            user_permissions = set()
            for role in user.roles:
                user_permissions |= ROLE_PERMISSIONS.get(role, set())

            if permission not in user_permissions:
                audit_log("access_denied", user_id=user.id,
                          detail=f"missing permission: {permission}",
                          resource=permission)
                raise AuthorizationError(f"Permission denied: {permission}")

            audit_log("access_granted", user_id=user.id, resource=permission)
            return func(*args, **kwargs)
        return wrapper
    return decorator

@require_permission("journal:create")
def create_journal_entry(data):
    """Only DATA_ENTRY role can create. APPROVER role approves separately."""
    pass
```

**PHP:**
```php
class FinancialAccessControl
{
    private const ROLE_PERMISSIONS = [
        'viewer'      => ['report:read'],
        'data_entry'  => ['journal:create', 'journal:edit_draft', 'report:read'],
        'approver'    => ['journal:approve', 'journal:reject', 'report:read'],
        'reconciler'  => ['reconciliation:perform', 'reconciliation:read', 'report:read'],
        'admin'       => ['system:configure', 'user:manage', 'report:read'],
        'auditor'     => ['report:read', 'journal:read', 'audit_log:read',
                          'reconciliation:read', 'user:read'],
    ];

    public function requirePermission(string $permission): void
    {
        $user = $this->getAuthenticatedUser();
        if ($user === null) {
            $this->auditLog('access_denied', ['detail' => 'unauthenticated']);
            throw new AuthenticationException('Authentication required');
        }

        $userPermissions = [];
        foreach ($user->getRoles() as $role) {
            $userPermissions = array_merge(
                $userPermissions,
                self::ROLE_PERMISSIONS[$role] ?? []
            );
        }

        if (!in_array($permission, $userPermissions, true)) {
            $this->auditLog('access_denied', [
                'user_id'    => $user->getId(),
                'permission' => $permission,
            ]);
            throw new AuthorizationException("Permission denied: {$permission}");
        }

        $this->auditLog('access_granted', [
            'user_id'    => $user->getId(),
            'permission' => $permission,
        ]);
    }
}
```

**Periodic access review query (run quarterly):**

```sql
-- SOX ITGC: Quarterly access review report
-- Generates list of all users with financial system access for management review
SELECT
    u.user_id,
    u.full_name,
    u.email,
    u.department,
    GROUP_CONCAT(ur.role_name) AS assigned_roles,
    u.last_login_at,
    u.created_at,
    u.manager_email,
    CASE
        WHEN u.last_login_at < NOW() - INTERVAL 90 DAY THEN 'INACTIVE - REVIEW'
        WHEN u.termination_date IS NOT NULL THEN 'TERMINATED - REMOVE'
        ELSE 'ACTIVE'
    END AS review_status
FROM users u
JOIN user_roles ur ON u.user_id = ur.user_id
WHERE ur.role_name IN ('data_entry', 'approver', 'reconciler', 'admin')
GROUP BY u.user_id
ORDER BY review_status DESC, u.department;
```

**Automated deprovisioning check:**

```python
def check_terminated_users():
    """
    SOX ITGC: Ensure terminated employees have no active access.
    Run daily. Flag any terminated user with active financial system roles.
    """
    terminated_with_access = db.execute("""
        SELECT u.user_id, u.full_name, u.termination_date, ur.role_name
        FROM users u
        JOIN user_roles ur ON u.user_id = ur.user_id
        WHERE u.termination_date IS NOT NULL
          AND u.termination_date <= CURRENT_DATE
          AND ur.is_active = TRUE
    """).fetchall()

    for user in terminated_with_access:
        # Immediately revoke access
        db.execute(
            "UPDATE user_roles SET is_active = FALSE, revoked_at = NOW(), "
            "revoked_reason = 'automated_termination_check' "
            "WHERE user_id = %s AND is_active = TRUE",
            (user.user_id,)
        )
        audit_log("access_revoked_automated",
                  user_id=user.user_id,
                  detail=f"Terminated {user.termination_date}, role: {user.role_name}")
        alert_security_team(user)
```

### 3.2 Domain 2: Change Management

All changes to financial systems must be authorized, tested, and approved before reaching production.

**Branch protection configuration (generic Git platform):**

```yaml
# Branch protection rules for financial system repositories
main_branch_protection:
  require_pull_request: true
  required_approvals: 2                # At least two reviewers
  dismiss_stale_reviews: true          # Re-review after new commits
  require_code_owner_review: true      # Finance module owners must approve
  require_status_checks:
    - unit-tests
    - integration-tests
    - security-scan
    - sox-audit-trail-check            # Verify audit logging present
  restrict_push: true                  # No direct pushes to main
  require_linear_history: true         # No merge commits -- clean audit trail
  require_signed_commits: true         # Cryptographic author verification
```

**CODEOWNERS pattern for financial modules:**

```
# Financial modules require finance-team review
/src/ledger/           @finance-team @security-team
/src/journal/          @finance-team @security-team
/src/reconciliation/   @finance-team @security-team
/src/reporting/        @finance-team @security-team
/db/migrations/        @finance-team @dba-team
/config/financial/     @finance-team @ops-team
```

**Pull request template with SOX traceability:**

```markdown
## Change Request
- Ticket/CR Number: [REQUIRED -- links change to authorized request]
- Business Justification: [Why is this change needed?]
- Financial Impact: [Which financial reports/processes does this affect?]

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] UAT sign-off obtained (attach evidence)
- [ ] Audit trail verified (all financial mutations logged)
- [ ] No direct database modifications (all changes through application layer)

## Segregation of Duties
- [ ] Author is NOT the sole approver
- [ ] Code reviewer is different from the author
- [ ] Deployment will be executed by CI/CD pipeline (not manually)

## Rollback Plan
- Rollback procedure: [describe]
- Data recovery steps: [if applicable]
```

**Deployment gate pattern:**

```python
def pre_deployment_check(deployment):
    """
    SOX Change Management: Automated gate before production deployment.
    Blocks deployment if any control is not satisfied.
    """
    checks = {
        "change_request_linked": deployment.ticket_id is not None,
        "change_request_approved": is_ticket_approved(deployment.ticket_id),
        "approver_not_author": (
            deployment.approved_by != deployment.committed_by
        ),
        "tests_passed": deployment.test_results.all_passed,
        "code_review_approved": (
            deployment.review_approvals >= 2
            and deployment.author not in deployment.reviewers
        ),
        "security_scan_clean": deployment.security_scan.critical_count == 0,
    }

    failed = [name for name, passed in checks.items() if not passed]
    if failed:
        audit_log("deployment_blocked",
                  deployment_id=deployment.id,
                  failed_checks=failed)
        raise DeploymentBlockedError(
            f"SOX controls not satisfied: {', '.join(failed)}"
        )

    audit_log("deployment_approved",
              deployment_id=deployment.id,
              ticket=deployment.ticket_id,
              author=deployment.committed_by,
              approver=deployment.approved_by)
```

### 3.3 Domain 3: Program Development

Security and compliance requirements must be part of the design phase, not afterthoughts.

**Required elements for financial system development:**

1. Security requirements documented before coding begins
2. Data flow diagrams showing where financial data enters, moves, and is stored
3. Threat model identifying risks to data integrity
4. Test plan covering unit, integration, and user acceptance testing
5. Test evidence retained (test reports, screenshots, sign-off records)
6. Go-live approval from business owner (not the development team)

**Test documentation pattern:**

```python
class TestJournalEntryPosting:
    """
    SOX Control: JE-001 -- Journal Entry Posting Accuracy
    Control Owner: Finance Controller
    Test Frequency: Every release (automated), quarterly (manual UAT)

    Validates that journal entries are posted accurately to the general ledger
    with correct debits, credits, and account mappings.
    """

    def test_balanced_entry_posts_successfully(self):
        """Debit and credit must balance before posting is allowed."""
        entry = JournalEntry(
            lines=[
                JournalLine(account="4100", debit=Decimal("1000.00")),
                JournalLine(account="1200", credit=Decimal("1000.00")),
            ]
        )
        result = post_journal_entry(entry)
        assert result.status == "posted"
        assert result.gl_impact.total_debits == result.gl_impact.total_credits

    def test_unbalanced_entry_rejected(self):
        """SOX Control: Prevent posting of unbalanced entries."""
        entry = JournalEntry(
            lines=[
                JournalLine(account="4100", debit=Decimal("1000.00")),
                JournalLine(account="1200", credit=Decimal("999.99")),
            ]
        )
        with pytest.raises(UnbalancedEntryError):
            post_journal_entry(entry)

    def test_posting_creates_audit_trail(self):
        """SOX Section 802: Every posting must generate an immutable audit record."""
        entry = create_and_post_valid_entry()
        logs = get_audit_logs(entity_type="journal_entry", entity_id=entry.id)
        assert len(logs) >= 1
        assert logs[0].action == "journal_entry_posted"
        assert logs[0].user_id is not None
        assert logs[0].before_state is not None
        assert logs[0].after_state is not None
```

### 3.4 Domain 4: Computer Operations

**Backup verification pattern:**

```python
def verify_financial_backup():
    """
    SOX ITGC: Verify backup integrity for financial databases.
    Run daily after backup. Test full restore quarterly.
    """
    backup = get_latest_backup("financial_db")

    # Verify backup exists and is recent
    assert backup is not None, "No backup found"
    age_hours = (datetime.now(timezone.utc) - backup.created_at).total_seconds() / 3600
    assert age_hours < 25, f"Backup is {age_hours:.1f} hours old (max 24)"

    # Verify checksum integrity
    computed_checksum = compute_sha256(backup.file_path)
    assert computed_checksum == backup.stored_checksum, "Backup checksum mismatch"

    # Verify backup size is reasonable (not empty or truncated)
    assert backup.size_bytes > backup.minimum_expected_size, "Backup appears truncated"

    audit_log("backup_verified",
              backup_id=backup.id,
              size=backup.size_bytes,
              checksum=computed_checksum,
              age_hours=round(age_hours, 1))
```

**Batch job monitoring:**

```python
def monitor_financial_batch_jobs():
    """
    SOX ITGC: Monitor critical financial batch processes.
    Alert on failure, late start, or unexpected duration.
    """
    critical_jobs = [
        {"name": "gl_posting_batch",      "max_duration_min": 60,  "deadline": "06:00"},
        {"name": "sub_ledger_sync",       "max_duration_min": 30,  "deadline": "07:00"},
        {"name": "reconciliation_batch",  "max_duration_min": 120, "deadline": "08:00"},
        {"name": "financial_report_gen",  "max_duration_min": 45,  "deadline": "09:00"},
    ]

    for job in critical_jobs:
        last_run = get_last_job_run(job["name"])
        if last_run is None or last_run.status == "failed":
            alert_operations(f"Critical job {job['name']} failed or missing",
                             severity="high")
            audit_log("batch_job_failure", job_name=job["name"],
                      status=last_run.status if last_run else "not_found")
        elif last_run.duration_minutes > job["max_duration_min"]:
            alert_operations(f"Job {job['name']} exceeded duration limit",
                             severity="medium")
```

## 4. Segregation of Duties (SoD)

The four financial duties that must be separated so no single person controls an entire transaction:

| Duty | Description | System Role | Example |
|------|-------------|-------------|---------|
| Authorization | Approving transactions | Approver | Approve a journal entry for posting |
| Recording | Creating/modifying records | Data Entry | Create a journal entry |
| Custody | Responsibility for assets | Treasury | Execute a payment |
| Verification | Reconciling and reviewing | Reconciler | Verify bank statement matches ledger |

**SoD enforcement in code:**

```python
class SegregationOfDuties:
    """
    SOX Section 404: Enforce segregation of duties on financial transactions.
    No user may perform conflicting duties on the same transaction.
    """

    CONFLICTING_ACTIONS = {
        "journal:create":  {"journal:approve", "journal:post"},
        "journal:approve": {"journal:create"},
        "payment:request": {"payment:approve", "payment:execute"},
        "payment:approve": {"payment:request", "payment:execute"},
        "reconciliation:perform": {"journal:create", "journal:approve"},
    }

    @staticmethod
    def check(user_id: str, action: str, transaction_id: str):
        """
        Before allowing an action, verify the user has not performed
        a conflicting action on the same transaction.
        """
        conflicting = SegregationOfDuties.CONFLICTING_ACTIONS.get(action, set())
        if not conflicting:
            return

        prior_actions = db.execute("""
            SELECT action FROM audit_log
            WHERE transaction_id = %s AND user_id = %s AND action IN %s
        """, (transaction_id, user_id, tuple(conflicting))).fetchall()

        if prior_actions:
            conflicting_action = prior_actions[0].action
            audit_log("sod_violation_blocked",
                      user_id=user_id,
                      attempted_action=action,
                      conflicting_action=conflicting_action,
                      transaction_id=transaction_id)
            raise SoDViolationError(
                f"Segregation of duties violation: user {user_id} cannot perform "
                f"'{action}' after performing '{conflicting_action}' on the same "
                f"transaction {transaction_id}"
            )
```

**SoD in software development (author cannot deploy):**

```yaml
# CI/CD pipeline configuration enforcing SoD
deployment_pipeline:
  stages:
    - name: build
      trigger: pull_request_merged

    - name: deploy_staging
      trigger: build_success
      # Automated -- no human in loop

    - name: deploy_production
      trigger: manual_approval
      constraints:
        # The person approving production deploy CANNOT be the PR author
        approver_cannot_be:
          - pull_request_author
          - last_commit_author
        required_approvers: 1
        allowed_roles:
          - release_manager
          - ops_lead
```

**Git branch protection enforcing review separation:**

```
# CODEOWNERS: enforce that financial code is reviewed by non-authors
# The CI system verifies the reviewer is not the commit author

/src/financial/**    @finance-reviewers
/src/ledger/**       @finance-reviewers
/src/reporting/**    @finance-reviewers @audit-reviewers
```

## 5. Audit Trail Implementation

This is the single most critical coding pattern for SOX compliance. Every mutation to financial data must be captured in an immutable, tamper-evident log.

**Required fields for every audit record:**

| Field | Description | SOX Requirement |
|-------|-------------|-----------------|
| WHO | Authenticated user ID (unique, never shared) | Section 302 -- accountability |
| WHAT | Before and after values of every changed field | Section 404 -- evidence of controls |
| WHEN | Precise timestamp with timezone (UTC preferred) | Section 802 -- record integrity |
| WHERE | System name, module, table, record ID | Section 404 -- traceability |
| WHY | Linked change request or business justification | Section 404 -- authorization evidence |

**Append-only audit log table schema:**

```sql
-- SOX Section 802: Immutable audit log with tamper detection
-- This table must NEVER have UPDATE or DELETE permissions granted
CREATE TABLE financial_audit_log (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id        CHAR(36) NOT NULL,          -- UUID, globally unique
    timestamp_utc   DATETIME(6) NOT NULL DEFAULT NOW(6),
    user_id         VARCHAR(100) NOT NULL,       -- Unique user, never shared accounts
    user_ip         VARCHAR(45),                 -- Source IP for forensics
    session_id      VARCHAR(100),                -- Session correlation

    action          VARCHAR(100) NOT NULL,       -- e.g., 'journal_entry_created'
    entity_type     VARCHAR(100) NOT NULL,       -- e.g., 'journal_entry'
    entity_id       VARCHAR(100) NOT NULL,       -- Record identifier
    transaction_id  VARCHAR(100),                -- Groups related changes

    before_state    JSON,                        -- Full state before change
    after_state     JSON,                        -- Full state after change
    changed_fields  JSON,                        -- List of specific fields changed

    change_reason   TEXT,                        -- Business justification
    ticket_id       VARCHAR(100),                -- Link to change request

    -- Tamper detection: hash chain
    previous_hash   CHAR(64),                    -- SHA-256 of previous record
    record_hash     CHAR(64) NOT NULL,           -- SHA-256 of this record

    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_user (user_id, timestamp_utc),
    INDEX idx_timestamp (timestamp_utc),
    INDEX idx_transaction (transaction_id)
) ENGINE=InnoDB;

-- CRITICAL: Revoke UPDATE and DELETE on this table for all application users
-- GRANT INSERT, SELECT ON financial_audit_log TO 'app_user'@'%';
-- No UPDATE, no DELETE
```

**Hash chain for tamper detection:**

```python
import hashlib
import json
from datetime import datetime, timezone

class AuditLogger:
    """
    SOX Section 802: Append-only audit log with cryptographic hash chain.
    Each record includes the hash of the previous record, creating a
    tamper-evident chain. If any record is modified or deleted, the
    chain breaks and the tampering is detectable.
    """

    def __init__(self, db_connection):
        self.db = db_connection

    def _compute_hash(self, record: dict) -> str:
        """Compute SHA-256 hash of audit record fields."""
        hashable = json.dumps({
            "event_id": record["event_id"],
            "timestamp_utc": record["timestamp_utc"],
            "user_id": record["user_id"],
            "action": record["action"],
            "entity_type": record["entity_type"],
            "entity_id": record["entity_id"],
            "before_state": record["before_state"],
            "after_state": record["after_state"],
            "previous_hash": record["previous_hash"],
        }, sort_keys=True, default=str)
        return hashlib.sha256(hashable.encode()).hexdigest()

    def _get_last_hash(self) -> str:
        """Retrieve hash of the most recent audit record."""
        result = self.db.execute(
            "SELECT record_hash FROM financial_audit_log "
            "ORDER BY id DESC LIMIT 1"
        ).fetchone()
        return result.record_hash if result else "0" * 64  # Genesis hash

    def log(self, user_id: str, action: str, entity_type: str,
            entity_id: str, before_state: dict = None,
            after_state: dict = None, change_reason: str = None,
            ticket_id: str = None, transaction_id: str = None):
        """Write an immutable, hash-chained audit record."""
        import uuid

        previous_hash = self._get_last_hash()

        record = {
            "event_id": str(uuid.uuid4()),
            "timestamp_utc": datetime.now(timezone.utc).isoformat(),
            "user_id": user_id,
            "action": action,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "before_state": before_state,
            "after_state": after_state,
            "changed_fields": self._diff_fields(before_state, after_state),
            "change_reason": change_reason,
            "ticket_id": ticket_id,
            "transaction_id": transaction_id,
            "previous_hash": previous_hash,
        }
        record["record_hash"] = self._compute_hash(record)

        self.db.execute(
            "INSERT INTO financial_audit_log "
            "(event_id, timestamp_utc, user_id, action, entity_type, entity_id, "
            "transaction_id, before_state, after_state, changed_fields, "
            "change_reason, ticket_id, previous_hash, record_hash) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
            (record["event_id"], record["timestamp_utc"], record["user_id"],
             record["action"], record["entity_type"], record["entity_id"],
             record["transaction_id"],
             json.dumps(record["before_state"]),
             json.dumps(record["after_state"]),
             json.dumps(record["changed_fields"]),
             record["change_reason"], record["ticket_id"],
             record["previous_hash"], record["record_hash"])
        )
        self.db.commit()

    def _diff_fields(self, before: dict, after: dict) -> list:
        """Identify which fields changed between before and after states."""
        if before is None or after is None:
            return []
        changed = []
        all_keys = set(list(before.keys()) + list(after.keys()))
        for key in all_keys:
            if before.get(key) != after.get(key):
                changed.append(key)
        return changed

    def verify_chain(self, start_id: int = None, end_id: int = None) -> dict:
        """
        SOX Section 802: Verify hash chain integrity.
        Run periodically to detect tampering.
        """
        query = "SELECT * FROM financial_audit_log ORDER BY id"
        if start_id and end_id:
            query += f" WHERE id BETWEEN {start_id} AND {end_id}"

        records = self.db.execute(query).fetchall()
        broken_links = []
        previous_hash = "0" * 64

        for record in records:
            if record.previous_hash != previous_hash:
                broken_links.append({
                    "record_id": record.id,
                    "expected_previous_hash": previous_hash,
                    "actual_previous_hash": record.previous_hash,
                })
            recomputed = self._compute_hash(record.__dict__)
            if recomputed != record.record_hash:
                broken_links.append({
                    "record_id": record.id,
                    "expected_hash": recomputed,
                    "actual_hash": record.record_hash,
                    "issue": "record_modified",
                })
            previous_hash = record.record_hash

        return {
            "records_checked": len(records),
            "chain_intact": len(broken_links) == 0,
            "broken_links": broken_links,
        }
```

**PHP audit logging implementation:**

```php
class FinancialAuditLogger
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function log(
        string $userId,
        string $action,
        string $entityType,
        string $entityId,
        ?array $beforeState = null,
        ?array $afterState = null,
        ?string $changeReason = null,
        ?string $ticketId = null,
        ?string $transactionId = null
    ): void {
        $previousHash = $this->getLastHash();
        $eventId = $this->generateUuid();
        $timestamp = gmdate('Y-m-d\TH:i:s.u\Z');

        $record = [
            'event_id'       => $eventId,
            'timestamp_utc'  => $timestamp,
            'user_id'        => $userId,
            'action'         => $action,
            'entity_type'    => $entityType,
            'entity_id'      => $entityId,
            'before_state'   => $beforeState,
            'after_state'    => $afterState,
            'previous_hash'  => $previousHash,
        ];
        $recordHash = $this->computeHash($record);
        $changedFields = $this->diffFields($beforeState, $afterState);

        $stmt = $this->db->prepare(
            'INSERT INTO financial_audit_log
            (event_id, timestamp_utc, user_id, action, entity_type, entity_id,
             transaction_id, before_state, after_state, changed_fields,
             change_reason, ticket_id, previous_hash, record_hash)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );

        $stmt->execute([
            $eventId, $timestamp, $userId, $action, $entityType, $entityId,
            $transactionId,
            json_encode($beforeState),
            json_encode($afterState),
            json_encode($changedFields),
            $changeReason, $ticketId, $previousHash, $recordHash,
        ]);
    }

    private function computeHash(array $record): string
    {
        $hashable = json_encode([
            'event_id'       => $record['event_id'],
            'timestamp_utc'  => $record['timestamp_utc'],
            'user_id'        => $record['user_id'],
            'action'         => $record['action'],
            'entity_type'    => $record['entity_type'],
            'entity_id'      => $record['entity_id'],
            'before_state'   => $record['before_state'],
            'after_state'    => $record['after_state'],
            'previous_hash'  => $record['previous_hash'],
        ], JSON_THROW_ON_ERROR);

        return hash('sha256', $hashable);
    }

    private function getLastHash(): string
    {
        $stmt = $this->db->query(
            'SELECT record_hash FROM financial_audit_log ORDER BY id DESC LIMIT 1'
        );
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? $row['record_hash'] : str_repeat('0', 64);
    }

    private function diffFields(?array $before, ?array $after): array
    {
        if ($before === null || $after === null) {
            return [];
        }
        $changed = [];
        $allKeys = array_unique(array_merge(array_keys($before), array_keys($after)));
        foreach ($allKeys as $key) {
            if (($before[$key] ?? null) !== ($after[$key] ?? null)) {
                $changed[] = $key;
            }
        }
        return $changed;
    }
}
```

**7-year retention policy configuration:**

```sql
-- SOX Section 802: Retention policy
-- Financial audit logs must be retained for a minimum of 7 years
-- Partition by year for efficient archival without deletion

ALTER TABLE financial_audit_log
    PARTITION BY RANGE (YEAR(timestamp_utc)) (
        PARTITION p2024 VALUES LESS THAN (2025),
        PARTITION p2025 VALUES LESS THAN (2026),
        PARTITION p2026 VALUES LESS THAN (2027),
        PARTITION p2027 VALUES LESS THAN (2028),
        PARTITION p2028 VALUES LESS THAN (2029),
        PARTITION p2029 VALUES LESS THAN (2030),
        PARTITION p2030 VALUES LESS THAN (2031),
        PARTITION p2031 VALUES LESS THAN (2032),
        PARTITION pmax  VALUES LESS THAN MAXVALUE
    );

-- Archive old partitions to cold storage before dropping
-- NEVER drop a partition less than 7 years old
```

## 6. Application Controls

### 6.1 Input Controls

**Data validation for financial entries:**

```python
from decimal import Decimal, InvalidOperation
from datetime import date

class JournalEntryValidator:
    """SOX Section 404: Input controls for journal entries."""

    MAX_LINE_AMOUNT = Decimal("999999999.99")  # Configurable threshold
    VALID_CURRENCIES = {"USD", "EUR", "GBP", "JPY", "CAD"}

    def validate(self, entry: dict) -> list:
        errors = []

        # Completeness: all required fields present
        required = ["date", "description", "lines", "created_by"]
        for field in required:
            if not entry.get(field):
                errors.append(f"Missing required field: {field}")

        # Date validation: no future-dated entries without approval
        if entry.get("date"):
            entry_date = self._parse_date(entry["date"])
            if entry_date and entry_date > date.today():
                errors.append("Future-dated entry requires supervisory approval")

            # No entries in closed periods
            if entry_date and self._is_period_closed(entry_date):
                errors.append(f"Period {entry_date.strftime('%Y-%m')} is closed")

        # Line validation
        if entry.get("lines"):
            total_debit = Decimal("0")
            total_credit = Decimal("0")

            for i, line in enumerate(entry["lines"]):
                # Amount validation
                try:
                    debit = Decimal(str(line.get("debit", "0")))
                    credit = Decimal(str(line.get("credit", "0")))
                except InvalidOperation:
                    errors.append(f"Line {i+1}: Invalid amount format")
                    continue

                if debit < 0 or credit < 0:
                    errors.append(f"Line {i+1}: Negative amounts not allowed")
                if debit > self.MAX_LINE_AMOUNT or credit > self.MAX_LINE_AMOUNT:
                    errors.append(f"Line {i+1}: Amount exceeds threshold")
                if debit > 0 and credit > 0:
                    errors.append(f"Line {i+1}: Line cannot have both debit and credit")

                # Account validation
                if not self._is_valid_account(line.get("account")):
                    errors.append(f"Line {i+1}: Invalid account code")

                total_debit += debit
                total_credit += credit

            # Balance check: debits must equal credits
            if total_debit != total_credit:
                errors.append(
                    f"Entry is unbalanced: debits={total_debit}, credits={total_credit}"
                )

        # Duplicate detection
        if self._is_duplicate(entry):
            errors.append("Potential duplicate entry detected -- requires override approval")

        return errors
```

**Approval workflow for journal entries:**

```python
class JournalApprovalWorkflow:
    """
    SOX Section 404: Journal entries require approval before posting.
    The approver MUST be different from the creator (SoD).
    """

    APPROVAL_THRESHOLDS = [
        # (amount_threshold, required_approval_level)
        (Decimal("10000"),    "supervisor"),
        (Decimal("100000"),   "controller"),
        (Decimal("1000000"),  "cfo"),
    ]

    def submit_for_approval(self, entry_id: str, submitter_id: str):
        entry = self.get_entry(entry_id)

        if entry.created_by != submitter_id:
            raise PermissionError("Only the creator can submit for approval")

        max_amount = max(
            sum(line.debit for line in entry.lines),
            sum(line.credit for line in entry.lines)
        )

        required_level = "supervisor"  # Default
        for threshold, level in self.APPROVAL_THRESHOLDS:
            if max_amount >= threshold:
                required_level = level

        entry.status = "pending_approval"
        entry.required_approval_level = required_level
        self.save(entry)

        audit_log("journal_submitted_for_approval",
                  entity_type="journal_entry", entity_id=entry_id,
                  user_id=submitter_id,
                  after_state={"status": "pending_approval",
                               "required_level": required_level})

    def approve(self, entry_id: str, approver_id: str):
        entry = self.get_entry(entry_id)

        # SOX SoD: Approver cannot be the creator
        if entry.created_by == approver_id:
            audit_log("sod_violation_blocked", user_id=approver_id,
                      entity_type="journal_entry", entity_id=entry_id,
                      after_state={"violation": "creator_cannot_approve"})
            raise SoDViolationError("Creator cannot approve their own entry")

        # Verify approver has sufficient authority level
        if not self.user_has_level(approver_id, entry.required_approval_level):
            raise PermissionError(
                f"Approver must have {entry.required_approval_level} level"
            )

        before = {"status": entry.status}
        entry.status = "approved"
        entry.approved_by = approver_id
        entry.approved_at = datetime.now(timezone.utc)
        self.save(entry)

        audit_log("journal_entry_approved",
                  entity_type="journal_entry", entity_id=entry_id,
                  user_id=approver_id,
                  before_state=before,
                  after_state={"status": "approved",
                               "approved_by": approver_id})
```

### 6.2 Processing Controls

**Transaction atomicity for financial postings:**

```python
def post_journal_entry(entry_id: str, user_id: str):
    """
    SOX Section 404: Post journal entry to general ledger.
    All-or-nothing: either all lines post or none do.
    """
    entry = get_journal_entry(entry_id)

    if entry.status != "approved":
        raise InvalidStateError("Only approved entries can be posted")

    before_balances = {}
    try:
        db.begin_transaction()

        for line in entry.lines:
            # Capture before state for audit trail
            balance = get_account_balance(line.account)
            before_balances[line.account] = balance

            # Update general ledger
            update_gl_balance(
                account=line.account,
                debit=line.debit,
                credit=line.credit,
                entry_id=entry_id,
                period=entry.posting_period,
            )

        # Update entry status
        entry.status = "posted"
        entry.posted_by = user_id
        entry.posted_at = datetime.now(timezone.utc)
        save_entry(entry)

        db.commit()

    except Exception as e:
        db.rollback()
        audit_log("journal_posting_failed",
                  entity_type="journal_entry", entity_id=entry_id,
                  user_id=user_id,
                  after_state={"error": str(e)})
        raise

    # Audit trail for successful posting (after commit)
    after_balances = {acct: get_account_balance(acct) for acct in before_balances}
    audit_log("journal_entry_posted",
              entity_type="journal_entry", entity_id=entry_id,
              user_id=user_id,
              before_state={"balances": before_balances, "status": "approved"},
              after_state={"balances": after_balances, "status": "posted"})
```

**Sub-ledger to general ledger reconciliation:**

```python
def reconcile_sub_ledger_to_gl(sub_ledger: str, period: str):
    """
    SOX Section 404: Automated reconciliation between sub-ledger and GL.
    Run daily. Discrepancies must be investigated and resolved.
    """
    sub_total = get_sub_ledger_total(sub_ledger, period)
    gl_total = get_gl_balance_for_sub_ledger(sub_ledger, period)

    difference = sub_total - gl_total
    is_reconciled = abs(difference) < Decimal("0.01")  # Penny tolerance

    result = {
        "sub_ledger": sub_ledger,
        "period": period,
        "sub_ledger_total": str(sub_total),
        "gl_total": str(gl_total),
        "difference": str(difference),
        "reconciled": is_reconciled,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

    audit_log("reconciliation_performed",
              entity_type="reconciliation",
              entity_id=f"{sub_ledger}_{period}",
              user_id="system_batch",
              after_state=result)

    if not is_reconciled:
        alert_finance_team(
            f"Reconciliation discrepancy: {sub_ledger} for {period} "
            f"differs by {difference}"
        )
        create_reconciliation_item(sub_ledger, period, difference)

    return result
```

### 6.3 Output Controls

**Report distribution with access verification:**

```python
def generate_financial_report(report_type: str, period: str, user_id: str):
    """
    SOX Section 302/404: Generate financial report with output controls.
    Only authorized recipients receive reports. All access is logged.
    """
    # Verify user is authorized to receive this report
    if not is_authorized_report_recipient(user_id, report_type):
        audit_log("report_access_denied", user_id=user_id,
                  entity_type="report", entity_id=f"{report_type}_{period}")
        raise AuthorizationError("Not authorized for this report")

    report_data = compile_report(report_type, period)

    # Output-to-input reconciliation: verify report totals match source
    source_totals = get_source_totals(report_type, period)
    report_totals = extract_report_totals(report_data)

    if source_totals != report_totals:
        audit_log("report_reconciliation_failed",
                  entity_type="report", entity_id=f"{report_type}_{period}",
                  user_id="system",
                  after_state={"source": str(source_totals),
                               "report": str(report_totals)})
        raise DataIntegrityError("Report totals do not match source data")

    # Completeness check
    expected_accounts = get_expected_accounts(report_type)
    reported_accounts = extract_accounts(report_data)
    missing = expected_accounts - reported_accounts
    if missing:
        raise DataIntegrityError(f"Report missing accounts: {missing}")

    # Log successful report generation
    audit_log("report_generated",
              entity_type="report", entity_id=f"{report_type}_{period}",
              user_id=user_id,
              after_state={"type": report_type, "period": period,
                           "total": str(report_totals)})

    return report_data
```

## 7. Data Integrity Controls

**Input validation at every entry point:**

```python
class FinancialDataValidator:
    """SOX Section 404: Validate all financial data at system boundaries."""

    @staticmethod
    def validate_amount(value, field_name: str = "amount") -> Decimal:
        """Validate monetary amounts."""
        if value is None:
            raise ValidationError(f"{field_name} is required")
        try:
            amount = Decimal(str(value))
        except (InvalidOperation, ValueError):
            raise ValidationError(f"{field_name} must be a valid number")

        if amount.as_tuple().exponent < -2:
            raise ValidationError(f"{field_name} cannot have more than 2 decimal places")
        if amount < 0:
            raise ValidationError(f"{field_name} cannot be negative")

        return amount

    @staticmethod
    def validate_account_code(code: str) -> str:
        """Validate account codes against chart of accounts."""
        if not code or not code.strip():
            raise ValidationError("Account code is required")
        if not account_exists(code):
            raise ValidationError(f"Account {code} does not exist in chart of accounts")
        if is_account_inactive(code):
            raise ValidationError(f"Account {code} is inactive")
        return code
```

**Data transfer checksum verification:**

```python
def transfer_financial_data(source_system: str, target_system: str,
                            data: list, user_id: str):
    """
    SOX Section 404: Verify data integrity when transferring between systems.
    Checksum ensures no records are lost, added, or modified in transit.
    """
    # Compute source checksum
    record_count = len(data)
    control_total = sum(Decimal(str(r["amount"])) for r in data)
    hash_digest = hashlib.sha256(
        json.dumps(data, sort_keys=True, default=str).encode()
    ).hexdigest()

    transfer_manifest = {
        "source_system": source_system,
        "target_system": target_system,
        "record_count": record_count,
        "control_total": str(control_total),
        "hash_digest": hash_digest,
        "transfer_time": datetime.now(timezone.utc).isoformat(),
    }

    # Send data to target system
    result = send_to_target(target_system, data, transfer_manifest)

    # Verify target received correctly
    if result["received_count"] != record_count:
        raise DataIntegrityError(
            f"Record count mismatch: sent {record_count}, "
            f"received {result['received_count']}"
        )
    if result["received_hash"] != hash_digest:
        raise DataIntegrityError("Data hash mismatch -- data corrupted in transit")

    audit_log("data_transfer_completed",
              entity_type="data_transfer",
              entity_id=f"{source_system}_to_{target_system}",
              user_id=user_id,
              after_state=transfer_manifest)
```

**Encryption for financial data at rest:**

```python
from cryptography.fernet import Fernet

class FinancialDataEncryption:
    """
    SOX Section 404: Encrypt sensitive financial data at rest.
    Key management must follow least-privilege and rotation policies.
    """

    def __init__(self, key_provider):
        self.key_provider = key_provider

    def encrypt_field(self, plaintext: str, field_name: str) -> str:
        """Encrypt a single field value. Key is retrieved per-operation."""
        key = self.key_provider.get_current_key()
        f = Fernet(key)
        return f.encrypt(plaintext.encode()).decode()

    def decrypt_field(self, ciphertext: str, field_name: str,
                      user_id: str) -> str:
        """Decrypt a field. Access is logged for audit trail."""
        audit_log("sensitive_field_accessed",
                  entity_type="field_access",
                  entity_id=field_name,
                  user_id=user_id)

        key = self.key_provider.get_current_key()
        f = Fernet(key)
        return f.decrypt(ciphertext.encode()).decode()
```

## 8. Change Management for Code

The full SOX-compliant change pipeline with ten required steps:

```
1. Change Request     --> Documented in ticketing system with business justification
2. Impact Assessment  --> Which financial reports/processes affected?
3. Approval           --> Business owner approves (NOT the developer)
4. Development        --> Isolated environment, no production data
5. Testing            --> Unit + integration + security + UAT
6. Code Review        --> By peer (NOT the author)
7. Deploy Approval    --> Separate from dev approval (SoD)
8. Automated Deploy   --> CI/CD pipeline (not manual)
9. Post-Deploy Verify --> Smoke tests + reconciliation check
10. Audit Trail       --> Every step logged with who/what/when
```

**CI/CD pipeline gate configuration:**

```yaml
# Generic CI/CD pipeline for SOX-compliant deployment
pipeline:
  stages:
    - name: validate
      steps:
        - verify_ticket_linked        # Every change tied to approved ticket
        - verify_ticket_approved       # Ticket approved by authorized person
        - verify_branch_protection     # PR approved, reviews not stale

    - name: test
      steps:
        - run_unit_tests
        - run_integration_tests
        - run_security_checks
        - verify_audit_logging         # Custom: ensure financial mutations are logged
        - generate_test_report         # Evidence retained for auditors

    - name: review_gate
      steps:
        - verify_code_review_count: 2  # Minimum 2 approvals
        - verify_author_not_reviewer   # SoD enforcement
        - verify_codeowner_approved    # Finance module owners signed off

    - name: deploy_staging
      steps:
        - deploy_to_staging
        - run_smoke_tests
        - run_reconciliation_check     # Verify financial data integrity

    - name: deploy_production
      requires_manual_approval: true
      approval_constraints:
        approver_cannot_be_author: true
        required_role: release_manager
      steps:
        - deploy_to_production
        - run_smoke_tests
        - run_reconciliation_check
        - notify_change_management     # Close the change ticket
```

**Deployment checklist (automated verification):**

```python
class SOXDeploymentChecklist:
    """
    SOX Section 404: Automated pre-deployment verification.
    All items must pass before production deployment proceeds.
    """

    def run_all_checks(self, deployment) -> dict:
        results = {}

        # 1. Change request traceability
        results["ticket_linked"] = deployment.ticket_id is not None
        results["ticket_approved"] = self._check_ticket_approved(deployment.ticket_id)

        # 2. Segregation of duties
        results["author_not_deployer"] = (
            deployment.code_author != deployment.deploy_approver
        )
        results["reviewer_not_author"] = (
            deployment.code_author not in deployment.code_reviewers
        )

        # 3. Testing evidence
        results["unit_tests_passed"] = deployment.test_results.unit.passed
        results["integration_tests_passed"] = deployment.test_results.integration.passed
        results["security_scan_clean"] = (
            deployment.security_results.critical == 0
            and deployment.security_results.high == 0
        )

        # 4. Code review
        results["min_reviews_met"] = len(deployment.code_reviewers) >= 2
        results["codeowner_approved"] = deployment.codeowner_approved

        # 5. Environment segregation
        results["staging_tested"] = deployment.staging_smoke_passed
        results["no_prod_data_in_dev"] = self._verify_no_prod_data(deployment)

        # Log result
        all_passed = all(results.values())
        audit_log(
            "deployment_checklist_completed",
            entity_type="deployment",
            entity_id=deployment.id,
            user_id=deployment.deploy_approver,
            after_state={
                "results": results,
                "all_passed": all_passed,
                "ticket_id": deployment.ticket_id,
            }
        )

        if not all_passed:
            failed = [k for k, v in results.items() if not v]
            raise DeploymentBlockedError(
                f"SOX deployment checks failed: {', '.join(failed)}"
            )

        return results
```

## 9. Backup and Recovery

```python
class FinancialBackupPolicy:
    """
    SOX ITGC Domain 4: Backup and recovery requirements
    for financial systems.
    """

    REQUIREMENTS = {
        "financial_database": {
            "frequency": "daily",
            "retention_days": 2555,          # 7 years (SOX Section 802)
            "encryption": True,
            "offsite_copy": True,
            "test_restore_frequency": "quarterly",
            "rto_hours": 4,                  # Recovery Time Objective
            "rpo_hours": 1,                  # Recovery Point Objective
        },
        "audit_log_database": {
            "frequency": "daily",
            "retention_days": 2555,          # 7 years -- never shorter than data
            "encryption": True,
            "offsite_copy": True,
            "test_restore_frequency": "quarterly",
            "rto_hours": 4,
            "rpo_hours": 1,
        },
        "document_storage": {
            "frequency": "daily",
            "retention_days": 2555,
            "encryption": True,
            "offsite_copy": True,
            "test_restore_frequency": "annually",
            "rto_hours": 24,
            "rpo_hours": 24,
        },
    }

    def verify_backup_compliance(self, system_name: str):
        """Verify a system's backup meets SOX requirements."""
        policy = self.REQUIREMENTS.get(system_name)
        if not policy:
            raise ValueError(f"No backup policy defined for {system_name}")

        backup = get_latest_backup(system_name)
        issues = []

        if backup is None:
            issues.append("No backup found")
        else:
            # Check age
            age_hours = (datetime.now(timezone.utc) - backup.timestamp).total_seconds() / 3600
            max_age = 25 if policy["frequency"] == "daily" else 169  # daily or weekly
            if age_hours > max_age:
                issues.append(f"Backup is {age_hours:.0f} hours old (max {max_age})")

            # Check encryption
            if policy["encryption"] and not backup.is_encrypted:
                issues.append("Backup is not encrypted")

            # Check offsite copy
            if policy["offsite_copy"] and not backup.has_offsite_copy:
                issues.append("No offsite copy found")

            # Check integrity
            if not verify_backup_checksum(backup):
                issues.append("Backup checksum verification failed")

        # Check test restore currency
        last_test = get_last_restore_test(system_name)
        if last_test is None:
            issues.append("No restore test on record")
        else:
            test_age_days = (date.today() - last_test.date).days
            max_days = 90 if policy["test_restore_frequency"] == "quarterly" else 365
            if test_age_days > max_days:
                issues.append(f"Last restore test was {test_age_days} days ago (max {max_days})")

        audit_log("backup_compliance_check",
                  entity_type="backup", entity_id=system_name,
                  user_id="system_batch",
                  after_state={"issues": issues, "compliant": len(issues) == 0})

        return {"system": system_name, "compliant": len(issues) == 0, "issues": issues}
```

## 10. Common Mistakes

| Mistake | SOX Risk | Fix |
|---------|----------|-----|
| Shared service accounts for financial systems | No individual accountability; audit trail is meaningless | Unique user IDs per person; service accounts scoped per application with logged usage |
| Developer self-approves and deploys own code | Segregation of duties violation | Branch protection requiring peer review; CI/CD deploys (never manual); deploy approver cannot be author |
| No audit trail on journal entry mutations | Cannot prove controls are operating; Section 802 violation | Append-only audit log on every create, update, approve, post, and void operation |
| Audit log captures action but not before/after values | Auditors cannot verify what changed; insufficient evidence | Always capture full before and after state of the affected record |
| Developers have direct production database access | Unauthorized changes possible without controls | Remove direct access; all changes through application layer with audit trail; read-only replicas for debugging |
| No change ticket linked to code deployments | Cannot prove changes were authorized | CI/CD gate that blocks deployment without valid, approved ticket reference |
| Hardcoded credentials in financial system code | Unauthorized access risk; credential rotation impossible | Environment variables or secrets manager; rotate credentials on schedule; never commit secrets |
| No backup restore testing | Backup may be corrupt; RTO/RPO unverifiable | Quarterly restore tests with documented results; automated backup integrity verification |
| Audit logs can be modified or deleted | Tamper risk destroys evidentiary value; Section 802 violation | Append-only table permissions (INSERT and SELECT only); hash chain for tamper detection |
| Journal entries post without approval workflow | No authorization control; Section 404 finding | Mandatory approval step with SoD (creator cannot approve); amount-based escalation thresholds |
| No environment segregation (dev/staging/prod) | Untested code can reach production; unauthorized changes | Separate environments; no production data in dev/test; pipeline enforces promotion path |
| Manual production deployments via SSH | No audit trail; no SoD; no testing gate | Automated CI/CD pipeline as the sole deployment mechanism; SSH access restricted and logged |
| No reconciliation between sub-ledger and GL | Data discrepancies go undetected | Automated daily reconciliation with alerting on discrepancies; monthly management review |
| Financial reports accessible to all users | Unauthorized disclosure of material non-public information | Role-based report access; distribution lists reviewed quarterly; access logged |
| Logs do not include timestamps with timezone | Cannot establish event sequence for investigations | UTC timestamps with millisecond precision on all audit records |

## 11. Quick Reference

### DO

- Use unique user IDs for every person accessing financial systems (SOX 302)
- Implement RBAC with least privilege on all financial endpoints (ITGC Domain 1)
- Enforce segregation of duties: creator cannot approve, author cannot deploy (SOX 404)
- Log every financial data mutation with WHO, WHAT (before/after), WHEN, WHERE, WHY (SOX 802)
- Use append-only audit tables with hash chains for tamper detection (SOX 802)
- Retain financial records and audit logs for a minimum of 7 years (SOX 802)
- Validate all financial inputs: type, range, format, completeness, balance (SOX 404)
- Require approval workflows for journal entries with amount-based escalation (SOX 404)
- Use transaction atomicity (BEGIN/COMMIT/ROLLBACK) for all financial postings (SOX 404)
- Reconcile sub-ledgers to general ledger daily with automated alerting (SOX 404)
- Link every code deployment to an approved change request (ITGC Domain 2)
- Require peer code review (minimum 2 reviewers, not the author) (ITGC Domain 2)
- Deploy only through automated CI/CD pipelines, never manually (ITGC Domain 2)
- Encrypt financial data at rest and in transit (SOX 404)
- Test backups quarterly with documented restore results (ITGC Domain 4)
- Run periodic access reviews and remove terminated user access promptly (ITGC Domain 1)
- Document all controls and retain test evidence for auditors (SOX 404)
- Verify report output totals against source data before distribution (SOX 404)
- Use separate dev, staging, and production environments (ITGC Domain 2)
- Implement checksums for data transfers between financial systems (SOX 404)

### DO NOT

- Use shared or generic accounts on any financial system (violates SOX 302)
- Allow the same person to create AND approve journal entries (SoD violation)
- Allow code authors to approve or deploy their own changes (SoD violation)
- Store financial data without encryption at rest (SOX 404 finding)
- Permit UPDATE or DELETE operations on audit log tables (SOX 802 violation)
- Deploy code without an approved change ticket (ITGC Domain 2 finding)
- Grant developers direct access to production databases (ITGC Domain 1 finding)
- Skip before/after value capture in audit logs (insufficient audit evidence)
- Use manual deployment processes for financial systems (no audit trail, no SoD)
- Allow financial reports to be accessed without authorization checks (SOX 302)
- Delete or modify audit records under any circumstances (SOX 802, up to 20 years prison)
- Use production financial data in development or test environments (data leakage risk)
- Deploy without passing all automated tests (ITGC Domain 2 finding)
- Skip backup integrity verification (ITGC Domain 4 finding)
- Hardcode credentials or secrets in source code (ITGC Domain 1 finding)
- Allow entries in closed accounting periods without documented override (SOX 404)
- Ignore reconciliation discrepancies between systems (SOX 404 finding)
- Build financial logic without documented test cases (ITGC Domain 3 finding)
