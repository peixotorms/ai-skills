---
name: flyonui
description: Use when building with FlyonUI — Tailwind CSS component library with CSS classes and optional JS plugins. Covers CSS component classes, JS plugin system (accordion, carousel, collapse, combobox, datatable, dropdown, select, tabs, tooltip, etc.), theming, installation, class reference, and plugin initialization via MCP tools.
---

# FlyonUI

## 1. Overview

FlyonUI is a **Tailwind CSS component library** with two layers:

1. **CSS Components** (49 files) — Semantic class names like DaisyUI, providing pre-styled components
2. **JS Plugins** (24 plugins) — Optional interactive behavior for components that need JavaScript (accordion, dropdown, tabs, carousel, etc.)

All FlyonUI files are available through the `frontend-components` MCP server under the `flyonui` framework.

## 2. Installation

```bash
npm install flyonui
```

### Tailwind CSS v4

```css
@import "tailwindcss";
@plugin "flyonui";
```

### Tailwind CSS v3

```js
// tailwind.config.js
module.exports = {
  plugins: [require("flyonui")],
}
```

### JS Plugins (optional)

```html
<!-- Include FlyonUI JS for interactive components -->
<script src="./node_modules/flyonui/flyonui.js"></script>
```

Or import specific plugins:

```js
import "flyonui/accordion";
import "flyonui/dropdown";
import "flyonui/tabs";
```

## 3. MCP Workflow

### 3.1 Browse Components

```
# See all CSS components and JS plugins
list_components(framework: "flyonui")

# CSS components only
list_components(framework: "flyonui", category: "css")

# JS plugins only
list_components(framework: "flyonui", category: "plugins")
```

### 3.2 Get Component CSS

```
# Get CSS source for a component
get_component(framework: "flyonui", category: "css", component_type: "all", variant: "button")
get_component(framework: "flyonui", category: "css", component_type: "all", variant: "card")
get_component(framework: "flyonui", category: "css", component_type: "all", variant: "modal")
```

### 3.3 Get JS Plugin Source

```
# Get plugin implementation
get_component(framework: "flyonui", category: "plugins", component_type: "accordion", variant: "index")
get_component(framework: "flyonui", category: "plugins", component_type: "dropdown", variant: "index")

# Get plugin types
get_component(framework: "flyonui", category: "plugins", component_type: "accordion", variant: "types")

# Get plugin variant CSS
get_component(framework: "flyonui", category: "plugins", component_type: "dropdown", variant: "variants")
```

### 3.4 Search

```
search_components(query: "accordion", framework: "flyonui")
search_components(query: "select", framework: "flyonui")
```

## 4. CSS Components

### 4.1 Component Classes

FlyonUI follows the same naming convention as DaisyUI. Base class + modifiers:

| Component | Base Class | Color Example | Size Example |
|-----------|-----------|---------------|--------------|
| Button | `btn` | `btn-primary` | `btn-sm` |
| Card | `card` | — | — |
| Badge | `badge` | `badge-primary` | `badge-sm` |
| Alert | `alert` | `alert-info` | — |
| Input | `input` | — | `input-sm` |
| Select | `select` | — | `select-sm` |
| Checkbox | `checkbox` | `checkbox-primary` | `checkbox-sm` |
| Radio | `radio` | `radio-primary` | `radio-sm` |
| Toggle | `switches` | `switch-primary` | `switch-sm` |
| Table | `table` | — | — |
| Tab | `tab` | — | — |
| Menu | `menu` | — | — |
| Modal | `modal` | — | — |
| Navbar | `navbar` | — | — |
| Drawer | `drawer` | — | — |
| Dropdown | `dropdown` | — | — |
| Tooltip | `tooltip` | — | — |
| Progress | `progress` | `progress-primary` | — |
| Loading | `loading` | — | — |
| Divider | `divider` | — | — |
| Breadcrumbs | `breadcrumbs` | — | — |
| Pagination | — | — | — |
| Avatar | `avatar` | — | — |
| Indicator | `indicator` | — | — |
| Mask | `mask` | — | — |
| Stack | `stack` | — | — |
| Stat | `stat` | — | — |
| Skeleton | `skeleton` | — | — |
| Timeline | `timeline` | — | — |
| Kbd | `kbd` | — | — |
| Link | `link` | `link-primary` | — |
| Label | `label` | — | — |
| Collapse | `collapse` | — | — |
| Carousel | `carousel` | — | — |
| Diff | `diff` | — | — |
| Filter | `filter` | — | — |
| Footer | `footer` | — | — |

### 4.2 Color System

FlyonUI uses semantic colors matching Tailwind CSS theme:

| Color | Usage |
|-------|-------|
| `primary` | Primary brand actions |
| `secondary` | Secondary actions |
| `accent` | Highlights and accents |
| `neutral` | Default/neutral elements |
| `info` | Informational states |
| `success` | Success states |
| `warning` | Warning states |
| `error` | Error/danger states |

### 4.3 Size System

| Size | Modifier |
|------|----------|
| Extra small | `-xs` |
| Small | `-sm` |
| Medium (default) | `-md` |
| Large | `-lg` |
| Extra large | `-xl` |

## 5. JS Plugins

### 5.1 Available Plugins

