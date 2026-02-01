---
name: elementor-controls
description: Use when adding controls to Elementor widgets, creating custom controls, using group controls, responsive controls, selectors, conditional display, dynamic content, or referencing control type parameters
---

# Elementor Controls Reference

## 1. Controls Overview

Controls are the fields in the Elementor editor panel that allow users to configure widgets. Every control must live inside a **section**.

**Basic pattern:**
```php
$this->start_controls_section('section_id', [
    'label' => esc_html__('Section', 'textdomain'),
    'tab' => \Elementor\Controls_Manager::TAB_CONTENT, // or TAB_STYLE
]);

$this->add_control('control_id', [
    'label' => esc_html__('Label', 'textdomain'),
    'type' => \Elementor\Controls_Manager::TEXT,
    'default' => '',
]);

$this->end_controls_section();
```

**Control base classes:**

| Base Class | Purpose | Examples |
|---|---|---|
| `Base_Data_Control` | Controls that store a single value | TEXT, SELECT, COLOR, SWITCHER, NUMBER |
| `Control_Base_Multiple` | Controls returning arrays | URL, MEDIA, ICONS, IMAGE_DIMENSIONS |
| `Control_Base_Units` | Controls with size + unit | SLIDER, DIMENSIONS |
| `Base_UI_Control` | Display-only, no stored data | HEADING, DIVIDER, ALERT, RAW_HTML |
| `Group_Control_Base` | Grouped sets of controls | Typography, Background, Border |

**Available tabs:** `TAB_CONTENT`, `TAB_STYLE`, `TAB_ADVANCED`, `TAB_RESPONSIVE`, `TAB_LAYOUT`

**Common parameters (all controls):** `label`, `description`, `show_label` (bool), `label_block` (bool), `separator` (`default`|`before`|`after`), `condition`, `conditions`, `classes`, `dynamic`, `global`, `frontend_available`

## 2. Data Controls Quick Reference

### Text Input Controls

| Control | Constant | Returns | Key Params |
|---|---|---|---|
| Text | `TEXT` | `string` | `input_type`, `placeholder`, `title` |
| Textarea | `TEXTAREA` | `string` | `rows`, `placeholder` |
| WYSIWYG | `WYSIWYG` | `string` | (rich text editor) |
| Code | `CODE` | `string` | `language` (`html`\|`css`\|`javascript`), `rows` |
| Number | `NUMBER` | `string` | `min`, `max`, `step`, `placeholder` |
| Hidden | `HIDDEN` | `string` | `default` (only param that matters) |

```php
// TEXT
$this->add_control('title', [
    'label' => esc_html__('Title', 'textdomain'),
    'type' => \Elementor\Controls_Manager::TEXT,
    'default' => esc_html__('Default title', 'textdomain'),
    'placeholder' => esc_html__('Enter title', 'textdomain'),
]);

// TEXTAREA
$this->add_control('desc', [
    'label' => esc_html__('Description', 'textdomain'),
    'type' => \Elementor\Controls_Manager::TEXTAREA,
    'rows' => 10,
    'default' => esc_html__('Default description', 'textdomain'),
]);

// WYSIWYG
$this->add_control('content', [
    'label' => esc_html__('Content', 'textdomain'),
    'type' => \Elementor\Controls_Manager::WYSIWYG,
    'default' => '<p>Default content</p>',
]);

// CODE
$this->add_control('custom_css', [
    'label' => esc_html__('Custom CSS', 'textdomain'),
    'type' => \Elementor\Controls_Manager::CODE,
    'language' => 'css',
    'rows' => 20,
]);

// NUMBER
$this->add_control('count', [
    'label' => esc_html__('Count', 'textdomain'),
    'type' => \Elementor\Controls_Manager::NUMBER,
    'min' => 1, 'max' => 100, 'step' => 1,
    'default' => 10,
]);

// HIDDEN
$this->add_control('version', [
    'type' => \Elementor\Controls_Manager::HIDDEN,
    'default' => '2',
]);
```

