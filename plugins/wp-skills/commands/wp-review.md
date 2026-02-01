---
name: wp-review
description: Review WordPress code against coding standards, security, and performance guidelines
arguments:
  - name: path
    description: File or directory to review
    required: true
allowed_tools: Read, Glob, Grep, Task
---

Review the WordPress code at `$ARGUMENTS` against the wp-skills guidelines.

## Review Process

1. **Read** the file(s) at the specified path
2. **Check against all applicable skills** in this order:
   - **wp-security**: Escaping, nonces, sanitization, SQL safety, capabilities, permissions
   - **wp-guidelines**: Naming conventions, hooks, i18n, enqueue, Yoda conditions, WordPress APIs
   - **wp-performance**: Query optimization, caching, anti-patterns, asset loading
   - **wp-blocks**: Block.json, deprecations, theme.json, Interactivity API (if block code)
   - **wp-rest-api**: Route registration, schema, permissions, Abilities API (if REST code)
   - **wp-plugins**: Architecture, lifecycle, settings, WP-CLI (if plugin bootstrap code)

3. **Report findings** using severity levels:

| Severity | Meaning |
|----------|---------|
| CRITICAL | Security vulnerability, data loss risk, or crash |
| WARNING | Performance issue, bad practice, or maintainability concern |
| INFO | Style improvement, minor optimization, or suggestion |

## Output Format

For each finding:

```
[SEVERITY] file:line — Description
  ↳ Fix: Recommended change with code example
```

Group findings by severity (CRITICAL first), then by file.

End with a summary: total findings by severity, and an overall assessment.
