---
name: accessibility-compliance
description: Use when building web interfaces, HTML templates, forms, navigation, modals, dynamic content, media players, or any user-facing UI — WCAG 2.1/2.2 patterns, ARIA roles, semantic HTML, keyboard navigation, screen reader support, color contrast
---

## 1. Overview

WCAG (Web Content Accessibility Guidelines) 2.1/2.2 are the international standards published by the W3C for making web content accessible to people with disabilities. Approximately 15% of the world population — over 1 billion people — live with some form of disability, including visual, auditory, motor, and cognitive impairments. Accessibility is also a legal requirement in many jurisdictions: the Americans with Disabilities Act (ADA) in the US, the European Accessibility Act (EAA) in the EU, and Section 508 for US federal agencies. WCAG defines three conformance levels: **Level A** (minimum baseline, must fix), **Level AA** (the standard target for legal compliance and production websites), and **Level AAA** (enhanced accessibility, aspirational for most sites). All code produced should target **WCAG 2.1 Level AA** at minimum, incorporating 2.2 criteria where applicable.

## 2. The Four Principles (POUR)

Every WCAG success criterion falls under one of four principles:

| Principle | Meaning | Key Success Criteria |
|---|---|---|
| **Perceivable** | Information and UI must be presentable in ways users can perceive | 1.1.1 Non-text Content, 1.2.x Time-based Media, 1.3.x Adaptable, 1.4.3 Contrast (Minimum), 1.4.4 Resize Text, 1.4.11 Non-text Contrast |
| **Operable** | UI components and navigation must be operable by all users | 2.1.1 Keyboard, 2.1.2 No Keyboard Trap, 2.4.3 Focus Order, 2.4.7 Focus Visible, 2.5.5 Target Size, 2.5.8 Target Size (Minimum) |
| **Understandable** | Information and UI operation must be understandable | 3.1.1 Language of Page, 3.2.1 On Focus, 3.2.2 On Input, 3.3.1 Error Identification, 3.3.2 Labels or Instructions |
| **Robust** | Content must be compatible with current and future assistive technologies | 4.1.1 Parsing, 4.1.2 Name/Role/Value, 4.1.3 Status Messages |

## 3. Semantic HTML (Foundation)

Semantic HTML is the single most impactful accessibility practice. Native HTML elements carry built-in roles, keyboard behavior, and screen reader announcements that no amount of ARIA can fully replicate. Always prefer native elements over custom constructs.

### 3.1 Buttons vs Divs (SC 4.1.2, 2.1.1)

```html
<!-- WRONG: div with click handler -->
<div class="btn" onclick="submitForm()">Submit</div>

<!-- RIGHT: native button element -->
<button type="submit" class="btn">Submit</button>
```

A `<div>` has no role, no keyboard focusability, no Enter/Space activation. A `<button>` provides all three natively.

### 3.2 Landmark Elements (SC 1.3.1, 2.4.1)

```html
<!-- RIGHT: semantic landmarks -->
<header>
  <nav aria-label="Main navigation">
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/about">About</a></li>
    </ul>
  </nav>
</header>

<main id="main-content">
  <article>
    <h1>Page Title</h1>
    <!-- primary content -->
  </article>
  <aside aria-label="Related articles">
    <!-- supplementary content -->
  </aside>
</main>

<footer>
  <p>Copyright 2026</p>
</footer>
```

When multiple `<nav>` or `<aside>` elements exist on a page, distinguish them with `aria-label`.

### 3.3 Heading Hierarchy (SC 1.3.1)

```html
<!-- WRONG: skipping heading levels -->
<h1>Site Name</h1>
<h3>Section Title</h3>   <!-- skipped h2 -->
<h5>Subsection</h5>      <!-- skipped h4 -->

<!-- RIGHT: sequential heading levels -->
<h1>Site Name</h1>
  <h2>Section Title</h2>
    <h3>Subsection</h3>
    <h3>Another Subsection</h3>
  <h2>Another Section</h2>
```

Every page must have exactly one `<h1>`. Never skip heading levels. Headings create a navigable document outline for screen reader users.

### 3.4 Data Tables (SC 1.3.1)

```html
<table>
  <caption>Monthly Revenue by Region</caption>
  <thead>
    <tr>
      <th scope="col">Region</th>
      <th scope="col">Q1</th>
      <th scope="col">Q2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">North America</th>
      <td>$1.2M</td>
      <td>$1.4M</td>
    </tr>
  </tbody>
</table>
```

Always use `<caption>` for table purpose, `<th scope>` for header associations. Never use tables for layout.

### 3.5 Form Labels (SC 1.3.1, 3.3.2)

```html
<!-- WRONG: placeholder as label -->
<input type="email" placeholder="Email address">

<!-- RIGHT: explicit label -->
<label for="email">Email address</label>
<input type="email" id="email" name="email" autocomplete="email">
```

### 3.6 Fieldsets and Legends (SC 1.3.1)

