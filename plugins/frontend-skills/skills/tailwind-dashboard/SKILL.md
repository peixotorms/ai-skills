---
name: tailwind-dashboard
description: Use when building admin dashboards, data tables, CRUD interfaces, back-office panels, or management consoles with Tailwind CSS. Covers advanced tables with sorting, filtering, pagination, expandable rows, CRUD layouts, create/update/delete modals, create/update drawers, dashboard navbars, dashboard footers, faceted search, dropdown filters, side navigation, read sections, success messages, table headers, table footers, bulk actions, data export.
---

# Dashboard and CRUD Patterns

Reference for building admin dashboards, data tables, CRUD interfaces, and
management consoles with Tailwind CSS. Covers table variants, CRUD layouts,
filtering, navigation, forms, feedback, and pagination.

For foundational Tailwind CSS patterns see **tailwind-guidelines**.

---

## 1. Data Table Patterns

### Table Variants

| Variant | Key Features | Classes / Approach |
|---------|--------------|--------------------|
| Simple | Basic rows and columns | `min-w-full divide-y divide-gray-300` |
| With checkboxes | Bulk row selection | Checkbox column + indeterminate state for "select all" |
| Sortable | Column header click to sort | `cursor-pointer` headers + chevron sort icons |
| Striped | Alternating row colors | `even:bg-gray-50` on `<tr>` |
| Sticky header | Fixed header on scroll | `sticky top-0 z-10 bg-white` on `<thead>` |
| Expandable rows | Inline detail expansion | Disclosure toggle per row, hidden detail `<tr>` |
| With avatars | User/entity tables | `size-10 rounded-full` avatar + multi-line name/email |
| Condensed | High-density data | `py-2 text-xs` cells, `px-2` horizontal padding |
| Responsive | Mobile-friendly | `hidden sm:table-cell` to hide columns, or stacked card layout below `sm:` |

### Core Table Classes

| Element | Classes |
|---------|---------|
| Table wrapper | `overflow-x-auto` (or `overflow-hidden ring-1 ring-gray-300 sm:rounded-lg`) |
| Table | `min-w-full divide-y divide-gray-300` |
| Header cell | `px-3 py-3.5 text-left text-sm font-semibold text-gray-900` |
| Body section | `divide-y divide-gray-200 bg-white` |
| Body cell | `whitespace-nowrap px-3 py-4 text-sm text-gray-500` |
| Primary cell | `font-medium text-gray-900` (first meaningful column) |
| Action cell | `relative py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6` |
| Action link | `text-indigo-600 hover:text-indigo-900` |

### Responsive Table Strategies

| Strategy | When to Use | Approach |
|----------|-------------|----------|
| Column hiding | Table has many columns | `hidden sm:table-cell` on low-priority columns |
| Horizontal scroll | Data must remain tabular | Wrap in `overflow-x-auto` container |
| Stacked cards | Few columns, mobile-primary | Replace `<table>` with card layout below breakpoint |
| Priority columns | Mixed importance | Show 2-3 columns on mobile, rest on `md:` and above |

### Checkbox Column Pattern

| Element | Classes |
|---------|---------|
| Header checkbox | `size-4 rounded-sm border-gray-300 text-indigo-600 focus:ring-indigo-600` |
| Row checkbox | Same as header, bound to row selection state |
| Indeterminate state | Set via `ref.indeterminate = true` when partial selection |
| Selected row | `bg-gray-50` or `bg-indigo-50` on selected `<tr>` |

---

## 2. CRUD Layout Patterns

### CRUD Action Map

| Action | UI Pattern | Component | When to Use |
|--------|------------|-----------|-------------|
| Create | Modal dialog | `Dialog` with form | Simple forms (under 5 fields) |
| Create | Slide-over drawer | `Dialog` + `DialogPanel` with `translate-x` | Complex forms, multi-section |
| Read | Detail section | Inline description list | Below table or dedicated page |
| Read | Slide-over drawer | Read-only detail panel | Quick preview without navigation |
| Update | Modal dialog | `Dialog` with pre-filled form | Simple edits |
| Update | Slide-over drawer | Pre-filled form in slide-over | Complex edits |
| Update | Inline editing | Click-to-edit cells | Single-field quick edits |
| Delete | Confirmation modal | Alert dialog with destructive button | Always require confirmation |

