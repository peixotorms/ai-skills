---
name: pci-compliance
description: Use when building payment processing, handling credit card data, implementing checkout flows, tokenization, or any code that touches cardholder information — PCI DSS coding patterns, data classification, encryption, audit logging, scope reduction
---

# PCI DSS Compliance Coding Guidelines

## 1. Overview

PCI DSS (Payment Card Industry Data Security Standard) is a set of security requirements established by the major card brands (Visa, Mastercard, Amex, Discover, JCB) to protect cardholder data wherever it is processed, stored, or transmitted. Every developer writing code that touches payment card information -- whether directly handling card numbers or integrating with a payment processor -- must understand these requirements because a single coding mistake (logging a full card number, storing a CVV, transmitting over HTTP) can cause a data breach, result in fines ranging from $5,000 to $100,000 per month, and revoke the organization's ability to accept card payments entirely.

## 2. The 12 Requirements (Developer View)

| # | PCI DSS Requirement | What Developers Must Do in Code |
|---|---------------------|-------------------------------|
| 1 | Install and maintain network security controls | Configure firewalls in deployment scripts; restrict inbound/outbound traffic to payment endpoints only; never expose card-processing services directly to the internet |
| 2 | Apply secure configurations to all system components | Remove default credentials from all configs; disable unnecessary services and debug endpoints in production; enforce secure defaults in environment configuration |
| 3 | Protect stored account data | Never store CVV/CVC; mask PAN to first 6 and last 4 digits; encrypt stored card data with AES-256; implement cryptographic key rotation |
| 4 | Protect cardholder data with strong cryptography during transmission | Enforce TLS 1.2+ on all payment endpoints; set HSTS headers; use secure cookie flags; reject plaintext HTTP for any cardholder data |
| 5 | Protect all systems and networks from malicious software | Validate and sanitize all input to payment endpoints; reject unexpected file uploads on payment pages; use dependency scanning in build process |
| 6 | Develop and maintain secure systems and software | Follow secure coding practices; conduct code reviews for payment logic; patch dependencies promptly; maintain a software inventory |
| 7 | Restrict access to system components and cardholder data by business need to know | Implement RBAC on payment endpoints; enforce least-privilege database permissions; separate payment service credentials from general application credentials |
| 8 | Identify users and authenticate access to system components | Require MFA for admin access to payment systems; enforce strong password policies; use unique service accounts per component; implement session timeouts |
| 9 | Restrict physical access to cardholder data | (Infrastructure concern -- ensure payment encryption keys are stored in HSM or secure vault, not on developer machines or in source code) |
| 10 | Log and monitor all access to system components and cardholder data | Log every access to payment endpoints with timestamp, user, IP, action, and result; never log card numbers or CVV; implement tamper-evident log storage |
| 11 | Test security of systems and networks regularly | Write unit tests for input validation on payment fields; test that logs do not contain card data; verify TLS configuration in integration tests |
| 12 | Support information security with organizational policies and programs | Document payment data flows; maintain an inventory of where card data is processed; train on secure coding before writing payment code |

## 3. Data Classification

### 3.1 NEVER Store (Prohibited Under All Circumstances)

These data elements must never be written to any persistent storage, log file, error message, analytics system, or debugging output after authorization:

- **Full magnetic stripe data** (track 1 and track 2)
- **CVV / CVC / CID** (3 or 4 digit security code)
- **PIN or encrypted PIN block**
- **Full unmasked card number in logs or error messages**

### 3.2 May Store (With Encryption and Business Justification)

| Data Element | Storage Rule |
|---|---|
| PAN (Primary Account Number) | Must be rendered unreadable (encryption, truncation, masking, or hashing). Display masked: first 6 and last 4 digits only |
| Cardholder name | Encrypt at rest if stored alongside PAN |
| Expiration date | Encrypt at rest if stored alongside PAN |
| Service code | Encrypt at rest if stored alongside PAN |

### 3.3 PAN Masking Function

**PHP:**
```php
function maskPan(string $pan): string
{
    $cleaned = preg_replace('/\D/', '', $pan);
    $len = strlen($cleaned);
    if ($len < 13 || $len > 19) {
        return str_repeat('*', $len);
    }
    $first6 = substr($cleaned, 0, 6);
    $last4 = substr($cleaned, -4);
    $masked = str_repeat('*', $len - 10);
    return $first6 . $masked . $last4;
}
// "4111111111111111" → "411111******1111"
```