```html
<fieldset>
  <legend>Notification Preferences</legend>
  <label>
    <input type="checkbox" name="notify" value="email"> Email
  </label>
  <label>
    <input type="checkbox" name="notify" value="sms"> SMS
  </label>
  <label>
    <input type="checkbox" name="notify" value="push"> Push notification
  </label>
</fieldset>
```

### 3.7 Links vs Buttons (SC 4.1.2)

```html
<!-- Link: navigates to a URL -->
<a href="/settings">Account Settings</a>

<!-- Button: performs an action -->
<button type="button" onclick="openPanel()">Open Settings Panel</button>
```

Use `<a href>` for navigation (changes URL or scrolls to anchor). Use `<button>` for actions (toggles, submissions, UI state changes). Never use `<a href="#">` or `<a href="javascript:void(0)">` for actions.

### 3.8 Lists for Groups (SC 1.3.1)

```html
<!-- RIGHT: nav items as list -->
<nav aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="/products">Products</a></li>
    <li aria-current="page">Widget Pro</li>
  </ol>
</nav>
```

Screen readers announce "list, 3 items" — giving users a count and structure context.

## 4. ARIA (When Semantic HTML Is Not Enough)

**First rule of ARIA: do not use ARIA if a native HTML element provides the semantics you need.** ARIA overrides native semantics and adds complexity. Misused ARIA is worse than no ARIA at all.

### 4.1 Common ARIA Roles and States

| Widget | Roles | Required States/Properties |
|---|---|---|
| Tabs | `tablist`, `tab`, `tabpanel` | `aria-selected`, `aria-controls`, `aria-labelledby` |
| Modal Dialog | `dialog` | `aria-modal="true"`, `aria-labelledby` |
| Accordion | (native elements) | `aria-expanded`, `aria-controls` |
| Dropdown Menu | `menu`, `menuitem` | `aria-haspopup`, `aria-expanded` |
| Alert | `alert` | (auto-announced, assertive) |
| Status Message | `status` | (polite announcement) |
| Progress Bar | `progressbar` | `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-label` |
| Live Region | (container) | `aria-live="polite"` or `aria-live="assertive"` |
| Toggle Button | `button` | `aria-pressed="true/false"` |
| Switch | `switch` | `aria-checked="true/false"` |
| Tree View | `tree`, `treeitem` | `aria-expanded`, `aria-selected`, `aria-level` |
| Combobox | `combobox`, `listbox`, `option` | `aria-expanded`, `aria-activedescendant`, `aria-autocomplete` |

### 4.2 Accessible Modal Dialog (SC 2.1.2, 2.4.3)

```html
<button type="button" id="open-modal-btn">Delete Account</button>

<div id="confirm-dialog" role="dialog" aria-modal="true"
     aria-labelledby="dialog-title" hidden>
  <h2 id="dialog-title">Confirm Account Deletion</h2>
  <p id="dialog-desc">This action cannot be undone. All data will be permanently removed.</p>
  <div class="dialog-actions">
    <button type="button" id="confirm-btn">Delete</button>
    <button type="button" id="cancel-btn">Cancel</button>
  </div>
</div>
```

```javascript
// Modal focus management
const dialog = document.getElementById('confirm-dialog');
const openBtn = document.getElementById('open-modal-btn');
const cancelBtn = document.getElementById('cancel-btn');
let previouslyFocused = null;

function openModal() {
  previouslyFocused = document.activeElement;
  dialog.hidden = false;
  dialog.querySelector('h2').focus();
  document.addEventListener('keydown', trapFocus);
}

function closeModal() {
  dialog.hidden = true;
  document.removeEventListener('keydown', trapFocus);
  if (previouslyFocused) {
    previouslyFocused.focus(); // Restore focus to trigger element
  }
}

function trapFocus(e) {
  if (e.key === 'Escape') {
    closeModal();
    return;
  }
  if (e.key !== 'Tab') return;

  const focusable = dialog.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (e.shiftKey) {
    if (document.activeElement === first) {
      last.focus();
      e.preventDefault();
    }
  } else {
    if (document.activeElement === last) {
      first.focus();
      e.preventDefault();
    }
  }
}

openBtn.addEventListener('click', openModal);
cancelBtn.addEventListener('click', closeModal);
```

### 4.3 Accessible Tabs (SC 2.1.1, 4.1.2)

```html
<div class="tabs">
  <div role="tablist" aria-label="Account settings">
    <button role="tab" id="tab-profile" aria-selected="true"
            aria-controls="panel-profile" tabindex="0">
      Profile
    </button>
    <button role="tab" id="tab-security" aria-selected="false"
            aria-controls="panel-security" tabindex="-1">
      Security
    </button>
    <button role="tab" id="tab-billing" aria-selected="false"
            aria-controls="panel-billing" tabindex="-1">
      Billing
    </button>
  </div>

  <div role="tabpanel" id="panel-profile" aria-labelledby="tab-profile"
       tabindex="0">
    <!-- Profile content -->
  </div>
  <div role="tabpanel" id="panel-security" aria-labelledby="tab-security"
       tabindex="0" hidden>
    <!-- Security content -->
  </div>
  <div role="tabpanel" id="panel-billing" aria-labelledby="tab-billing"
       tabindex="0" hidden>
    <!-- Billing content -->
  </div>
</div>
```

