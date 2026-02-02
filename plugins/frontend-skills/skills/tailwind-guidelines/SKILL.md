---
name: tailwind-guidelines
description: Use when writing, reviewing, or refactoring Tailwind CSS code. Covers tailwind, tailwindcss, utility classes, responsive design, dark mode, CSS, frontend, className, tw-merge, clsx, color system, typography, spacing, borders, rings, outlines, state variants, hover, focus, focus-visible, group-hover, data attributes, container queries, breakpoints, mobile-first, text-pretty, text-balance, opacity modifiers, @theme directive, @utility, Tailwind v4 CSS-first configuration, and common anti-patterns.
---

# Tailwind CSS Guidelines

## Overview

Foundational Tailwind CSS guidelines for utility-first styling. Covers class composition, responsive design, dark mode, color systems, typography, spacing, state variants, and Tailwind v4 changes. Prioritize utility classes over custom CSS, compose with `clsx`/`tw-merge`, and follow mobile-first responsive patterns.

---

## Utility-First Methodology

| Rule | Detail |
|------|--------|
| Default to utilities | Write `className="mt-4 text-sm font-medium"` before reaching for custom CSS |
| Custom CSS only for complex selectors | Animations, `::before`/`::after`, or styles utilities cannot express |
| Never use `@apply` in components | Defeats utility-first purpose; use `clsx`/`tw-merge` composition instead |
| `@apply` only in base layer | Acceptable for resetting third-party styles or global typography |
| One semantic class per component | Extract via component abstraction, not CSS abstraction |

### Class Composition

| Tool | Purpose | When to Use |
|------|---------|-------------|
| `clsx` | Conditional class joining | Toggling classes based on props/state |
| `tw-merge` | Tailwind-aware merge with conflict resolution | Overriding default styles in component variants |
| `clsx` + `tw-merge` | Combined via `cn()` helper | Standard pattern for component libraries |

```tsx
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Usage: last class wins for conflicts
cn("px-4 py-2 bg-blue-500", isActive && "bg-blue-700", className)
```

| Pattern | Correct | Incorrect |
|---------|---------|-----------|
| Conditional classes | `cn("text-sm", isLarge && "text-lg")` | String interpolation: `` `text-${size}` `` |
| Dynamic values | Use style prop or CSS variables | `text-[${dynamicValue}px]` |
| Component variants | `cn(baseStyles, variants[variant])` | Deeply nested ternaries |
| Override defaults | `cn("px-4", className)` via tw-merge | Manual class deduplication |

---

## Responsive Design

Mobile-first: base styles apply to all screens, breakpoint prefixes apply at that width and above.

| Breakpoint | Min Width | Typical Target |
|------------|-----------|----------------|
| (none) | 0px | Mobile (default) |
| `sm:` | 640px | Large phones, small tablets |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Laptops |
| `xl:` | 1280px | Desktops |
| `2xl:` | 1536px | Large screens |

### Common Responsive Patterns

| Pattern | Classes | Effect |
|---------|---------|--------|
| Stack to row | `flex flex-col md:flex-row` | Column on mobile, row on desktop |
| Column count | `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3` | Responsive grid columns |
| Hide on mobile | `hidden md:block` | Visible only at md and above |
| Show on mobile only | `block md:hidden` | Visible only below md |
| Responsive text | `text-sm md:text-base lg:text-lg` | Scale text with screen |
| Responsive padding | `px-4 md:px-6 lg:px-8` | Increase padding with screen |
| Full to constrained | `w-full max-w-md mx-auto` | Full mobile, centered container on desktop |
| Responsive gap | `gap-4 md:gap-6 lg:gap-8` | Increase spacing with screen |

### Container Queries

| Rule | Detail |
|------|--------|
| Use `@container` for component-level responsiveness | When component lives in varying-width contexts |
| Apply `@container` on parent | Parent gets the container class |
| Query with `@sm:`, `@md:`, etc. | Breakpoints relative to container, not viewport |

