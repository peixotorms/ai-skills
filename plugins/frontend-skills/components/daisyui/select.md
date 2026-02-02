# Select

Select is used to pick a value from a list of options.

## Class Reference

| Class | Description | Category |
|-------|-------------|----------|
| `select` | For <select> element | component |
| `select-ghost` | ghost style | style |
| `select-neutral` | neutral color | color |
| `select-primary` | primary color | color |
| `select-secondary` | secondary color | color |
| `select-accent` | accent color | color |
| `select-info` | info color | color |
| `select-success` | success color | color |
| `select-warning` | warning color | color |
| `select-error` | error color | color |
| `select-xs` | Extra small size | size |
| `select-sm` | Small size | size |
| `select-md` | Medium size | size |
| `select-lg` | Large size | size |
| `select-xl` | Extra large size | size |

## Examples

### Select

<select class="select">
  <option disabled selected>Pick a color</option>
  <option>Crimson</option>
  <option>Amber</option>
  <option>Velvet</option>
</select>

```html
<select class="select">
  <option disabled selected>Pick a color</option>
  <option>Crimson</option>
  <option>Amber</option>
  <option>Velvet</option>
</select>
```

```jsx
<select defaultValue="Pick a color" className="select">
  <option disabled={true}>Pick a color</option>
  <option>Crimson</option>
  <option>Amber</option>
  <option>Velvet</option>
</select>
```

### Ghost (no background)

<select class="select select-ghost">
  <option disabled selected>Pick a font</option>
  <option>Inter</option>
  <option>Poppins</option>
  <option>Raleway</option>
</select>

```html
<select class="select select-ghost">
  <option disabled selected>Pick a font</option>
  <option>Inter</option>
  <option>Poppins</option>
  <option>Raleway</option>
</select>
```

```jsx
<select defaultValue="Pick a font" class="select select-ghost">
  <option disabled={true}>Pick a font</option>
  <option>Inter</option>
  <option>Poppins</option>
  <option>Raleway</option>
</select>
```

### With fieldset and labels

<fieldset class="fieldset w-xs">
  <legend class="fieldset-legend">Browsers</legend>
  <select class="select">
    <option disabled selected>Pick a Browser</option>
    <option>Chrome</option>
    <option>FireFox</option>
    <option>Safari</option>
  </select>
  <span class="label">Optional</span>
</fieldset>

```html
<fieldset class="fieldset">
  <legend class="fieldset-legend">Browsers</legend>
  <select class="select">
    <option disabled selected>Pick a browser</option>
    <option>Chrome</option>
    <option>FireFox</option>
    <option>Safari</option>
  </select>
  <span class="label">Optional</span>
</fieldset>
```

```jsx
<fieldset class="fieldset">
  <legend class="fieldset-legend">Browsers</legend>
  <select defaultValue="Pick a browser" class="select">
    <option disabled={true}>Pick a browser</option>
    <option>Chrome</option>
    <option>FireFox</option>
    <option>Safari</option>
  </select>
  <span class="label">Optional</span>
</fieldset>
```

### Primary color

<select class="select select-primary">
  <option disabled selected>Pick a text editor</option>
  <option>VScode</option>
  <option>VScode fork</option>
  <option>Another VScode fork</option>
</select>

```html
<select class="select select-primary">
  <option disabled selected>Pick a text editor</option>
  <option>VScode</option>
  <option>VScode fork</option>
  <option>Another VScode fork</option>
</select>
```

```jsx
<select defaultValue="Pick a text editor" class="select select-primary">
  <option disabled={true}>Pick a text editor</option>
  <option>VScode</option>
  <option>VScode fork</option>
  <option>Another VScode fork</option>
</select>
```

### Secondary color

<select class="select select-secondary">
  <option disabled selected>Pick a language</option>
  <option>Zig</option>
  <option>Go</option>
  <option>Rust</option>
</select>