### Selection Controls

| Control | Constant | Returns | Key Params |
|---|---|---|---|
| Select | `SELECT` | `string` | `options` (key=>label array), `groups` |
| Select2 | `SELECT2` | `string\|array` | `options`, `multiple` (bool), `select2options` |
| Choose | `CHOOSE` | `string` | `options` (key=>[title,icon]), `toggle` (bool) |
| Visual Choice | `VISUAL_CHOICE` | `string` | `options` (key=>[title,image]) |
| Switcher | `SWITCHER` | `string` | `label_on`, `label_off`, `return_value` (default `'yes'`) |

```php
// SELECT
$this->add_control('border_style', [
    'label' => esc_html__('Border Style', 'textdomain'),
    'type' => \Elementor\Controls_Manager::SELECT,
    'default' => 'solid',
    'options' => [
        'none' => esc_html__('None', 'textdomain'),
        'solid' => esc_html__('Solid', 'textdomain'),
        'dashed' => esc_html__('Dashed', 'textdomain'),
    ],
    'selectors' => [
        '{{WRAPPER}} .el' => 'border-style: {{VALUE}};',
    ],
]);

// SELECT with groups (optgroup)
$this->add_control('animation', [
    'label' => esc_html__('Animation', 'textdomain'),
    'type' => \Elementor\Controls_Manager::SELECT,
    'groups' => [
        ['label' => 'Slide', 'options' => ['slide-right' => 'Slide Right', 'slide-left' => 'Slide Left']],
        ['label' => 'Zoom', 'options' => ['zoom-in' => 'Zoom In', 'zoom-out' => 'Zoom Out']],
    ],
]);

// SELECT2
$this->add_control('categories', [
    'label' => esc_html__('Categories', 'textdomain'),
    'type' => \Elementor\Controls_Manager::SELECT2,
    'multiple' => true,
    'options' => ['cat1' => 'Category 1', 'cat2' => 'Category 2'],
    'default' => [],
]);

// CHOOSE
$this->add_control('alignment', [
    'label' => esc_html__('Alignment', 'textdomain'),
    'type' => \Elementor\Controls_Manager::CHOOSE,
    'options' => [
        'left' => ['title' => esc_html__('Left', 'textdomain'), 'icon' => 'eicon-text-align-left'],
        'center' => ['title' => esc_html__('Center', 'textdomain'), 'icon' => 'eicon-text-align-center'],
        'right' => ['title' => esc_html__('Right', 'textdomain'), 'icon' => 'eicon-text-align-right'],
    ],
    'default' => 'center',
    'toggle' => true,
    'selectors' => [
        '{{WRAPPER}} .el' => 'text-align: {{VALUE}};',
    ],
]);

// SWITCHER
$this->add_control('show_title', [
    'label' => esc_html__('Show Title', 'textdomain'),
    'type' => \Elementor\Controls_Manager::SWITCHER,
    'label_on' => esc_html__('Yes', 'textdomain'),
    'label_off' => esc_html__('No', 'textdomain'),
    'return_value' => 'yes',
    'default' => 'yes',
]);
```

### Unit / Dimension Controls

| Control | Constant | Returns | Key Params |
|---|---|---|---|
| Slider | `SLIDER` | `['size'=>int, 'unit'=>string]` | `size_units`, `range` (per unit: min/max/step) |
| Dimensions | `DIMENSIONS` | `['top','right','bottom','left','unit','isLinked']` | `size_units`, `range`, `allowed_dimensions` |
| Image Dimensions | `IMAGE_DIMENSIONS` | `['width'=>int, 'height'=>int]` | `default` |