```html
<div class="@container">
  <div class="flex flex-col @md:flex-row">...</div>
</div>
```

---

## Dark Mode

| Rule | Detail |
|------|--------|
| Use `dark:` variant for every color | Pair every light color with its dark counterpart |
| v4: Use `@custom-variant` | `@custom-variant dark (&:where(.dark, .dark *))` for class-based toggle |
| v3: Set strategy in config | `darkMode: 'class'` (toggle) or `'media'` (system preference) |
| Test both modes | Every component must be visually verified in both modes |
| Use semantic tokens | Prefer CSS variables over hardcoded dark/light pairs for theming |

### Color Pairing Strategy

| Element | Light | Dark |
|---------|-------|------|
| Page background | `bg-white` | `dark:bg-gray-950` |
| Card/surface | `bg-white` or `bg-gray-50` | `dark:bg-gray-900` |
| Primary text | `text-gray-900` | `dark:text-white` |
| Secondary text | `text-gray-600` | `dark:text-gray-400` |
| Muted text | `text-gray-500` | `dark:text-gray-500` |
| Borders | `border-gray-200` | `dark:border-gray-700` |
| Subtle borders | `border-gray-900/10` | `dark:border-white/10` |
| Input background | `bg-white` | `dark:bg-white/5` |
| Hover surface | `hover:bg-gray-50` | `dark:hover:bg-gray-800` |

### Opacity-Based Dark Mode Colors

| Pattern | Use Case |
|---------|----------|
| `bg-white/5` | Subtle elevated surface in dark mode |
| `bg-white/10` | Hover state overlay in dark mode |
| `border-white/10` | Subtle border in dark mode |
| `ring-white/15` | Decorative ring in dark mode |
| `text-white/70` | De-emphasized text in dark mode |

### Accessibility

| Rule | Detail |
|------|--------|
| `forced-colors:` variant | Override styles when user has forced-colors enabled |
| Maintain 4.5:1 contrast ratio | For body text in both modes |
| Maintain 3:1 contrast ratio | For large text and UI components |
| Test with `prefers-contrast: more` | Ensure readability in high-contrast mode |

---

## Color System

### Color Hierarchy

| Role | Default Shade | Usage |
|------|---------------|-------|
| Primary action | `indigo-600` / `dark:indigo-500` | Buttons, links, active states |
| Primary hover | `indigo-500` / `dark:indigo-400` | Hover on primary actions |
| Heading text | `gray-900` / `dark:white` | Page titles, section headings |
| Body text | `gray-600` / `dark:gray-300` | Paragraphs, descriptions |
| Muted/caption | `gray-500` / `dark:gray-400` | Timestamps, helper text |
| Placeholder | `gray-400` / `dark:gray-500` | Input placeholders |
| Success | `green-600` / `dark:green-400` | Confirmation, valid states |
| Warning | `yellow-600` / `dark:yellow-500` | Caution, attention |
| Danger | `red-600` / `dark:red-500` | Errors, destructive actions |

### Opacity Modifiers

| Syntax | Effect |
|--------|--------|
| `bg-red-500/10` | Red background at 10% opacity (subtle tint) |
| `bg-indigo-600/90` | Slightly transparent primary |
| `text-gray-900/80` | Slightly muted text |
| `border-gray-900/10` | Very subtle border |

### CSS Variable Theming

```html
<!-- Inline theme overrides -->
<button class="bg-[var(--btn-bg)] text-[var(--btn-text)]"
        style="--btn-bg: var(--color-indigo-600); --btn-text: white;">
  Submit
</button>

<!-- Tailwind v4: @theme for custom tokens -->
```

| Theming rule | Detail |
|--------------|--------|
| Use CSS variables for brand colors | Allows runtime theme switching |
| Keep utility classes for standard colors | Use variables only when dynamic theming is needed |
| Arbitrary value syntax for variables | `bg-[var(--color-brand)]` or `bg-(--color-brand)` in v4 |

