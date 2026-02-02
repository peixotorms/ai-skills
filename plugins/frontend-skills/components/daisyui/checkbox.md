# Checkbox

Checkboxes are used to select or deselect a value.

## Class Reference

| Class | Description | Category |
|-------|-------------|----------|
| `checkbox` | Checkbox | component |
| `checkbox-primary` | primary color | color |
| `checkbox-secondary` | secondary color | color |
| `checkbox-accent` | accent color | color |
| `checkbox-neutral` | neutral color | color |
| `checkbox-success` | success color | color |
| `checkbox-warning` | warning color | color |
| `checkbox-info` | info color | color |
| `checkbox-error` | error color | color |
| `checkbox-xs` | Extra small size | size |
| `checkbox-sm` | Small size | size |
| `checkbox-md` | Medium size | size |
| `checkbox-lg` | Large size | size |
| `checkbox-xl` | Extra large size | size |

## Examples

### Checkbox

<input type="checkbox" checked="checked" class="checkbox" />

```html
<input type="checkbox" checked="checked" class="checkbox" />
```

### With fieldset and label

<fieldset class="fieldset p-4 bg-base-100 border border-base-300 rounded-box w-64">
  <legend class="fieldset-legend">Login options</legend>
  <label class="label">
    <input type="checkbox" checked="checked" class="checkbox" />
    Remember me
  </label>
</fieldset>

```html
<fieldset class="fieldset bg-base-100 border-base-300 rounded-box w-64 border p-4">
  <legend class="fieldset-legend">Login options</legend>
  <label class="label">
    <input type="checkbox" checked="checked" class="checkbox" />
    Remember me
  </label>
</fieldset>
```

### Sizes

<input type="checkbox" checked="checked" class="checkbox checkbox-xs" />
<input type="checkbox" checked="checked" class="checkbox checkbox-sm" />
<input type="checkbox" checked="checked" class="checkbox checkbox-md" />
<input type="checkbox" checked="checked" class="checkbox checkbox-lg" />
<input type="checkbox" checked="checked" class="checkbox checkbox-xl" />

```html
<input type="checkbox" checked="checked" class="checkbox checkbox-xs" />
<input type="checkbox" checked="checked" class="checkbox checkbox-sm" />
<input type="checkbox" checked="checked" class="checkbox checkbox-md" />
<input type="checkbox" checked="checked" class="checkbox checkbox-lg" />
<input type="checkbox" checked="checked" class="checkbox checkbox-xl" />
```

### Colors

<input type="checkbox" checked="checked" class="checkbox checkbox-primary" />
<input type="checkbox" checked="checked" class="checkbox checkbox-secondary" />
<input type="checkbox" checked="checked" class="checkbox checkbox-accent" />
<input type="checkbox" checked="checked" class="checkbox checkbox-neutral" />
<input type="checkbox" checked="checked" class="checkbox checkbox-info" />
<input type="checkbox" checked="checked" class="checkbox checkbox-success" />
<input type="checkbox" checked="checked" class="checkbox checkbox-warning" />
<input type="checkbox" checked="checked" class="checkbox checkbox-error" />

```html
<input type="checkbox" checked="checked" class="checkbox checkbox-primary" />
<input type="checkbox" checked="checked" class="checkbox checkbox-secondary" />
<input type="checkbox" checked="checked" class="checkbox checkbox-accent" />
<input type="checkbox" checked="checked" class="checkbox checkbox-neutral" />

<input type="checkbox" checked="checked" class="checkbox checkbox-info" />
<input type="checkbox" checked="checked" class="checkbox checkbox-success" />
<input type="checkbox" checked="checked" class="checkbox checkbox-warning" />
<input type="checkbox" checked="checked" class="checkbox checkbox-error" />
```

### Disabled

<input type="checkbox" disabled="disabled" class="checkbox" />
<input type="checkbox" disabled="disabled" class="checkbox" checked="checked" />

```html
<input type="checkbox" class="checkbox" disabled />
<input type="checkbox" class="checkbox" disabled checked="checked" />
```

### Indeterminate

<input type="checkbox" class="checkbox" bind:indeterminate onclick={(e)=>{e.preventDefault()}} />

```html
<!-- You can make a checkbox indeterminate using JS -->

<input type="checkbox" class="checkbox" id="my-checkbox" />
```

### Checkbox with custom colors

<input type="checkbox" checked="checked" class="checkbox border-indigo-600 bg-indigo-500 checked:bg-orange-400 checked:text-orange-800 checked:border-orange-500 " />

```html
<input
  type="checkbox"
  checked="checked"
  class="checkbox border-indigo-600 bg-indigo-500 checked:border-orange-500 checked:bg-orange-400 checked:text-orange-800"
/>
```
