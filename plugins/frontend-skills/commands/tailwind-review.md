---
description: Review frontend code against Tailwind CSS best practices
argument-hint: [file-or-component]
allowed-tools: [Read, Glob, Grep, Bash]
---

# Tailwind CSS Review

Review frontend code against the Tailwind CSS guideline skills (tailwind-guidelines, tailwind-components, tailwind-layouts).

## Target

If $ARGUMENTS is provided, review that file or component. Otherwise review the most recently discussed or edited frontend file.

## Review Checklist

Check all applicable guidelines. Focus on actionable findings only — skip rules that don't apply.

### Utility-First
- TW-UTIL-FIRST: Prefer utility classes over custom CSS / @apply
- TW-CLASS-ORDER: Consistent class ordering (layout → sizing → spacing → typography → visual → state)
- TW-CLASS-MERGE: Use clsx/tw-merge for conditional classes, not string concatenation
- TW-NO-INLINE-STYLE: No inline styles when a Tailwind utility exists

### Responsive Design
- TW-MOBILE-FIRST: Base styles for mobile, breakpoint prefixes for larger screens
- TW-BREAKPOINTS: Consistent breakpoint usage (sm/md/lg/xl)
- TW-RESPONSIVE-NAV: Mobile navigation accessible (Dialog-based, not just hidden)
- TW-CONTAINER: Consistent container pattern (max-w-* mx-auto px-4 sm:px-6 lg:px-8)

### Dark Mode
- TW-DARK-PAIRS: Every light color has a dark: counterpart where appropriate
- TW-DARK-BORDERS: Border colors adapted for dark mode (border-gray-200 dark:border-white/10)
- TW-FORCED-COLORS: Critical UI elements work in forced-colors mode

### Components
- TW-HEADLESS: Interactive components use HeadlessUI (Dialog, Disclosure, Listbox, etc.)
- TW-FOCUS-VISIBLE: All interactive elements have focus-visible styles
- TW-TRANSITIONS: Transitions use data-[enter]/data-[leave] with appropriate durations
- TW-POLYMORPHIC: Navigation items render as proper elements (links vs buttons)

### Accessibility
- TW-SEMANTIC: Semantic HTML elements used (button, nav, main, label, fieldset)
- TW-ARIA: Appropriate ARIA attributes on custom interactive components
- TW-SR-ONLY: Screen-reader-only text provided where visual context is missing
- TW-TOUCH-TARGET: Interactive elements meet 44x44px minimum touch target
- TW-ALT-TEXT: Images have descriptive alt text (or alt="" for decorative)
- TW-FOCUS-TRAP: Modals and dialogs trap focus
- TW-LABEL: All form inputs have associated labels (htmlFor/aria-label)

### Layout
- TW-GRID-RESPONSIVE: Grids adapt columns across breakpoints
- TW-OVERFLOW: No horizontal overflow on mobile
- TW-Z-INDEX: z-index values are intentional and documented
- TW-STICKY-FIXED: Sticky/fixed elements account for mobile viewports

### Performance
- TW-NO-DUPLICATE: No duplicate or conflicting utility classes
- TW-PURGE-SAFE: Dynamic class names use complete strings (not string interpolation)
- TW-IMAGE-SIZING: Images have explicit width/height or aspect-ratio

## Output Format

For each finding, report:
1. **Guideline**: The TW-CODE that applies
2. **Location**: file:line
3. **Issue**: What's wrong
4. **Fix**: Concrete suggestion

If the code follows guidelines well, say so briefly and highlight any particularly good patterns.
