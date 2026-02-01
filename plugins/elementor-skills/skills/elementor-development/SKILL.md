---
name: elementor-development
description: Use when building Elementor addons, creating custom widgets, registering/unregistering components, managing scripts and styles, working with Elementor CLI, or handling deprecations
---

# Elementor Addon & Widget Development

Consolidated reference for addon architecture, widget creation, manager registration,
scripts/styles, data structure, deprecations, and CLI commands.

---

## 1. Addon Structure

### Plugin Header

Every Elementor addon requires standard WordPress headers plus optional Elementor headers.

```php
<?php
/**
 * Plugin Name:      Elementor Test Addon
 * Description:      Custom Elementor addon.
 * Plugin URI:       https://elementor.com/
 * Version:          1.0.0
 * Author:           Elementor Developer
 * Author URI:       https://developers.elementor.com/
 * Text Domain:      elementor-test-addon
 * Requires Plugins: elementor
 *
 * Elementor tested up to: 3.25.0
 * Elementor Pro tested up to: 3.25.0
 */

defined( 'ABSPATH' ) || exit;

function elementor_test_addon() {
    require_once __DIR__ . '/includes/plugin.php';
    \Elementor_Test_Addon\Plugin::instance();
}
add_action( 'plugins_loaded', 'elementor_test_addon' );
```

### Main Class (Singleton + Compatibility Checks)

```php
namespace Elementor_Test_Addon;

final class Plugin {

    const VERSION                  = '1.0.0';
    const MINIMUM_ELEMENTOR_VERSION = '3.20.0';
    const MINIMUM_PHP_VERSION      = '7.4';

    private static $_instance = null;

    public static function instance() {
        if ( is_null( self::$_instance ) ) {
            self::$_instance = new self();
        }
        return self::$_instance;
    }

    public function __construct() {
        if ( $this->is_compatible() ) {
            add_action( 'elementor/init', [ $this, 'init' ] );
        }
    }

    public function is_compatible(): bool {
        if ( ! did_action( 'elementor/loaded' ) ) {
            add_action( 'admin_notices', [ $this, 'admin_notice_missing_main_plugin' ] );
            return false;
        }
        if ( ! version_compare( ELEMENTOR_VERSION, self::MINIMUM_ELEMENTOR_VERSION, '>=' ) ) {
            add_action( 'admin_notices', [ $this, 'admin_notice_minimum_elementor_version' ] );
            return false;
        }
        if ( version_compare( PHP_VERSION, self::MINIMUM_PHP_VERSION, '<' ) ) {
            add_action( 'admin_notices', [ $this, 'admin_notice_minimum_php_version' ] );
            return false;
        }
        return true;
    }

    public function init(): void {
        add_action( 'elementor/widgets/register', [ $this, 'register_widgets' ] );
        add_action( 'elementor/controls/register', [ $this, 'register_controls' ] );
    }

    public function register_widgets( $widgets_manager ): void {
        require_once __DIR__ . '/widgets/widget-1.php';
        $widgets_manager->register( new \Elementor_Widget_1() );
    }

    public function register_controls( $controls_manager ): void {
        require_once __DIR__ . '/controls/control-1.php';
        $controls_manager->register( new \Elementor_Control_1() );
    }
}
```

### Folder Structure

```
elementor-test-addon/
  elementor-test-addon.php      # Main file with headers
  includes/
    plugin.php                  # Main class (singleton)
    widgets/                    # Widget classes
    controls/                   # Custom controls
    dynamic-tags/               # Dynamic tag classes
    finder/                     # Finder category classes
  assets/
    js/                         # Frontend/editor JS
    css/                        # Frontend/editor CSS
    images/
```

---

## 2. Widget Development

### Widget Class Skeleton

