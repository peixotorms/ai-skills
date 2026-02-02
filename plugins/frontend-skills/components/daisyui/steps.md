# Steps

Steps can be used to show a list of steps in a process.

## Class Reference

| Class | Description | Category |
|-------|-------------|----------|
| `steps` | Container of multiple step nodes | component |
| `step` | A single step node | part |
| `step-icon` | For custom icon inside step | part |
| `step-neutral` | neutral color | color |
| `step-primary` | primary color | color |
| `step-secondary` | secondary color | color |
| `step-accent` | accent color | color |
| `step-info` | info color | color |
| `step-success` | success color | color |
| `step-warning` | warning color | color |
| `step-error` | error color | color |
| `steps-vertical` | Makes steps vertical (default) | direction |
| `steps-horizontal` | Makes steps horizontal | direction |

## Examples

### Horizontal
<ul class="steps">
  <li class="step step-primary">Register</li>
  <li class="step step-primary">Choose plan</li>
  <li class="step">Purchase</li>
  <li class="step">Receive Product</li>
</ul>

```html
<ul class="steps">
  <li class="step step-primary">Register</li>
  <li class="step step-primary">Choose plan</li>
  <li class="step">Purchase</li>
  <li class="step">Receive Product</li>
</ul>
```


### Vertical
<ul class="steps steps-vertical">
  <li class="step step-primary">Register</li>
  <li class="step step-primary">Choose plan</li>
  <li class="step">Purchase</li>
  <li class="step">Receive Product</li>
</ul>

```html
<ul class="steps steps-vertical">
  <li class="step step-primary">Register</li>
  <li class="step step-primary">Choose plan</li>
  <li class="step">Purchase</li>
  <li class="step">Receive Product</li>
</ul>
```


### responsive (vertical on small screen, horizontal on large screen)
<ul class="steps steps-vertical lg:steps-horizontal">
  <li class="step step-primary">Register</li>
  <li class="step step-primary">Choose plan</li>
  <li class="step">Purchase</li>
  <li class="step">Receive Product</li>
</ul>

```html
<ul class="steps steps-vertical lg:steps-horizontal">
  <li class="step step-primary">Register</li>
  <li class="step step-primary">Choose plan</li>
  <li class="step">Purchase</li>
  <li class="step">Receive Product</li>
</ul>
```

### With custom content in step-icon
<ul class="steps">
  <li class="step step-neutral">
    <span class="step-icon">😕</span>Step 1
  </li>
  <li class="step step-neutral">
    <span class="step-icon">😃</span>Step 2
  </li>
  <li class="step">
    <span class="step-icon">😍</span>Step 3
  </li>
</ul>

```html
<ul class="steps">
  <li class="step step-neutral">
    <span class="step-icon">😕</span>Step 1
  </li>
  <li class="step step-neutral">
    <span class="step-icon">😃</span>Step 2
  </li>
  <li class="step">
    <span class="step-icon">😍</span>Step 3
  </li>
</ul>
```

### With data-content
<ul class="steps">
  <li data-content="?" class="step step-neutral">Step 1</li>
  <li data-content="!" class="step step-neutral">Step 2</li>
  <li data-content="✓" class="step step-neutral">Step 3</li>
  <li data-content="✕" class="step step-neutral">Step 4</li>
  <li data-content="★" class="step step-neutral">Step 5</li>
  <li data-content="" class="step step-neutral">Step 6</li>
  <li data-content="●" class="step step-neutral">Step 7</li>
</ul>

```html
<ul class="steps">
  <li data-content="?" class="step step-neutral">Step 1</li>
  <li data-content="!" class="step step-neutral">Step 2</li>
  <li data-content="✓" class="step step-neutral">Step 3</li>
  <li data-content="✕" class="step step-neutral">Step 4</li>
  <li data-content="★" class="step step-neutral">Step 5</li>
  <li data-content="" class="step step-neutral">Step 6</li>
  <li data-content="●" class="step step-neutral">Step 7</li>
</ul>
```


### Custom colors
<ul class="steps">
  <li class="step step-info">Fly to moon</li>
  <li class="step step-info">Shrink the moon</li>
  <li class="step step-info">Grab the moon</li>
  <li data-content="?" class="step step-error">Sit on toilet</li>
</ul>

```html
<ul class="steps">
  <li class="step step-info">Fly to moon</li>
  <li class="step step-info">Shrink the moon</li>
  <li class="step step-info">Grab the moon</li>
  <li class="step step-error" data-content="?">Sit on toilet</li>
</ul>
```


### With scrollable wrapper
<div class="overflow-x-auto">
  <ul class="steps">
    <li class="step">start</li>
    <li class="step step-secondary">2</li>
    <li class="step step-secondary">3</li>
    <li class="step step-secondary">4</li>
    <li class="step">5</li>
    <li class="step step-accent">6</li>
    <li class="step step-accent">7</li>
    <li class="step">8</li>
    <li class="step step-error">9</li>
    <li class="step step-error">10</li>
    <li class="step">11</li>
    <li class="step">12</li>
    <li class="step step-warning">13</li>
    <li class="step step-warning">14</li>
    <li class="step">15</li>
    <li class="step step-neutral">16</li>
    <li class="step step-neutral">17</li>
    <li class="step step-neutral">18</li>
    <li class="step step-neutral">19</li>
    <li class="step step-neutral">20</li>
    <li class="step step-neutral">21</li>
    <li class="step step-neutral">22</li>
    <li class="step step-neutral">23</li>
    <li class="step step-neutral">end</li>
  </ul>
</div>

```html
<div class="overflow-x-auto">
  <ul class="steps">
    <li class="step">start</li>
    <li class="step step-secondary">2</li>
    <li class="step step-secondary">3</li>
    <li class="step step-secondary">4</li>
    <li class="step">5</li>
    <li class="step step-accent">6</li>
    <li class="step step-accent">7</li>
    <li class="step">8</li>
    <li class="step step-error">9</li>
    <li class="step step-error">10</li>
    <li class="step">11</li>
    <li class="step">12</li>
    <li class="step step-warning">13</li>
    <li class="step step-warning">14</li>
    <li class="step">15</li>
    <li class="step step-neutral">16</li>
    <li class="step step-neutral">17</li>
    <li class="step step-neutral">18</li>
    <li class="step step-neutral">19</li>
    <li class="step step-neutral">20</li>
    <li class="step step-neutral">21</li>
    <li class="step step-neutral">22</li>
    <li class="step step-neutral">23</li>
    <li class="step step-neutral">end</li>
  </ul>
</div>
```