```javascript
// Roving tabindex pattern for tabs
const tablist = document.querySelector('[role="tablist"]');
const tabs = tablist.querySelectorAll('[role="tab"]');

tablist.addEventListener('keydown', (e) => {
  const currentIndex = Array.from(tabs).indexOf(document.activeElement);
  let newIndex;

  switch (e.key) {
    case 'ArrowRight':
      newIndex = (currentIndex + 1) % tabs.length;
      break;
    case 'ArrowLeft':
      newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      break;
    case 'Home':
      newIndex = 0;
      break;
    case 'End':
      newIndex = tabs.length - 1;
      break;
    default:
      return;
  }

  e.preventDefault();
  activateTab(tabs[newIndex]);
});

function activateTab(newTab) {
  tabs.forEach((tab) => {
    tab.setAttribute('aria-selected', 'false');
    tab.setAttribute('tabindex', '-1');
    document.getElementById(tab.getAttribute('aria-controls')).hidden = true;
  });

  newTab.setAttribute('aria-selected', 'true');
  newTab.setAttribute('tabindex', '0');
  newTab.focus();
  document.getElementById(newTab.getAttribute('aria-controls')).hidden = false;
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => activateTab(tab));
});
```

### 4.4 Accessible Dropdown Menu (SC 2.1.1, 4.1.2)

```html
<div class="menu-container">
  <button type="button" aria-haspopup="true" aria-expanded="false"
          aria-controls="actions-menu" id="menu-trigger">
    Actions
  </button>
  <ul role="menu" id="actions-menu" aria-labelledby="menu-trigger" hidden>
    <li role="menuitem" tabindex="-1">Edit</li>
    <li role="menuitem" tabindex="-1">Duplicate</li>
    <li role="separator"></li>
    <li role="menuitem" tabindex="-1">Delete</li>
  </ul>
</div>
```

```javascript
const trigger = document.getElementById('menu-trigger');
const menu = document.getElementById('actions-menu');
const items = menu.querySelectorAll('[role="menuitem"]');

function openMenu() {
  menu.hidden = false;
  trigger.setAttribute('aria-expanded', 'true');
  items[0].focus();
}

function closeMenu() {
  menu.hidden = true;
  trigger.setAttribute('aria-expanded', 'false');
  trigger.focus();
}

trigger.addEventListener('click', () => {
  menu.hidden ? openMenu() : closeMenu();
});

menu.addEventListener('keydown', (e) => {
  const currentIndex = Array.from(items).indexOf(document.activeElement);

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      items[(currentIndex + 1) % items.length].focus();
      break;
    case 'ArrowUp':
      e.preventDefault();
      items[(currentIndex - 1 + items.length) % items.length].focus();
      break;
    case 'Escape':
      closeMenu();
      break;
    case 'Home':
      e.preventDefault();
      items[0].focus();
      break;
    case 'End':
      e.preventDefault();
      items[items.length - 1].focus();
      break;
  }
});
```

### 4.5 Live Regions (SC 4.1.3)

```html
<!-- Polite: announced after current speech finishes -->
<div aria-live="polite" id="status-region" class="sr-only"></div>

<!-- Assertive: interrupts current speech immediately -->
<div role="alert" id="error-region"></div>
```

```javascript
// Announce a status message
function announceStatus(message) {
  const region = document.getElementById('status-region');
  region.textContent = message; // Screen reader announces change
}

// Usage
announceStatus('3 results found');
announceStatus('File uploaded successfully');
```

## 5. Keyboard Navigation

### 5.1 Focus Visibility (SC 2.4.7, 2.4.11, 2.4.12)

```css
/* WRONG: removing focus outline entirely */
*:focus {
  outline: none; /* Never do this */
}

/* RIGHT: visible, high-contrast focus indicator */
:focus-visible {
  outline: 3px solid #1a73e8;
  outline-offset: 2px;
}

/* Optional: remove outline for mouse clicks, keep for keyboard */
:focus:not(:focus-visible) {
  outline: none;
}
```

WCAG 2.4.11 (AA in 2.2) requires the focus indicator to have a minimum contrast ratio and area. Use a 3px solid outline for reliable compliance.

### 5.2 Skip Navigation Link (SC 2.4.1)

```html
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <header><!-- site header and nav --></header>
  <main id="main-content" tabindex="-1">
    <!-- page content -->
  </main>
</body>
```

```css
.skip-link {
  position: absolute;
  top: -100%;
  left: 0;
  padding: 0.75rem 1.5rem;
  background: #000;
  color: #fff;
  z-index: 10000;
  font-size: 1rem;
}

.skip-link:focus {
  top: 0;
}
```

### 5.3 Tab Order (SC 2.4.3)