**Python:**
```python
import re

def mask_pan(pan: str) -> str:
    cleaned = re.sub(r'\D', '', pan)
    length = len(cleaned)
    if length < 13 or length > 19:
        return '*' * length
    return cleaned[:6] + '*' * (length - 10) + cleaned[-4:]

# "4111111111111111" → "411111******1111"
```

**JavaScript/Node:**
```javascript
function maskPan(pan) {
    const cleaned = pan.replace(/\D/g, '');
    const len = cleaned.length;
    if (len < 13 || len > 19) {
        return '*'.repeat(len);
    }
    return cleaned.slice(0, 6) + '*'.repeat(len - 10) + cleaned.slice(-4);
}
// "4111111111111111" → "411111******1111"
```

### 3.4 Log Sanitization

Regex patterns to detect and redact card numbers from log output before writing:

**PHP:**
```php
function sanitizeLogEntry(string $message): string
{
    // Match 13-19 digit sequences that pass Luhn check
    return preg_replace_callback(
        '/\b(\d{13,19})\b/',
        function ($matches) {
            if (luhnCheck($matches[1])) {
                return maskPan($matches[1]);
            }
            return $matches[1];
        },
        $message
    );
}

// Also catch formatted card numbers with spaces or dashes
function sanitizeFormattedCards(string $message): string
{
    return preg_replace(
        '/\b(\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{1,7})\b/',
        '[CARD_REDACTED]',
        $message
    );
}
```

**Python:**
```python
import re

CARD_PATTERN = re.compile(r'\b(\d{13,19})\b')
FORMATTED_CARD = re.compile(r'\b(\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{1,7})\b')

def sanitize_log_entry(message: str) -> str:
    def replace_match(match):
        digits = match.group(1)
        if luhn_check(digits):
            return mask_pan(digits)
        return digits
    message = CARD_PATTERN.sub(replace_match, message)
    message = FORMATTED_CARD.sub('[CARD_REDACTED]', message)
    return message
```

**JavaScript/Node:**
```javascript
const CARD_PATTERN = /\b(\d{13,19})\b/g;
const FORMATTED_CARD = /\b(\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{1,7})\b/g;

function sanitizeLogEntry(message) {
    message = message.replace(CARD_PATTERN, (match) => {
        return luhnCheck(match) ? maskPan(match) : match;
    });
    return message.replace(FORMATTED_CARD, '[CARD_REDACTED]');
}
```

### 3.5 Luhn Validation

Use to detect whether a digit sequence is a card number (for log sanitization and input validation):

**PHP:**
```php
function luhnCheck(string $number): bool
{
    $cleaned = preg_replace('/\D/', '', $number);
    $len = strlen($cleaned);
    if ($len < 13 || $len > 19) {
        return false;
    }
    $sum = 0;
    $alternate = false;
    for ($i = $len - 1; $i >= 0; $i--) {
        $digit = (int) $cleaned[$i];
        if ($alternate) {
            $digit *= 2;
            if ($digit > 9) {
                $digit -= 9;
            }
        }
        $sum += $digit;
        $alternate = !$alternate;
    }
    return $sum % 10 === 0;
}
```

**Python:**
```python
def luhn_check(number: str) -> bool:
    cleaned = re.sub(r'\D', '', number)
    if not (13 <= len(cleaned) <= 19):
        return False
    total = 0
    alternate = False
    for ch in reversed(cleaned):
        digit = int(ch)
        if alternate:
            digit *= 2
            if digit > 9:
                digit -= 9
        total += digit
        alternate = not alternate
    return total % 10 == 0
```

**JavaScript/Node:**
```javascript
function luhnCheck(number) {
    const cleaned = number.replace(/\D/g, '');
    if (cleaned.length < 13 || cleaned.length > 19) return false;
    let sum = 0;
    let alternate = false;
    for (let i = cleaned.length - 1; i >= 0; i--) {
        let digit = parseInt(cleaned[i], 10);
        if (alternate) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        alternate = !alternate;
    }
    return sum % 10 === 0;
}
```

## 4. Tokenization Patterns

### 4.1 Preferred: Use Payment Processor Tokens

The safest PCI strategy is to never let card data touch your servers. Use client-side tokenization provided by your payment processor.

**Stripe Elements (client-side JavaScript):**
```javascript
// Card data goes directly from user's browser to Stripe
// Your server never sees the raw card number
const stripe = Stripe('pk_live_...');
const elements = stripe.elements();
const cardElement = elements.create('card');
cardElement.mount('#card-element');

async function handlePayment(event) {
    event.preventDefault();

    const { paymentMethod, error } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
    });

    if (error) {
        showError(error.message);
        return;
    }

    // Send only the token/paymentMethod ID to your server
    const response = await fetch('/api/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethodId: paymentMethod.id }),
    });
}
```