### Table Action Column

| Pattern | Classes |
|---------|---------|
| Single action link | `text-indigo-600 hover:text-indigo-900` in last column |
| Dropdown menu | Kebab icon button + `Popover` or `Menu` with actions |
| Icon buttons | `size-5 text-gray-400 hover:text-gray-500` icons inline |

### Bulk Action Bar

| Element | Classes |
|---------|---------|
| Container | `absolute left-14 flex items-center space-x-3 bg-white sm:left-12` (overlay above table header) |
| Selection count | `text-sm font-semibold text-gray-900` |
| Action buttons | `inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50` |

### Empty State

| Element | Classes |
|---------|---------|
| Container | `text-center py-12` |
| Icon | `mx-auto size-12 text-gray-400` |
| Title | `mt-2 text-sm font-semibold text-gray-900` |
| Description | `mt-1 text-sm text-gray-500` |
| CTA button | `mt-6 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500` |

---

## 3. Filter and Search Patterns

### Table Header with Search

| Element | Classes |
|---------|---------|
| Header bar | `sm:flex sm:items-center sm:justify-between` above table |
| Title | `text-base font-semibold text-gray-900` |
| Search input | `block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6` |
| Search icon | `pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3` with `size-5 text-gray-400` |

### Filter Approaches

| Pattern | When to Use | Implementation |
|---------|-------------|----------------|
| Dropdown filters | 1-3 filter dimensions | `Popover` with checkbox/radio groups |
| Faceted sidebar | Many filter dimensions | Sidebar with `Disclosure` groups for each facet |
| Inline filter row | Simple column filters | Filter inputs below each column header |
| Filter chips | Show active filters | Removable badge chips below search bar |
| Date range picker | Time-based filtering | Two date inputs with preset ranges |

### Active Filter Chips

| Element | Classes |
|---------|---------|
| Chip container | `flex flex-wrap gap-2 mt-3` |
| Chip | `inline-flex items-center gap-x-1 rounded-md bg-gray-100 px-2.5 py-1.5 text-sm font-medium text-gray-700` |
| Remove button | `group relative -mr-1 size-3.5 rounded-sm hover:bg-gray-200/80` with X icon |
| Clear all link | `text-sm font-medium text-indigo-600 hover:text-indigo-500` |

### Search Implementation Rules

| Rule | Detail |
|------|--------|
| Debounce search input | 300ms debounce to avoid excessive requests |
| Show loading indicator | Spinner or skeleton while fetching results |
| Preserve filters on search | Search should combine with active filters |
| Clear search button | X icon inside input when value is present |
| Empty results state | Distinct from empty table state, suggest broadening filters |
| Filter count badge | Show count on filter button when filters are active |

---

## 4. Dashboard Navigation

### Dashboard Navbar

| Element | Classes |
|---------|---------|
| Navbar | `bg-white shadow-sm` or `bg-gray-800` for dark |
| Container | `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8` |
| Inner | `flex h-16 items-center justify-between` |
| Logo area | `flex shrink-0 items-center` |
| Search | `hidden sm:block` centered search input |
| Right section | `flex items-center gap-x-4` for notifications + profile |
| Notification button | `relative rounded-full p-1 text-gray-400 hover:text-gray-500` with badge dot |
| Profile dropdown | `relative` trigger + `Menu` dropdown with user info and links |

### Side Navigation

| Element | Classes |
|---------|---------|
| Sidebar | `flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 border-r border-gray-200` |
| Nav group label | `text-xs/6 font-semibold text-gray-400` |
| Nav item | `group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold` |
| Nav item default | `text-gray-700 hover:bg-gray-50 hover:text-indigo-600` |
| Nav item active | `bg-gray-50 text-indigo-600` |
| Nav icon | `size-6 shrink-0 text-gray-400 group-hover:text-indigo-600` |
| Nav icon active | `size-6 shrink-0 text-indigo-600` |
| Collapsible group | `Disclosure` with chevron rotation `group-data-[open]:rotate-180` |
| Badge count | `ml-auto rounded-full bg-gray-50 px-2.5 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-200` |