```html
<!-- WRONG: using positive tabindex to force order -->
<input tabindex="3" name="email">
<input tabindex="1" name="name">
<input tabindex="2" name="phone">

<!-- RIGHT: DOM order determines tab order -->
<input name="name">
<input name="email">
<input name="phone">
```

Never use `tabindex` values greater than 0. Use only `tabindex="0"` (add to tab order) and `tabindex="-1"` (programmatically focusable, not in tab order).

### 5.4 Key Bindings (SC 2.1.1)

All interactive elements must respond to expected keys:

| Element | Expected Keys |
|---|---|
| Button | `Enter`, `Space` (activates) |
| Link | `Enter` (activates) |
| Checkbox | `Space` (toggles) |
| Radio group | `Arrow` keys (moves selection) |
| Tab list | `Arrow Left/Right` (moves between tabs) |
| Menu | `Arrow Up/Down` (navigates items), `Escape` (closes) |
| Dialog | `Escape` (closes), `Tab` (cycles within) |
| Combobox | `Arrow Down` (opens list), `Escape` (closes) |
| Slider | `Arrow Left/Right` (decrease/increase), `Home/End` (min/max) |

### 5.5 Focus Management in SPAs (SC 2.4.3)

```javascript
// After client-side route change, move focus to new content
function onRouteChange(pageTitle) {
  document.title = pageTitle;

  const main = document.querySelector('main');
  main.setAttribute('tabindex', '-1');
  main.focus();

  // Announce the route change to screen readers
  announceRouteChange(pageTitle);
}

function announceRouteChange(title) {
  let announcer = document.getElementById('route-announcer');
  if (!announcer) {
    announcer = document.createElement('div');
    announcer.id = 'route-announcer';
    announcer.setAttribute('aria-live', 'assertive');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    document.body.appendChild(announcer);
  }
  announcer.textContent = '';
  requestAnimationFrame(() => {
    announcer.textContent = title;
  });
}
```

### 5.6 Programmatic Focus Movement

```javascript
// Move focus after dynamic content insertion
function addItemToList(item) {
  const list = document.getElementById('item-list');
  const li = document.createElement('li');
  li.textContent = item.name;
  li.setAttribute('tabindex', '-1');
  list.appendChild(li);
  li.focus(); // Move focus to newly added item
  announceStatus(`${item.name} added to list`);
}

// Move focus after deletion
function removeItem(itemElement) {
  const nextFocus = itemElement.nextElementSibling
    || itemElement.previousElementSibling
    || itemElement.parentElement;
  itemElement.remove();
  if (nextFocus) {
    nextFocus.setAttribute('tabindex', '-1');
    nextFocus.focus();
  }
}
```

## 6. Forms and Error Handling

### 6.1 Complete Accessible Form (SC 1.3.1, 3.3.1, 3.3.2, 3.3.3)

```html
<form novalidate aria-labelledby="form-title">
  <h2 id="form-title">Create Account</h2>

  <!-- Error summary (shown after failed submission) -->
  <div id="error-summary" role="alert" hidden>
    <h3>There are 2 errors in this form:</h3>
    <ul>
      <li><a href="#name">Full name is required</a></li>
      <li><a href="#email">Enter a valid email address</a></li>
    </ul>
  </div>

  <div class="form-group">
    <label for="name">
      Full name <span aria-hidden="true">*</span>
    </label>
    <input type="text" id="name" name="name"
           required aria-required="true"
           autocomplete="name"
           aria-describedby="name-error">
    <p id="name-error" class="error-message" hidden>
      Full name is required
    </p>
  </div>

  <div class="form-group">
    <label for="email">
      Email address <span aria-hidden="true">*</span>
    </label>
    <input type="email" id="email" name="email"
           required aria-required="true"
           autocomplete="email"
           aria-describedby="email-hint email-error">
    <p id="email-hint" class="hint">We will send a confirmation to this address</p>
    <p id="email-error" class="error-message" hidden>
      Enter a valid email address (example: name@domain.com)
    </p>
  </div>

  <fieldset>
    <legend>Account type <span aria-hidden="true">*</span></legend>
    <label>
      <input type="radio" name="account-type" value="personal" required>
      Personal
    </label>
    <label>
      <input type="radio" name="account-type" value="business">
      Business
    </label>
  </fieldset>

  <div class="form-group">
    <label for="password">
      Password <span aria-hidden="true">*</span>
    </label>
    <input type="password" id="password" name="password"
           required aria-required="true"
           autocomplete="new-password"
           aria-describedby="password-requirements">
    <p id="password-requirements" class="hint">
      At least 8 characters, one uppercase, one number
    </p>
  </div>

  <button type="submit">Create Account</button>
</form>
```

### 6.2 Inline Validation (SC 3.3.1, 4.1.3)