**Server-side PaymentIntent (Node.js) -- only handles tokens:**
```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/api/charge', async (req, res) => {
    const { paymentMethodId } = req.body;

    // Server only receives the token, never the card number
    const paymentIntent = await stripe.paymentIntents.create({
        amount: 2000, // $20.00 in cents
        currency: 'usd',
        payment_method: paymentMethodId,
        confirm: true,
        return_url: 'https://example.com/return',
    });

    auditLog('payment_attempt', {
        intentId: paymentIntent.id,
        status: paymentIntent.status,
        // NEVER log: card number, CVV, expiry
    });

    res.json({ status: paymentIntent.status });
});
```

**Server-side PaymentIntent (PHP):**
```php
$stripe = new \Stripe\StripeClient(getenv('STRIPE_SECRET_KEY'));

$paymentIntent = $stripe->paymentIntents->create([
    'amount' => 2000,
    'currency' => 'usd',
    'payment_method' => $request->input('paymentMethodId'),
    'confirm' => true,
    'return_url' => 'https://example.com/return',
]);

auditLog('payment_attempt', [
    'intentId' => $paymentIntent->id,
    'status' => $paymentIntent->status,
]);
```

### 4.2 Custom Tokenization (When Required)

If you must build your own tokenization layer (rare -- strongly prefer processor tokens):

**Token Vault Pattern (Python):**
```python
import os
import hashlib
from cryptography.fernet import Fernet

class TokenVault:
    def __init__(self, encryption_key: bytes):
        self._fernet = Fernet(encryption_key)

    def tokenize(self, pan: str) -> str:
        """Replace PAN with a random token. Store encrypted mapping."""
        token = os.urandom(16).hex()  # Random, non-reversible token
        encrypted_pan = self._fernet.encrypt(pan.encode())

        # Store in database: token → encrypted_pan
        db.execute(
            "INSERT INTO token_vault (token, encrypted_pan, created_at) "
            "VALUES (?, ?, NOW())",
            (token, encrypted_pan)
        )

        audit_log('pan_tokenized', {'token': token, 'pan_last4': pan[-4:]})
        return token

    def detokenize(self, token: str, requesting_user: str) -> str:
        """Retrieve PAN from token. Requires authorization and logs access."""
        audit_log('detokenize_request', {
            'token': token,
            'user': requesting_user
        })

        row = db.execute(
            "SELECT encrypted_pan FROM token_vault WHERE token = ?",
            (token,)
        ).fetchone()

        if not row:
            raise ValueError("Invalid token")

        pan = self._fernet.decrypt(row['encrypted_pan']).decode()

        audit_log('detokenize_success', {
            'token': token,
            'user': requesting_user,
            'pan_last4': pan[-4:]
        })
        return pan
```

## 5. Encryption Requirements

### 5.1 Encryption at Rest -- AES-256-GCM

All stored cardholder data must be encrypted with strong cryptography. AES-256-GCM provides both confidentiality and integrity.

**PHP (OpenSSL):**
```php
function encryptCardData(string $plaintext, string $key): string
{
    // Key must be 32 bytes for AES-256
    if (strlen($key) !== 32) {
        throw new InvalidArgumentException('Key must be 32 bytes');
    }
    $iv = random_bytes(12); // 96-bit IV for GCM
    $tag = '';
    $ciphertext = openssl_encrypt(
        $plaintext,
        'aes-256-gcm',
        $key,
        OPENSSL_RAW_DATA,
        $iv,
        $tag,
        '', // additional authenticated data
        16  // tag length
    );
    // Store IV + tag + ciphertext together
    return base64_encode($iv . $tag . $ciphertext);
}

function decryptCardData(string $encoded, string $key): string
{
    $data = base64_decode($encoded);
    $iv = substr($data, 0, 12);
    $tag = substr($data, 12, 16);
    $ciphertext = substr($data, 28);
    $plaintext = openssl_decrypt(
        $ciphertext,
        'aes-256-gcm',
        $key,
        OPENSSL_RAW_DATA,
        $iv,
        $tag
    );
    if ($plaintext === false) {
        throw new RuntimeException('Decryption failed -- data may be tampered');
    }
    return $plaintext;
}
```

