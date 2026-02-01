---
name: compliance-review
description: Review code against compliance standards (PCI DSS, GDPR, WCAG, HIPAA, SOX, SOC 2)
arguments:
  - name: path
    description: File or directory to review
    required: true
user_invocable: true
---

# Compliance Review

Review the code at `$ARGUMENTS` against applicable compliance standards.

## Instructions

1. **Read the target** — if a directory, scan all relevant source files (PHP, Python, JavaScript, TypeScript, HTML, CSS, SQL, config files). If a single file, read it fully.

2. **Detect which standards apply** by looking at the code:
   - **PCI DSS** — if code handles payments, card data, checkout, tokenization, or payment gateway integration
   - **GDPR** — if code handles personal data, user registration, consent, cookies, data export, account deletion, or serves EU users
   - **WCAG** — if code generates HTML, renders UI, handles forms, navigation, or dynamic content
   - **HIPAA** — if code handles health data, patient records, ePHI, medical systems, EHR, or healthcare APIs
   - **SOX** — if code handles financial reporting, accounting, ledger entries, audit trails, or runs at a publicly traded company
   - **SOC 2** — if code is part of a SaaS platform, cloud service, or multi-tenant system handling customer data

3. **For each applicable standard**, review against the corresponding skill:
   - `pci-compliance` — check data classification, tokenization, encryption, access control, audit logging, scope
   - `gdpr-compliance` — check consent management, data subject rights, privacy by design, retention, breach handling
   - `accessibility-compliance` — check semantic HTML, ARIA usage, keyboard navigation, color contrast, forms, media
   - `hipaa-compliance` — check PHI handling, de-identification, audit controls, transmission security, BAA requirements
   - `sox-compliance` — check audit trails, segregation of duties, change management, data integrity, access controls
   - `soc2-compliance` — check access controls, encryption, logging, change management, incident response, vendor management

4. **Report findings** grouped by standard:

```
## PCI DSS Findings
### Critical
- [file:line] Description of violation and fix

### Warnings
- [file:line] Description and recommendation

## GDPR Findings
### Critical
- [file:line] Description of violation and fix

### Warnings
- [file:line] Description and recommendation

## WCAG Findings
### Critical
- [file:line] Description of violation and fix

### Warnings
- [file:line] Description and recommendation
```

5. **Skip standards that don't apply** — don't force-fit. If there's no payment code, skip PCI. If there's no UI, skip WCAG.

6. **End with a summary** — overall compliance posture and top 3 priority fixes.