### Navigation Variants

| Variant | Structure | Key Detail |
|---------|-----------|------------|
| Fixed sidebar + content | Sidebar `fixed inset-y-0 w-64` + main `pl-64` | Desktop persistent navigation |
| Collapsible sidebar | `w-64` expanded, `w-16` icon-only collapsed | Toggle button at sidebar bottom |
| Mobile drawer | `Dialog` with `fixed inset-0` sidebar | Hamburger trigger, backdrop overlay |
| Top + side combined | Horizontal navbar + vertical sidebar | Sidebar nested under navbar height |
| Breadcrumb sub-nav | `nav` with `/` separated breadcrumb links | Below main navbar, `text-sm text-gray-500` |
| Tab sub-nav | Horizontal tabs below navbar | `border-b border-gray-200` with active tab indicator |

---

## 5. Form Patterns for CRUD

### Modal Form Layout

| Element | Classes |
|---------|---------|
| Dialog backdrop | `fixed inset-0 bg-gray-500/75 transition-opacity` |
| Dialog panel | `relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6` |
| Form title | `text-lg/6 font-semibold text-gray-900` |
| Fieldset | `mt-4 space-y-4` |
| Label | `block text-sm/6 font-medium text-gray-900` |
| Input | `block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6` |
| Error text | `mt-2 text-sm text-red-600` |
| Error input ring | `ring-red-300 focus:ring-red-500` (replace gray ring) |
| Button row | `mt-5 sm:mt-6 sm:flex sm:flex-row-reverse gap-3` |
| Submit button | `inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:w-auto` |
| Cancel button | `mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto` |

### Drawer Form Layout

| Element | Classes |
|---------|---------|
| Panel | `pointer-events-auto w-screen max-w-md` (or `max-w-lg`, `max-w-2xl`) |
| Header | `bg-indigo-700 px-4 py-6 sm:px-6` or `px-4 py-6 border-b border-gray-200` |
| Form body | `flex-1 overflow-y-auto px-4 py-6 sm:px-6` |
| Form sections | `space-y-6 divide-y divide-gray-200` |
| Section title | `text-sm font-medium text-gray-900` |
| Footer | `flex shrink-0 justify-end gap-x-3 border-t border-gray-200 px-4 py-4` |

### Inline Editing

| State | Implementation |
|-------|----------------|
| Display mode | Text with `cursor-pointer hover:bg-gray-50` wrapper |
| Edit mode | Input replaces text, auto-focused, saves on blur or Enter |
| Saving | Disabled input with spinner, or optimistic update |
| Validation error | Red ring on input, error text below |

### Multi-Step Form

| Element | Classes |
|---------|---------|
| Stepper | `flex items-center` with step circles and connecting lines |
| Step circle (complete) | `flex size-8 items-center justify-center rounded-full bg-indigo-600 text-white` |
| Step circle (current) | `flex size-8 items-center justify-center rounded-full border-2 border-indigo-600 text-indigo-600` |
| Step circle (upcoming) | `flex size-8 items-center justify-center rounded-full border-2 border-gray-300 text-gray-500` |
| Connector line | `h-0.5 w-full bg-indigo-600` (complete) or `bg-gray-200` (upcoming) |

---

## 6. Feedback and Status

### Status Badges

| Status | Badge Classes |
|--------|---------------|
| Active / Success | `inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20` |
| Warning / Pending | `inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20` |
| Error / Failed | `inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10` |
| Info / Default | `inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10` |
| Dot indicator | Add `size-1.5 rounded-full bg-green-500` (or matching color) before text |

### Success Message Banner

| Element | Classes |
|---------|---------|
| Container | `rounded-md bg-green-50 p-4` |
| Icon | `size-5 text-green-400` |
| Text | `text-sm font-medium text-green-800` |
| Dismiss button | `rounded-md bg-green-50 p-1.5 text-green-500 hover:bg-green-100` |
| Behavior | Auto-dismiss after 5 seconds with fade-out transition |