**Python (cryptography library):**
```python
import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

def encrypt_card_data(plaintext: str, key: bytes) -> bytes:
    """Encrypt with AES-256-GCM. Key must be 32 bytes."""
    if len(key) != 32:
        raise ValueError("Key must be 32 bytes for AES-256")
    nonce = os.urandom(12)  # 96-bit nonce
    aesgcm = AESGCM(key)
    ciphertext = aesgcm.encrypt(nonce, plaintext.encode(), None)
    return nonce + ciphertext  # Prepend nonce for storage

def decrypt_card_data(data: bytes, key: bytes) -> str:
    """Decrypt AES-256-GCM. First 12 bytes are nonce."""
    nonce = data[:12]
    ciphertext = data[12:]
    aesgcm = AESGCM(key)
    plaintext = aesgcm.decrypt(nonce, ciphertext, None)
    return plaintext.decode()
```

### 5.2 Encryption in Transit -- TLS 1.2+

All cardholder data must be transmitted over TLS 1.2 or higher. Never transmit card data over plain HTTP.

**HTTP to HTTPS Redirect (Node/Express):**
```javascript
// Force HTTPS on all payment routes
app.use('/api/payment', (req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https' && !req.secure) {
        return res.redirect(301, `https://${req.hostname}${req.originalUrl}`);
    }
    next();
});
```

**Security Headers (Node/Express):**
```javascript
app.use((req, res, next) => {
    // HSTS: enforce HTTPS for 1 year, include subdomains
    res.setHeader(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
    );
    // Prevent framing (clickjacking protection for payment pages)
    res.setHeader('X-Frame-Options', 'DENY');
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // Content Security Policy for payment pages
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' https://js.stripe.com; frame-src https://js.stripe.com;"
    );
    next();
});
```

**Secure Cookie Flags (PHP):**
```php
// All cookies on payment pages must use these flags
session_set_cookie_params([
    'lifetime' => 0,
    'path'     => '/',
    'domain'   => '.example.com',
    'secure'   => true,       // Only sent over HTTPS
    'httponly'  => true,       // Not accessible via JavaScript
    'samesite' => 'Strict',   // Prevent CSRF
]);
session_start();
```

**Secure Cookie Flags (Node/Express):**
```javascript
app.use(session({
    secret: process.env.SESSION_SECRET,
    cookie: {
        secure: true,       // HTTPS only
        httpOnly: true,     // No JS access
        sameSite: 'strict', // CSRF protection
        maxAge: 3600000,    // 1 hour
    },
    resave: false,
    saveUninitialized: false,
}));
```

### 5.3 Key Management

```
NEVER:
  - Hardcode encryption keys in source code
  - Store keys alongside the data they encrypt
  - Use the same key for encryption and authentication
  - Commit keys or secrets to version control

ALWAYS:
  - Load keys from environment variables or a secrets manager
  - Rotate keys at least annually
  - Use separate keys for separate data types
  - Implement key versioning to support rotation
```

**Key Rotation Pattern (Python):**
```python
import os
import json

class KeyManager:
    def __init__(self):
        # Keys loaded from environment or secrets manager
        self._keys = {
            'v2': os.environ['ENCRYPTION_KEY_V2'].encode(),
            'v1': os.environ['ENCRYPTION_KEY_V1'].encode(),
        }
        self._current_version = 'v2'

    def encrypt(self, plaintext: str) -> dict:
        key = self._keys[self._current_version]
        ciphertext = encrypt_card_data(plaintext, key)
        return {
            'key_version': self._current_version,
            'data': ciphertext.hex(),
        }

    def decrypt(self, envelope: dict) -> str:
        version = envelope['key_version']
        key = self._keys[version]
        return decrypt_card_data(bytes.fromhex(envelope['data']), key)
```

## 6. Access Control Patterns

### 6.1 Role-Based Access Control

Only authorized roles should access cardholder data endpoints. Implement middleware that enforces this before the request reaches your handler.

**Node/Express Middleware:**
```javascript
const PAYMENT_ROLES = ['payment_admin', 'billing_manager'];

function requirePaymentAccess(req, res, next) {
    const user = req.auth; // Set by authentication middleware

    if (!user) {
        auditLog('payment_access_denied', {
            reason: 'unauthenticated',
            ip: req.ip,
            path: req.path,
        });
        return res.status(401).json({ error: 'Authentication required' });
    }

    if (!PAYMENT_ROLES.includes(user.role)) {
        auditLog('payment_access_denied', {
            userId: user.id,
            role: user.role,
            ip: req.ip,
            path: req.path,
        });
        return res.status(403).json({ error: 'Insufficient permissions' });
    }

    auditLog('payment_access_granted', {
        userId: user.id,
        role: user.role,
        ip: req.ip,
        path: req.path,
    });
    next();
}