---

## Typography

### Text Size Scale

| Class | Size | Default Line Height | Common Pairing |
|-------|------|---------------------|----------------|
| `text-xs` | 0.75rem | 1rem | Captions, badges |
| `text-sm` | 0.875rem | 1.25rem | Secondary text, labels |
| `text-base` | 1rem | 1.5rem | Body text |
| `text-lg` | 1.125rem | 1.75rem | Subheadings |
| `text-xl` | 1.25rem | 1.75rem | Section headings |
| `text-2xl` | 1.5rem | 2rem | Page titles |
| `text-3xl` | 1.875rem | 2.25rem | Hero subheadings |
| `text-4xl` | 2.25rem | 2.5rem | Hero headings |

### Line Height Slash Syntax (v4)

| Syntax | Effect |
|--------|--------|
| `text-sm/6` | `text-sm` with `line-height: 1.5rem` |
| `text-base/7` | `text-base` with `line-height: 1.75rem` |
| `text-xl/8` | `text-xl` with `line-height: 2rem` |
| `text-sm/[17px]` | Custom arbitrary line height |

### Font Weight Pairing

| Element | Weight | Class |
|---------|--------|-------|
| Headings | Semibold or bold | `font-semibold` or `font-bold` |
| Body | Normal | `font-normal` (default) |
| Labels | Medium | `font-medium` |
| Captions | Normal or medium | `font-normal` or `font-medium` |
| Emphasis | Semibold | `font-semibold` |

### Text Wrapping

| Class | Use Case |
|-------|----------|
| `text-pretty` | Avoids orphan words at end of paragraphs (preferred for body text) |
| `text-balance` | Evenly balanced line lengths (preferred for headings) |
| `truncate` | Single line with ellipsis overflow |
| `line-clamp-3` | Multi-line truncation (3 lines) |

### Responsive Text

```html
<h1 class="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
  Page Title
</h1>
<p class="text-sm/6 text-gray-600 md:text-base/7">
  Description text that scales with viewport.
</p>
```

---

## Spacing and Sizing

### Spacing Scale Consistency

| Spacing | Value | Common Use |
|---------|-------|------------|
| `1` | 0.25rem (4px) | Tight icon gaps |
| `1.5` | 0.375rem (6px) | Small vertical padding |
| `2` | 0.5rem (8px) | Compact element padding |
| `3` | 0.75rem (12px) | Standard small padding |
| `4` | 1rem (16px) | Standard padding and gap |
| `6` | 1.5rem (24px) | Section spacing |
| `8` | 2rem (32px) | Large section spacing |
| `10` | 2.5rem (40px) | Content block separation |
| `12` | 3rem (48px) | Major section separation |
| `16` | 4rem (64px) | Page-level spacing |

### Gap vs Space

| Utility | Use When |
|---------|----------|
| `gap-*` | Flex/grid layouts (preferred, handles wrapping correctly) |
| `space-y-*` | Vertical stack of direct children, no flex/grid |
| `space-x-*` | Horizontal stack of direct children, no flex/grid |

**Prefer `gap` over `space-*`** in flex/grid contexts. `space-*` uses margins and breaks with `flex-wrap`.

### Common Padding Pairs

| Context | Horizontal | Vertical | Combined |
|---------|-----------|----------|----------|
| Small button | `px-2.5` | `py-1.5` | `px-2.5 py-1.5` |
| Standard button | `px-3` | `py-2` | `px-3 py-2` |
| Large button | `px-4` | `py-2.5` | `px-4 py-2.5` |
| Card | `px-4` or `px-6` | `py-4` or `py-5` | `p-4` or `px-6 py-5` |
| Input field | `px-3` | `py-1.5` or `py-2` | `px-3 py-1.5` |
| Section | `px-4 sm:px-6 lg:px-8` | `py-12 sm:py-16` | Responsive both axes |

### Negative Margins