```php
// SLIDER
$this->add_control('width', [
    'label' => esc_html__('Width', 'textdomain'),
    'type' => \Elementor\Controls_Manager::SLIDER,
    'size_units' => ['px', '%', 'em', 'rem', 'custom'],
    'range' => [
        'px' => ['min' => 0, 'max' => 1000, 'step' => 5],
        '%' => ['min' => 0, 'max' => 100],
    ],
    'default' => ['unit' => '%', 'size' => 50],
    'selectors' => [
        '{{WRAPPER}} .el' => 'width: {{SIZE}}{{UNIT}};',
    ],
]);

// DIMENSIONS
$this->add_control('margin', [
    'label' => esc_html__('Margin', 'textdomain'),
    'type' => \Elementor\Controls_Manager::DIMENSIONS,
    'size_units' => ['px', '%', 'em', 'rem', 'custom'],
    'selectors' => [
        '{{WRAPPER}} .el' => 'margin: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
    ],
]);

// IMAGE_DIMENSIONS
$this->add_control('image_size', [
    'label' => esc_html__('Image Dimension', 'textdomain'),
    'type' => \Elementor\Controls_Manager::IMAGE_DIMENSIONS,
    'default' => ['width' => '', 'height' => ''],
]);
```

### Media / Asset Controls

| Control | Constant | Returns | Key Params |
|---|---|---|---|
| Color | `COLOR` | `string` (hex/rgba) | `alpha` (bool, default true) |
| Media | `MEDIA` | `['id'=>int, 'url'=>string]` | `media_types` (default `['image']`) |
| Gallery | `GALLERY` | `array` of `['id','url']` | `default` |
| Icons | `ICONS` | `['value'=>string, 'library'=>string]` | `default`, `fa4compatibility`, `recommended`, `skin` |
| Icon | `ICON` | `string` | DEPRECATED - use ICONS instead |
| Font | `FONT` | `string` | `default` |
| URL | `URL` | `['url','is_external','nofollow','custom_attributes']` | `placeholder`, `autocomplete`, `options` |
| Date Time | `DATE_TIME` | `string` | `picker_options` (Flatpickr config) |

```php
// COLOR
$this->add_control('text_color', [
    'label' => esc_html__('Text Color', 'textdomain'),
    'type' => \Elementor\Controls_Manager::COLOR,
    'selectors' => [
        '{{WRAPPER}} .el' => 'color: {{VALUE}};',
    ],
]);

// MEDIA
$this->add_control('image', [
    'label' => esc_html__('Choose Image', 'textdomain'),
    'type' => \Elementor\Controls_Manager::MEDIA,
    'media_types' => ['image', 'svg'],
    'default' => ['url' => \Elementor\Utils::get_placeholder_image_src()],
]);

// GALLERY
$this->add_control('gallery', [
    'label' => esc_html__('Gallery', 'textdomain'),
    'type' => \Elementor\Controls_Manager::GALLERY,
    'default' => [],
]);

// ICONS
$this->add_control('icon', [
    'label' => esc_html__('Icon', 'textdomain'),
    'type' => \Elementor\Controls_Manager::ICONS,
    'default' => ['value' => 'fas fa-circle', 'library' => 'fa-solid'],
    'recommended' => [
        'fa-solid' => ['circle', 'dot-circle', 'square-full'],
        'fa-regular' => ['circle', 'dot-circle', 'square-full'],
    ],
]);

// URL
$this->add_control('link', [
    'label' => esc_html__('Link', 'textdomain'),
    'type' => \Elementor\Controls_Manager::URL,
    'placeholder' => esc_html__('https://your-link.com', 'textdomain'),
    'options' => ['url', 'is_external', 'nofollow'],
    'default' => ['url' => '', 'is_external' => true, 'nofollow' => true],
]);

// FONT
$this->add_control('font_family', [
    'label' => esc_html__('Font Family', 'textdomain'),
    'type' => \Elementor\Controls_Manager::FONT,
    'default' => "'Open Sans', sans-serif",
]);

// DATE_TIME
$this->add_control('due_date', [
    'label' => esc_html__('Due Date', 'textdomain'),
    'type' => \Elementor\Controls_Manager::DATE_TIME,
    'default' => gmdate('Y-m-d H:i'),
]);
```

