---
name: tailwind-marketing
description: Use when building marketing pages, landing pages, homepages, about pages, pricing pages, or promotional content with Tailwind CSS. Covers hero sections, call-to-action sections, feature sections, pricing tables, testimonials, team sections, FAQ sections, blog sections, newsletter forms, footers, logo clouds, stats sections, bento grids, contact forms, banners, 404 pages, headers with flyout menus.
---

# Tailwind CSS Marketing Pages

## 1. Hero Section Patterns

| Variant | Structure | Best For |
|---------|-----------|----------|
| Simple centered | Centered heading + subtext + CTA button pair | SaaS landing pages |
| Split with image | 2-col grid: text left, image right | Product showcase |
| With app screenshot | Centered text + full-width screenshot below | App launch pages |
| Background image | Full-bleed bg image + dark overlay + white text | Visual impact, events |
| With phone mockup | Text block + device frame image | Mobile app marketing |
| With image tiles | Text block + asymmetric image grid | Portfolio, creative agency |

### Hero Text Scaling

Use responsive font sizes for headings. Standard pattern:

```html
<h1 class="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
```

- `text-balance` prevents orphaned words on narrow viewports.
- Subtext uses `text-lg sm:text-xl text-gray-600` with `max-w-2xl mx-auto` for centered variants.

### CTA Button Pairs

Primary + secondary pattern:

```html
<div class="flex items-center justify-center gap-x-6">
  <a href="#" class="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
    Get started
  </a>
  <a href="#" class="text-sm font-semibold text-gray-900">
    Learn more <span aria-hidden="true">&rarr;</span>
  </a>
</div>
```

### Gradient Overlay (Background Image Hero)

```html
<div class="relative isolate overflow-hidden">
  <img src="..." alt="" class="absolute inset-0 -z-10 size-full object-cover" />
  <div class="absolute inset-0 -z-10 bg-gradient-to-t from-gray-900/80 to-gray-900/20" />
  <!-- Content on top -->
</div>
```

## 2. Feature Sections

| Layout | Structure | When to Use |
|--------|-----------|-------------|
| Icon grid | 3-col grid, each cell: icon + title + description | General feature overview |
| Alternating rows | Image + text, alternating left/right per row | Detailed feature walkthrough |
| Bento grid | Asymmetric card grid with varying col/row spans | Modern, visual feature display |
| Checklist | List with check icons + feature text | Concise feature comparison |
| Screenshot + callouts | Large screenshot with annotated feature labels | Product demo sections |

### Icon Grid Pattern

```html
<div class="mx-auto max-w-7xl px-6 lg:px-8">
  <div class="mx-auto max-w-2xl text-center">
    <h2 class="text-base font-semibold text-indigo-600">Section label</h2>
    <p class="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Section heading</p>
    <p class="mt-6 text-lg text-gray-600">Section description.</p>
  </div>
  <div class="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
    <dl class="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
      <!-- Repeat: dt with icon + name, dd with description -->
    </dl>
  </div>
</div>
```

### Section Header Convention

All feature sections follow a consistent header pattern:

| Element | Classes | Purpose |
|---------|---------|---------|
| Eyebrow | `text-base font-semibold text-indigo-600` | Category label above heading |
| Heading | `mt-2 text-4xl font-semibold tracking-tight sm:text-5xl` | Primary section title |
| Description | `mt-6 text-lg text-gray-600` | Supporting paragraph |

### Bento Grid

Use `grid-cols-1 lg:grid-cols-3` with varying `lg:col-span-2` and `lg:row-span-2` on feature cards. Each card typically has `rounded-2xl ring-1 ring-gray-200 overflow-hidden` with a screenshot or illustration inside.

## 3. Pricing Patterns

| Layout | Columns | Features | Best For |
|--------|---------|----------|----------|
| Two tiers | 2 cards side by side | Simple comparison | Freemium products |
| Three tiers | 3 cards, middle emphasized | Most common pattern | SaaS with multiple plans |
| With toggle | Monthly/annual switch above cards | Billing frequency toggle | Subscription products |
| Comparison table | Full feature matrix below cards | Detailed feature comparison | Complex product tiers |
| Single price | One centered card | Single product/offering | Simple products |