| Pattern | Use Case |
|---------|----------|
| `-mx-4` | Bleed content to edge of padded parent |
| `-mt-1` | Pull element up for optical alignment |
| `-ml-px` | Overlap 1px borders between siblings |

---

## Borders, Rings, and Outlines

### When to Use Each

| Utility | Purpose | Typical Use |
|---------|---------|-------------|
| `border` | Structural boundary | Card edges, input fields, dividers |
| `ring` | Decorative/state highlight | Focus states, selection indicator |
| `outline` | Accessibility focus indicator | Keyboard focus visibility |

### Focus Patterns

| Pattern | Classes | Use Case |
|---------|---------|----------|
| Standard focus ring | `focus:outline-2 focus:outline-offset-2 focus:outline-indigo-600` | Buttons, links |
| Input focus | `focus:ring-2 focus:ring-inset focus:ring-indigo-600` or `focus:outline-2 focus:outline-indigo-600` | Form fields |
| Focus-visible only | `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600` | Interactive elements (keyboard only) |
| No focus ring | Never remove without replacement | Accessibility violation |

### Subtle Borders with Opacity

| Pattern | Classes |
|---------|---------|
| Subtle card border | `border border-gray-900/10 dark:border-white/10` |
| Separator | `border-t border-gray-900/5` |
| Elevated surface | `ring-1 ring-gray-900/5 dark:ring-white/5` |

### Inset Rings

| Pattern | Classes | Use Case |
|---------|---------|----------|
| Inset input ring | `ring-1 ring-inset ring-gray-300` | Default input border |
| Inset focus ring | `ring-2 ring-inset ring-indigo-600` | Focused input |
| Inset error ring | `ring-2 ring-inset ring-red-500` | Validation error |

---

## State Variants

### Standard States

| Variant | Applies When | Common Use |
|---------|--------------|------------|
| `hover:` | Mouse over | Background/text color change |
| `focus:` | Element focused (any method) | Outline/ring for inputs |
| `focus-visible:` | Keyboard focus only | Outline for buttons/links |
| `active:` | Being clicked/pressed | Scale down, darken |
| `disabled:` | Element disabled | Opacity reduction, cursor change |
| `visited:` | Link visited | Subtle color change |

### Disabled Pattern

```html
<button class="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50
               disabled:cursor-not-allowed disabled:hover:bg-indigo-600">
  Submit
</button>
```

### Group and Peer States

| Pattern | Trigger | Classes |
|---------|---------|---------|
| Group hover | Parent hovered | Parent: `group`, child: `group-hover:text-white` |
| Group focus | Parent focused | Parent: `group`, child: `group-focus:ring-2` |
| Group data state | Parent has data attr | Parent: `group`, child: `group-data-[open]:rotate-180` |
| Named groups | Multiple nested groups | Parent: `group/item`, child: `group-hover/item:text-white` |
| Peer checked | Sibling checked | Sibling: `peer`, target: `peer-checked:bg-indigo-600` |
| Peer focus | Sibling focused | Sibling: `peer`, target: `peer-focus:ring-2` |
| Peer invalid | Sibling invalid | Sibling: `peer`, target: `peer-invalid:text-red-500` |

### Data Attribute Styling

| Pattern | Classes |
|---------|---------|
| Toggle checked | `data-[checked]:bg-indigo-600` |
| Open state | `data-[open]:bg-gray-50` |
| Active tab | `data-[selected]:border-indigo-500 data-[selected]:text-indigo-600` |
| State text color | `data-[disabled]:text-gray-400` |
| Headless UI integration | `data-[open]:rotate-180` on disclosure chevron |

---

## Tailwind v4 Changes

