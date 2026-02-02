---
name: tailwind-components
description: Use when building UI components with Tailwind CSS — buttons, forms, inputs, selects, checkboxes, toggles, badges, avatars, dropdowns, modals, dialogs, notifications, alerts, tables, lists, cards, tabs, accordions, tooltips, popovers. Covers HeadlessUI integration, component composition, data-attribute styling, polymorphic components, className helpers, clsx, focus management, transition patterns, slot patterns.
---

# Tailwind CSS Components

## 1. Component Class Patterns

Standard Tailwind class recipes for common UI components. Use these as the baseline and extend as needed.

### 1.1 Buttons

| Variant | Classes |
|---|---|
| Primary | `rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600` |
| Secondary | `rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50` |
| Soft | `rounded-md bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-100` |
| Danger | `rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600` |
| Ghost | `rounded-md px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50` |
| Icon only | `rounded-full p-2 text-gray-400 hover:text-gray-500` |
| Disabled (any) | Add `disabled:opacity-50 disabled:cursor-not-allowed` |

### 1.2 Form Controls

| Component | Classes |
|---|---|
| Text input | `block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6` |
| Select | `block w-full rounded-md bg-white py-1.5 pl-3 pr-10 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6` |
| Textarea | `block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6` |
| Checkbox | `size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600` |
| Radio | `size-4 border-gray-300 text-indigo-600 focus:ring-indigo-600` |
| Toggle/Switch | `relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 data-[checked]:bg-indigo-600` |
| Label | `block text-sm/6 font-medium text-gray-900` |
| Help text | `mt-2 text-sm text-gray-500` |
| Error text | `mt-2 text-sm text-red-600` |
| Error input | Change outline from `outline-gray-300` to `outline-red-500`, focus from `focus:outline-indigo-600` to `focus:outline-red-600` |

### 1.3 Display Components

| Component | Classes |
|---|---|
| Badge/pill | `inline-flex items-center rounded-full px-2.5 py-1 text-xs/5 font-semibold` |
| Badge (color) | Add `bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20` (swap color as needed) |
| Card | `overflow-hidden rounded-lg bg-white shadow ring-1 ring-gray-900/5` |
| Card (bordered) | `overflow-hidden rounded-lg border border-gray-200 bg-white` |
| Avatar (circle) | `inline-block size-10 rounded-full` |
| Avatar (placeholder) | `inline-flex size-10 items-center justify-center rounded-full bg-gray-500 text-sm font-medium text-white` |
| Divider | `border-t border-gray-200` |
| Alert container | `rounded-md p-4` with color: `bg-yellow-50`, `bg-red-50`, `bg-green-50`, `bg-blue-50` |
| Alert icon | `size-5` with color: `text-yellow-400`, `text-red-400`, `text-green-400`, `text-blue-400` |
| Alert text | `text-sm` with color: `text-yellow-800`, `text-red-800`, `text-green-800`, `text-blue-800` |

### 1.4 Table

| Element | Classes |
|---|---|
| Table wrapper | `overflow-hidden shadow ring-1 ring-black/5 sm:rounded-lg` |
| `<table>` | `min-w-full divide-y divide-gray-300` |
| `<thead>` | `bg-gray-50` |
| `<th>` | `px-3 py-3.5 text-left text-sm font-semibold text-gray-900` |
| `<td>` | `whitespace-nowrap px-3 py-4 text-sm text-gray-500` |
| `<tbody>` | `divide-y divide-gray-200 bg-white` |
| Striped rows | Add `even:bg-gray-50` on `<tr>` |

### 1.5 Tabs

| Element | Classes |
|---|---|
| Tab list | `flex border-b border-gray-200` |
| Tab (inactive) | `border-b-2 border-transparent px-4 py-2 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700` |
| Tab (active) | `border-b-2 border-indigo-500 px-4 py-2 text-sm font-medium text-indigo-600` |

### 1.6 Dropdown / Popover

| Element | Classes |
|---|---|
| Panel | `absolute z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none` |
| Item | `block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900` |
| Item (destructive) | `block px-4 py-2 text-sm text-red-700 data-[focus]:bg-red-50` |

### 1.7 Modal / Dialog

| Element | Classes |
|---|---|
| Backdrop | `fixed inset-0 bg-gray-500/75 transition-opacity` |
| Dialog container | `fixed inset-0 z-10 w-screen overflow-y-auto` |
| Centering wrapper | `flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0` |
| Panel | `relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6` |
| Title | `text-base/7 font-semibold text-gray-900` |
| Description | `mt-2 text-sm text-gray-500` |
| Actions | `mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3` |