### Emphasized Tier

The recommended tier gets visual prominence:

| Technique | Classes |
|-----------|---------|
| Scale | `lg:z-10 lg:scale-105` on the card |
| Ring accent | `ring-2 ring-indigo-600` instead of `ring-1 ring-gray-200` |
| Shadow | `shadow-xl` vs `shadow-sm` on other cards |
| Popular badge | Absolute-positioned label: `rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white` |
| CTA color | `bg-indigo-600 text-white` vs `bg-white text-indigo-600 ring-1 ring-indigo-200` |

### Feature List Within Pricing Card

```html
<ul role="list" class="mt-8 space-y-3 text-sm text-gray-600">
  <li class="flex gap-x-3">
    <svg class="h-6 w-5 flex-none text-indigo-600"><!-- check icon --></svg>
    Feature description
  </li>
</ul>
```

### Monthly/Annual Toggle

Use a button group or Headless UI Switch. Display pricing dynamically. Common pattern:

| State | Label | Price Display |
|-------|-------|---------------|
| Monthly | `Monthly` (default) | `$15/month` |
| Annual | `Annual` (highlighted) | `$12/month` with `Save 20%` badge |

## 4. Social Proof

| Pattern | Structure | Key Classes |
|---------|-----------|-------------|
| Testimonial card | Quote + avatar + name + role | `rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200` |
| Testimonial grid | 2-3 col grid of testimonial cards | `grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3` |
| Logo cloud | Row of grayscale client logos | `grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition` |
| Star rating | Filled/empty star SVGs | `text-yellow-400` filled, `text-gray-200` empty |
| Stats section | Large numbers + labels in a row | `text-4xl font-semibold` number, `text-sm text-gray-600` label |
| Case study card | Image + company + result metric | Card with image top, text bottom |

### Logo Cloud Layout

```html
<div class="mx-auto max-w-7xl px-6 lg:px-8">
  <h2 class="text-center text-lg font-semibold text-gray-900">
    Trusted by the world's most innovative teams
  </h2>
  <div class="mx-auto mt-10 grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-6 lg:mx-0 lg:max-w-none lg:grid-cols-5">
    <img class="col-span-2 max-h-12 w-full object-contain lg:col-span-1" src="..." alt="..." />
    <!-- Repeat per logo -->
  </div>
</div>
```

### Stats Section Layout

```html
<div class="mx-auto max-w-7xl px-6 lg:px-8">
  <dl class="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-4">
    <div class="mx-auto flex max-w-xs flex-col gap-y-4">
      <dt class="text-base text-gray-600">Transactions every 24 hours</dt>
      <dd class="order-first text-3xl font-semibold tracking-tight text-gray-900 sm:text-5xl">44 million+</dd>
    </div>
    <!-- Repeat -->
  </dl>
</div>
```

## 5. Content Sections

| Section | Structure | Responsive Columns |
|---------|-----------|--------------------|
| Blog card | Image + date + category + title + excerpt + author | 1 col mobile, 2 col sm, 3 col lg |
| FAQ accordion | Disclosure component with dt/dd pairs | Single column, `max-w-4xl mx-auto` |
| Contact split | 2-col: info left, form right | Stack on mobile |
| Newsletter inline | Heading + paragraph + email input + button | Single row on lg, stacked on mobile |
| Content + sidebar | Main content + sticky TOC sidebar | 2-col on lg, TOC hidden on mobile |

### Blog Card Pattern

```html
<article class="flex flex-col items-start">
  <div class="relative w-full">
    <img src="..." alt="" class="aspect-video w-full rounded-2xl bg-gray-100 object-cover" />
  </div>
  <div class="max-w-xl">
    <div class="mt-8 flex items-center gap-x-4 text-xs">
      <time datetime="2024-01-01" class="text-gray-500">Jan 1, 2024</time>
      <span class="rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600">Category</span>
    </div>
    <h3 class="mt-3 text-lg font-semibold text-gray-900"><a href="#">Post title</a></h3>
    <p class="mt-5 line-clamp-3 text-sm text-gray-600">Excerpt text...</p>
  </div>
</article>
```

