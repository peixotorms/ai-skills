# Tooltip

Tooltip can be used to show a message when hovering over an element.

## Class Reference

| Class | Description | Category |
|-------|-------------|----------|
| `tooltip` | Container element | component |
| `tooltip-content` | Optional. Setting a div as the content of the tooltip instead of the `data-tip` text | part |
| `tooltip-top` | Put tooltip on top | placement |
| `tooltip-bottom` | Put tooltip on bottom | placement |
| `tooltip-left` | Put tooltip on left | placement |
| `tooltip-right` | Put tooltip on right | placement |
| `tooltip-open` | Force open tooltip | modifier |
| `tooltip-neutral` | neutral color | color |
| `tooltip-primary` | primary color | color |
| `tooltip-secondary` | secondary color | color |
| `tooltip-accent` | accent color | color |
| `tooltip-info` | info color | color |
| `tooltip-success` | success color | color |
| `tooltip-warning` | warning color | color |
| `tooltip-error` | error color | color |

## Examples

### Tooltip
<div class="my-6">
  <div class="tooltip" data-tip="hello">
    <button class="btn">Hover me</button>
  </div>
</div>

```html
<div class="tooltip" data-tip="hello">
  <button class="btn">Hover me</button>
</div>
```

### Tooltip with tooltip-content
<div class="my-6 mt-12">
  <div class="tooltip">
    <div class="tooltip-content">
      <div class="animate-bounce text-orange-400 -rotate-10 text-2xl font-black">Wow!</div>
    </div>
    <button class="btn">Hover me</button>
  </div>
</div>

```html
<div class="tooltip">
  <div class="tooltip-content">
    <div class="animate-bounce text-orange-400 -rotate-10 text-2xl font-black">Wow!</div>
  </div>
  <button class="btn">Hover me</button>
</div>
```


### Force open
<div class="my-6">
  <div class="tooltip tooltip-open" data-tip="hello">
    <button class="btn">Force open</button>
  </div>
</div>

```html
<div class="tooltip tooltip-open" data-tip="hello">
  <button class="btn">Force open</button>
</div>
```


### Top
<div class="my-6">
  <div class="tooltip tooltip-open tooltip-top" data-tip="hello">
    <button class="btn">Top</button>
  </div>
</div>

```html
<div class="tooltip tooltip-open tooltip-top" data-tip="hello">
  <button class="btn">Top</button>
</div>
```


### Bottom
<div class="my-6">
  <div class="tooltip tooltip-open tooltip-bottom" data-tip="hello">
    <button class="btn">Bottom</button>
  </div>
</div>

```html
<div class="tooltip tooltip-open tooltip-bottom" data-tip="hello">
  <button class="btn">Bottom</button>
</div>
```


### Left
<div class="my-6">
  <div class="tooltip tooltip-open tooltip-left" data-tip="hello">
    <button class="btn">Left</button>
  </div>
</div>

```html
<div class="tooltip tooltip-open tooltip-left" data-tip="hello">
  <button class="btn">Left</button>
</div>
```


### Right
<div class="my-6">
  <div class="tooltip tooltip-open tooltip-right" data-tip="hello">
    <button class="btn">Right</button>
  </div>
</div>

```html
<div class="tooltip tooltip-open tooltip-right" data-tip="hello">
  <button class="btn">Right</button>
</div>
```


### Neutral color
<div class="my-6">
  <div data-tip="neutral" class="tooltip tooltip-open tooltip-neutral">
    <button class="btn btn-neutral">neutral</button>
  </div>
</div>

```html
<div class="tooltip tooltip-open tooltip-neutral" data-tip="neutral">
  <button class="btn btn-neutral">neutral</button>
</div>
```


### Primary color
<div class="my-6">
  <div data-tip="primary" class="tooltip tooltip-open tooltip-primary">
    <button class="btn btn-primary">primary</button>
  </div>
</div>

```html
<div class="tooltip tooltip-open tooltip-primary" data-tip="primary">
  <button class="btn btn-primary">primary</button>
</div>
```


### Secondary color
<div class="my-6">
  <div data-tip="secondary" class="tooltip tooltip-open tooltip-secondary">
    <button class="btn btn-secondary">secondary</button>
  </div>
</div>

```html
<div class="tooltip tooltip-open tooltip-secondary" data-tip="secondary">
  <button class="btn btn-secondary">secondary</button>
</div>
```


### Accent color
<div class="my-6">
  <div data-tip="accent" class="tooltip tooltip-open tooltip-accent">
    <button class="btn btn-accent">accent</button>
  </div>
</div>

```html
<div class="tooltip tooltip-open tooltip-accent" data-tip="accent">
  <button class="btn btn-accent">accent</button>
</div>
```


### Info color
<div class="my-6">
  <div data-tip="info" class="tooltip tooltip-open tooltip-info">
    <button class="btn btn-info">info</button>
  </div>
</div>

```html
<div class="tooltip tooltip-open tooltip-info" data-tip="info">
  <button class="btn btn-info">info</button>
</div>
```


### Success color
<div class="my-6">
  <div data-tip="success" class="tooltip tooltip-open tooltip-success">
    <button class="btn btn-success">success</button>
  </div>
</div>

```html
<div class="tooltip tooltip-open tooltip-success" data-tip="success">
  <button class="btn btn-success">success</button>
</div>
```


### Warning color
<div class="my-6">
  <div data-tip="warning" class="tooltip tooltip-open tooltip-warning">
    <button class="btn btn-warning">warning</button>
  </div>
</div>

```html
<div class="tooltip tooltip-open tooltip-warning" data-tip="warning">
  <button class="btn btn-warning">warning</button>
</div>
```


### Error color
<div class="my-6">
  <div data-tip="error" class="tooltip tooltip-open tooltip-error">
    <button class="btn btn-error">error</button>
  </div>
</div>

```html
<div class="tooltip tooltip-open tooltip-error" data-tip="error">
  <button class="btn btn-error">error</button>
</div>
```


### Responsive tooltip. only show for large screen
<div class="my-6">
  <div class="lg:tooltip" data-tip="hello">
    <button class="btn">Hover me</button>
  </div>
</div>

```html
<div class="lg:tooltip" data-tip="hello">
  <button class="btn">Hover me</button>
</div>
```