// Apply to all payment routes
app.use('/api/payment', requirePaymentAccess);
```

**Python/Flask Decorator:**
```python
from functools import wraps
from flask import request, jsonify, g

PAYMENT_ROLES = {'payment_admin', 'billing_manager'}

def require_payment_access(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user = g.get('current_user')

        if not user:
            audit_log('payment_access_denied', {
                'reason': 'unauthenticated',
                'ip': request.remote_addr,
                'path': request.path,
            })
            return jsonify({'error': 'Authentication required'}), 401

        if user.role not in PAYMENT_ROLES:
            audit_log('payment_access_denied', {
                'user_id': user.id,
                'role': user.role,
                'ip': request.remote_addr,
                'path': request.path,
            })
            return jsonify({'error': 'Insufficient permissions'}), 403

        audit_log('payment_access_granted', {
            'user_id': user.id,
            'role': user.role,
            'ip': request.remote_addr,
            'path': request.path,
        })
        return f(*args, **kwargs)
    return decorated

@app.route('/api/payment/charge', methods=['POST'])
@require_payment_access
def charge():
    pass
```

**PHP Middleware:**
```php
class PaymentAccessMiddleware
{
    private const PAYMENT_ROLES = ['payment_admin', 'billing_manager'];

    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if (!$user) {
            AuditLog::write('payment_access_denied', [
                'reason' => 'unauthenticated',
                'ip'     => $request->ip(),
                'path'   => $request->path(),
            ]);
            return response()->json(['error' => 'Authentication required'], 401);
        }

        if (!in_array($user->role, self::PAYMENT_ROLES, true)) {
            AuditLog::write('payment_access_denied', [
                'user_id' => $user->id,
                'role'    => $user->role,
                'ip'      => $request->ip(),
                'path'    => $request->path(),
            ]);
            return response()->json(['error' => 'Insufficient permissions'], 403);
        }

        AuditLog::write('payment_access_granted', [
            'user_id' => $user->id,
            'role'    => $user->role,
            'ip'      => $request->ip(),
            'path'    => $request->path(),
        ]);

        return $next($request);
    }
}
```

### 6.2 Database Permission Separation

```sql
-- Payment service account: minimal permissions
CREATE USER 'payment_svc'@'localhost' IDENTIFIED BY '...';
GRANT SELECT, INSERT ON payments.transactions TO 'payment_svc'@'localhost';
GRANT SELECT ON payments.token_vault TO 'payment_svc'@'localhost';
-- NO DELETE, NO DROP, NO ALTER, NO access to other schemas

-- Application service account: no access to payment tables
CREATE USER 'app_svc'@'localhost' IDENTIFIED BY '...';
GRANT SELECT, INSERT, UPDATE ON app.users TO 'app_svc'@'localhost';
-- NO access to payments schema at all
```

## 7. Audit Logging

### 7.1 What to Log

Every interaction with cardholder data must produce an audit record containing:

| Field | Description | Example |
|-------|-------------|---------|
| `timestamp` | ISO 8601 with timezone | `2026-01-15T14:30:00.000Z` |
| `event_type` | Action category | `payment_attempt`, `detokenize_request` |
| `user_id` | Authenticated user identifier | `usr_abc123` |
| `ip_address` | Source IP of the request | `203.0.113.42` |
| `resource` | What was accessed | `/api/payment/charge` |
| `action` | Specific operation | `create_payment_intent` |
| `result` | Outcome | `success`, `denied`, `error` |
| `metadata` | Additional safe context | `{"intent_id": "pi_xxx", "amount": 2000}` |

### 7.2 What NEVER to Log

```
PROHIBITED in any log output:
  - Full PAN (card number)
  - CVV / CVC / CID
  - PIN or PIN block
  - Full magnetic stripe data
  - Encryption keys
  - Passwords or password hashes
  - Full expiration date combined with other card data
```

### 7.3 Structured Audit Logger

**Node.js:**
```javascript
const crypto = require('crypto');

class AuditLogger {
    constructor(storage) {
        this._storage = storage;
        this._previousHash = null;
    }

    log(eventType, details) {
        const entry = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            event_type: eventType,
            user_id: details.userId || null,
            ip_address: details.ip || null,
            resource: details.resource || null,
            action: details.action || null,
            result: details.result || null,
            metadata: this._sanitize(details.metadata || {}),
        };

        // Hash chain for tamper evidence
        const payload = JSON.stringify(entry) + (this._previousHash || '');
        entry.chain_hash = crypto
            .createHash('sha256')
            .update(payload)
            .digest('hex');
        this._previousHash = entry.chain_hash;

