# Phone mockup

Phone mockup shows a mockup of an iPhone.

## Class Reference

| Class | Description | Category |
|-------|-------------|----------|
| `mockup-phone` | Phone mockup | component |
| `mockup-phone-camera` | Camera part | part |
| `mockup-phone-display` | Display part | part |

## Examples

### iPhone mockup

<div class="mockup-phone">
  <div class="mockup-phone-camera"></div>
  <div class="mockup-phone-display text-white bg-neutral-900 grid place-content-center">It's Glowtime.</div>
</div>

```html
<div class="mockup-phone">
  <div class="mockup-phone-camera"></div>
  <div class="mockup-phone-display text-white grid place-content-center bg-neutral-900">
    It's Glowtime.
  </div>
</div>
```

### With color and wallpaper

<div class="mockup-phone border-[#ff8938]">
  <div class="mockup-phone-camera"></div>
  <div class="mockup-phone-display">
    <img alt="wallpaper" src="https://img.daisyui.com/images/stock/453966.webp?1"/>
  </div>
</div>

```html
<div class="mockup-phone border-[#ff8938]">
  <div class="mockup-phone-camera"></div>
  <div class="mockup-phone-display">
    <img alt="wallpaper" src="https://img.daisyui.com/images/stock/453966.webp" />
  </div>
</div>
```