## 2. HeadlessUI Integration

### 2.1 Component Import Map

| Use Case | Components |
|---|---|
| Modal | `Dialog`, `DialogBackdrop`, `DialogPanel`, `DialogTitle` |
| Dropdown menu | `Menu`, `MenuButton`, `MenuItems`, `MenuItem` |
| Select | `Listbox`, `ListboxButton`, `ListboxOptions`, `ListboxOption` |
| Autocomplete | `Combobox`, `ComboboxInput`, `ComboboxButton`, `ComboboxOptions`, `ComboboxOption` |
| Toggle | `Switch` |
| Disclosure | `Disclosure`, `DisclosureButton`, `DisclosurePanel` |
| Radio group | `RadioGroup`, `Radio`, `Label`, `Description` |
| Popover | `Popover`, `PopoverButton`, `PopoverPanel` |
| Tabs | `TabGroup`, `TabList`, `Tab`, `TabPanels`, `TabPanel` |

### 2.2 Data Attribute Styling

HeadlessUI exposes component state via data attributes. Use these instead of managing state classes manually.

| Data Attribute | Applies When | Example Usage |
|---|---|---|
| `data-[open]` | Component is open (Dialog, Menu, Disclosure, Popover) | `data-[open]:rotate-180` on chevron icon |
| `data-[closed]` | Component is closed | `data-[closed]:opacity-0` for exit transitions |
| `data-[checked]` | Switch/Radio is checked | `data-[checked]:bg-indigo-600` |
| `data-[disabled]` | Component is disabled | `data-[disabled]:opacity-50` |
| `data-[focus]` | Item has virtual focus (Menu, Listbox, Combobox) | `data-[focus]:bg-indigo-600 data-[focus]:text-white` |
| `data-[selected]` | Option is selected (Listbox, Combobox) | `data-[selected]:font-semibold` |
| `data-[active]` | Item is active | `data-[active]:bg-gray-100` |
| `data-[hover]` | Item is hovered | `data-[hover]:bg-gray-50` |

### 2.3 Dialog Pattern

```jsx
<Dialog open={isOpen} onClose={setIsOpen} className="relative z-50">
  <DialogBackdrop className="fixed inset-0 bg-black/30 duration-300 ease-out data-[closed]:opacity-0" />
  <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
    <DialogPanel className="max-w-lg rounded-xl bg-white p-6 shadow-xl duration-300 ease-out data-[closed]:scale-95 data-[closed]:opacity-0">
      <DialogTitle className="text-lg font-semibold">Title</DialogTitle>
      <p className="mt-2 text-sm text-gray-500">Description text.</p>
      <div className="mt-4 flex justify-end gap-3">
        <button onClick={() => setIsOpen(false)} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Cancel</button>
        <button onClick={handleConfirm} className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">Confirm</button>
      </div>
    </DialogPanel>
  </div>
</Dialog>
```

### 2.4 Switch Pattern

```jsx
<Switch
  checked={enabled}
  onChange={setEnabled}
  className="group relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 data-[checked]:bg-indigo-600"
>
  <span className="pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out group-data-[checked]:translate-x-5" />
</Switch>
```

### 2.5 Menu Pattern

```jsx
<Menu>
  <MenuButton className="inline-flex items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
    Options
    <ChevronDownIcon className="-mr-1 size-5 text-gray-400" />
  </MenuButton>
  <MenuItems className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 transition duration-100 ease-out data-[closed]:scale-95 data-[closed]:opacity-0 focus:outline-none">
    <MenuItem>
      <a href="#" className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100">Edit</a>
    </MenuItem>
    <MenuItem>
      <a href="#" className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100">Delete</a>
    </MenuItem>
  </MenuItems>
</Menu>
```

### 2.6 Listbox (Select) Pattern

```jsx
<Listbox value={selected} onChange={setSelected}>
  <ListboxButton className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm/6">
    {selected.name}
    <ChevronUpDownIcon className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 size-5 text-gray-400" />
  </ListboxButton>
  <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
    {options.map((option) => (
      <ListboxOption key={option.id} value={option} className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-indigo-600 data-[focus]:text-white">
        {option.name}
      </ListboxOption>
    ))}
  </ListboxOptions>
</Listbox>
```

## 3. Component Composition

### 3.1 Sub-Component Pattern

Structure complex components with semantic sub-components for clear slot-based composition.