| Change | v3 | v4 |
|--------|----|----|
| Configuration | `tailwind.config.js` | CSS-first: `@theme` in CSS file |
| Custom utilities | Plugin API in config | `@utility` directive in CSS |
| Color opacity | `bg-red-500/50` | Same syntax, now also `bg-red-500/[0.5]` |
| Line height | `text-sm leading-6` | `text-sm/6` (slash syntax) |
| CSS variables | `theme()` function | `var(--color-*)` native access |
| Import | `@tailwind base/components/utilities` | `@import "tailwindcss"` |
| Arbitrary properties | `[--my-var:value]` | Same, plus `(--my-var)` shorthand |

### @theme Directive

```css
@import "tailwindcss";

@theme {
  --color-brand: #4f46e5;
  --color-brand-light: #818cf8;
  --font-display: "Inter", sans-serif;
  --breakpoint-3xl: 1920px;
}
```

### @utility Directive

```css
@utility scrollbar-hidden {
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}

/* Usage: class="scrollbar-hidden" */
```

### @custom-variant Directive

```css
/* Class-based dark mode toggle */
@custom-variant dark (&:where(.dark, .dark *));

/* Custom theme variants */
@custom-variant theme-midnight (&:where([data-theme="midnight"] *));
```

### @variant Directive (Apply Variants in Custom CSS)

```css
.my-element {
  background: white;
  @variant dark {
    background: black;
  }
}
```

### @source Directive (Content Detection)

```css
@import "tailwindcss";
/* Include external library templates */
@source "../node_modules/@my-company/ui-lib";
/* Exclude legacy code */
@source not "./src/legacy";
/* Safelist specific utilities */
@source inline("underline");
@source inline("{hover:,}bg-red-{50,{100..900..100},950}");
```

### Built-in Container Queries (No Plugin)

```html
<div class="@container">
  <div class="grid grid-cols-1 @sm:grid-cols-3 @lg:grid-cols-4">...</div>
</div>
<!-- Named containers, max-width, ranges -->
<div class="@container/main">
  <div class="@sm:@max-md:grid-cols-2">...</div>
</div>
```

### v4 New Features

| Feature | Syntax | Use Case |
|---------|--------|----------|
| Dynamic spacing | `w-17`, `pr-29`, `grid-cols-15` | Any numeric value without config |
| Gradient rename | `bg-linear-to-r` (was `bg-gradient-to-r`) | Linear gradients |
| Gradient angles | `bg-linear-45` | Arbitrary gradient angles |
| Radial/conic | `bg-radial-*`, `bg-conic-*` | Radial and conic gradients |
| OKLCH colors | Default palette | Wider gamut, more vivid |
| 3D transforms | `rotate-x-*`, `rotate-y-*`, `perspective-*` | 3D effects |
| Not variant | `not-hover:opacity-100` | Negation |
| In variant | `in-data-open:block` | Implicit group (ancestor match) |
| Nth variant | `nth-3:bg-gray-50` | Child targeting |
| Starting style | `starting:opacity-0` | Entry animations (`@starting-style`) |
| Inert variant | `inert:opacity-50` | Non-interactive elements |

### v4.1 Features

| Feature | Syntax | Use Case |
|---------|--------|----------|
| Text shadows | `text-shadow-sm`, `text-shadow-lg` | Text readability on images |
| Text shadow color | `text-shadow-sky-300/50` | Colored text glow |
| Masks | `mask-b-from-50%`, `mask-radial-*` | Image fade/reveal effects |
| Colored drop shadows | `drop-shadow-cyan-500/50` | Colored SVG/element shadows |
| Overflow wrap | `wrap-break-word`, `wrap-anywhere` | Long word handling |
| Input device | `pointer-fine:`, `pointer-coarse:` | Mouse vs touch adaptation |
| Safe alignment | `justify-center-safe`, `items-center-safe` | Auto-fix overflow alignment |
| User validation | `user-valid:`, `user-invalid:` | Post-interaction form states |
| No-JS fallback | `noscript:block` | Styles when JS disabled |

### v4 Migration Checklist

