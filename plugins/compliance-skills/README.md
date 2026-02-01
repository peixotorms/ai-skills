# Compliance Skills Plugin

Compliance coding guidelines as focused Claude Code skills — PCI DSS, GDPR, and WCAG accessibility patterns for developers.

## What's Included

### Skills

| Skill | Focus |
|-------|-------|
| `pci-compliance` | PCI DSS payment security — 12 requirements mapped to code, data classification, tokenization (Stripe/custom), AES-256-GCM encryption, access control, audit logging, scope reduction, SAQ types, compliance levels |
| `gdpr-compliance` | GDPR data protection — 7 principles, 6 lawful bases, data subject rights (access, erasure, portability), consent management, cookie consent, data retention, breach notification, cross-border transfers, DPIA |
| `accessibility-compliance` | WCAG 2.1/2.2 accessibility — POUR principles, semantic HTML, ARIA roles/states, keyboard navigation, focus management, forms, color contrast, images/media, dynamic content, SPAs, responsive/mobile |

### Commands

- `/compliance-review` — Review code against applicable compliance standards (PCI, GDPR, WCAG)

## Installation

```bash
claude plugin marketplace add peixotorms/odinlayer-skills
claude plugin install compliance-skills
```

## Usage

Skills activate automatically based on context. You can also explicitly review code:

```
/compliance-review src/checkout/
/compliance-review templates/registration-form.html
/compliance-review src/payments/stripe-handler.py
```

## Sources

- [PCI DSS v4.0](https://www.pcisecuritystandards.org/document_library/) (PCI Security Standards Council)
- [GDPR Full Text](https://gdpr-info.eu/) (EU Regulation 2016/679)
- [WCAG 2.1](https://www.w3.org/TR/WCAG21/) / [WCAG 2.2](https://www.w3.org/TR/WCAG22/) (W3C)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