```javascript
function validateField(input) {
  const errorEl = document.getElementById(`${input.id}-error`);
  let message = '';

  if (input.validity.valueMissing) {
    message = `${input.labels[0].textContent.trim()} is required`;
  } else if (input.validity.typeMismatch) {
    message = `Enter a valid ${input.type}`;
  }

  if (message) {
    input.setAttribute('aria-invalid', 'true');
    errorEl.textContent = message;
    errorEl.hidden = false;
  } else {
    input.removeAttribute('aria-invalid');
    errorEl.hidden = true;
  }
}

// Validate on blur (not on every keystroke)
document.querySelectorAll('input[required]').forEach((input) => {
  input.addEventListener('blur', () => validateField(input));
});
```

### 6.3 Error Summary on Submission (SC 3.3.1)

```javascript
function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const errors = [];

  form.querySelectorAll('input[required]').forEach((input) => {
    validateField(input);
    if (input.getAttribute('aria-invalid') === 'true') {
      const label = input.labels[0].textContent.trim();
      errors.push({ id: input.id, message: `${label} is required` });
    }
  });

  const summary = document.getElementById('error-summary');
  if (errors.length > 0) {
    const list = errors
      .map((err) => `<li><a href="#${err.id}">${err.message}</a></li>`)
      .join('');
    summary.textContent = '';
    summary.insertAdjacentHTML('afterbegin',
      `<h3>There are ${errors.length} errors in this form:</h3><ul>${list}</ul>`
    );
    summary.hidden = false;
    summary.focus();
  } else {
    summary.hidden = true;
    // Proceed with form submission
  }
}
```

### 6.4 Autocomplete Attributes (SC 1.3.5)

Always set `autocomplete` on inputs that accept user personal data:

```html
<input type="text" autocomplete="given-name">
<input type="text" autocomplete="family-name">
<input type="email" autocomplete="email">
<input type="tel" autocomplete="tel">
<input type="text" autocomplete="street-address">
<input type="text" autocomplete="postal-code">
<input type="text" autocomplete="country-name">
<input type="text" autocomplete="organization">
<input type="password" autocomplete="new-password">
<input type="password" autocomplete="current-password">
<input type="text" autocomplete="one-time-code">
```

## 7. Color and Contrast

### 7.1 Contrast Ratios (SC 1.4.3, 1.4.6, 1.4.11)

| Element | Minimum Ratio (AA) | Enhanced Ratio (AAA) |
|---|---|---|
| Normal text (below 18pt / 14pt bold) | 4.5:1 | 7:1 |
| Large text (18pt+ or 14pt+ bold) | 3:1 | 4.5:1 |
| UI components and graphical objects | 3:1 | N/A |
| Disabled controls and decorative elements | No requirement | No requirement |

### 7.2 Never Use Color Alone (SC 1.4.1)

```html
<!-- WRONG: only color differentiates error -->
<input style="border-color: red;">

<!-- RIGHT: color + icon + text -->
<div class="form-group has-error">
  <label for="username">Username</label>
  <input id="username" aria-invalid="true" aria-describedby="username-error">
  <p id="username-error" class="error-message">
    <svg aria-hidden="true" class="icon-error"><!-- error icon --></svg>
    Username is already taken
  </p>
</div>
```

```css
/* Links: use underline in addition to color */
a {
  color: #0055cc;
  text-decoration: underline;
}

/* Don't remove underline unless another visual cue exists */
a:hover {
  text-decoration: underline;
  color: #003d99;
}
```

### 7.3 High Contrast and User Preferences (SC 1.4.3)

```css
/* Respect user's color scheme preference */
@media (prefers-color-scheme: dark) {
  :root {
    --text-color: #e0e0e0;
    --bg-color: #121212;
    --link-color: #80b4ff;
  }
}

/* Respect user's contrast preference */
@media (prefers-contrast: more) {
  :root {
    --text-color: #000;
    --bg-color: #fff;
    --border-color: #000;
  }

  button, input, select {
    border: 2px solid #000;
  }
}

/* Windows High Contrast Mode (forced-colors) */
@media (forced-colors: active) {
  .custom-checkbox .checkmark {
    forced-color-adjust: none;
    border: 2px solid ButtonText;
  }

  :focus-visible {
    outline: 3px solid Highlight;
  }
}
```

### 7.4 Charts and Data Visualization (SC 1.4.1)

```css
/* Use patterns in addition to colors for chart bars */
.bar-revenue {
  background-color: #2563eb;
  background-image: repeating-linear-gradient(
    45deg, transparent, transparent 5px,
    rgba(255,255,255,0.2) 5px, rgba(255,255,255,0.2) 10px
  );
}

.bar-expenses {
  background-color: #dc2626;
  background-image: repeating-linear-gradient(
    -45deg, transparent, transparent 5px,
    rgba(255,255,255,0.2) 5px, rgba(255,255,255,0.2) 10px
  );
}
```

Always provide a data table alternative alongside charts.

## 8. Images and Media

### 8.1 Alt Text (SC 1.1.1)