        // Append-only write
        this._storage.append(entry);
        return entry;
    }

    _sanitize(metadata) {
        const sanitized = { ...metadata };
        // Remove any accidentally included card data
        for (const [key, value] of Object.entries(sanitized)) {
            if (typeof value === 'string') {
                sanitized[key] = sanitizeLogEntry(value);
            }
        }
        return sanitized;
    }
}
```

**Python:**
```python
import hashlib
import json
import uuid
from datetime import datetime, timezone

class AuditLogger:
    def __init__(self, storage):
        self._storage = storage
        self._previous_hash = None

    def log(self, event_type: str, **details) -> dict:
        entry = {
            'id': str(uuid.uuid4()),
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'event_type': event_type,
            'user_id': details.get('user_id'),
            'ip_address': details.get('ip'),
            'resource': details.get('resource'),
            'action': details.get('action'),
            'result': details.get('result'),
            'metadata': self._sanitize(details.get('metadata', {})),
        }

        # Tamper-evident hash chain
        payload = json.dumps(entry, sort_keys=True)
        if self._previous_hash:
            payload += self._previous_hash
        entry['chain_hash'] = hashlib.sha256(payload.encode()).hexdigest()
        self._previous_hash = entry['chain_hash']

        self._storage.append(entry)
        return entry

    def _sanitize(self, metadata: dict) -> dict:
        sanitized = {}
        for key, value in metadata.items():
            if isinstance(value, str):
                sanitized[key] = sanitize_log_entry(value)
            else:
                sanitized[key] = value
        return sanitized
```

### 7.4 Log Retention

PCI DSS requires audit logs to be retained for a minimum of **one year**, with at least **three months immediately available** for analysis. Configure log rotation and archival accordingly:

```
Log storage requirements:
  - Minimum retention: 12 months
  - Immediately available: 3 months
  - Append-only storage (no modification or deletion)
  - Centralized collection from all payment components
  - Access to logs restricted to security/audit roles only
```

## 8. Secure Coding Practices

### 8.1 Input Validation

Validate all payment-related input at the boundary. Reject malformed data before it reaches business logic.

**Card Number Validation (Node.js):**
```javascript
function validateCardInput(input) {
    const errors = [];

    // PAN: strip spaces/dashes, check length and Luhn
    const pan = (input.cardNumber || '').replace(/[\s-]/g, '');
    if (!/^\d{13,19}$/.test(pan)) {
        errors.push('Card number must be 13-19 digits');
    } else if (!luhnCheck(pan)) {
        errors.push('Invalid card number');
    }

    // Expiry: MM/YY format, not in the past
    const expiry = input.expiry || '';
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
        errors.push('Expiry must be MM/YY format');
    } else {
        const [month, year] = expiry.split('/').map(Number);
        const expDate = new Date(2000 + year, month, 0); // Last day of month
        if (expDate < new Date()) {
            errors.push('Card is expired');
        }
    }

    // CVV: 3 digits (Visa/MC/Discover) or 4 digits (Amex)
    const cvv = input.cvv || '';
    if (!/^\d{3,4}$/.test(cvv)) {
        errors.push('CVV must be 3 or 4 digits');
    }

    return { valid: errors.length === 0, errors };
}
```

### 8.2 Parameterized Queries

Never concatenate card data or any user input into SQL strings.

**WRONG -- SQL injection risk:**
```python
# NEVER DO THIS
cursor.execute(
    f"SELECT * FROM transactions WHERE card_token = '{token}'"
)
```

**CORRECT -- parameterized query:**
```python
cursor.execute(
    "SELECT * FROM transactions WHERE card_token = %s",
    (token,)
)
```

**CORRECT -- ORM (SQLAlchemy):**
```python
transaction = db.session.query(Transaction).filter(
    Transaction.card_token == token
).first()
```

**CORRECT -- PHP PDO:**
```php
$stmt = $pdo->prepare('SELECT * FROM transactions WHERE card_token = :token');
$stmt->execute(['token' => $token]);
$transaction = $stmt->fetch();
```

### 8.3 Error Handling

Never expose card data or internal system details in error messages.

**WRONG:**
```javascript
// Leaks card number in error response
catch (err) {
    res.status(500).json({
        error: `Payment failed for card ${cardNumber}: ${err.message}`,
        stack: err.stack,
    });
}
```

**CORRECT:**
```javascript
catch (err) {
    const errorId = crypto.randomUUID();

    // Log full details internally (with sanitization)
    auditLog('payment_error', {
        errorId,
        message: sanitizeLogEntry(err.message),
        userId: req.auth.id,
        ip: req.ip,
    });

    // Return safe error to client
    res.status(500).json({
        error: 'Payment processing failed',
        errorId, // Reference ID for support
    });
}
```

### 8.4 Memory Handling

Clear sensitive data from memory after use to minimize exposure window.

**Node.js -- Buffer clearing:**
```javascript
function processCardSecurely(cardNumber) {
    const buffer = Buffer.from(cardNumber, 'utf8');
    try {
        // Process the card data
        const token = tokenize(buffer.toString());
        return token;
    } finally {
        // Zero out the buffer
        buffer.fill(0);
    }
}
```

**Python -- Memory clearing:**
```python
import ctypes

