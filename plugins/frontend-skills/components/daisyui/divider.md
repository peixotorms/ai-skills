# Divider

Divider will be used to separate content vertically or horizontally.

## Class Reference

| Class | Description | Category |
|-------|-------------|----------|
| `divider` | A divider line between two elements | component |
| `divider-neutral` | neutral color | color |
| `divider-primary` | primary color | color |
| `divider-secondary` | secondary color | color |
| `divider-accent` | accent color | color |
| `divider-success` | success color | color |
| `divider-warning` | warning color | color |
| `divider-info` | info color | color |
| `divider-error` | error color | color |
| `divider-vertical` | Divide vertical elements (on top of each other) | direction |
| `divider-horizontal` | Divide horizontal elements (next to each other) | direction |
| `divider-start` | Pushes the divider text to the start | placement |
| `divider-end` | Pushes the divider text to the end | placement |

## Examples

### Divider
<div class="flex flex-col w-full">
  <div class="grid h-20 card bg-base-300 rounded-box place-items-center">content</div>
  <div class="divider">OR</div>
  <div class="grid h-20 card bg-base-300 rounded-box place-items-center">content</div>
</div>

```html
<div class="flex w-full flex-col">
  <div class="card bg-base-300 rounded-box grid h-20 place-items-center">content</div>
  <div class="divider">OR</div>
  <div class="card bg-base-300 rounded-box grid h-20 place-items-center">content</div>
</div>
```


### Divider horizontal
<div class="flex w-full">
  <div class="grid h-20 grow card bg-base-300 rounded-box place-items-center">content</div>
  <div class="divider divider-horizontal">OR</div>
  <div class="grid h-20 grow card bg-base-300 rounded-box place-items-center">content</div>
</div>

```html
<div class="flex w-full">
  <div class="card bg-base-300 rounded-box grid h-20 grow place-items-center">content</div>
  <div class="divider divider-horizontal">OR</div>
  <div class="card bg-base-300 rounded-box grid h-20 grow place-items-center">content</div>
</div>
```


### Divider with no text
<div class="flex flex-col w-full">
  <div class="grid h-20 card bg-base-300 rounded-box place-items-center">content</div>
  <div class="divider"></div>
  <div class="grid h-20 card bg-base-300 rounded-box place-items-center">content</div>
</div>

```html
<div class="flex w-full flex-col">
  <div class="card bg-base-300 rounded-box grid h-20 place-items-center">content</div>
  <div class="divider"></div>
  <div class="card bg-base-300 rounded-box grid h-20 place-items-center">content</div>
</div>
```


### responsive (lg:divider-horizontal)
<div class="flex flex-col w-full lg:flex-row">
  <div class="grid grow h-32 card bg-base-300 rounded-box place-items-center">content</div>
  <div class="divider lg:divider-horizontal">OR</div>
  <div class="grid grow h-32 card bg-base-300 rounded-box place-items-center">content</div>
</div>

```html
<div class="flex w-full flex-col lg:flex-row">
  <div class="card bg-base-300 rounded-box grid h-32 grow place-items-center">content</div>
  <div class="divider lg:divider-horizontal">OR</div>
  <div class="card bg-base-300 rounded-box grid h-32 grow place-items-center">content</div>
</div>
```


### Divider with colors
<div class="flex flex-col w-full">
  <div class="divider">Default</div>
  <div class="divider divider-neutral">Neutral</div>
  <div class="divider divider-primary">Primary</div>
  <div class="divider divider-secondary">Secondary</div>
  <div class="divider divider-accent">Accent</div>
  <div class="divider divider-success">Success</div>
  <div class="divider divider-warning">Warning</div>
  <div class="divider divider-info">Info</div>
  <div class="divider divider-error">Error</div>
</div>

```html
<div class="flex w-full flex-col">
  <div class="divider">Default</div>
  <div class="divider divider-neutral">Neutral</div>
  <div class="divider divider-primary">Primary</div>
  <div class="divider divider-secondary">Secondary</div>
  <div class="divider divider-accent">Accent</div>
  <div class="divider divider-success">Success</div>
  <div class="divider divider-warning">Warning</div>
  <div class="divider divider-info">Info</div>
  <div class="divider divider-error">Error</div>
</div>
```


### Divider in different positions
<div class="flex flex-col w-full">
  <div class="divider divider-start">Start</div>
  <div class="divider">Default</div>
  <div class="divider divider-end">End</div>
</div>

```html
<div class="flex w-full flex-col">
  <div class="divider divider-start">Start</div>
  <div class="divider">Default</div>
  <div class="divider divider-end">End</div>
</div>
```


### Divider in different positions (horizontal)
<div class="flex w-full justify-center h-52">
  <div class="divider divider-horizontal divider-start">Start</div>
  <div class="divider divider-horizontal">Default</div>
  <div class="divider divider-horizontal divider-end">End</div>
</div>

```html
<div class="flex w-full">
  <div class="divider divider-horizontal divider-start">Start</div>
  <div class="divider divider-horizontal">Default</div>
  <div class="divider divider-horizontal divider-end">End</div>
</div>
```