### Delete Confirmation Modal

| Element | Classes |
|---------|---------|
| Icon | `mx-auto flex size-12 items-center justify-center rounded-full bg-red-100` with `size-6 text-red-600` exclamation icon |
| Title | `text-lg/6 font-semibold text-gray-900` |
| Description | `mt-2 text-sm text-gray-500` |
| Delete button | `bg-red-600 hover:bg-red-500 text-white` |
| Cancel button | Standard cancel button classes |
| Input confirmation | For destructive actions: require typing entity name to enable delete button |

### Bulk Action Feedback

| State | Display |
|-------|---------|
| Items selected | "X items selected" text in bulk action bar |
| Action in progress | Loading spinner replacing action button text |
| Action complete | Success banner with count: "X items updated" |
| Partial failure | Warning banner with details: "X succeeded, Y failed" |

---

## 7. Dashboard Layout

### Stat Cards

| Element | Classes |
|---------|---------|
| Grid | `grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4` |
| Card | `overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6` |
| Stat label | `truncate text-sm font-medium text-gray-500` |
| Stat value | `mt-1 text-3xl font-semibold tracking-tight text-gray-900` |
| Trend up | `text-sm font-medium text-green-600` with up arrow icon |
| Trend down | `text-sm font-medium text-red-600` with down arrow icon |
| Card icon | `rounded-md bg-indigo-500 p-3 text-white` |

### Activity Feed

| Element | Classes |
|---------|---------|
| Container | `flow-root` |
| List | `divide-y divide-gray-200` or timeline with connecting line |
| Timeline line | `absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200` |
| Event dot | `relative flex size-10 items-center justify-center rounded-full bg-white ring-8 ring-white` |
| Event content | `min-w-0 flex-1 ml-4` |
| Event text | `text-sm text-gray-500` with `font-medium text-gray-900` for actor name |
| Timestamp | `text-xs text-gray-500` or `whitespace-nowrap text-sm text-gray-500` |

### Quick Actions

| Element | Classes |
|---------|---------|
| Grid | `grid grid-cols-1 gap-4 sm:grid-cols-2` |
| Action card | `group relative flex items-center gap-x-4 rounded-lg p-4 hover:bg-gray-50` |
| Icon wrapper | `flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 group-hover:bg-indigo-100` |
| Action title | `text-sm font-semibold text-gray-900` |
| Action description | `mt-1 text-sm text-gray-500` |

---

## 8. Table Footer and Pagination

### Table Footer

| Element | Classes |
|---------|---------|
| Container | `flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6` |
| Result text | `text-sm text-gray-700` with `font-medium` on numbers |
| Mobile result text | `sm:hidden` simplified version |

### Pagination Variants

| Variant | When to Use | Key Detail |
|---------|-------------|------------|
| Page numbers | Under 10 pages | Full page number list with prev/next |
| Truncated pages | Over 10 pages | `1 2 ... 5 6 7 ... 20` with ellipsis |
| Prev/Next only | Mobile or large datasets | Two buttons, no page numbers |
| Load more | Infinite lists | Single "Load more" button at bottom |
| Infinite scroll | Feed-style content | Sentinel element triggers fetch |

### Page Number Pagination

| Element | Classes |
|---------|---------|
| Nav | `isolate inline-flex -space-x-px rounded-md shadow-sm` |
| Prev/Next button | `relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50` |
| Page button | `relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50` |
| Current page | `relative z-10 inline-flex items-center bg-indigo-600 px-4 py-2 text-sm font-semibold text-white` |
| Ellipsis | `relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300` |

### Per-Page Selector

| Element | Classes |
|---------|---------|
| Label | `text-sm text-gray-700` |
| Select | `rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm` |
| Options | 10, 25, 50, 100 as standard values |

---

## 9. Drawer / Slide-Over Patterns

### Width Variants