### REPEATER

Returns: `array` of rows, each row is an assoc array of field values. Use `title_field` for dynamic row labels.

```php
$repeater = new \Elementor\Repeater();

$repeater->add_control('list_title', [
    'label' => esc_html__('Title', 'textdomain'),
    'type' => \Elementor\Controls_Manager::TEXT,
    'default' => esc_html__('List Title', 'textdomain'),
    'label_block' => true,
]);

$repeater->add_control('list_color', [
    'label' => esc_html__('Color', 'textdomain'),
    'type' => \Elementor\Controls_Manager::COLOR,
    'selectors' => [
        '{{WRAPPER}} {{CURRENT_ITEM}}' => 'color: {{VALUE}}',
    ],
]);

$this->add_control('list', [
    'label' => esc_html__('Items', 'textdomain'),
    'type' => \Elementor\Controls_Manager::REPEATER,
    'fields' => $repeater->get_controls(),
    'default' => [
        ['list_title' => esc_html__('Title #1', 'textdomain')],
        ['list_title' => esc_html__('Title #2', 'textdomain')],
    ],
    'title_field' => '{{{ list_title }}}',
    'prevent_empty' => true,
]);
```

**Render:** PHP: `$settings['list']` is array of rows. Each row has `_id` key. Use class `elementor-repeater-item-{$item['_id']}` for per-item styling with `{{CURRENT_ITEM}}`. JS template: `_.each(settings.list, function(item) { ... item._id ... })`

### POPOVER_TOGGLE

Used with `start_popover()` / `end_popover()` to group controls in a popup.

```php
$this->add_control('box_toggle', [
    'label' => esc_html__('Box', 'textdomain'),
    'type' => \Elementor\Controls_Manager::POPOVER_TOGGLE,
    'label_off' => esc_html__('Default', 'textdomain'),
    'label_on' => esc_html__('Custom', 'textdomain'),
    'return_value' => 'yes',
]);

$this->start_popover();
// ... add controls inside popover ...
$this->end_popover();
```

## 3. UI Controls

UI controls display information in the panel but store no data.

| Control | Constant | Key Params | Purpose |
|---|---|---|---|
| Heading | `HEADING` | `label` | Section heading text |
| Divider | `DIVIDER` | - | Horizontal separator line |
| Alert | `ALERT` | `alert_type` (`info`\|`success`\|`warning`\|`danger`), `content` | Colored alert box |
| Notice | `NOTICE` | `notice_type`, `content`, `dismissible` (bool), `heading` | Dismissible notice |
| Raw HTML | `RAW_HTML` | `raw`, `content_classes` | Arbitrary HTML in panel |
| Button | `BUTTON` | `text`, `button_type` (`default`\|`success`), `event` | Clickable button |
| Deprecated Notice | `DEPRECATED_NOTICE` | `widget`, `since`, `last`, `plugin`, `replacement` | Deprecation warning |

```php
// HEADING
$this->add_control('heading_style', [
    'label' => esc_html__('Title Style', 'textdomain'),
    'type' => \Elementor\Controls_Manager::HEADING,
    'separator' => 'before',
]);

// DIVIDER
$this->add_control('hr', [
    'type' => \Elementor\Controls_Manager::DIVIDER,
]);

// ALERT
$this->add_control('important_note', [
    'type' => \Elementor\Controls_Manager::ALERT,
    'alert_type' => 'warning',
    'content' => esc_html__('This is a warning message.', 'textdomain'),
]);

// RAW_HTML
$this->add_control('info', [
    'type' => \Elementor\Controls_Manager::RAW_HTML,
    'raw' => '<p>Custom HTML content here</p>',
    'content_classes' => 'elementor-panel-alert elementor-panel-alert-info',
]);

// BUTTON
$this->add_control('submit_btn', [
    'label' => esc_html__('Action', 'textdomain'),
    'type' => \Elementor\Controls_Manager::BUTTON,
    'text' => esc_html__('Apply', 'textdomain'),
    'event' => 'namespace:editor:action',
]);
```

