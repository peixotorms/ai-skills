# File Input

File Input is a an input field for uploading files.

## Class Reference

| Class | Description | Category |
|-------|-------------|----------|
| `file-input` | For <input type="file"> element | component |
| `file-input-ghost` | ghost style | style |
| `file-input-neutral` | neutral color | color |
| `file-input-primary` | primary color | color |
| `file-input-secondary` | secondary color | color |
| `file-input-accent` | accent color | color |
| `file-input-info` | info color | color |
| `file-input-success` | success color | color |
| `file-input-warning` | warning color | color |
| `file-input-error` | error color | color |
| `file-input-xs` | Extra small size | size |
| `file-input-sm` | Small size | size |
| `file-input-md` | Medium size | size |
| `file-input-lg` | Large size | size |
| `file-input-xl` | Extra large size | size |

## Examples

### File input

<input type="file" class="file-input" />

```html
<input type="file" class="file-input" />
```

### File input ghost

<input type="file" class="file-input file-input-ghost" />

```html
<input type="file" class="file-input file-input-ghost" />
```

### With fieldset and label

<fieldset class="fieldset">
  <legend class="fieldset-legend">Pick a file</legend>
  <input type="file" class="file-input" />
  <label class="label">Max size 2MB</label>
</fieldset>

```html
<fieldset class="fieldset">
  <legend class="fieldset-legend">Pick a file</legend>
  <input type="file" class="file-input" />
  <label class="label">Max size 2MB</label>
</fieldset>
```

### Sizes

<div class="flex flex-col gap-4 w-full items-center">
  <input type="file" class="file-input file-input-xs" />
  <input type="file" class="file-input file-input-sm" />
  <input type="file" class="file-input file-input-md" />
  <input type="file" class="file-input file-input-lg" />
  <input type="file" class="file-input file-input-xl" />
</div>

```html
<input type="file" class="file-input file-input-xs" />

<input type="file" class="file-input file-input-sm" />

<input type="file" class="file-input file-input-md" />

<input type="file" class="file-input file-input-lg" />

<input type="file" class="file-input file-input-xl" />
```

### Primary color

<div class="grid gap-2">
  <input type="file" class="file-input file-input-primary" />
  <input type="file" class="file-input file-input-secondary" />
  <input type="file" class="file-input file-input-accent" />
  <input type="file" class="file-input file-input-neutral" />
  <input type="file" class="file-input file-input-info" />
  <input type="file" class="file-input file-input-success" />
  <input type="file" class="file-input file-input-warning" />
  <input type="file" class="file-input file-input-error" />
</div>

```html
<input type="file" class="file-input file-input-primary" />
<input type="file" class="file-input file-input-secondary" />
<input type="file" class="file-input file-input-accent" />
<input type="file" class="file-input file-input-neutral" />
<input type="file" class="file-input file-input-info" />
<input type="file" class="file-input file-input-success" />
<input type="file" class="file-input file-input-warning" />
<input type="file" class="file-input file-input-error" />
```

### Disabled

<input type="file" placeholder="You can't touch this" class="file-input" disabled />

```html
<input type="file" placeholder="You can't touch this" class="file-input" disabled />
```