```php
class Elementor_Test_Widget extends \Elementor\Widget_Base {

    // --- Required ---
    public function get_name(): string {
        return 'test_widget';
    }

    public function get_title(): string {
        return esc_html__( 'Test Widget', 'textdomain' );
    }

    public function get_icon(): string {
        return 'eicon-code';
    }

    public function get_categories(): array {
        return [ 'general' ];
    }

    // --- Optional ---
    public function get_keywords(): array {
        return [ 'test', 'example' ];
    }

    public function get_custom_help_url(): string {
        return 'https://example.com/widget-help';
    }

    public function get_script_depends(): array {
        return [ 'widget-custom-script' ];
    }

    public function get_style_depends(): array {
        return [ 'widget-custom-style' ];
    }

    public function has_widget_inner_wrapper(): bool {
        return false; // DOM optimization: single wrapper
    }

    protected function is_dynamic_content(): bool {
        return false; // Enable output caching for static content
    }

    protected function get_upsale_data(): array {
        return [
            'condition'   => ! \Elementor\Utils::has_pro(),
            'image'       => esc_url( ELEMENTOR_ASSETS_URL . 'images/go-pro.svg' ),
            'image_alt'   => esc_attr__( 'Upgrade', 'textdomain' ),
            'title'       => esc_html__( 'Promotion heading', 'textdomain' ),
            'description' => esc_html__( 'Get the premium version.', 'textdomain' ),
            'upgrade_url' => esc_url( 'https://example.com/upgrade-to-pro/' ),
            'upgrade_text' => esc_html__( 'Upgrade Now', 'textdomain' ),
        ];
    }

    protected function register_controls(): void { /* see below */ }
    protected function render(): void { /* see below */ }
    protected function content_template(): void { /* see below */ }
}
```

### Register Custom Widget Category

```php
function add_elementor_widget_categories( $elements_manager ) {
    $elements_manager->add_category( 'my-category', [
        'title' => esc_html__( 'My Category', 'textdomain' ),
        'icon'  => 'fa fa-plug',
    ] );
}
add_action( 'elementor/elements/categories_registered', 'add_elementor_widget_categories' );
```

### register_controls()

```php
protected function register_controls(): void {

    // --- Content Tab ---
    $this->start_controls_section( 'content_section', [
        'label' => esc_html__( 'Content', 'textdomain' ),
        'tab'   => \Elementor\Controls_Manager::TAB_CONTENT,
    ] );

    $this->add_control( 'title', [
        'type'        => \Elementor\Controls_Manager::TEXT,
        'label'       => esc_html__( 'Title', 'textdomain' ),
        'placeholder' => esc_html__( 'Enter your title', 'textdomain' ),
    ] );

    $this->add_control( 'image', [
        'type'    => \Elementor\Controls_Manager::MEDIA,
        'label'   => esc_html__( 'Image', 'textdomain' ),
        'default' => [ 'url' => \Elementor\Utils::get_placeholder_image_src() ],
    ] );

    $this->add_group_control( \Elementor\Group_Control_Image_Size::get_type(), [
        'name'    => 'image',
        'default' => 'large',
    ] );

    $this->add_control( 'link', [
        'type'        => \Elementor\Controls_Manager::URL,
        'label'       => esc_html__( 'Link', 'textdomain' ),
        'placeholder' => esc_html__( 'https://your-link.com', 'textdomain' ),
    ] );

    // Repeater
    $repeater = new \Elementor\Repeater();
    $repeater->add_control( 'text', [
        'type'    => \Elementor\Controls_Manager::TEXT,
        'label'   => esc_html__( 'Text', 'textdomain' ),
        'default' => esc_html__( 'List Item', 'textdomain' ),
    ] );
    $repeater->add_control( 'link', [
        'type'  => \Elementor\Controls_Manager::URL,
        'label' => esc_html__( 'Link', 'textdomain' ),
    ] );
    $this->add_control( 'list', [
        'type'        => \Elementor\Controls_Manager::REPEATER,
        'label'       => esc_html__( 'List', 'textdomain' ),
        'fields'      => $repeater->get_controls(),
        'title_field' => '{{{ text }}}',
    ] );

    $this->end_controls_section();

    // --- Style Tab ---
    $this->start_controls_section( 'style_section', [
        'label' => esc_html__( 'Style', 'textdomain' ),
        'tab'   => \Elementor\Controls_Manager::TAB_STYLE,
    ] );

    $this->add_control( 'title_color', [
        'type'      => \Elementor\Controls_Manager::COLOR,
        'label'     => esc_html__( 'Title Color', 'textdomain' ),
        'global'    => [
            'default' => \Elementor\Core\Kits\Documents\Tabs\Global_Colors::COLOR_PRIMARY,
        ],
        'selectors' => [ '{{WRAPPER}} .title' => 'color: {{VALUE}};' ],
    ] );

    $this->add_group_control( \Elementor\Group_Control_Typography::get_type(), [
        'name'     => 'title_typography',
        'global'   => [
            'default' => \Elementor\Core\Kits\Documents\Tabs\Global_Typography::TYPOGRAPHY_PRIMARY,
        ],
        'selector' => '{{WRAPPER}} .title',
    ] );

    $this->end_controls_section();
}
```