def secure_clear(s: str):
    """Attempt to overwrite string in memory."""
    if not isinstance(s, str):
        return
    ptr = ctypes.cast(id(s), ctypes.POINTER(ctypes.c_char))
    for i in range(len(s)):
        ptr[ctypes.sizeof(ctypes.c_ssize_t) * 2 + i] = b'\x00'

def process_card_securely(card_number: str) -> str:
    try:
        token = tokenize(card_number)
        return token
    finally:
        secure_clear(card_number)
```

**PHP -- Unset and overwrite:**
```php
function processCardSecurely(string &$cardNumber): string
{
    try {
        $token = tokenize($cardNumber);
        return $token;
    } finally {
        // Overwrite the variable content before unsetting
        $cardNumber = str_repeat("\0", strlen($cardNumber));
        unset($cardNumber);
    }
}
```

## 9. Scope Reduction

### 9.1 Hosted Payment Pages

The most effective way to reduce PCI scope is to never let card data touch your servers. Use hosted payment forms provided by your processor.

**Stripe Elements (iframe approach):**
```html
<!-- Card fields are rendered inside a Stripe-hosted iframe -->
<!-- Your page never has access to the raw card data -->
<form id="payment-form">
    <div id="card-element">
        <!-- Stripe Elements iframe renders here -->
    </div>
    <button type="submit">Pay</button>
</form>

<script src="https://js.stripe.com/v3/"></script>
<script>
    const stripe = Stripe('pk_live_...');
    const elements = stripe.elements();
    const card = elements.create('card');
    card.mount('#card-element');

    document.getElementById('payment-form')
        .addEventListener('submit', async (e) => {
            e.preventDefault();
            const { token, error } = await stripe.createToken(card);
            if (token) {
                // Send token.id to your server -- not card data
                submitToServer(token.id);
            }
        });
</script>
```

**Hosted Payment Page (redirect approach):**
```javascript
// Create a checkout session server-side, redirect the user
app.post('/api/create-checkout', async (req, res) => {
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{ price: 'price_xxx', quantity: 1 }],
        mode: 'payment',
        success_url: 'https://example.com/success?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: 'https://example.com/cancel',
    });
    res.json({ url: session.url });
});
// User is redirected to Stripe's domain for card entry
// Card data never passes through your server
```

### 9.2 SAQ Types

Choose the approach that minimizes your compliance burden:

| SAQ Type | Card Data Flow | Scope | Effort |
|----------|---------------|-------|--------|
| **SAQ A** | Fully hosted payment page (redirect to processor) | Lowest -- card data never touches your systems | ~20 controls |
| **SAQ A-EP** | JavaScript-based redirect (Stripe.js, Braintree.js) -- card data goes directly to processor from client, but your page serves the JS | Low -- your server serves the page but never sees card data | ~140 controls |
| **SAQ C** | Payment terminal integration (physical POS) | Medium -- terminal handles card data | ~160 controls |
| **SAQ D** | Card data processed/stored on your servers | Full scope -- all 250+ controls apply | ~330 controls |

**Decision rule:** Always prefer SAQ A or SAQ A-EP. Only accept SAQ D scope if you have a specific business requirement to handle raw card data.

### 9.3 Network Segmentation

If you must process card data, isolate payment systems from the rest of your infrastructure:

```
Segmentation principles:
  - Payment processing services in a separate network zone
  - Firewall rules allowing only required traffic between zones
  - Payment database accessible only from payment services
  - No direct access from general application servers to payment data
  - Monitoring on all cross-zone traffic
  - Separate CI/CD pipeline credentials for payment services