### FAQ Accordion

Use Headless UI `Disclosure` component. Each item is a `dt` (question button) and `dd` (answer panel). Apply `divide-y divide-gray-900/10` on the list container.

### Newsletter Inline

```html
<div class="flex gap-x-4">
  <input type="email" placeholder="Enter your email" class="min-w-0 flex-auto rounded-md bg-white/5 px-3.5 py-2 text-sm ring-1 ring-inset ring-white/10" />
  <button type="submit" class="flex-none rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white">
    Subscribe
  </button>
</div>
```

## 6. Headers and Navigation

| Pattern | Component Dependencies | Key Behavior |
|---------|------------------------|--------------|
| Simple header | None | Logo + nav links + CTA button |
| Flyout menus | Headless UI `Popover`, `PopoverButton`, `PopoverPanel` | Desktop dropdown navigation |
| Mobile menu | Headless UI `Dialog`, `DialogPanel` | Full-screen slide-over menu |
| Sticky header | Scroll event listener or `sticky top-0 z-50` | Fixed on scroll |
| Announcement banner | Dismissible bar above header | Promo or status message |

### Header Structure

```html
<header class="bg-white">
  <nav class="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
    <!-- Logo -->
    <div class="flex lg:flex-1">
      <a href="#"><img class="h-8 w-auto" src="..." alt="" /></a>
    </div>
    <!-- Mobile menu button -->
    <div class="flex lg:hidden">
      <button type="button" class="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700">
        <span class="sr-only">Open main menu</span>
        <!-- Bars icon -->
      </button>
    </div>
    <!-- Desktop nav -->
    <div class="hidden lg:flex lg:gap-x-12">
      <a href="#" class="text-sm font-semibold text-gray-900">Features</a>
      <!-- More links -->
    </div>
    <!-- Desktop CTA -->
    <div class="hidden lg:flex lg:flex-1 lg:justify-end">
      <a href="#" class="text-sm font-semibold text-gray-900">Log in <span aria-hidden="true">&rarr;</span></a>
    </div>
  </nav>
</header>
```

### Announcement Banner

```html
<div class="relative isolate flex items-center gap-x-6 overflow-hidden bg-gray-50 px-6 py-2.5 sm:px-3.5 sm:before:flex-1">
  <p class="text-sm text-gray-900">
    <a href="#"><strong class="font-semibold">Announcement</strong> — Details here &rarr;</a>
  </p>
  <div class="flex flex-1 justify-end">
    <button type="button" class="-m-3 p-3 focus-visible:outline-offset-[-4px]">
      <span class="sr-only">Dismiss</span>
      <!-- X icon -->
    </button>
  </div>
</div>
```

## 7. Footers

| Variant | Structure | When to Use |
|---------|-----------|-------------|
| Simple centered | Centered nav links + copyright | Small sites, single-page |
| Multi-column | 4-col grid of categorized link groups | Sites with many pages |
| With newsletter | Multi-column + email signup form | Lead generation focus |
| With social icons | Links + row of social SVG icons | Brand with social presence |
| Dark footer | `bg-gray-900 text-gray-300` variant | Dark-themed or contrast |

### Multi-Column Footer Structure

| Column Count | Grid Classes | Typical Categories |
|--------------|-------------|-------------------|
| 4 columns | `grid grid-cols-2 gap-8 xl:col-span-2 xl:grid-cols-4` | Product, Company, Support, Legal |
| 3 columns | `grid grid-cols-2 gap-8 xl:col-span-2 xl:grid-cols-3` | Solutions, Company, Resources |

### Footer Link Styling

```html
<ul role="list" class="mt-6 space-y-4">
  <li><a href="#" class="text-sm text-gray-400 hover:text-white">Link text</a></li>
</ul>
```

### Social Icons Row

```html
<div class="flex gap-x-6">
  <a href="#" class="text-gray-400 hover:text-gray-300">
    <span class="sr-only">Platform name</span>
    <svg class="size-6" fill="currentColor" viewBox="0 0 24 24"><!-- icon --></svg>
  </a>
</div>
```