| Variant | Class | Use Case |
|---------|-------|----------|
| Narrow | `max-w-md` | Simple detail view or short forms |
| Medium | `max-w-lg` | Standard CRUD forms |
| Wide | `max-w-2xl` | Complex forms, multi-column layouts |
| Full | `max-w-4xl` or wider | Data-heavy detail views |

### Drawer Structure

| Element | Classes |
|---------|---------|
| Root | `Dialog` with `relative z-50` |
| Backdrop | `fixed inset-0 bg-gray-500/75 transition-opacity` |
| Panel wrapper | `fixed inset-0 overflow-hidden` |
| Inner wrapper | `absolute inset-0 overflow-hidden` |
| Panel container | `pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10` |
| Panel | `pointer-events-auto w-screen max-w-md` (or chosen width variant) |
| Content wrapper | `flex h-full flex-col overflow-y-scroll bg-white shadow-xl` |
| Close button | `rounded-md text-gray-300 hover:text-white` (on colored header) or `text-gray-400 hover:text-gray-500` (on white header) |

### Drawer Types

| Type | Header | Body | Footer |
|------|--------|------|--------|
| Read drawer | Entity name + status badge | Description list with label/value pairs | Edit / Delete buttons |
| Create drawer | "Create [Entity]" title | Form fields in sections | Cancel + Create buttons |
| Update drawer | "Edit [Entity]" title | Pre-filled form fields | Cancel + Save buttons |

### Transition Classes

| Direction | Enter | Leave |
|-----------|-------|-------|
| Slide from right | `translate-x-0` (to) from `translate-x-full` | `translate-x-full` (to) from `translate-x-0` |
| Duration | `duration-500 ease-in-out` or `duration-300 ease-out` | `duration-500 ease-in-out` or `duration-200 ease-in` |
| Backdrop | `opacity-100` from `opacity-0` | `opacity-0` from `opacity-100` |

---

## 10. Common Anti-Patterns

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| Table without `overflow-x-auto` wrapper | Horizontal overflow breaks layout on mobile | Always wrap table in `overflow-x-auto` container |
| Complex multi-step form in a modal | Modal too small, cannot scroll properly | Use slide-over drawer or dedicated page |
| No loading state on data fetch | Users see empty table, assume no data | Show skeleton rows or spinner while loading |
| Empty table with no empty state | Users confused by blank space | Always provide empty state with CTA |
| Delete without confirmation | Accidental data loss | Always use confirmation modal for destructive actions |
| Inline styles for table column widths | Inconsistent, not responsive | Use `w-*` utility classes or `min-w-*` constraints |
| Missing sticky header on long tables | Users lose column context while scrolling | Add `sticky top-0` to `<thead>` for tables over 10 rows |
| Filter state not reflected in URL | Users cannot share or bookmark filtered views | Sync filter state with URL search params |
| Pagination resets on filter change | Users lose their place | Reset to page 1 when filters change, preserve on sort |
| No keyboard navigation on tables | Accessibility failure | Ensure interactive elements are focusable and operable via keyboard |
| Bulk actions without clear selection count | Users unsure what they are acting on | Always show "X items selected" in bulk action bar |
| Modal stacking (modal opens modal) | Confusing UX, z-index issues | Use single modal with changing content, or drawers |

## MCP Component Library

The `frontend-components` MCP server provides dashboard-related components:

- **HyperUI** (`hyperui`, category: `application`): Tables, stats, pagination, filters, modals, tabs, side-menu, vertical-menu, badges, empty-states, loaders, progress-bars, steps
- **HeadlessUI React/Vue**: Dialog, Menu, Listbox, Combobox, Tabs, Disclosure — accessible interactive patterns for dashboards
- **DaisyUI** (`daisyui`): Table, stat, menu, drawer, tab, modal, badge, pagination, steps, loading class references
- **FlyonUI** (`flyonui`): Table, stat, menu, drawer, tab, modal CSS + datatable, tabs, dropdown, stepper JS plugins

**Dashboard search:** `search_components(query: "table", framework: "hyperui")` or `search_components(query: "stat")` across all libraries.