```

## 10. Compliance Levels

PCI DSS defines four merchant levels based on annual transaction volume:

| Level | Annual Transactions | Requirements |
|-------|-------------------|--------------|
| **Level 1** | Over 6 million | Annual on-site assessment by Qualified Security Assessor (QSA); quarterly network scans; Report on Compliance (ROC) |
| **Level 2** | 1 million to 6 million | Annual Self-Assessment Questionnaire (SAQ); quarterly network scans; Attestation of Compliance (AOC) |
| **Level 3** | 20,000 to 1 million (e-commerce) | Annual SAQ; quarterly network scans; AOC |
| **Level 4** | Under 20,000 (e-commerce) or up to 1 million (other channels) | Annual SAQ; quarterly network scans recommended; AOC |

**Note:** Any merchant that has suffered a breach can be escalated to Level 1 regardless of transaction volume. Card brands may also independently assign levels based on risk assessment.

## 11. Common Mistakes

| Mistake | Why It Is Wrong | Fix |
|---------|----------------|-----|
| Storing CVV/CVC after authorization | Explicitly prohibited by PCI DSS Requirement 3.2 -- no exception | Never store CVV; use tokenization; validate client-side only |
| Logging full card numbers | Exposes PAN in log files accessible to operations staff; violation of Requirement 3.4 | Implement log sanitization with Luhn detection; mask all PANs |
| Using MD5 or SHA-1 to "encrypt" card data | These are hashing algorithms, not encryption; they are reversible via rainbow tables for short inputs like card numbers | Use AES-256-GCM encryption with proper key management |
| Hardcoding encryption keys in source code | Keys in code end up in version control, CI logs, and developer machines | Load keys from environment variables or a secrets manager |
| Transmitting card data over HTTP | Violates Requirement 4; data visible to any network observer | Enforce TLS 1.2+; redirect HTTP to HTTPS; set HSTS headers |
| Missing audit trail for payment access | Cannot detect or investigate unauthorized access; violates Requirement 10 | Implement structured audit logging on all payment endpoints |
| Using default or shared database credentials | Violates Requirement 2 (secure configuration) and Requirement 8 (unique IDs) | Use unique service accounts with least-privilege permissions |
| No input validation on payment fields | Enables injection attacks and malformed data processing | Validate card number (Luhn), expiry format, CVV length at input boundary |
| Returning card data in error messages | Exposes cardholder data to client; may be cached in browser, proxies, or logs | Return generic error messages with correlation IDs; log details server-side |
| Storing PAN in plaintext database columns | Direct violation of Requirement 3.4 -- PAN must be rendered unreadable | Encrypt PAN with AES-256-GCM or replace with processor tokens |
| Using test card numbers in production code | Indicates development/testing practices leaking into production | Separate test and production environments completely; use environment flags |
| Disabling TLS certificate verification | Opens connection to man-in-the-middle attacks; all "encrypted" traffic is compromised | Never set `verify=False`, `rejectUnauthorized: false`, or `CURLOPT_SSL_VERIFYPEER: false` in production |

## 12. Quick Reference

### DO

```
[x] Use payment processor tokenization (Stripe, Braintree, Adyen, Square)
[x] Mask PAN to first 6, last 4 digits in any display or log
[x] Encrypt stored cardholder data with AES-256-GCM
[x] Enforce TLS 1.2+ on all payment endpoints
[x] Set Secure, HttpOnly, SameSite=Strict on all cookies
[x] Implement RBAC on payment data endpoints
[x] Log all access to payment data with timestamp, user, IP, action, result
[x] Use parameterized queries for all database operations
[x] Validate input: Luhn check, expiry format, CVV length
[x] Return generic error messages; log details server-side with correlation IDs
[x] Rotate encryption keys at least annually
[x] Load secrets from environment variables or a secrets manager
[x] Clear sensitive data from memory after use
[x] Use hosted payment pages to minimize PCI scope
[x] Retain audit logs for minimum 12 months
[x] Use separate database credentials for payment services
[x] Apply Content-Security-Policy headers on payment pages
[x] Test that logs do not contain card numbers
```

### DO NOT

```
[ ] Store CVV/CVC/CID after authorization -- ever
[ ] Store full magnetic stripe data or PIN blocks
[ ] Log full card numbers or sensitive authentication data
[ ] Hardcode encryption keys, API keys, or credentials in source code
[ ] Concatenate user input into SQL queries
[ ] Transmit card data over plain HTTP
[ ] Use MD5 or SHA-1 for "encrypting" card data
[ ] Return card data in API error responses
[ ] Disable TLS certificate verification in production
[ ] Use default or shared credentials for payment databases
[ ] Grant broad database permissions to payment service accounts
[ ] Skip audit logging on payment endpoints
[ ] Store PAN in plaintext
[ ] Use innerHTML to render payment-related user input in the browser
[ ] Allow card data to pass through your servers when tokenization is available
```