## 4. Group Controls

Group controls bundle multiple related controls. Use `add_group_control()` with `selector` (singular, string) for CSS targeting.

| Group Control | Class | Type Getter | Key Params |
|---|---|---|---|
| Typography | `Group_Control_Typography` | `::get_type()` | `selector`, `fields_options`, `global` |
| Background | `Group_Control_Background` | `::get_type()` | `selector`, `types` (`classic`\|`gradient`\|`video`\|`slideshow`) |
| Border | `Group_Control_Border` | `::get_type()` | `selector`, `fields_options` |
| Box Shadow | `Group_Control_Box_Shadow` | `::get_type()` | `selector`, `exclude` |
| Text Shadow | `Group_Control_Text_Shadow` | `::get_type()` | `selector`, `exclude` |
| Text Stroke | `Group_Control_Text_Stroke` | `::get_type()` | `selector`, `exclude` |
| CSS Filter | `Group_Control_Css_Filter` | `::get_type()` | `selector`, `exclude` |
| Image Size | `Group_Control_Image_Size` | `::get_type()` | `include`, `exclude`, `default` |

**Common group control params:** `name` (required, unique prefix), `selector`, `exclude` (array of inner control names), `fields_options` (override inner control settings).

```php
// TYPOGRAPHY
$this->add_group_control(\Elementor\Group_Control_Typography::get_type(), [
    'name' => 'title_typography',
    'selector' => '{{WRAPPER}} .title',
]);

// BACKGROUND
$this->add_group_control(\Elementor\Group_Control_Background::get_type(), [
    'name' => 'background',
    'types' => ['classic', 'gradient'],
    'selector' => '{{WRAPPER}} .content',
]);

// BORDER
$this->add_group_control(\Elementor\Group_Control_Border::get_type(), [
    'name' => 'border',
    'selector' => '{{WRAPPER}} .wrapper',
]);

// BOX SHADOW
$this->add_group_control(\Elementor\Group_Control_Box_Shadow::get_type(), [
    'name' => 'box_shadow',
    'selector' => '{{WRAPPER}} .wrapper',
]);

// TEXT SHADOW
$this->add_group_control(\Elementor\Group_Control_Text_Shadow::get_type(), [
    'name' => 'text_shadow',
    'selector' => '{{WRAPPER}} .heading',
]);

// TEXT STROKE
$this->add_group_control(\Elementor\Group_Control_Text_Stroke::get_type(), [
    'name' => 'text_stroke',
    'selector' => '{{WRAPPER}} .heading',
]);

// CSS FILTER
$this->add_group_control(\Elementor\Group_Control_Css_Filter::get_type(), [
    'name' => 'css_filters',
    'selector' => '{{WRAPPER}} img',
]);

// IMAGE SIZE (use with MEDIA control)
$this->add_group_control(\Elementor\Group_Control_Image_Size::get_type(), [
    'name' => 'thumbnail',
    'default' => 'large',
    'exclude' => ['custom'],
]);
// Render: Group_Control_Image_Size::get_attachment_image_html($settings, 'thumbnail');
```

**Customizing inner controls with fields_options:**
```php
$this->add_group_control(\Elementor\Group_Control_Border::get_type(), [
    'name' => 'box_border',
    'fields_options' => [
        'border' => ['default' => 'solid'],
        'width' => ['default' => ['top' => '1', 'right' => '2', 'bottom' => '3', 'left' => '4', 'isLinked' => false]],
        'color' => ['default' => '#D4D4D4'],
    ],
    'selector' => '{{WRAPPER}} .box',
]);
```

## 5. Structural Controls

### Sections
Every control must be inside a section. Sections appear as collapsible panels.

```php
$this->start_controls_section('section_id', [
    'label' => esc_html__('Section Name', 'textdomain'),
    'tab' => \Elementor\Controls_Manager::TAB_CONTENT,  // default
    'condition' => [],  // optional
]);
// ... controls ...
$this->end_controls_section();
```