```html
<select class="select select-secondary">
  <option disabled selected>Pick a language</option>
  <option>Zig</option>
  <option>Go</option>
  <option>Rust</option>
</select>
```

```jsx
<select defaultValue="Pick a language" class="select select-secondary">
  <option disabled={true}>Pick a language</option>
  <option>Zig</option>
  <option>Go</option>
  <option>Rust</option>
</select>
```

### Accent color

<select class="select select-accent">
  <option selected disabled>Color scheme</option>
  <option>Light mode</option>
  <option>Dark mode</option>
  <option>System</option>
</select>

```html
<select class="select select-accent">
  <option selected disabled>Color scheme</option>
  <option>Light mode</option>
  <option>Dark mode</option>
  <option>System</option>
</select>
```

```jsx
<select defaultValue="Color scheme" class="select select-accent">
  <option disabled={true}>Color scheme</option>
  <option>Light mode</option>
  <option>Dark mode</option>
  <option>System</option>
</select>
```

### Neutral color

<select class="select select-neutral">
  <option disabled selected>Server location</option>
  <option>North America</option>
  <option>EU west</option>
  <option>South East Asia</option>
</select>

```html
<select class="select select-neutral">
  <option disabled selected>Server location</option>
  <option>North America</option>
  <option>EU west</option>
  <option>South East Asia</option>
</select>
```

```jsx
<select defaultValue="Server location" class="select select-neutral">
  <option disabled={true}>Server location</option>
  <option>North America</option>
  <option>EU west</option>
  <option>South East Asia</option>
</select>
```

### Info color

<select class="select select-info">
  <option disabled selected>Pick a Framework</option>
  <option>React</option>
  <option>Vue</option>
  <option>Angular</option>
</select>

```html
<select class="select select-info">
  <option disabled selected>Pick a Framework</option>
  <option>React</option>
  <option>Vue</option>
  <option>Angular</option>
</select>
```

```jsx
<select defaultValue="Pick a Framework" className="select select-info">
  <option disabled={true}>Pick a Framework</option>
  <option>React</option>
  <option>Vue</option>
  <option>Angular</option>
</select>
```

### Success color

<select class="select select-success">
  <option disabled selected>Pick a Runtime</option>
  <option>npm</option>
  <option>Bun</option>
  <option>yarn</option>
</select>

```html
<select class="select select-success">
  <option disabled selected>Pick a Runtime</option>
  <option>npm</option>
  <option>Bun</option>
  <option>yarn</option>
</select>
```

```jsx
<select defaultValue="Pick a Runtime" className="select select-success">
  <option disabled={true}>Pick a Runtime</option>
  <option>npm</option>
  <option>Bun</option>
  <option>yarn</option>
</select>
```

### Warning color

<select class="select select-warning">
  <option disabled selected>Pick an OS</option>
  <option>Windows</option>
  <option>MacOS</option>
  <option>Linux</option>
</select>

```html
<select class="select select-warning">
  <option disabled selected>Pick an OS</option>
  <option>Windows</option>
  <option>MacOS</option>
  <option>Linux</option>
</select>
```

```jsx
<select defaultValue="Pick an OS" className="select select-warning">
  <option disabled={true}>Pick an OS</option>
  <option>Windows</option>
  <option>MacOS</option>
  <option>Linux</option>
</select>
```

### Error color

<select class="select select-error">
  <option disabled selected>Pick an AI Model</option>
  <option>GPT-4</option>
  <option>Claude</option>
  <option>Llama</option>
</select>

```html
<select class="select select-error">
  <option disabled selected>Pick an AI Model</option>
  <option>GPT-4</option>
  <option>Claude</option>
  <option>Llama</option>
</select>
```

```jsx
<select defaultValue="Pick an AI Model" className="select select-error">
  <option disabled={true}>Pick an AI Model</option>
  <option>GPT-4</option>
  <option>Claude</option>
  <option>Llama</option>
</select>
```

### Sizes