### Selector Tokens

| Token | Description |
|-------|-------------|
| `{{WRAPPER}}` | Widget wrapper element |
| `{{VALUE}}` | Control value |
| `{{UNIT}}` | Unit control value |
| `{{URL}}` | URL from media control |
| `{{SELECTOR}}` | Group control CSS selector |

### render() -- PHP Frontend

```php
protected function render(): void {
    $settings = $this->get_settings_for_display();

    if ( empty( $settings['title'] ) ) {
        return;
    }

    // Render attributes
    $this->add_render_attribute( 'wrapper', 'class', 'my-widget-wrapper' );
    $this->add_inline_editing_attributes( 'title', 'none' );

    // Link attributes
    if ( ! empty( $settings['link']['url'] ) ) {
        $this->add_link_attributes( 'link', $settings['link'] );
    }
    ?>
    <div <?php $this->print_render_attribute_string( 'wrapper' ); ?>>
        <h3 <?php $this->print_render_attribute_string( 'title' ); ?>>
            <?php echo esc_html( $settings['title'] ); ?>
        </h3>
        <?php
        // Image with Group_Control_Image_Size
        echo \Elementor\Group_Control_Image_Size::get_attachment_image_html( $settings );

        // Repeater
        if ( $settings['list'] ) : ?>
            <ul>
            <?php foreach ( $settings['list'] as $index => $item ) : ?>
                <li>
                <?php if ( ! empty( $item['link']['url'] ) ) :
                    $this->add_link_attributes( "link_{$index}", $item['link'] ); ?>
                    <a <?php $this->print_render_attribute_string( "link_{$index}" ); ?>>
                        <?php echo esc_html( $item['text'] ); ?>
                    </a>
                <?php else :
                    echo esc_html( $item['text'] );
                endif; ?>
                </li>
            <?php endforeach; ?>
            </ul>
        <?php endif; ?>
    </div>
    <?php
}
```

### content_template() -- JS Editor Preview

Template syntax: `<# ... #>` for logic, `{{ }}` for escaped output, `{{{ }}}` for unescaped output.

```php
protected function content_template(): void {
    ?>
    <#
    if ( '' === settings.title ) {
        return;
    }

    view.addRenderAttribute( 'wrapper', 'class', 'my-widget-wrapper' );
    view.addInlineEditingAttributes( 'title', 'none' );
    #>
    <div {{{ view.getRenderAttributeString( 'wrapper' ) }}}>
        <h3 {{{ view.getRenderAttributeString( 'title' ) }}}>
            {{ settings.title }}
        </h3>

        <# /* Advanced image rendering */ #>
        <#
        const image = {
            id: settings.image.id,
            url: settings.image.url,
            size: settings.image_size,
            dimension: settings.image_custom_dimension,
            model: view.getEditModel()
        };
        const image_url = elementor.imagesManager.getImageUrl( image );
        if ( '' !== image_url ) { #>
            <img src="{{{ image_url }}}">
        <# } #>

        <# if ( settings.list.length ) { #>
        <ul>
        <# _.each( settings.list, function( item, index ) { #>
            <li>
            <# if ( item.link && item.link.url ) { #>
                <a href="{{{ item.link.url }}}">{{{ item.text }}}</a>
            <# } else { #>
                {{{ item.text }}}
            <# } #>
            </li>
        <# } ); #>
        </ul>
        <# } #>
    </div>
    <?php
}
```

### Inline Editing Toolbars

| Mode | Toolbar | Use Case |
|------|---------|----------|
| `'none'` | No toolbar | Plain text headings |
| `'basic'` | Bold, italic, underline | Short descriptions |
| `'advanced'` | Full (links, headings, lists) | Rich text content |

### Render Attributes (PHP)

```php
$this->add_render_attribute( 'wrapper', [
    'id'    => 'custom-widget-id',
    'class' => [ 'wrapper-class', $settings['custom_class'] ],
    'role'  => $settings['role'],
] );

// Output: echo or print
echo $this->get_render_attribute_string( 'wrapper' );
$this->print_render_attribute_string( 'wrapper' );
```

### Render Attributes (JS)

