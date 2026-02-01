# Compliance Skills Plugin

Compliance coding guidelines as focused Claude Code skills — PCI DSS, GDPR, WCAG accessibility, HIPAA, SOX, and SOC 2 patterns for developers.

## What's Included

### Skills

| Skill | Focus |
|-------|-------|
| `pci-compliance` | PCI DSS payment security — 12 requirements mapped to code, data classification, tokenization (Stripe/custom), AES-256-GCM encryption, access control, audit logging, scope reduction, SAQ types, compliance levels |
| `gdpr-compliance` | GDPR data protection — 7 principles, 6 lawful bases, data subject rights (access, erasure, portability), consent management, cookie consent, data retention, breach notification, cross-border transfers, DPIA |
| `accessibility-compliance` | WCAG 2.1/2.2 accessibility — POUR principles, semantic HTML, ARIA roles/states, keyboard navigation, focus management, forms, color contrast, images/media, dynamic content, SPAs, responsive/mobile |
| `hipaa-compliance` | HIPAA healthcare data — PHI identification (18 identifiers), Security Rule technical safeguards (access, audit, integrity, transmission), de-identification (Safe Harbor), BAA requirements, mobile/API rules, breach response |
| `sox-compliance` | SOX financial controls — Section 302/404, ITGC four domains, segregation of duties, audit trail (hash chain), application controls (input/processing/output), change management, 7-year retention |
| `soc2-compliance` | SOC 2 trust services — 5 Trust Services Criteria, Common Criteria CC1-CC9, access controls, encryption, logging, change management, incident response, availability, vendor management, evidence collection, Type I vs II |

### Commands

- `/compliance-review` — Review code against applicable compliance standards (PCI, GDPR, WCAG, HIPAA, SOX, SOC 2)

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
/compliance-review src/patient-records/
/compliance-review src/financial-reports/
```

## Sources

- [PCI DSS v4.0](https://www.pcisecuritystandards.org/document_library/) (PCI Security Standards Council)
- [GDPR Full Text](https://gdpr-info.eu/) (EU Regulation 2016/679)
- [WCAG 2.1](https://www.w3.org/TR/WCAG21/) / [WCAG 2.2](https://www.w3.org/TR/WCAG22/) (W3C)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [HHS HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html)
- [HHS De-identification Guidance](https://www.hhs.gov/hipaa/for-professionals/special-topics/de-identification/index.html)
- [COSO Internal Control Framework](https://www.coso.org/guidance-on-ic)
- [AICPA Trust Services Criteria](https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-2)
