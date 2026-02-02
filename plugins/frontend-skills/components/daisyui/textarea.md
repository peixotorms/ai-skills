# Textarea

Textarea allows users to enter text in multiple lines.

## Class Reference

| Class | Description | Category |
|-------|-------------|----------|
| `textarea` | For <textarea> element | component |
| `textarea-ghost` | ghost style | style |
| `textarea-neutral` | neutral color | color |
| `textarea-primary` | primary color | color |
| `textarea-secondary` | secondary color | color |
| `textarea-accent` | accent color | color |
| `textarea-info` | info color | color |
| `textarea-success` | success color | color |
| `textarea-warning` | warning color | color |
| `textarea-error` | error color | color |
| `textarea-xs` | Extra small size | size |
| `textarea-sm` | Small size | size |
| `textarea-md` | Medium size | size |
| `textarea-lg` | Large size | size |
| `textarea-xl` | Extra large size | size |

## Examples

### Textarea

<textarea class="textarea" placeholder="Bio"></textarea>

```html
<textarea class="textarea" placeholder="Bio"></textarea>
```

### Ghost (no background)

<textarea class="textarea textarea-ghost" placeholder="Bio"></textarea>

```html
<textarea class="textarea textarea-ghost" placeholder="Bio"></textarea>
```

### With form control and labels

<fieldset class="fieldset w-xs">
  <legend class="fieldset-legend">Your bio</legend>
  <textarea class="textarea h-24" placeholder="Bio"></textarea>
  <div class="label">Optional</div>
</fieldset>

```html
<fieldset class="fieldset">
  <legend class="fieldset-legend">Your bio</legend>
  <textarea class="textarea h-24" placeholder="Bio"></textarea>
  <div class="label">Optional</div>
</fieldset>
```

### Textarea colors

<div class="grid gap-4 w-xs">
  <textarea placeholder="Primary" class="textarea textarea-primary"></textarea>
  <textarea placeholder="Secondary" class="textarea textarea-secondary"></textarea>
  <textarea placeholder="Accent" class="textarea textarea-accent"></textarea>
  <textarea placeholder="Neutral" class="textarea textarea-neutral"></textarea>
  <textarea placeholder="Info" class="textarea textarea-info"></textarea>
  <textarea placeholder="Success" class="textarea textarea-success"></textarea>
  <textarea placeholder="Warning" class="textarea textarea-warning"></textarea>
  <textarea placeholder="Error" class="textarea textarea-error"></textarea>
</div>

```html
<textarea placeholder="Primary" class="textarea textarea-primary"></textarea>
<textarea placeholder="Secondary" class="textarea textarea-secondary"></textarea>
<textarea placeholder="Accent" class="textarea textarea-accent"></textarea>
<textarea placeholder="Neutral" class="textarea textarea-neutral"></textarea>
<textarea placeholder="Info" class="textarea textarea-info"></textarea>
<textarea placeholder="Success" class="textarea textarea-success"></textarea>
<textarea placeholder="Warning" class="textarea textarea-warning"></textarea>
<textarea placeholder="Error" class="textarea textarea-error"></textarea>
```

### Sizes

<div class="flex flex-col gap-4 w-full items-center">
  <textarea placeholder="Xsmall" class="textarea textarea-xs"></textarea>
  <textarea placeholder="Small" class="textarea textarea-sm"></textarea>
  <textarea placeholder="Medium" class="textarea textarea-md"></textarea>
  <textarea placeholder="Large" class="textarea textarea-lg"></textarea>
  <textarea placeholder="Xlarge" class="textarea textarea-xl"></textarea>
</div>

```html
<textarea placeholder="Bio" class="textarea textarea-xs"></textarea>

<textarea placeholder="Bio" class="textarea textarea-sm"></textarea>

<textarea placeholder="Bio" class="textarea textarea-md"></textarea>

<textarea placeholder="Bio" class="textarea textarea-lg"></textarea>

<textarea placeholder="Bio" class="textarea textarea-xl"></textarea>
```

### Disabled

<textarea class="textarea" placeholder="Bio" disabled></textarea>

```html
<textarea class="textarea" placeholder="Bio" disabled></textarea>
```