### Tabs (within a section)
Group controls into switchable tabs (e.g., Normal / Hover).

```php
$this->start_controls_tabs('style_tabs');

$this->start_controls_tab('normal_tab', [
    'label' => esc_html__('Normal', 'textdomain'),
]);
// ... normal state controls ...
$this->end_controls_tab();

$this->start_controls_tab('hover_tab', [
    'label' => esc_html__('Hover', 'textdomain'),
]);
// ... hover state controls ...
$this->end_controls_tab();

$this->end_controls_tabs();
```

### Popovers
Group controls in a popup that appears on toggle.

```php
$this->add_control('popover_toggle', [
    'type' => \Elementor\Controls_Manager::POPOVER_TOGGLE,
    'label' => esc_html__('Options', 'textdomain'),
    'label_off' => esc_html__('Default', 'textdomain'),
    'label_on' => esc_html__('Custom', 'textdomain'),
    'return_value' => 'yes',
]);
$this->start_popover();
// ... controls ...
$this->end_popover();
```

## 6. CSS Selectors

### The `{{WRAPPER}}` Pattern
All selectors should use `{{WRAPPER}}` for scoped styling. Resolves to `.elementor-{page_id} .elementor-element.elementor-element-{widget_id}`.

### Value Placeholders by Control Type

| Control Type | Selector Pattern |
|---|---|
| String controls (TEXT, SELECT, COLOR, etc.) | `'{{WRAPPER}} .el' => 'property: {{VALUE}};'` |
| SLIDER | `'{{WRAPPER}} .el' => 'width: {{SIZE}}{{UNIT}};'` |
| DIMENSIONS | `'{{WRAPPER}} .el' => 'margin: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};'` |
| URL / MEDIA | `'{{WRAPPER}} .el' => 'background-image: url({{URL}});'` |

### Multiple Properties in One Selector
```php
'selectors' => [
    '{{WRAPPER}} .el' => 'color: {{VALUE}}; border-color: {{VALUE}}; outline-color: {{VALUE}};',
],
```

### Multiple / Comma-Separated Selectors
```php
'selectors' => [
    '{{WRAPPER}} .heading, {{WRAPPER}} .content' => 'color: {{VALUE}};',
],
// OR as separate keys:
'selectors' => [
    '{{WRAPPER}} .heading' => 'color: {{VALUE}};',
    '{{WRAPPER}} .content' => 'color: {{VALUE}};',
],
```

### RTL/LTR Support
```php
'selectors' => [
    'body:not(.rtl) {{WRAPPER}} .el' => 'padding-left: {{VALUE}};',
    'body.rtl {{WRAPPER}} .el' => 'padding-right: {{VALUE}};',
],
```

### Hover States
```php
// Via group control:
'selector' => '{{WRAPPER}}:hover .el',
// Via tabs: put controls in a "Hover" tab
```

### Cross-Control Values
Reference another control's value by prefixing with the control name:
```php
$this->add_control('aspect_width', [
    'type' => \Elementor\Controls_Manager::NUMBER,
]);
$this->add_control('aspect_height', [
    'type' => \Elementor\Controls_Manager::NUMBER,
    'selectors' => [
        '{{WRAPPER}} img' => 'aspect-ratio: {{aspect_width.VALUE}} / {{aspect_height.VALUE}};',
    ],
]);
```

### Selectors Dictionary
Transform old stored values to new CSS values (backward compat). Only works with string-returning controls.
```php
$this->add_control('align', [
    'type' => \Elementor\Controls_Manager::CHOOSE,
    'selectors_dictionary' => [
        'left' => is_rtl() ? 'end' : 'start',
        'right' => is_rtl() ? 'start' : 'end',
    ],
    'selectors' => [
        '{{WRAPPER}} .el' => 'text-align: {{VALUE}};',
    ],
]);
```

### Element ID
`{{ID}}` resolves to the element's unique ID. Discouraged -- prefer `{{WRAPPER}}`.

