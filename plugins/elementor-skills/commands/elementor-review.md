---
name: elementor-review
description: Review Elementor addon code against development guidelines, controls usage, hooks, and best practices
arguments:
  - name: path
    description: File or directory to review
    required: true
allowed_tools: Read, Glob, Grep, Task
---

Review the Elementor addon code at `$ARGUMENTS` against the elementor-skills guidelines.

## Review Process

1. **Read** the file(s) at the specified path
2. **Check against all applicable skills** in this order:
   - **elementor-development**: Addon structure, widget lifecycle, rendering patterns, manager registration, script/style dependencies, data structure
   - **elementor-controls**: Control type usage, parameter correctness, selectors, group controls, responsive controls, dynamic content
   - **elementor-hooks**: Hook usage, correct hook names, parameter signatures, JS hooks/commands
   - **elementor-forms**: Form action structure, field validation, export/import handling (if form code)
   - **elementor-themes**: Theme conditions, dynamic tags, location registration, finder items (if theme code)

3. **Report findings** using severity levels:

| Severity | Meaning |
|----------|---------|
| CRITICAL | Security issue, broken rendering, deprecated API without replacement |
| WARNING | Incorrect control usage, missing dependencies, bad practice |
| INFO | Style improvement, optimization opportunity, or suggestion |

## Output Format

For each finding:

```
[SEVERITY] file:line — Description
  ↳ Fix: Recommended change with code example
```

Group findings by severity (CRITICAL first), then by file.

End with a summary: total findings by severity, and an overall assessment.