| Parent | Sub-Components | Purpose |
|---|---|---|
| `Dialog` | `DialogBackdrop`, `DialogPanel`, `DialogTitle` | Modal structure |
| `Card` | `CardHeader`, `CardBody`, `CardFooter` | Card layout slots |
| `DescriptionList` | `DescriptionTerm`, `DescriptionDetails` | Data display |
| `Table` | `TableHead`, `TableBody`, `TableRow`, `TableCell` | Table structure |

### 3.2 Polymorphic Components with `as`

HeadlessUI components accept an `as` prop to change the rendered element.

| Use Case | Example |
|---|---|
| MenuItem as link | `<MenuItem as="a" href="/settings">` |
| Tab as link | `<Tab as={Link} href="/tab1">` |
| DialogPanel as form | `<DialogPanel as="form" onSubmit={handleSubmit}>` |
| ListboxButton as custom | `<ListboxButton as={CustomButton}>` |

### 3.3 Slot Pattern with `data-slot`

Use `data-slot` attributes to style child components from a parent context.

```jsx
function Card({ children }) {
  return <div className="rounded-lg bg-white shadow [&_[data-slot=header]]:border-b [&_[data-slot=header]]:px-6 [&_[data-slot=header]]:py-4 [&_[data-slot=body]]:px-6 [&_[data-slot=body]]:py-4">
    {children}
  </div>
}

function CardHeader({ children }) {
  return <div data-slot="header">{children}</div>
}
```

### 3.4 Group-Based Styling

Use the `group` class on a parent to style children based on parent state.

| Pattern | Parent | Child Selector |
|---|---|---|
| Hover propagation | `group` | `group-hover:text-indigo-600` |
| Open state | `group` on Disclosure | `group-data-[open]:rotate-180` |
| Focus within | `group` | `group-focus-within:ring-2` |
| Named groups | `group/item` | `group-hover/item:visible` |

### 3.5 ForwardRef for Reusable Components

Always use `forwardRef` when building reusable components that wrap native elements or HeadlessUI components. This ensures compatibility with HeadlessUI's internal ref management and allows parent components to access the DOM node.

```jsx
const Button = forwardRef(function Button({ className, variant = 'primary', ...props }, ref) {
  return <button ref={ref} className={clsx(buttonVariants[variant], className)} {...props} />
})
```

## 4. className Helpers

### 4.1 Utility Comparison

| Tool | Install | Purpose | When to Use |
|---|---|---|---|
| `classNames` filter | None (inline) | Filter falsy values | Simple conditional: `[base, condition && 'extra'].filter(Boolean).join(' ')` |
| `clsx` | `npm i clsx` | Conditional class joining | Multiple conditions, cleaner syntax than filter pattern |
| `tailwind-merge` (`twMerge`) | `npm i tailwind-merge` | Resolve Tailwind conflicts | When user/prop classes must override base classes |
| `clsx` + `twMerge` | Both | Full solution | Reusable component libraries accepting className prop |

### 4.2 Combined Helper

```jsx
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs) {
  return twMerge(clsx(inputs))
}
```

### 4.3 Usage Rules

| Rule | Rationale |
|---|---|
| Use `clsx` for internal conditional classes | No conflict resolution needed within a single component |
| Use `cn` (clsx + twMerge) when accepting external `className` | External classes may conflict with base styles; merge resolves correctly |
| Never concatenate class strings with template literals | Error-prone with whitespace and conditional logic |
| Place `className` prop last in `cn()` call | Ensures prop classes override base classes after merge |

## 5. Transition and Animation

### 5.1 HeadlessUI Transition Data Attributes

HeadlessUI components support built-in transitions via data attributes. No `<Transition>` wrapper needed.

| Attribute | Phase | Use |
|---|---|---|
| `data-[enter]` | Mount animation classes | `data-[enter]:duration-300 data-[enter]:ease-out` |
| `data-[leave]` | Unmount animation classes | `data-[leave]:duration-200 data-[leave]:ease-in` |
| `data-[closed]` | Start/end state | `data-[closed]:opacity-0 data-[closed]:scale-95` |

### 5.2 Common Transition Recipes

| Effect | Classes |
|---|---|
| Fade | `transition-opacity duration-200 data-[closed]:opacity-0` |
| Fade + scale | `transition duration-200 ease-out data-[closed]:scale-95 data-[closed]:opacity-0` |
| Slide down | `transition duration-200 ease-out data-[closed]:-translate-y-1 data-[closed]:opacity-0` |
| Slide from right | `transition duration-300 ease-in-out data-[closed]:translate-x-full` |
| Backdrop fade | `transition-opacity duration-300 ease-out data-[closed]:opacity-0` |

### 5.3 Asymmetric Timing

Use different durations for enter and leave to make exits feel snappier.

