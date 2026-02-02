# Status

Status is a really small icon to visually show the current status of an element, like online, offline, error, etc.

## Class Reference

| Class | Description | Category |
|-------|-------------|----------|
| `status` | Status icon | component |
| `status-neutral` | neutral color | color |
| `status-primary` | primary color | color |
| `status-secondary` | secondary color | color |
| `status-accent` | accent color | color |
| `status-info` | info color | color |
| `status-success` | success color | color |
| `status-warning` | warning color | color |
| `status-error` | error color | color |
| `status-xs` | extra small size | size |
| `status-sm` | small size | size |
| `status-md` | medium size | size |
| `status-lg` | large size | size |
| `status-xl` | extra large size | size |

## Examples

### Status
<span class="status"></span>

```html
<span class="status"></span>
```

### Status sizes
<div aria-label="status" class="status status-xs"></div>
<div aria-label="status" class="status status-sm"></div>
<div aria-label="status" class="status status-md"></div>
<div aria-label="status" class="status status-lg"></div>
<div aria-label="status" class="status status-xl"></div>

```html
<div aria-label="status" class="status status-xs"></div>
<div aria-label="status" class="status status-sm"></div>
<div aria-label="status" class="status status-md"></div>
<div aria-label="status" class="status status-lg"></div>
<div aria-label="status" class="status status-xl"></div>
```

### Status with colors
<div aria-label="status" class="status status-primary"></div>
<div aria-label="status" class="status status-secondary"></div>
<div aria-label="status" class="status status-accent"></div>
<div aria-label="status" class="status status-neutral"></div>

<div aria-label="info" class="status status-info"></div>
<div aria-label="success" class="status status-success"></div>
<div aria-label="warning" class="status status-warning"></div>
<div aria-label="error" class="status status-error"></div>

```html
<div aria-label="status" class="status status-primary"></div>
<div aria-label="status" class="status status-secondary"></div>
<div aria-label="status" class="status status-accent"></div>
<div aria-label="status" class="status status-neutral"></div>

<div aria-label="info" class="status status-info"></div>
<div aria-label="success" class="status status-success"></div>
<div aria-label="warning" class="status status-warning"></div>
<div aria-label="error" class="status status-error"></div>
```
### Status with ping animation

<div class="inline-grid *:[grid-area:1/1]">
  <div class="status status-error animate-ping"></div>
  <div class="status status-error"></div>
</div> Server is down

```html
<div class="inline-grid *:[grid-area:1/1]">
  <div class="status status-error animate-ping"></div>
  <div class="status status-error"></div>
</div> Server is down
```
### Status with bounce animation

<div class="status status-info animate-bounce"></div> Unread messages

```html
<div class="status status-info animate-bounce"></div> Unread messages
```