```html
<!-- Informative image: describe content -->
<img src="chart-q3.png" alt="Q3 revenue chart showing 23% growth over Q2">

<!-- Decorative image: empty alt -->
<img src="divider-line.png" alt="">

<!-- Image that is a link: describe destination -->
<a href="/profile">
  <img src="avatar.jpg" alt="Your profile">
</a>

<!-- Complex image: long description -->
<figure>
  <img src="org-chart.png" alt="Company organization chart"
       aria-describedby="org-chart-desc">
  <figcaption id="org-chart-desc">
    The CEO oversees three divisions: Engineering (VP Jane Smith, 45 staff),
    Marketing (VP John Doe, 22 staff), and Operations (VP Lisa Park, 30 staff).
  </figcaption>
</figure>
```

### 8.2 SVG Accessibility (SC 1.1.1, 4.1.2)

```html
<!-- Informative SVG: needs accessible name -->
<svg role="img" aria-labelledby="svg-title svg-desc"
     viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <title id="svg-title">Warning</title>
  <desc id="svg-desc">Yellow triangle with exclamation mark</desc>
  <path d="M12 2L1 21h22L12 2zm0 4l7.5 13h-15L12 6z"/>
  <path d="M11 10h2v5h-2zm0 6h2v2h-2z"/>
</svg>

<!-- Decorative SVG icon: hide from assistive tech -->
<button type="button">
  <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
  </svg>
  Menu
</button>
```

When SVG icons appear inside buttons or links with visible text, mark the SVG `aria-hidden="true"` and add `focusable="false"` (for IE/Edge legacy).

### 8.3 Video and Audio (SC 1.2.1, 1.2.2, 1.2.3, 1.2.5)

```html
<figure>
  <video controls aria-label="Product demo video">
    <source src="demo.mp4" type="video/mp4">
    <track kind="captions" src="demo-en.vtt" srclang="en"
           label="English captions" default>
    <track kind="descriptions" src="demo-desc-en.vtt" srclang="en"
           label="English audio descriptions">
    <p>Your browser does not support video.
       <a href="demo.mp4">Download the video</a> or
       <a href="transcript.html">read the transcript</a>.</p>
  </video>
  <figcaption>
    <a href="transcript.html">Full transcript of this video</a>
  </figcaption>
</figure>
```

Requirements by media type:

| Media | Level A | Level AA |
|---|---|---|
| Pre-recorded video with audio | Captions OR transcript | Captions AND audio descriptions |
| Pre-recorded audio only | Transcript | Transcript |
| Pre-recorded video only | Text alternative or audio track | Audio descriptions |
| Live video with audio | Captions | Captions |

### 8.4 Reduced Motion (SC 2.3.1, 2.3.3)

```css
/* Default: provide animations */
.fade-in {
  animation: fadeIn 0.3s ease-in;
}

/* Respect user preference to reduce motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Any content that blinks, flashes, or auto-scrolls must have pause/stop controls. Nothing should flash more than 3 times per second (SC 2.3.1).

## 9. Dynamic Content and SPAs

### 9.1 Route Change Announcements (SC 4.1.3)

When a SPA changes routes without a full page reload, screen readers do not automatically announce the new content. You must programmatically manage this:

```javascript
// Pattern: visually hidden live region for route announcements
const ANNOUNCER_STYLES = [
  'position: absolute',
  'width: 1px',
  'height: 1px',
  'padding: 0',
  'margin: -1px',
  'overflow: hidden',
  'clip: rect(0, 0, 0, 0)',
  'white-space: nowrap',
  'border: 0',
].join(';');

function createRouteAnnouncer() {
  const el = document.createElement('div');
  el.setAttribute('role', 'status');
  el.setAttribute('aria-live', 'assertive');
  el.setAttribute('aria-atomic', 'true');
  el.setAttribute('style', ANNOUNCER_STYLES);
  document.body.appendChild(el);
  return el;
}

const routeAnnouncer = createRouteAnnouncer();

function navigateTo(path, title) {
  // Render new content...
  document.title = title;

  // Clear then set (ensures re-announcement even if same text)
  routeAnnouncer.textContent = '';
  setTimeout(() => {
    routeAnnouncer.textContent = `Navigated to ${title}`;
  }, 100);

  // Move focus to main content
  const main = document.querySelector('main');
  main.setAttribute('tabindex', '-1');
  main.focus();
}
```

### 9.2 Loading States (SC 4.1.3)

```html
<div id="content-area" aria-busy="false">
  <!-- Dynamic content here -->
</div>
<div id="loading-status" aria-live="polite" class="sr-only"></div>
```

```javascript
async function loadContent(url) {
  const area = document.getElementById('content-area');
  const status = document.getElementById('loading-status');

  area.setAttribute('aria-busy', 'true');
  status.textContent = 'Loading content...';

  try {
    const data = await fetch(url).then((r) => r.json());
    area.setAttribute('aria-busy', 'false');
    // Render content into area...
    status.textContent = 'Content loaded';
  } catch {
    area.setAttribute('aria-busy', 'false');
    status.textContent = 'Failed to load content';
  }
}
```

### 9.3 Toast Notifications (SC 4.1.3)

```html
<!-- Container for toast messages -->
<div id="toast-container" aria-live="polite" aria-relevant="additions">
</div>
```

```javascript
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
  toast.textContent = message;
  container.appendChild(toast);

  // Auto-dismiss after 5 seconds (but never for errors)
  if (type !== 'error') {
    setTimeout(() => {
      toast.remove();
    }, 5000);
  }
}
```

### 9.4 Infinite Scroll Alternative (SC 2.1.1, 2.4.1)

```html
<!-- Always provide a pagination alternative to infinite scroll -->
<nav aria-label="Results navigation">
  <ul>
    <li><a href="?page=1" aria-current="page">1</a></li>
    <li><a href="?page=2">2</a></li>
    <li><a href="?page=3">3</a></li>
  </ul>