<div class="flex flex-col gap-4 w-full items-center">
  <select class="select select-xs">
    <option disabled selected>Xsmall</option>
    <option>Xsmall Apple</option>
    <option>Xsmall Orange</option>
    <option>Xsmall Tomato</option>
  </select>
  <select class="select select-sm">
    <option disabled selected>Small</option>
    <option>Small Apple</option>
    <option>Small Orange</option>
    <option>Small Tomato</option>
  </select>
  <select class="select select-md">
    <option disabled selected>Medium</option>
    <option>Medium Apple</option>
    <option>Medium Orange</option>
    <option>Medium Tomato</option>
  </select>
  <select class="select select-lg">
    <option disabled selected>Large</option>
    <option>Large Apple</option>
    <option>Large Orange</option>
    <option>Large Tomato</option>
  </select>
  <select class="select select-xl">
    <option disabled selected>Xlarge</option>
    <option>Xlarge Apple</option>
    <option>Xlarge Orange</option>
    <option>Xlarge Tomato</option>
  </select>
</div>

```html
<select class="select select-xs">
  <option disabled selected>Xsmall</option>
  <option>Xsmall Apple</option>
  <option>Xsmall Orange</option>
  <option>Xsmall Tomato</option>
</select>
<select class="select select-sm">
  <option disabled selected>Small</option>
  <option>Small Apple</option>
  <option>Small Orange</option>
  <option>Small Tomato</option>
</select>
<select class="select select-md">
  <option disabled selected>Medium</option>
  <option>Medium Apple</option>
  <option>Medium Orange</option>
  <option>Medium Tomato</option>
</select>
<select class="select select-lg">
  <option disabled selected>Large</option>
  <option>Large Apple</option>
  <option>Large Orange</option>
  <option>Large Tomato</option>
</select>
<select class="select select-xl">
  <option disabled selected>Xlarge</option>
  <option>Xlarge Apple</option>
  <option>Xlarge Orange</option>
  <option>Xlarge Tomato</option>
</select>
```

```jsx
<select defaultValue="Xsmall" class="select select-xs">
  <option disabled={true}>Xsmall</option>
  <option>Xsmall Apple</option>
  <option>Xsmall Orange</option>
  <option>Xsmall Tomato</option>
</select>
<select defaultValue="Small" class="select select-sm">
  <option disabled={true}>Small</option>
  <option>Small Apple</option>
  <option>Small Orange</option>
  <option>Small Tomato</option>
</select>
<select defaultValue="Medium" class="select select-md">
  <option disabled={true}>Medium</option>
  <option>Medium Apple</option>
  <option>Medium Orange</option>
  <option>Medium Tomato</option>
</select>
<select defaultValue="Large" class="select select-lg">
  <option disabled={true}>Large</option>
  <option>Large Apple</option>
  <option>Large Orange</option>
  <option>Large Tomato</option>
</select>
<select defaultValue="Xlarge" class="select select-xl">
  <option disabled={true}>Xlarge</option>
  <option>Xlarge Apple</option>
  <option>Xlarge Orange</option>
  <option>Xlarge Tomato</option>
</select>
```

### Disabled

<select class="select" disabled>
  <option>You can't touch this</option>
</select>

```html
<select class="select" disabled>
  <option>You can't touch this</option>
</select>
```

```jsx
<select class="select" disabled={true}>
  <option>You can't touch this</option>
</select>
```

### Using OS native style for the options dropdown

<select class="select appearance-none">
  <option disabled selected>Pick a color</option>
  <option>Crimson</option>
  <option>Amber</option>
  <option>Velvet</option>
</select>

```html
<select class="select appearance-none">
  <option disabled selected>Pick a color</option>
  <option>Crimson</option>
  <option>Amber</option>
  <option>Velvet</option>
</select>
```

```jsx
<select defaultValue="Pick a color" className="select appearance-none">
  <option disabled={true}>Pick a color</option>
  <option>Crimson</option>
  <option>Amber</option>
  <option>Velvet</option>
</select>
```