## 8. Landing Page Composition

Recommended section ordering by page type:

| Page Type | Recommended Section Order |
|-----------|---------------------------|
| SaaS Landing | Header > Hero (centered) > Logo cloud > Features (icon grid) > Feature detail (alternating) > Pricing (3-tier) > Testimonials > CTA section > Footer |
| Product Launch | Header > Hero (with screenshot) > Features (bento) > Screenshots > Pricing (2-tier) > FAQ > Footer |
| Agency / Service | Header > Hero (split image) > Services (icon grid) > Portfolio > Testimonials > Team section > Contact (split) > Footer |
| Mobile App | Header > Hero (phone mockup) > Features (alternating) > Stats > Testimonials > Download CTA > Footer |
| Event / Conference | Header + Banner > Hero (background image) > Speakers (team grid) > Schedule > Pricing (tickets) > FAQ > Footer |

### Section Spacing Convention

| Context | Padding Classes |
|---------|-----------------|
| Standard section | `py-24 sm:py-32` |
| Tight section (logo cloud) | `py-16 sm:py-20` |
| Hero section | `py-32 sm:py-48 lg:py-56` |
| CTA section | `py-16 sm:py-24` |

### Container Convention

All sections use a consistent container:

```html
<div class="mx-auto max-w-7xl px-6 lg:px-8">
  <!-- Section content -->
</div>
```

## 9. Visual Design Patterns

### Gradient Text

```html
<span class="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
  Gradient heading
</span>
```

### Decorative Background Elements

| Element | Technique | Placement |
|---------|-----------|-----------|
| Gradient blob | `absolute` div with `bg-gradient-to-tr`, `blur-3xl`, `opacity-30` | Behind hero or CTA sections |
| Dot pattern | SVG pattern with `fill="currentColor"` | Behind feature sections |
| Grid pattern | SVG with grid lines at low opacity | Full-page background |

```html
<!-- Gradient blob -->
<div class="absolute -top-40 -z-10 transform-gpu overflow-hidden blur-3xl" aria-hidden="true">
  <div class="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30"
       style="clip-path: polygon(...)"></div>
</div>
```

### Section Dividers

| Type | Implementation |
|------|----------------|
| Angled | `clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%)` on the section |
| Wave | Inline SVG with a curved path between sections |
| Gradient fade | `bg-gradient-to-b from-white to-gray-50` as section background |

### Dark Section Variant

For contrast sections (CTA blocks, alternate feature rows):

| Element | Light | Dark |
|---------|-------|------|
| Background | `bg-white` | `bg-gray-900` |
| Heading | `text-gray-900` | `text-white` |
| Body text | `text-gray-600` | `text-gray-300` |
| Ring/border | `ring-gray-200` | `ring-white/10` |
| Input bg | `bg-white` | `bg-white/5` |

### Common Utility Patterns

| Pattern | Classes | Purpose |
|---------|---------|---------|
| Aspect ratio image | `aspect-video w-full rounded-2xl object-cover` | Blog cards, hero images |
| Avatar | `size-10 rounded-full` | Testimonials, team |
| Badge | `rounded-full bg-indigo-600/10 px-3 py-1 text-xs font-semibold text-indigo-600 ring-1 ring-inset ring-indigo-600/20` | Tags, categories |
| Truncated text | `line-clamp-3` | Blog excerpts |
| Screen-reader text | `sr-only` | Icon-only buttons, social links |
| Smooth transition | `transition-all duration-300` | Hover states |
| Focus ring | `focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600` | Interactive elements |

## MCP Component Library

The `frontend-components` MCP server provides marketing-related components:

- **HyperUI** (`hyperui`, category: `marketing`): Heroes/banners, CTAs, pricing tables, testimonials, FAQs, blog cards, product showcases, announcements, footers, headers, stats
- **DaisyUI** (`daisyui`): Hero, card, stat, badge, countdown, timeline class references
- **FlyonUI** (`flyonui`): Card, stat, footer CSS components

**Marketing search:** `list_components(framework: "hyperui", category: "marketing")` to browse all marketing components, or `search_components(query: "hero")` across libraries.