| Plugin | Purpose |
|--------|---------|
| `accordion` | Expandable/collapsible sections |
| `carousel` | Image/content slider |
| `collapse` | Single collapsible element |
| `combobox` | Searchable select with filtering |
| `copy-markup` | Copy to clipboard functionality |
| `datatable` | Interactive data tables |
| `dropdown` | Dropdown menus |
| `file-upload` | File upload with drag-and-drop |
| `input-number` | Number input with increment/decrement |
| `overlay` | Modal/overlay management |
| `pin-input` | PIN/OTP input fields |
| `range-slider` | Range slider with labels |
| `remove-element` | Remove/dismiss elements |
| `scrollspy` | Scroll-based navigation highlighting |
| `select` | Enhanced select dropdowns |
| `stepper` | Multi-step wizard |
| `strong-password` | Password strength indicator |
| `tabs` | Tab navigation |
| `toggle-count` | Counter toggle |
| `toggle-password` | Show/hide password |
| `tooltip` | Interactive tooltips |
| `tree-view` | Hierarchical tree navigation |

### 5.2 Plugin Initialization

Plugins auto-initialize when the JS is loaded. They use data attributes for configuration:

```html
<!-- Accordion -->
<div class="accordion" id="my-accordion">
  <div class="accordion-item active">
    <button class="accordion-toggle">Section 1</button>
    <div class="accordion-content">
      <p>Content 1</p>
    </div>
  </div>
  <div class="accordion-item">
    <button class="accordion-toggle">Section 2</button>
    <div class="accordion-content">
      <p>Content 2</p>
    </div>
  </div>
</div>
```

```html
<!-- Tabs -->
<div class="tabs" data-tabs>
  <button class="tab tab-active" data-tab="#tab1">Tab 1</button>
  <button class="tab" data-tab="#tab2">Tab 2</button>
</div>
<div id="tab1">Content 1</div>
<div id="tab2" class="hidden">Content 2</div>
```

```html
<!-- Dropdown -->
<div class="dropdown" data-dropdown>
  <button class="btn dropdown-toggle">Dropdown</button>
  <ul class="dropdown-menu">
    <li><a class="dropdown-item">Item 1</a></li>
    <li><a class="dropdown-item">Item 2</a></li>
  </ul>
</div>
```

### 5.3 Plugin Architecture

Each plugin follows this structure:
- `index.ts` — Main plugin logic and class definition
- `types.ts` — TypeScript type definitions
- `interfaces.ts` — Interface definitions
- `variants.css` — Optional CSS variants for the plugin

Fetch plugin source to understand initialization options, events, and API methods:

```
get_component(framework: "flyonui", category: "plugins", component_type: "accordion", variant: "index")
```

## 6. Theming

### 6.1 Built-in Themes

FlyonUI supports themes through `data-theme`:

```html
<html data-theme="light">
<html data-theme="dark">
```

### 6.2 Custom Themes

Similar to DaisyUI, override CSS custom properties:

```css
[data-theme="custom"] {
  --color-primary: oklch(65% 0.25 260);
  --color-secondary: oklch(70% 0.2 180);
  /* ... other color variables */
}
```

### 6.3 Dark Mode

FlyonUI supports both `data-theme` switching and Tailwind's `dark:` class strategy.

## 7. FlyonUI vs DaisyUI

| Feature | FlyonUI | DaisyUI |
|---------|---------|---------|
| CSS Components | 49 | 65+ |
| JS Plugins | 24 interactive plugins | None (CSS only) |
| Class naming | Same convention | Base convention |
| Theming | data-theme + CSS vars | data-theme + CSS vars |
| Interactive components | Built-in JS plugins | Requires external JS |
| File upload | Built-in plugin | Not included |
| Data tables | Built-in plugin | Not included |
| Tree view | Built-in plugin | Not included |
| Combobox | Built-in plugin | Not included |

### 7.1 When to Use FlyonUI Over DaisyUI

- You need **interactive components** (datatables, combobox, tree-view, file-upload)
- You want a **JS plugin system** alongside CSS components
- You need **stepper/wizard** functionality
- You need **copy-to-clipboard**, **password strength**, or **pin input**

### 7.2 When to Use DaisyUI Over FlyonUI

- You need **CSS-only** components with no JavaScript
- You want the **largest component catalog** (65+ vs 49)
- You need **more built-in themes** (30+)
- You're already using a JS framework (React, Vue) for interactivity

## 8. Common Patterns

### 8.1 Card with Actions

```html
<div class="card">
  <div class="card-body">
    <h5 class="card-title">Card Title</h5>
    <p>Card content goes here.</p>
    <div class="card-actions justify-end">
      <button class="btn btn-primary">Action</button>
    </div>
  </div>
</div>
```

### 8.2 Form Group

```html
<div class="form-control">
  <label class="label">
    <span class="label-text">Email</span>
  </label>
  <input type="email" class="input" placeholder="email@example.com" />
</div>
```

### 8.3 Modal with Overlay Plugin

```html
<button class="btn" data-overlay="#my-modal">Open Modal</button>
<div id="my-modal" class="modal overlay hidden">
  <div class="modal-box">
    <h3 class="text-lg font-bold">Modal Title</h3>
    <p>Modal content</p>
    <div class="modal-action">
      <button class="btn" data-overlay-close="#my-modal">Close</button>
    </div>
  </div>
</div>
```

## 9. Workflow Summary

| Step | Action |
|------|--------|
| 1. Identify component | What UI element is needed? |
| 2. Check CSS component | `get_component(framework: "flyonui", category: "css", ...)` |
| 3. Check JS plugin | Does it need interactivity? Check `list_components(category: "plugins")` |
| 4. Get plugin source | `get_component(framework: "flyonui", category: "plugins", ...)` |
| 5. Apply classes | Use base class + modifiers |
| 6. Add data attributes | For JS plugin initialization |
| 7. Theme | Set `data-theme` or define custom CSS variables |