## 7. Responsive Controls

Use `add_responsive_control()` instead of `add_control()`. Automatically creates per-device controls.

```php
$this->add_responsive_control('spacing', [
    'label' => esc_html__('Spacing', 'textdomain'),
    'type' => \Elementor\Controls_Manager::SLIDER,
    'range' => ['px' => ['min' => 0, 'max' => 100]],
    'devices' => ['desktop', 'tablet', 'mobile'],    // optional, default all 3
    'default' => ['size' => 30, 'unit' => 'px'],
    'tablet_default' => ['size' => 20, 'unit' => 'px'],
    'mobile_default' => ['size' => 10, 'unit' => 'px'],
    'selectors' => [
        '{{WRAPPER}} .el' => 'margin-bottom: {{SIZE}}{{UNIT}};',
    ],
]);
```

The `devices` parameter limits which breakpoints appear. Per-device defaults use `tablet_default` and `mobile_default` keys. Group controls automatically support responsive for their inner controls.

## 8. Conditional Display

### Basic `condition` Parameter
```php
// Show only when 'border' switcher is 'yes'
'condition' => ['border' => 'yes'],

// Show when value is one of multiple options (OR)
'condition' => ['type' => ['option1', 'option2']],

// Multiple conditions (AND)
'condition' => [
    'border' => 'yes',
    'border_style!' => '',   // ! suffix = not equal
],
```

### Advanced `conditions` Parameter
Supports operators: `==`, `!=`, `!==`, `===`, `in`, `!in`, `contains`, `!contains`, `<`, `<=`, `>`, `>=`
```php
'conditions' => [
    'relation' => 'or',  // 'and' (default) or 'or'
    'terms' => [
        ['name' => 'type', 'operator' => '===', 'value' => 'video'],
        ['name' => 'type', 'operator' => '===', 'value' => 'slideshow'],
    ],
],
```

Conditions can be nested. Repeater inner fields can only depend on other inner fields, NOT outer controls.

## 9. Dynamic Content

Enable dynamic tags (Elementor Pro) on any data control:

```php
$this->add_control('heading', [
    'label' => esc_html__('Heading', 'textdomain'),
    'type' => \Elementor\Controls_Manager::TEXT,
    'dynamic' => ['active' => true],
]);
```

Works with: TEXT, TEXTAREA, NUMBER, URL, MEDIA, WYSIWYG, and most data controls.

### Frontend Available
```php
$this->add_control('slides_count', [
    'type' => \Elementor\Controls_Manager::NUMBER,
    'default' => 3,
    'frontend_available' => true,  // default: false
]);
```
Access in JS handler: `this.getElementSettings('slides_count')`

## 10. Global Styles

Use the `global` parameter to inherit from the site's design system (set in Site Settings).

### Global Colors Constants
- `\Elementor\Core\Kits\Documents\Tabs\Global_Colors::COLOR_PRIMARY`
- `\Elementor\Core\Kits\Documents\Tabs\Global_Colors::COLOR_SECONDARY`
- `\Elementor\Core\Kits\Documents\Tabs\Global_Colors::COLOR_TEXT`
- `\Elementor\Core\Kits\Documents\Tabs\Global_Colors::COLOR_ACCENT`

### Global Typography Constants
- `\Elementor\Core\Kits\Documents\Tabs\Global_Typography::TYPOGRAPHY_PRIMARY`
- `\Elementor\Core\Kits\Documents\Tabs\Global_Typography::TYPOGRAPHY_SECONDARY`
- `\Elementor\Core\Kits\Documents\Tabs\Global_Typography::TYPOGRAPHY_TEXT`
- `\Elementor\Core\Kits\Documents\Tabs\Global_Typography::TYPOGRAPHY_ACCENT`