```js
view.addRenderAttribute( 'wrapper', {
    'id': 'custom-widget-id',
    'class': [ 'wrapper-class', settings.custom_class ],
    'role': settings.role,
} );
// Output
{{{ view.getRenderAttributeString( 'wrapper' ) }}}
```

---

## 3. Manager Registration

### Registration Hooks Reference

| Component | Hook | Manager Type | Method |
|-----------|------|-------------|--------|
| Widgets | `elementor/widgets/register` | `\Elementor\Widgets_Manager` | `register()` / `unregister()` |
| Controls | `elementor/controls/register` | `\Elementor\Controls_Manager` | `register()` / `unregister()` |
| Dynamic Tags | `elementor/dynamic_tags/register` | `\Elementor\Core\DynamicTags\Manager` | `register()` / `unregister()` |
| Finder | `elementor/finder/register` | `Categories_Manager` | `register()` / `unregister()` |
| Categories | `elementor/elements/categories_registered` | `Elements_Manager` | `add_category()` |

### Register Widgets

```php
function register_new_widgets( $widgets_manager ) {
    require_once __DIR__ . '/widgets/widget-1.php';
    $widgets_manager->register( new \Elementor_Widget_1() );
}
add_action( 'elementor/widgets/register', 'register_new_widgets' );
```

### Unregister Widgets

```php
function unregister_widgets( $widgets_manager ) {
    $widgets_manager->unregister( 'heading' );
    $widgets_manager->unregister( 'image' );
}
add_action( 'elementor/widgets/register', 'unregister_widgets' );
```

### Register/Unregister Controls

```php
function register_new_controls( $controls_manager ) {
    require_once __DIR__ . '/controls/control-1.php';
    $controls_manager->register( new \Elementor_Control_1() );
}
add_action( 'elementor/controls/register', 'register_new_controls' );

function unregister_controls( $controls_manager ) {
    $controls_manager->unregister( 'control-1' );
}
add_action( 'elementor/controls/register', 'unregister_controls' );
```

### Register/Unregister Dynamic Tags

```php
function register_dynamic_tags( $dynamic_tags_manager ) {
    require_once __DIR__ . '/dynamic-tags/tag-1.php';
    $dynamic_tags_manager->register( new \Elementor_Dynamic_Tag_1() );
}
add_action( 'elementor/dynamic_tags/register', 'register_dynamic_tags' );

function unregister_dynamic_tags( $dynamic_tags_manager ) {
    $dynamic_tags_manager->unregister( 'dynamic-tag-1' );
}
add_action( 'elementor/dynamic_tags/register', 'unregister_dynamic_tags' );
```

### Register/Unregister Finder Categories

```php
function register_finder_categories( $finder_manager ) {
    require_once __DIR__ . '/finder/finder-1.php';
    $finder_manager->register( new \Elementor_Finder_Category_1() );
}
add_action( 'elementor/finder/register', 'register_finder_categories' );

function unregister_finder_categories( $finder_manager ) {
    $finder_manager->unregister( 'finder-category-1' );
}
add_action( 'elementor/finder/register', 'unregister_finder_categories' );
```

---

## 4. Scripts & Styles

### Frontend Hooks

| Hook | Purpose |
|------|---------|
| `elementor/frontend/before_register_scripts` | Register scripts before Elementor |
| `elementor/frontend/after_register_scripts` | Register scripts after Elementor |
| `elementor/frontend/before_enqueue_scripts` | Enqueue scripts before Elementor |
| `elementor/frontend/after_enqueue_scripts` | Enqueue scripts after Elementor |
| `elementor/frontend/before_register_styles` | Register styles before Elementor |
| `elementor/frontend/after_register_styles` | Register styles after Elementor |
| `elementor/frontend/before_enqueue_styles` | Enqueue styles before Elementor |
| `elementor/frontend/after_enqueue_styles` | Enqueue styles after Elementor |

### Editor Hooks

| Hook | Purpose |
|------|---------|
| `elementor/editor/before_enqueue_scripts` | Enqueue editor scripts (before) |
| `elementor/editor/after_enqueue_scripts` | Enqueue editor scripts (after) |
| `elementor/editor/before_enqueue_styles` | Enqueue editor styles (before) |
| `elementor/editor/after_enqueue_styles` | Enqueue editor styles (after) |

### Preview Hooks

| Hook | Purpose |
|------|---------|
| `elementor/preview/enqueue_scripts` | Enqueue preview scripts |
| `elementor/preview/enqueue_styles` | Enqueue preview styles |