```
className="transition data-[enter]:duration-300 data-[enter]:ease-out data-[leave]:duration-200 data-[leave]:ease-in data-[closed]:opacity-0"
```

### 5.4 Reduced Motion

| Utility | Effect |
|---|---|
| `motion-safe:transition-all` | Only animate if user has no preference for reduced motion |
| `motion-reduce:transition-none` | Remove transitions when reduced motion is preferred |
| `motion-safe:duration-300` | Apply duration only when motion is safe |

Always gate non-essential animations behind `motion-safe:` or disable with `motion-reduce:`.

## 6. Form Components

### 6.1 Input with Label and Help Text

```jsx
<div>
  <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">Email</label>
  <div className="mt-2">
    <input type="email" id="email" name="email" className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" />
  </div>
  <p className="mt-2 text-sm text-gray-500">We will never share your email.</p>
</div>
```

### 6.2 Fieldset with Legend

```jsx
<fieldset>
  <legend className="text-sm/6 font-semibold text-gray-900">Notifications</legend>
  <p className="mt-1 text-sm text-gray-500">How should we contact you?</p>
  <div className="mt-4 space-y-4">
    {/* Radio/checkbox items here */}
  </div>
</fieldset>
```

### 6.3 Checkbox with Grid Overlay

```jsx
<div className="relative flex items-start">
  <div className="flex h-6 items-center">
    <input id="terms" name="terms" type="checkbox" className="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
  </div>
  <div className="ml-3 text-sm/6">
    <label htmlFor="terms" className="font-medium text-gray-900">Accept terms</label>
    <p className="text-gray-500">You agree to our terms of service and privacy policy.</p>
  </div>
</div>
```

### 6.4 Validation States

| State | Input Outline | Text | Icon |
|---|---|---|---|
| Default | `outline-gray-300` | -- | -- |
| Focus | `focus:outline-indigo-600` | -- | -- |
| Error | `outline-red-500 focus:outline-red-600` | `text-red-600` | `text-red-500` (ExclamationCircleIcon) |
| Success | `outline-green-500 focus:outline-green-600` | `text-green-600` | `text-green-500` (CheckCircleIcon) |
| Disabled | `bg-gray-50 text-gray-500 outline-gray-200` | `text-gray-400` | -- |

Add `aria-invalid="true"` and `aria-describedby="field-error"` on error inputs. Place error message in an element with matching `id`.

## 7. Interactive Feedback

### 7.1 Toast / Notification

| Element | Classes |
|---|---|
| Container (fixed) | `pointer-events-none fixed inset-0 z-50 flex items-end px-4 py-6 sm:items-start sm:p-6` |
| Toast panel | `pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black/5` |
| Toast inner | `p-4 flex items-start` |
| Icon area | `shrink-0 text-green-400` (or red/yellow/blue per type) |
| Dismiss button | `ml-auto inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2` |

Use `aria-live="polite"` on the toast container for screen reader announcement.

### 7.2 Alert with Dismiss

```jsx
<div className="rounded-md bg-yellow-50 p-4">
  <div className="flex">
    <ExclamationTriangleIcon className="size-5 text-yellow-400" />
    <div className="ml-3">
      <h3 className="text-sm font-medium text-yellow-800">Attention needed</h3>
      <p className="mt-2 text-sm text-yellow-700">Your trial expires in 3 days.</p>
    </div>
    <div className="ml-auto pl-3">
      <button type="button" className="-m-1.5 inline-flex rounded-md p-1.5 text-yellow-500 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 focus:ring-offset-yellow-50">
        <span className="sr-only">Dismiss</span>
        <XMarkIcon className="size-5" />
      </button>
    </div>
  </div>
</div>
```

### 7.3 Empty State

| Element | Classes |
|---|---|
| Container | `text-center py-12` |
| Icon | `mx-auto size-12 text-gray-400` |
| Heading | `mt-2 text-sm font-semibold text-gray-900` |
| Description | `mt-1 text-sm text-gray-500` |
| Action button | `mt-6` + primary button classes |

### 7.4 Loading States

| Pattern | Implementation |
|---|---|
| Spinner | `animate-spin size-5 text-indigo-600` on SVG circle icon |
| Skeleton | `animate-pulse rounded-md bg-gray-200 h-4 w-3/4` |
| Button loading | Disable button, replace text with spinner + "Loading..." |
| Full page | Centered spinner with `aria-busy="true"` on container, `aria-live="polite"` region |

### 7.5 Progress

| Element | Classes |
|---|---|
| Track | `overflow-hidden rounded-full bg-gray-200 h-2` |
| Bar | `h-full rounded-full bg-indigo-600 transition-all duration-300` with `style={{ width: '60%' }}` |