</nav>

<!-- If using infinite scroll, announce new content -->
<div aria-live="polite" id="scroll-status" class="sr-only"></div>
```

```javascript
function onNewItemsLoaded(count) {
  document.getElementById('scroll-status').textContent =
    `${count} more items loaded. Total items: ${getTotalCount()}.`;
}
```

## 10. Responsive and Mobile

### 10.1 Touch Target Size (SC 2.5.5, 2.5.8)

```css
/* Minimum 44x44 CSS pixels for all interactive elements */
button, a, input[type="checkbox"], input[type="radio"],
select, [role="button"], [role="tab"], [role="menuitem"] {
  min-height: 44px;
  min-width: 44px;
}

/* For inline links within text, add padding to increase target */
p a {
  padding: 0.25em 0;
}
```

### 10.2 Viewport and Zoom (SC 1.4.4, 1.4.10)

```html
<!-- RIGHT: allows zoom -->
<meta name="viewport" content="width=device-width, initial-scale=1">

<!-- WRONG: prevents zoom (violates SC 1.4.4) -->
<meta name="viewport" content="width=device-width, initial-scale=1,
  maximum-scale=1, user-scalable=no">
```

### 10.3 Content Reflow (SC 1.4.10)

Content must reflow without horizontal scrolling at 320px CSS width (equivalent to 1280px at 400% zoom):

```css
/* Use relative units and flexible layouts */
.container {
  max-width: 80rem;
  width: 100%;
  padding: 0 1rem;
}

/* Use rem/em, never fixed px for text */
body {
  font-size: 1rem;      /* RIGHT */
  /* font-size: 16px; */  /* WRONG: won't scale with user preferences */
}

h1 {
  font-size: 2rem;       /* RIGHT: scales proportionally */
}

/* Flexible grids that reflow naturally */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(18rem, 100%), 1fr));
  gap: 1rem;
}
```

### 10.4 Orientation (SC 1.3.4)

Never lock orientation unless essential to the content (e.g., a piano keyboard app):

```css
/* WRONG: forcing portrait only via CSS */
@media (orientation: landscape) {
  body {
    transform: rotate(-90deg); /* Never do this */
  }
}
```

Do not use `screen.orientation.lock()` unless the specific content genuinely requires a fixed orientation.

## 11. Testing Checklist

Manual accessibility checks every developer should perform before shipping. No external tools required.

### 11.1 Keyboard Navigation

- [ ] Tab through the entire page from first to last focusable element
- [ ] Confirm every interactive element (link, button, input, select) receives focus
- [ ] Confirm focus order matches visual reading order
- [ ] Confirm all focused elements have a visible focus indicator
- [ ] Confirm buttons activate with both Enter and Space
- [ ] Confirm dialogs/modals trap focus inside them
- [ ] Confirm Escape closes modals, menus, and popups
- [ ] Confirm you can use the entire page without a mouse

### 11.2 Screen Reader Quick Check

- [ ] Turn on VoiceOver (macOS: Cmd+F5) or NVDA (Windows: free download)
- [ ] Navigate by headings (VO: Ctrl+Option+Cmd+H / NVDA: H key) — is the hierarchy logical?
- [ ] Navigate by landmarks (VO: Ctrl+Option+U / NVDA: D key) — are all regions labeled?
- [ ] Navigate through a form — are all labels announced?
- [ ] Trigger an error state — is the error announced?
- [ ] Open a modal — is the modal title announced?

### 11.3 Visual Checks

- [ ] Zoom browser to 200% — does all content remain visible without horizontal scrolling?
- [ ] Zoom browser to 400% — does content reflow to single column?
- [ ] Disable all CSS (browser dev tools) — does the content read in logical order?
- [ ] Check that no information is conveyed by color alone
- [ ] Verify text against backgrounds has sufficient contrast (use browser dev tools color picker)
- [ ] Check that all images have alt text (inspect in dev tools)

### 11.4 Content Checks

- [ ] Confirm `<html lang="en">` (or appropriate language) is set
- [ ] Confirm page `<title>` is unique and descriptive
- [ ] Confirm every form input has a visible `<label>`
- [ ] Confirm error messages are descriptive and linked to their fields
- [ ] Confirm decorative images use `alt=""`
- [ ] Confirm no `tabindex` value greater than 0 exists in the markup
- [ ] Confirm skip navigation link is present and functional

## 12. Common Mistakes

| Mistake | WCAG SC | Impact | Fix |
|---|---|---|---|
| `<div onclick>` instead of `<button>` | 4.1.2, 2.1.1 | Not focusable, no keyboard support, no role | Use `<button>` element |
| Missing `alt` attribute on images | 1.1.1 | Screen readers read filename or nothing | Add descriptive `alt` text or `alt=""` for decorative |
| `outline: none` on `:focus` | 2.4.7 | Keyboard users cannot see where they are | Use `:focus-visible` with visible outline |
| Color as sole indicator | 1.4.1 | Color-blind users miss information | Add icon, text, pattern, or border in addition to color |
| Missing `<label>` on form inputs | 1.3.1, 3.3.2 | Screen readers announce nothing for the field | Add `<label for="...">` or `aria-label` |
| Auto-playing audio/video | 1.4.2 | Disorients users, interferes with screen readers | Never autoplay; or autoplay muted with stop control |
| Fixed font sizes in `px` | 1.4.4 | Text does not scale with browser zoom settings | Use `rem` or `em` units |
| Missing `lang` attribute on `<html>` | 3.1.1 | Screen readers use wrong pronunciation rules | Add `<html lang="en">` (or appropriate code) |
| Skipping heading levels | 1.3.1 | Breaks heading navigation for screen reader users | Use sequential `h1` through `h6` |
| No skip navigation link | 2.4.1 | Keyboard users must tab through entire header every page | Add hidden-until-focused skip link to `#main-content` |
| `tabindex` greater than 0 | 2.4.3 | Creates unpredictable, unmaintainable tab order | Use DOM order; only use `tabindex="0"` or `tabindex="-1"` |
| Mouse-only interactions (hover menus) | 2.1.1 | Keyboard and touch users cannot access content | Ensure all hover interactions work on focus/click |
| No focus management in modals | 2.1.2, 2.4.3 | Users tab behind modal, get lost in page | Trap focus inside modal, restore focus on close |
| Missing `aria-expanded` on toggles | 4.1.2 | Screen readers do not know if panel is open/closed | Add `aria-expanded="true/false"` and update on toggle |
| `placeholder` as the only label | 1.3.1, 3.3.2 | Placeholder disappears on input, low contrast | Use a real `<label>` element; placeholder is supplementary |
| `maximum-scale=1` in viewport meta | 1.4.4 | Prevents pinch-to-zoom on mobile | Remove `maximum-scale` and `user-scalable=no` |