```php
// Color with global default
$this->add_control('heading_color', [
    'label' => esc_html__('Color', 'textdomain'),
    'type' => \Elementor\Controls_Manager::COLOR,
    'global' => ['default' => Global_Colors::COLOR_PRIMARY],
    'selectors' => ['{{WRAPPER}} .heading' => 'color: {{VALUE}};'],
]);

// Typography with global default
$this->add_group_control(\Elementor\Group_Control_Typography::get_type(), [
    'name' => 'heading_typo',
    'selector' => '{{WRAPPER}} .heading',
    'global' => ['default' => Global_Typography::TYPOGRAPHY_PRIMARY],
]);
```

Controls with `global` show a globe icon for users to pick a global style or set custom.

## 11. Custom Controls

### Creating a Custom Control
```php
class My_Custom_Control extends \Elementor\Base_Data_Control {

    public function get_type(): string {
        return 'my-custom-control';
    }

    protected function get_default_settings(): array {
        return ['my_setting' => 'default_value'];
    }

    public function get_default_value(): string {
        return '';
    }

    public function content_template(): void {
        $control_uid = $this->get_control_uid();
        ?>
        <div class="elementor-control-field">
            <# if (data.label) { #>
                <label for="<?php echo $control_uid; ?>" class="elementor-control-title">{{{ data.label }}}</label>
            <# } #>
            <div class="elementor-control-input-wrapper">
                <input id="<?php echo $control_uid; ?>" type="text" data-setting="{{ data.name }}" />
            </div>
        </div>
        <# if (data.description) { #>
            <div class="elementor-control-field-description">{{{ data.description }}}</div>
        <# } #>
        <?php
    }

    public function enqueue(): void {
        wp_register_style('my-control-css', plugins_url('assets/css/control.css', __FILE__));
        wp_enqueue_style('my-control-css');
        wp_register_script('my-control-js', plugins_url('assets/js/control.js', __FILE__));
        wp_enqueue_script('my-control-js');
    }
}
```

### Registration
```php
add_action('elementor/controls/register', function($controls_manager) {
    require_once(__DIR__ . '/controls/my-custom-control.php');
    $controls_manager->register(new \My_Custom_Control());
});
```

### Required Methods
| Method | Purpose |
|---|---|
| `get_type(): string` | Unique control identifier |
| `content_template(): void` | JS/HTML template for panel UI (uses `data` object) |
| `get_default_settings(): array` | Default control settings |
| `get_default_value()` | Default stored value |
| `enqueue(): void` | Register/enqueue CSS & JS assets |

## 12. Common Mistakes

| Mistake | Correct Approach |
|---|---|
| Using `add_control()` outside a section | Always wrap in `start_controls_section()` / `end_controls_section()` |
| Using `selector` (singular) on non-group controls | Non-group controls use `selectors` (plural, array). Group controls use `selector` (singular, string). |
| Forgetting `{{WRAPPER}}` in selectors | Always prefix selectors with `{{WRAPPER}}` for scoped styles |
| Using `{{VALUE}}` with SLIDER control | SLIDER returns array; use `{{SIZE}}{{UNIT}}` |
| Using `{{VALUE}}` with DIMENSIONS control | Use `{{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}}` |
| Using `{{VALUE}}` with URL/MEDIA control | Use `{{URL}}` for the URL component |
| Nesting `start_controls_section` inside another | Sections cannot be nested. End one before starting another. |
| Putting tabs outside a section | `start_controls_tabs()` must be inside a section |
| Repeater inner field depending on outer control | Conditional display across repeater levels is not supported |
| Using `selectors_dictionary` with array-returning controls | Only works with string-value controls (TEXT, SELECT, CHOOSE, etc.) |
| Not using `esc_html__()` for labels | Always internationalize user-facing strings |
| Setting SWITCHER default to `true` or `1` | SWITCHER returns a string; default should be `'yes'` or `''` |
| Using `innerHTML =` on frontend | Use Elementor's rendering patterns; may be blocked by CSP |
| Setting REPEATER `prevent_empty` wrong | Defaults to `true`; set `false` if all rows should be deletable |