Add `role="progressbar"` with `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"`, and `aria-label`.

## 8. Accessibility Per Component

### 8.1 ARIA Requirements

| Component | Required ARIA | Keyboard | Focus Management |
|---|---|---|---|
| Dialog/Modal | `aria-modal="true"`, `aria-labelledby` (title id) | Escape closes | Focus trap inside panel; restore focus to trigger on close |
| Menu | `aria-haspopup="menu"`, `aria-expanded` | Arrow keys navigate items, Enter/Space selects, Escape closes | Focus moves into menu on open, returns to button on close |
| Listbox/Select | `aria-haspopup="listbox"`, `aria-expanded`, `aria-activedescendant` | Arrow keys navigate, Enter selects, Escape closes | Virtual focus via `aria-activedescendant` |
| Combobox | `role="combobox"`, `aria-expanded`, `aria-activedescendant`, `aria-autocomplete` | Arrow keys navigate, Enter selects, Escape closes | Input retains focus; virtual focus on options |
| Tabs | `role="tablist"`, `aria-selected` on active tab, `aria-controls` | Arrow keys switch tabs (roving tabindex), Home/End | Selected tab receives focus |
| Switch/Toggle | `role="switch"`, `aria-checked` | Space toggles | Self-focused |
| Disclosure | `aria-expanded`, `aria-controls` | Enter/Space toggles | Button retains focus |
| Radio Group | `role="radiogroup"`, `aria-checked` on selected | Arrow keys move selection, Space selects | Roving tabindex within group |
| Popover | `aria-expanded`, `aria-haspopup` | Escape closes | Focus moves into panel; returns to button on close |
| Alert | `role="alert"` (assertive) or `role="status"` (polite) | None | No focus change; announced by screen reader |
| Toast | `aria-live="polite"` on container | Optional dismiss with Escape | No forced focus change |

### 8.2 Focus Visibility

Always ensure focus indicators are visible. Tailwind default: `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`. Never use `outline-none` without a replacement indicator like a ring: `focus-visible:ring-2 focus-visible:ring-indigo-600`.

### 8.3 Screen Reader Utilities

| Utility | Purpose |
|---|---|
| `sr-only` | Visually hidden, accessible to screen readers |
| `not-sr-only` | Undo `sr-only` (e.g., on focus for skip links) |
| `aria-hidden="true"` | Hide decorative icons from screen readers |
| `role="img"` + `aria-label` | Accessible SVG icons |

## 9. Common Mistakes

| Mistake | Problem | Fix |
|---|---|---|
| Using `onClick` on `<div>` | Not keyboard accessible, no button role | Use `<button>` element |
| Removing outlines globally | Breaks keyboard navigation visibility | Use `focus-visible:outline` or `focus-visible:ring` |
| Missing `htmlFor` on labels | Input not associated; screen readers skip it | Match `htmlFor` to input `id` |
| Hardcoded colors instead of semantic | Dark mode breaks, inconsistent theming | Use design token classes or consistent color scales |
| String concatenation for classes | Whitespace bugs, unreadable conditionals | Use `clsx` or `cn` helper |
| Missing transition on data-[closed] | Component disappears without animation | Add `transition` + `duration-*` + `data-[closed]:*` classes |
| No `aria-label` on icon buttons | Screen readers announce nothing | Add `aria-label` or `sr-only` text inside button |
| Using `<a>` without `href` for actions | Missing keyboard support and role | Use `<button>` for actions, `<a href>` for navigation |
| Forgetting `motion-reduce` | Animations cause discomfort for vestibular disorders | Gate animations behind `motion-safe:` |
| Nested interactive elements | Invalid HTML, unpredictable behavior | Flatten structure; one interactive element per click target |

## MCP Component Library

The `frontend-components` MCP server provides ready-made component examples:

- **HyperUI** (`hyperui`): 481 HTML/Tailwind components — badges, modals, tables, forms, dropdowns, tabs, and more
- **HeadlessUI React** (`headlessui-react`): 38 accessible component examples — Dialog, Menu, Listbox, Combobox, Switch, Tabs
- **HeadlessUI Vue** (`headlessui-vue`): 30 accessible Vue component examples
- **DaisyUI** (`daisyui`): 65 component class references — semantic classes like `btn`, `card`, `modal` with all modifiers
- **FlyonUI** (`flyonui`): 49 CSS components + 24 JS plugins for interactive components

**Quick lookup:** `search_components(query: "modal")` or `get_component(framework: "hyperui", category: "application", component_type: "modals", variant: "1")`