| Action | Detail |
|--------|--------|
| Replace config file | Move theme tokens to `@theme` in CSS |
| Update imports | `@import "tailwindcss"` replaces three `@tailwind` directives |
| Test slash syntax | `text-sm/6` replaces `text-sm leading-6` |
| Audit plugins | Move custom utilities to `@utility`, variants to `@custom-variant` |
| Check color references | `theme()` calls become `var(--color-*)` |
| Rename gradients | `bg-gradient-to-r` → `bg-linear-to-r` |
| Content detection | Remove `content` array, use `@source` for non-auto paths |
| Container queries | Remove `@tailwindcss/container-queries` plugin, use built-in `@container` |
| Run upgrade tool | `npx @tailwindcss/upgrade` for automated migration |

---

## Common Anti-Patterns

| Anti-Pattern | Why It Is Wrong | Correct Approach |
|--------------|-----------------|------------------|
| `@apply` in component files | Defeats utility-first; hides styles from scanning | Use `cn()` or direct utility classes |
| Dynamic class construction: `` `text-${color}-500` `` | Tailwind cannot scan dynamic strings; classes get purged | Use complete class names: `cn(colorMap[color])` |
| Inline `style` for Tailwind-expressible values | Bypasses design system, no responsive/state variants | Use utility classes or arbitrary values `w-[72px]` |
| Nesting Tailwind in CSS files | Creates specificity issues and maintenance burden | Use utilities in markup, CSS only for base styles |
| Hardcoded colors without dark mode | Broken in dark mode, inconsistent theming | Always pair: `bg-white dark:bg-gray-950` |
| Using `!important` via `!` prefix | Specificity hack that masks structural issues | Fix class order or use `tw-merge` for overrides |
| Redundant classes: `flex flex-row` | `flex-row` is the default flex direction | Just use `flex` |
| Missing `focus-visible` on interactive elements | Keyboard users cannot see focus indicator | Always add focus-visible styles |
| Using `space-*` with `flex-wrap` | Margins from `space-*` break wrapped layouts | Use `gap-*` instead |
| Deeply nested arbitrary values: `[calc(100%-var(--x))]` | Unreadable, hard to maintain | Extract to CSS variable or custom utility |
| Using pixel values everywhere: `w-[347px]` | Breaks responsiveness and spacing consistency | Use Tailwind scale values: `w-80`, `max-w-sm` |
| Not using `tw-merge` for component overrides | Later classes do not reliably override earlier ones | Wrap with `cn()` using `tw-merge` |
| Applying `text-*` color to SVG | `text-*` sets CSS `color`, SVGs need `fill`/`stroke` | Use `fill-current` or `stroke-current` with `text-*` |
| Forgetting responsive prefixes on layout | Layout breaks on different screen sizes | Always test and apply `sm:`, `md:`, `lg:` as needed |
| Using `sm:` to target mobile | `sm:` means 640px+, not "small screens" | Unprefixed = mobile; `sm:` = tablet+ |
| Stacking conflicting utilities: `grid flex` | Later in stylesheet wins, not later in class string | Use conditional: `isGrid ? "grid" : "flex"` |
| Arbitrary values when token exists | Bypasses design system consistency | Use `w-80` not `w-[320px]` when token matches |

## MCP Component Library

The `frontend-components` MCP server provides browsable component libraries for reference and reuse:

| Framework | ID | What it provides |
|-----------|----|-----------------|
| HyperUI | `hyperui` | 481 pure HTML/Tailwind components (application, marketing, neobrutalism) |
| DaisyUI | `daisyui` | 65 component class references with examples |
| FlyonUI | `flyonui` | 49 CSS components + 24 JS plugins |
| HeadlessUI React | `headlessui-react` | 38 accessible React component examples |
| HeadlessUI Vue | `headlessui-vue` | 30 accessible Vue component examples |

**Key tools:** `list_frameworks`, `list_components(framework)`, `get_component(framework, ...)`, `search_components(query)`, `get_component_by_path(path)`

Use `search_components(query: "keyword")` to find components across all libraries, or filter by framework.