## 13. Quick Reference

### DO

- Use semantic HTML elements (`<button>`, `<nav>`, `<main>`, `<label>`, `<table>`)
- Provide text alternatives for all non-text content
- Maintain heading hierarchy (`h1` > `h2` > `h3`, no skipping)
- Ensure 4.5:1 contrast ratio for text, 3:1 for UI components
- Make all functionality available via keyboard
- Show visible focus indicators on all interactive elements
- Use `aria-live` regions to announce dynamic content changes
- Link form errors to their inputs with `aria-describedby`
- Set `<html lang="...">` on every page
- Use `rem`/`em` for font sizes and spacing
- Test with keyboard only before every release
- Provide captions for video and transcripts for audio
- Include a skip navigation link
- Use `autocomplete` attributes on personal data inputs
- Trap focus inside modals, restore on close
- Respect `prefers-reduced-motion` and `prefers-contrast`

### DO NOT

- Use `<div>` or `<span>` for interactive elements
- Remove focus outlines without replacement (`outline: none`)
- Convey information through color alone
- Use `tabindex` greater than 0
- Disable browser zoom (`maximum-scale=1`, `user-scalable=no`)
- Use fixed pixel sizes for text
- Autoplay audio or video with sound
- Use ARIA when native HTML provides the same semantics
- Rely on placeholder text as the field label
- Create mouse-only interactions (hover-dependent menus/tooltips)
- Skip heading levels or use headings for visual styling
- Use `title` attribute as a replacement for visible labels
- Put interactive elements inside other interactive elements (nested links/buttons)
- Use `role="presentation"` or `aria-hidden="true"` on visible, meaningful content
- Remove list semantics with `list-style: none` without restoring via `role="list"`

### Screen-Reader-Only CSS Class

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

Use this class to hide content visually while keeping it accessible to screen readers. Common uses: skip links (visible on focus), form hints, live region containers, icon button labels.

### Minimum Accessible Page Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Descriptive Page Title - Site Name</title>
</head>
<body>
  <a href="#main" class="skip-link sr-only" style="position:absolute">
    Skip to main content
  </a>

  <header>
    <nav aria-label="Main">
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/about">About</a></li>
      </ul>
    </nav>
  </header>

  <main id="main" tabindex="-1">
    <h1>Page Title</h1>
    <!-- Primary content -->
  </main>

  <footer>
    <p>Copyright 2026 Company Name</p>
  </footer>

  <!-- Live region for dynamic announcements -->
  <div aria-live="polite" id="announcements" class="sr-only"></div>
</body>
</html>
```