### Frontend Registration Pattern

```php
function my_plugin_frontend_scripts() {
    wp_register_script( 'my-widget-script', plugins_url( 'assets/js/widget.js', __FILE__ ) );
    wp_register_style( 'my-widget-style', plugins_url( 'assets/css/widget.css', __FILE__ ) );
}
add_action( 'wp_enqueue_scripts', 'my_plugin_frontend_scripts' );
```

### Widget-Level Dependencies

Declare in the widget class; Elementor loads them only when the widget is used.

```php
public function get_script_depends(): array {
    return [ 'my-widget-script', 'external-library' ];
}

public function get_style_depends(): array {
    return [ 'my-widget-style', 'external-framework' ];
}
```

### Control-Level Enqueue

```php
class My_Control extends \Elementor\Base_Control {

    protected function enqueue(): void {
        wp_enqueue_script( 'control-script' );
        wp_enqueue_style( 'control-style' );
    }
}
```

---

## 5. Data Structure

### JSON Document Format

```json
{
    "title": "Page Title",
    "type": "page",
    "version": "0.4",
    "page_settings": {},
    "content": []
}
```

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Template title |
| `type` | string | `page`, `post`, `header`, `footer`, `popup`, `error-404` |
| `version` | string | Data structure version (`0.4` is current) |
| `page_settings` | object | Page-level settings (background, margin, padding, etc.) |
| `content` | array | Top-level elements |

### Element Structure

```json
{
    "id": "6af611eb",
    "elType": "container",
    "isInner": false,
    "settings": {},
    "elements": [
        {
            "id": "6a637978",
            "elType": "widget",
            "widgetType": "heading",
            "isInner": false,
            "settings": {
                "title": "Hello World",
                "align": "center"
            },
            "elements": []
        }
    ]
}
```

| Field | Type | Values |
|-------|------|--------|
| `elType` | string | `container` or `widget` |
| `widgetType` | string | Widget name (only for `elType: widget`) |
| `isInner` | boolean | Whether the element is nested |
| `settings` | object | Control values; responsive keys use `_tablet`/`_mobile` suffixes |
| `elements` | array | Nested child elements |

### Responsive Settings

Dimension-type controls store responsive variants:

```json
{
    "_padding": { "unit": "px", "top": "100", "right": "0", "bottom": "100", "left": "0", "isLinked": false },
    "_padding_tablet": { "unit": "px", "top": "50", "right": "0", "bottom": "50", "left": "0", "isLinked": false }
}
```

---

## 6. Deprecations

### Deprecation Timeline

| Phase | Duration | Behavior |
|-------|----------|----------|
| Soft deprecation | 4 major versions | Browser console notices only |
| Hard deprecation | 4 major versions | PHP `E_USER_DEPRECATED` errors |
| Deletion | After 8+ major versions | Code removed entirely |

### Key Migrations

```diff
# Underscore prefix methods (removed)
- protected function _register_controls(): void {}
+ protected function register_controls(): void {}
- protected function _render(): void {}
+ protected function render(): void {}
- protected function _content_template(): void {}
+ protected function content_template(): void {}

# Widget registration hook + method
- add_action( 'elementor/widgets/widgets_registered', ... );
+ add_action( 'elementor/widgets/register', ... );
- $widgets_manager->register_widget_type( new Widget() );
+ $widgets_manager->register( new Widget() );

# Control registration hook + method
- add_action( 'elementor/controls/controls_registered', ... );
+ add_action( 'elementor/controls/register', ... );
- $controls_manager->register_control( 'name', new Control() );
+ $controls_manager->register( new Control() );

# Schemes replaced by Globals
- 'scheme' => \Elementor\Core\Schemes\Typography::TYPOGRAPHY_1,
+ 'global' => [ 'default' => \Elementor\Core\Kits\Documents\Tabs\Global_Typography::TYPOGRAPHY_PRIMARY ],

- 'scheme' => [ 'type' => Color::get_type(), 'value' => Color::COLOR_1 ],
+ 'global' => [ 'default' => \Elementor\Core\Kits\Documents\Tabs\Global_Colors::COLOR_PRIMARY ],
```

### Using the Deprecation API in Your Addon

