# Toast

Toast is a wrapper to stack elements, positioned on the corner of page.

## Class Reference

| Class | Description | Category |
|-------|-------------|----------|
| `toast` | Container element that sticks to the corner of page | component |
| `toast-start` | align horizontally to the left | placement |
| `toast-center` | align horizontally to the center | placement |
| `toast-end` | align horizontally to the right | placement |
| `toast-top` | align vertically to top | placement |
| `toast-middle` | align vertically to middle | placement |
| `toast-bottom` | align vertically to bottom | placement |

## Examples

### toast with alert inside
<div class="w-full h-64 relative">
  <div class="toast absolute">
    <div class="alert alert-info">
      <span>New message arrived.</span>
    </div>
  </div>
</div>

```html
<div class="toast">
  <div class="alert alert-info">
    <span>New message arrived.</span>
  </div>
</div>
```


### toast-top toast-start
<div class="w-full h-64 relative">
  <div class="toast toast-top toast-start absolute">
    <div class="alert alert-info">
      <span>New mail arrived.</span>
    </div>
    <div class="alert alert-success">
      <span>Message sent successfully.</span>
    </div>
  </div>
</div>

```html
<div class="toast toast-top toast-start">
  <div class="alert alert-info">
    <span>New mail arrived.</span>
  </div>
  <div class="alert alert-success">
    <span>Message sent successfully.</span>
  </div>
</div>
```


### toast-top toast-center
<div class="w-full h-64 relative">
  <div class="toast toast-top toast-center absolute">
    <div class="alert alert-info">
      <span>New mail arrived.</span>
    </div>
    <div class="alert alert-success">
      <span>Message sent successfully.</span>
    </div>
  </div>
</div>

```html
<div class="toast toast-top toast-center">
  <div class="alert alert-info">
    <span>New mail arrived.</span>
  </div>
  <div class="alert alert-success">
    <span>Message sent successfully.</span>
  </div>
</div>
```


### toast-top toast-end
<div class="w-full h-64 relative">
  <div class="toast toast-top toast-end absolute">
    <div class="alert alert-info">
      <span>New mail arrived.</span>
    </div>
    <div class="alert alert-success">
      <span>Message sent successfully.</span>
    </div>
  </div>
</div>

```html
<div class="toast toast-top toast-end">
  <div class="alert alert-info">
    <span>New mail arrived.</span>
  </div>
  <div class="alert alert-success">
    <span>Message sent successfully.</span>
  </div>
</div>
```


### toast-start toast-middle
<div class="w-full h-64 relative">
  <div class="toast toast-start toast-middle absolute">
    <div class="alert alert-info">
      <span>New mail arrived.</span>
    </div>
    <div class="alert alert-success">
      <span>Message sent successfully.</span>
    </div>
  </div>
</div>

```html
<div class="toast toast-start toast-middle">
  <div class="alert alert-info">
    <span>New mail arrived.</span>
  </div>
  <div class="alert alert-success">
    <span>Message sent successfully.</span>
  </div>
</div>
```


### toast-center toast-middle
<div class="w-full h-64 relative">
  <div class="toast toast-center toast-middle absolute">
    <div class="alert alert-info">
      <span>New mail arrived.</span>
    </div>
    <div class="alert alert-success">
      <span>Message sent successfully.</span>
    </div>
  </div>
</div>

```html
<div class="toast toast-center toast-middle">
  <div class="alert alert-info">
    <span>New mail arrived.</span>
  </div>
  <div class="alert alert-success">
    <span>Message sent successfully.</span>
  </div>
</div>
```


### toast-end toast-middle
<div class="w-full h-64 relative">
  <div class="toast toast-end toast-middle absolute">
    <div class="alert alert-info">
      <span>New mail arrived.</span>
    </div>
    <div class="alert alert-success">
      <span>Message sent successfully.</span>
    </div>
  </div>
</div>

```html
<div class="toast toast-end toast-middle">
  <div class="alert alert-info">
    <span>New mail arrived.</span>
  </div>
  <div class="alert alert-success">
    <span>Message sent successfully.</span>
  </div>
</div>
```


### toast-start toast-bottom (default)
<div class="w-full h-64 relative">
  <div class="toast toast-start absolute">
    <div class="alert alert-info">
      <span>New mail arrived.</span>
    </div>
    <div class="alert alert-success">
      <span>Message sent successfully.</span>
    </div>
  </div>
</div>

```html
<div class="toast toast-start">
  <div class="alert alert-info">
    <span>New mail arrived.</span>
  </div>
  <div class="alert alert-success">
    <span>Message sent successfully.</span>
  </div>
</div>
```


### toast-center toast-bottom (default)
<div class="w-full h-64 relative">
  <div class="toast toast-center absolute">
    <div class="alert alert-info">
      <span>New mail arrived.</span>
    </div>
    <div class="alert alert-success">
      <span>Message sent successfully.</span>
    </div>
  </div>
</div>

```html
<div class="toast toast-center">
  <div class="alert alert-info">
    <span>New mail arrived.</span>
  </div>
  <div class="alert alert-success">
    <span>Message sent successfully.</span>
  </div>
</div>
```


### toast-end (default) toast-bottom (default)
<div class="w-full h-64 relative">
  <div class="toast toast-end absolute">
    <div class="alert alert-info">
      <span>New mail arrived.</span>
    </div>
    <div class="alert alert-success">
      <span>Message sent successfully.</span>
    </div>
  </div>
</div>

```html
<div class="toast toast-end">
  <div class="alert alert-info">
    <span>New mail arrived.</span>
  </div>
  <div class="alert alert-success">
    <span>Message sent successfully.</span>
  </div>
</div>
```