```php
use Elementor\Plugin;

// Deprecated function
Plugin::$instance->modules_manager->get_modules( 'dev-tools' )->deprecation->deprecated_function(
    'old_method()', '3.5.0', 'new_method()'
);

// Deprecated argument
Plugin::instance()->modules_manager->get_modules( 'dev-tools' )->deprecation->deprecated_argument(
    '$id', '3.5.0'
);

// Deprecated action hook
Plugin::$instance->modules_manager->get_modules( 'dev-tools' )->deprecation->do_deprecated_action(
    'elementor/old/action', [ $args ], '3.5.0', 'elementor/new/action'
);

// Deprecated filter hook
Plugin::$instance->modules_manager->get_modules( 'dev-tools' )->deprecation->apply_deprecated_filter(
    'elementor/old/filter', [ $args ], '3.5.0', 'elementor/new/filter'
);
```

---

## 7. CLI Commands

### Quick Reference

| Command | Description |
|---------|-------------|
| `wp elementor system-info` | Display system info (JSON) |
| `wp elementor flush-css [--regenerate] [--network]` | Flush/regenerate CSS files |
| `wp elementor replace-urls <old> <new> [--force]` | Replace URLs in Elementor data |
| `wp elementor update db [--force] [--network]` | Run Elementor DB update |
| `wp elementor-pro update db [--force] [--network]` | Run Elementor Pro DB update |
| `wp elementor library sync [--force] [--network]` | Sync template library |
| `wp elementor library connect --user=<u> --token=<t>` | Connect library account |
| `wp elementor library disconnect --user=<u>` | Disconnect library account |
| `wp elementor library import <file> [--returnType=ids]` | Import template JSON |
| `wp elementor library import-dir <dir>` | Import all templates in directory |
| `wp elementor kit export <path.zip> [--include=...]` | Export site kit |
| `wp elementor kit import <path.zip> [--include=...] [--overrideConditions=...]` | Import site kit |
| `wp elementor experiments status <name>` | Check experiment status |
| `wp elementor experiments activate <name>` | Activate experiment |
| `wp elementor experiments deactivate <name>` | Deactivate experiment |
| `wp elementor-pro license activate <key>` | Activate Pro license |
| `wp elementor-pro license deactivate` | Deactivate Pro license |
| `wp elementor-pro theme-builder clear-conditions` | Clear theme builder conditions |

### Common Workflows

```bash
# Flush and regenerate CSS after style changes
wp elementor flush-css --regenerate

# Domain migration
wp elementor replace-urls http://old.example.com https://new.example.com

# Export full kit for staging
wp elementor kit export /tmp/my-site-kit.zip --include=site-settings,content,templates

# Import kit on new environment
wp elementor kit import /tmp/my-site-kit.zip --include=site-settings,content

# Install via Composer
composer require wpackagist-plugin/elementor
composer config --global --auth http-basic.composer.elementor.com token <license-key>
composer require elementor/elementor-pro
```

---

## 8. Common Mistakes

| Mistake | Fix |
|---------|-----|
| Using `elementor/widgets/widgets_registered` hook | Use `elementor/widgets/register` (old hook deprecated) |
| Calling `register_widget_type()` | Use `register()` on the widgets manager |
| Using `scheme` for colors/typography | Use `global` with `Global_Colors`/`Global_Typography` constants |
| Using `_register_controls()` with underscore prefix | Use `register_controls()` (no underscore) |
| Skipping `did_action('elementor/loaded')` check | Always verify Elementor is loaded before using its classes |
| Missing `Requires Plugins: elementor` header | Add it so WordPress enforces Elementor dependency |
| Using `{{ }}` for HTML output in JS templates | Use `{{{ }}}` (triple) for unescaped HTML; `{{ }}` escapes output |
| Not declaring widget script/style dependencies | Implement `get_script_depends()` / `get_style_depends()` |
| Enqueueing scripts globally instead of per-widget | Register with `wp_register_script`, declare via `get_script_depends()` |
| Using `innerHTML =` in editor JS | Use Elementor template syntax or DOM methods |
| Not using `esc_html__()` for translatable strings | Always wrap user-visible strings in localization functions |
| Missing `defined('ABSPATH') \|\| exit;` guard | Add to every PHP file to prevent direct access |
| Using `has_widget_inner_wrapper` returning `true` without need | Return `false` to reduce DOM nodes (optimization) |
| Not implementing `content_template()` | Without it, editor preview requires server round-trip on every change |
| Using `add_render_attribute` inside `content_template()` | Use `view.addRenderAttribute()` in JS templates |
