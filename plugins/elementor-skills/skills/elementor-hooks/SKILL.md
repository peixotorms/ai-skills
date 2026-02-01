---
name: elementor-hooks
description: Use when hooking into Elementor lifecycle events, injecting controls into existing widgets, filtering widget output, adding custom JS hooks, modifying editor behavior, or using the JS Commands API
---

# Elementor Hooks Reference

## 1. PHP Action Hooks

### Lifecycle

| Hook Name | Parameters | Description |
|-----------|-----------|-------------|
| `elementor/loaded` | none | Fires when Elementor plugin is loaded, before components initialize. Use for checking Elementor availability. |
| `elementor/init` | none | Fires when Elementor is fully loaded. Use for registering custom functionality. |

```php
// Wait for Elementor to fully load before running addon code
add_action( 'elementor/loaded', function() {
    // Elementor is available but not yet initialized
});

add_action( 'elementor/init', function() {
    // Elementor is fully initialized - safe to use all APIs
});
```

### Registration

| Hook Name | Parameters | Description |
|-----------|-----------|-------------|
| `elementor/widgets/register` | `Widgets_Manager $widgets_manager` | Register custom widgets |
| `elementor/controls/register` | `Controls_Manager $controls_manager` | Register custom controls |
| `elementor/dynamic_tags/register` | `Dynamic_Tags_Manager $dynamic_tags_manager` | Register dynamic tags |
| `elementor/finder/register` | `Categories_Manager $categories_manager` | Register Finder categories |
| `elementor/elements/categories_registered` | `Elements_Manager $elements_manager` | Register widget categories |
| `elementor/documents/register` | `Documents_Manager $documents_manager` | Register document types |

```php
// Register a custom widget
add_action( 'elementor/widgets/register', function( $widgets_manager ) {
    $widgets_manager->register( new \My_Custom_Widget() );
});

// Register a custom widget category
add_action( 'elementor/elements/categories_registered', function( $elements_manager ) {
    $elements_manager->add_category( 'my-category', [
        'title' => esc_html__( 'My Category', 'textdomain' ),
        'icon'  => 'fa fa-plug',
    ]);
});
```

### Frontend Scripts and Styles

| Hook Name | Parameters | Description |
|-----------|-----------|-------------|
| `elementor/frontend/after_register_scripts` | none | After frontend scripts registered |
| `elementor/frontend/before_register_scripts` | none | Before frontend scripts registered |
| `elementor/frontend/after_register_styles` | none | After frontend styles registered |
| `elementor/frontend/before_register_styles` | none | Before frontend styles registered |
| `elementor/frontend/after_enqueue_scripts` | none | After frontend scripts enqueued |
| `elementor/frontend/before_enqueue_scripts` | none | Before frontend scripts enqueued |
| `elementor/frontend/after_enqueue_styles` | none | After frontend styles enqueued |
| `elementor/frontend/before_enqueue_styles` | none | Before frontend styles enqueued |

```php
// Register a frontend script
add_action( 'elementor/frontend/after_register_scripts', function() {
    wp_register_script( 'my-script', plugins_url( 'js/my-script.js', __FILE__ ), [ 'jquery' ], '1.0.0', true );
});

// Enqueue a frontend style
add_action( 'elementor/frontend/after_enqueue_styles', function() {
    wp_enqueue_style( 'my-style', plugins_url( 'css/my-style.css', __FILE__ ) );
});
```

### Editor Scripts and Styles

| Hook Name | Parameters | Description |
|-----------|-----------|-------------|
| `elementor/editor/before_enqueue_scripts` | none | Before editor scripts enqueued |
| `elementor/editor/after_enqueue_scripts` | none | After editor scripts enqueued |
| `elementor/editor/after_enqueue_styles` | none | After editor styles enqueued |
| `elementor/editor/before_enqueue_styles` | none | Before editor styles enqueued |

```php
add_action( 'elementor/editor/after_enqueue_scripts', function() {
    wp_enqueue_script( 'my-editor-script', plugins_url( 'js/editor.js', __FILE__ ), [ 'elementor-editor' ], '1.0.0', true );
});
```

### Preview Scripts and Styles

| Hook Name | Parameters | Description |
|-----------|-----------|-------------|
| `elementor/preview/enqueue_scripts` | none | Enqueue scripts in the preview iframe |
| `elementor/preview/enqueue_styles` | none | Enqueue styles in the preview iframe |

### Widget Rendering

| Hook Name | Parameters | Description |
|-----------|-----------|-------------|
| `elementor/widget/{$widget_name}/skins_init` | `Widget_Base $widget` | Register custom skins for a widget |
| `elementor/widget/before_render_content` | `Widget_Base $widget` | Before widget content renders |
| `elementor/frontend/before_render` | `Element_Base $element` | Before any element renders (all types) |
| `elementor/frontend/after_render` | `Element_Base $element` | After any element renders (all types) |
| `elementor/frontend/{$element_type}/before_render` | `Element_Base $element` | Before specific element type renders |
| `elementor/frontend/{$element_type}/after_render` | `Element_Base $element` | After specific element type renders |

Element types for `{$element_type}`: `section`, `column`, `container`, `widget`

```php
// Add custom skin to Google Maps widget
add_action( 'elementor/widget/google_maps/skins_init', function( $widget ) {
    $widget->add_skin( new \MySkins\Skin_Dark_Map( $widget ) );
});

// Add a custom attribute to elements with a specific setting
add_action( 'elementor/frontend/before_render', function( $element ) {
    if ( ! $element->get_settings( 'my-custom-setting' ) ) {
        return;
    }
    $element->add_render_attribute( '_wrapper', [
        'class'                => 'my-custom-class',
        'data-my-custom-value' => 'my-custom-data-value',
    ]);
});

// Add HTML before all widgets
add_action( 'elementor/frontend/widget/before_render', function( $element ) {
    echo '<div class="before-widget">Before widget</div>';
});
```

### Document and Editor Save

| Hook Name | Parameters | Description |
|-----------|-----------|-------------|
| `elementor/documents/register_controls` | `Document $document` | Register controls for documents/page settings |
| `elementor/editor/after_save` | `int $post_id, array $editor_data` | After user saves editor data |
| `elementor/document/before_save` | `Document $document, array $data` | Before document saves |
| `elementor/document/after_save` | `Document $document, array $data` | After document saves |

```php
add_action( 'elementor/editor/after_save', function( $post_id, $editor_data ) {
    // Clear cache after Elementor save
    if ( get_post_status( $post_id ) === 'publish' ) {
        clear_cache_for_post( $post_id );
    }
}, 10, 2 );
```

### CSS File Hooks

| Hook Name | Parameters | Description |
|-----------|-----------|-------------|
| `elementor/element/parse_css` | `Post $post_css, Element_Base $element` | Add custom CSS rules to element CSS |
| `elementor/element/before_parse_css` | `Post $post_css, Element_Base $element` | Before CSS is parsed |
| `elementor/css-file/{$name}/enqueue` | `CSS_File $css_file` | When a CSS file is enqueued |
| `elementor/core/files/clear_cache` | none | When CSS cache is cleared |

```php
add_action( 'elementor/element/parse_css', function( $post_css_file, $element ) {
    $post_css_file->get_stylesheet()->add_rules(
        $element->get_unique_selector(),
        [ 'width' => '50px', 'height' => '50px' ]
    );
}, 10, 2 );
```

### Forms (Pro)

| Hook Name | Parameters | Description |
|-----------|-----------|-------------|
| `elementor_pro/forms/validation` | `Form_Record $record, Ajax_Handler $ajax_handler` | Validate all form fields |
| `elementor_pro/forms/validation/{$field_type}` | `array $field, Form_Record $record, Ajax_Handler $ajax_handler` | Validate specific field type |
| `elementor_pro/forms/process` | `Form_Record $record, Ajax_Handler $ajax_handler` | After fields validated, process form |
| `elementor_pro/forms/process/{$field_type}` | `array $field, Form_Record $record, Ajax_Handler $ajax_handler` | Process specific field type |
| `elementor_pro/forms/new_record` | `Form_Record $record, Ajax_Handler $ajax_handler` | After form actions run |
| `elementor_pro/forms/form_submitted` | `Forms\Module $module` | When form POST received |
| `elementor_pro/forms/mail_sent` | `array $settings, Form_Record $record` | After form email sent |
| `elementor_pro/forms/webhooks/response` | `array\|WP_Error $response, Form_Record $record` | Handle webhook response |

```php
// Validate a custom field format
add_action( 'elementor_pro/forms/validation', function( $record, $ajax_handler ) {
    $fields = $record->get_field( [ 'id' => 'ticket_id' ] );
    if ( empty( $fields ) ) return;
    $field = current( $fields );
    if ( 1 !== preg_match( '/^\w{3}-\w{4}$/', $field['value'] ) ) {
        $ajax_handler->add_error( $field['id'], 'Invalid Ticket ID, must be XXX-XXXX' );
    }
}, 10, 2 );

// Send data to external API after form submission
add_action( 'elementor_pro/forms/new_record', function( $record, $handler ) {
    if ( 'MY_FORM_NAME' !== $record->get_form_settings( 'form_name' ) ) return;
    $raw_fields = $record->get( 'fields' );
    $fields = [];
    foreach ( $raw_fields as $id => $field ) {
        $fields[ $id ] = $field['value'];
    }
    wp_remote_post( 'https://api.example.com/', [ 'body' => $fields ] );
}, 10, 2 );
```

### Query (Pro)

| Hook Name | Parameters | Description |
|-----------|-----------|-------------|
| `elementor/query/{$query_id}` | `WP_Query $query, Widget_Base $widget` | Filter Posts/Portfolio widget query. Set Query ID in widget settings. |

```php
add_action( 'elementor/query/my_custom_filter', function( $query ) {
    $query->set( 'post_type', [ 'custom-post-type1', 'custom-post-type2' ] );
});
```

### Other Important Actions

| Hook Name | Parameters | Description |
|-----------|-----------|-------------|
| `elementor/ajax/register_actions` | `Ajax_Manager $ajax_manager` | Register AJAX handlers |
| `elementor/editor/init` | none | Editor initialization |
| `elementor/editor/footer` | none | Editor footer output |
| `elementor/preview/init` | none | Preview initialization |
| `elementor/kit/register_tabs` | `Kit $kit` | Register kit (site settings) tabs |
| `elementor/page_templates/canvas/before_content` | none | Before canvas template content |
| `elementor/page_templates/canvas/after_content` | none | After canvas template content |
| `elementor/template-library/after_save_template` | `int $template_id, array $data` | After template saved |
| `elementor/element/after_add_attributes` | `Element_Base $element` | After render attributes added |
| `elementor/experiments/default-features-registered` | `Experiments_Manager $manager` | Register experiments |

---

## 2. PHP Filter Hooks

### Widget Output Filters

| Filter Name | Parameters | Description |
|-------------|-----------|-------------|
| `elementor/widget/render_content` | `string $content, Widget_Base $widget` | Filter widget HTML on frontend |
| `elementor/{$element_type}/print_template` | `string $template, Widget_Base $widget` | Filter widget JS template in preview |
| `elementor/frontend/the_content` | `string $content` | Filter entire Elementor page output |
| `elementor/frontend/{$element_type}/should_render` | `bool $should_render, Element_Base $element` | Control whether element renders |

```php
// Add icon to heading widgets with external links
add_filter( 'elementor/widget/render_content', function( $content, $widget ) {
    if ( 'heading' === $widget->get_name() ) {
        $settings = $widget->get_settings();
        if ( ! empty( $settings['link']['is_external'] ) ) {
            $content .= '<i class="fa fa-external-link" aria-hidden="true"></i>';
        }
    }
    return $content;
}, 10, 2 );

// Restrict content via membership check
add_filter( 'elementor/frontend/the_content', function( $content ) {
    if ( ! membership_plugin_is_content_allowed() ) {
        return esc_html__( 'Forbidden', 'textdomain' );
    }
    return $content;
});
```

### Document and Config Filters

| Filter Name | Parameters | Description |
|-------------|-----------|-------------|
| `elementor/document/config` | `array $config, Document $document` | Filter document config |
| `elementor/document/save/data` | `array $data, Document $document` | Filter data before save |
| `elementor/document/urls/edit` | `string $url, Document $document` | Filter edit URL |
| `elementor/document/urls/preview` | `string $url, Document $document` | Filter preview URL |
| `elementor/editor/localize_settings` | `array $settings` | Filter editor localized settings |

### Visual Element Filters

| Filter Name | Parameters | Description |
|-------------|-----------|-------------|
| `elementor/frontend/print_google_fonts` | `bool $print` | Return false to disable Google Fonts loading |
| `elementor/shapes/additional_shapes` | `array $shapes` | Add custom shape dividers |
| `elementor/mask_shapes/additional_shapes` | `array $shapes` | Add custom mask shapes |
| `elementor/utils/get_placeholder_image_src` | `string $src` | Change default placeholder image |
| `elementor/icons_manager/additional_tabs` | `array $tabs` | Add custom icon libraries |
| `elementor/fonts/additional_fonts` | `array $fonts` | Add custom fonts |
| `elementor/controls/animations/additional_animations` | `array $animations` | Add custom animations |
| `elementor/divider/styles/additional_styles` | `array $styles` | Add custom divider styles |

```php
// Disable Google Fonts
add_filter( 'elementor/frontend/print_google_fonts', '__return_false' );

// Add custom shape dividers
add_filter( 'elementor/shapes/additional_shapes', function() {
    return [
        'my-shape' => [
            'title'       => esc_html__( 'My Shape', 'textdomain' ),
            'url'         => PLUGIN_URL . 'shapes/my-shape.svg',
            'path'        => PLUGIN_PATH . 'shapes/my-shape.svg',
            'has_flip'    => true,
            'has_negative' => true,
            'height_only' => true,
        ],
    ];
});

// Add custom mask shapes
add_filter( 'elementor/mask_shapes/additional_shapes', function() {
    return [
        'my-mask' => [
            'title' => esc_html__( 'My Mask', 'textdomain' ),
            'image' => PLUGIN_URL . 'masks/my-mask.svg',
        ],
    ];
});

// Change placeholder image
add_filter( 'elementor/utils/get_placeholder_image_src', function() {
    return plugins_url( 'assets/images/placeholder.png', __FILE__ );
});
```

### Finder and Template Filters

| Filter Name | Parameters | Description |
|-------------|-----------|-------------|
| `elementor/finder/categories` | `array $categories` | Add/modify Finder categories |
| `elementor/template-library/get_template` | `array $template_data` | Filter template data |
| `elementor/template_library/is_template_supports_export` | `bool $supports, array $template` | Control template export |
| `elementor/files/allow_unfiltered_upload` | `bool $allow` | Allow unfiltered file uploads |
| `elementor/files/svg/enabled` | `bool $enabled` | Enable/disable SVG support |

### Forms Filters (Pro)

| Filter Name | Parameters | Description |
|-------------|-----------|-------------|
| `elementor_pro/forms/wp_mail_headers` | `string $headers` | Filter form email headers |
| `elementor_pro/forms/wp_mail_message` | `string $message` | Filter form email body HTML |
| `elementor_pro/custom_fonts/font_display` | `string $display` | Override custom fonts `font-display` value |

```php
// Set font-display to swap for custom fonts
add_filter( 'elementor_pro/custom_fonts/font_display', function() {
    return 'swap';
});
```

### Other Important Filters

| Filter Name | Parameters | Description |
|-------------|-----------|-------------|
| `elementor/frontend/builder_content_data` | `array $data, int $post_id` | Filter builder content data |
| `elementor/frontend/assets_url` | `string $url` | Filter frontend assets URL |
| `elementor/widgets/black_list` | `array $black_list` | Widget class blacklist |
| `elementor/element/get_child_type` | `string $child_type, array $data` | Filter allowed child types |
| `elementor/utils/is_post_type_support` | `bool $support, int $post_id, string $post_type` | Filter post type support |

---

## 3. Injecting Controls

### Targeting All Elements

Inject controls into every element using these hooks:

| Hook Name | Params | Use |
|-----------|--------|-----|
| `elementor/element/before_section_start` | `$element, $section_id, $args` | Add new section before an existing section |
| `elementor/element/after_section_start` | `$element, $section_id, $args` | Add control inside start of existing section |
| `elementor/element/before_section_end` | `$element, $section_id, $args` | Add control inside end of existing section |
| `elementor/element/after_section_end` | `$element, $section_id, $args` | Add new section after an existing section |

```php
// Add a control inside an existing section (all elements)
add_action( 'elementor/element/after_section_start', function( $element, $section_id, $args ) {
    if ( 'section' === $element->get_name() && 'section_background' === $section_id ) {
        $element->add_control( 'custom_control', [
            'type'  => \Elementor\Controls_Manager::NUMBER,
            'label' => esc_html__( 'Custom Control', 'textdomain' ),
        ]);
    }
}, 10, 3 );
```

### Targeting Specific Elements

Use `{$stack_name}` and `{$section_id}` to target a specific widget and section:

| Hook Pattern | Params | Use |
|-------------|--------|-----|
| `elementor/element/{$stack_name}/{$section_id}/before_section_start` | `$element, $args` | Add section before |
| `elementor/element/{$stack_name}/{$section_id}/after_section_start` | `$element, $args` | Add control at section start |
| `elementor/element/{$stack_name}/{$section_id}/before_section_end` | `$element, $args` | Add control at section end |
| `elementor/element/{$stack_name}/{$section_id}/after_section_end` | `$element, $args` | Add section after |

```php
// Add a new section before the heading widget's title section
add_action( 'elementor/element/heading/section_title/before_section_start', function( $element, $args ) {
    $element->start_controls_section( 'custom_section', [
        'tab'   => \Elementor\Controls_Manager::TAB_STYLE,
        'label' => esc_html__( 'Custom Section', 'textdomain' ),
    ]);
    $element->add_control( 'custom_control', [
        'type'  => \Elementor\Controls_Manager::NUMBER,
        'label' => esc_html__( 'Custom Control', 'textdomain' ),
    ]);
    $element->end_controls_section();
}, 10, 2 );

// Add control to page settings
add_action( 'elementor/documents/register_controls', function( $document ) {
    $document->start_controls_section( 'my_custom_section', [
        'tab'   => \Elementor\Controls_Manager::TAB_SETTINGS,
        'label' => esc_html__( 'My Settings', 'textdomain' ),
    ]);
    $document->add_control( 'my_setting', [
        'type'  => \Elementor\Controls_Manager::TEXT,
        'label' => esc_html__( 'My Setting', 'textdomain' ),
    ]);
    $document->end_controls_section();
});

// Add control to user preferences
add_action( 'elementor/element/editor-preferences/preferences/before_section_end', function( $element, $args ) {
    $element->add_control( 'my_preference', [
        'type'    => \Elementor\Controls_Manager::SWITCHER,
        'label'   => esc_html__( 'My Preference', 'textdomain' ),
        'default' => 'yes',
    ]);
}, 10, 2 );
```

---

## 4. JS Frontend Hooks

Frontend hooks use `elementorFrontend.hooks` (available on the frontend page).

### Actions

| Hook Name | Parameters | Description |
|-----------|-----------|-------------|
| `elementor/frontend/init` | none | Frontend initialized |
| `frontend/element_ready/global` | `$scope (jQuery), $ (jQuery)` | Any element is ready (sections, columns, widgets) |
| `frontend/element_ready/widget` | `$scope (jQuery), $ (jQuery)` | Any widget is ready |
| `frontend/element_ready/{widgetType.skinName}` | `$scope (jQuery), $ (jQuery)` | Specific widget+skin is ready (e.g. `image.default`) |

```js
// Run code when any element is ready
elementorFrontend.hooks.addAction( 'frontend/element_ready/global', function( $scope ) {
    if ( $scope.data( 'shake' ) ) {
        $scope.shake();
    }
});

// Run code when a specific widget (image, default skin) is ready
elementorFrontend.hooks.addAction( 'frontend/element_ready/image.default', function( $scope ) {
    if ( $scope.find( 'a' ) ) {
        $scope.find( 'a' ).lightbox();
    }
});

// Run code when a widget with a custom skin is ready
elementorFrontend.hooks.addAction( 'frontend/element_ready/google-maps.satellite', function( $scope ) {
    var $iframe = $scope.find( 'iframe' );
    $iframe.attr( 'src', $iframe.attr( 'src' ) + '&maptype=satellite' );
});

// Run code on frontend init
elementorFrontend.hooks.addAction( 'elementor/frontend/init', function() {
    // elementorFrontend object is now available
});
```

### Filters

| Hook Name | Parameters | Description |
|-----------|-----------|-------------|
| `frontend/handlers/menu_anchor/scroll_top_distance` | `int scrollTop` | Adjust scroll distance for menu anchors |

```js
// Adjust menu anchor scroll offset (e.g. for a fixed header)
jQuery( function( $ ) {
    if ( window.elementorFrontend ) {
        elementorFrontend.hooks.addFilter(
            'frontend/handlers/menu_anchor/scroll_top_distance',
            function( scrollTop ) { return scrollTop - 80; }
        );
    }
});
```

---

## 5. JS Editor Hooks

Editor hooks use `elementor.hooks` (available inside the Elementor editor).

### Actions

| Hook Name | Parameters | Description |
|-----------|-----------|-------------|
| `panel/open_editor/{elementType}` | `panel, model, view` | Settings panel opened for element type (`widget`, `section`, `column`) |
| `panel/open_editor/{elementType}/{elementName}` | `panel, model, view` | Settings panel opened for a specific widget name |

```js
// Run code when any widget panel opens
elementor.hooks.addAction( 'panel/open_editor/widget', function( panel, model, view ) {
    console.log( 'Editing widget:', model.get( 'widgetType' ) );
});

// Run code when the slider widget panel opens
elementor.hooks.addAction( 'panel/open_editor/widget/slider', function( panel, model, view ) {
    var $element = view.$el.find( '.elementor-selector' );
    if ( $element.length ) {
        $element.click( function() {
            alert( 'Slider clicked' );
        });
    }
});
```

### Filters

| Hook Name | Parameters | Description |
|-----------|-----------|-------------|
| `elements/context-menu/groups` | `array groups` | Modify right-click context menu groups |

---

## 6. JS Commands API (`$e.commands`)

The Commands API (since 2.7.0) manages all editor commands. Run commands with `$e.run()`.

### Key Methods

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `$e.commands.register()` | `component, command, callback` | `Commands` | Register a new command |
| `$e.run()` | `string command, object args` | `*` | Execute a command |
| `$e.commands.getAll()` | none | `Object` | Get all registered commands |
| `$e.commands.getCurrent()` | none | `Object` | Get currently running commands |
| `$e.commands.is()` | `string command` | `Boolean` | Check if command is currently running |
| `$e.commands.getCurrentArgs()` | none | `Object` | Get args of currently running command |
| `$e.commands.getCurrentFirst()` | none | `String` | Get first currently running command |

### Command Types

| Base Class | Type | Purpose |
|-----------|------|---------|
| `$e.modules.CommandBase` | User commands | Represent user actions |
| `$e.modules.CommandInternalBase` | Internal commands | For internal editor use |
| `$e.modules.CommandData` | Data commands | Communicate with data/cache/backend |

### Creating a Custom Component with Command

```js
class ExampleCommand extends $e.modules.CommandBase {
    apply( args ) {
        console.log( 'ExampleCommand:', args );
        return { example: 'result from ExampleCommand' };
    }
}

class CustomComponent extends $e.modules.ComponentBase {
    getNamespace() {
        return 'custom-component';
    }

    defaultCommands() {
        return {
            example: ( args ) => ( new ExampleCommand( args ) ).run(),
        };
    }
}

// Register and run
$e.components.register( new CustomComponent() );
result = $e.run( 'custom-component/example', { property: 'value' } );
```

### Importing Commands (File Structure)

Override `defaultCommands`, `defaultCommandsInternal`, or `defaultData` in your component:

```js
import * as commands from './commands/';

export class Component extends $e.modules.ComponentBase {
    getNamespace() {
        return 'component-name';
    }
    defaultCommands() {
        return this.importCommands( commands );
    }
}
```

---

## 7. JS Components API (`$e.components`)

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `$e.components.register()` | `ComponentBase component` | `ComponentBase` | Register a component |
| `$e.components.get()` | `string id` | `ComponentBase` | Get component by namespace |
| `$e.components.getAll()` | none | `array` | Get all components |
| `$e.components.activate()` | `string namespace` | | Activate a component |
| `$e.components.inactivate()` | `string namespace` | | Deactivate a component |
| `$e.components.isActive()` | `string namespace` | `Boolean` | Check if component is active |
| `$e.components.getActive()` | none | `Object` | Get all active components |

A component serves as a namespace that holds commands, hooks, routes, tabs, shortcuts, and utils. Component class files should be named `component.js`.

```js
class CustomComponent extends $e.modules.ComponentBase {
    getNamespace() {
        return 'custom-component';
    }
    defaultCommands() {
        return {
            example: ( args ) => { console.log( args ); },
        };
    }
}
$e.components.register( new CustomComponent() );
```

---

## 8. JS Hooks API (`$e.hooks`)

The `$e.hooks` API manages hooks that fire before/after commands run via `$e.run()`.

### UI Hooks

| Method | Parameter | Description |
|--------|-----------|-------------|
| `$e.hooks.registerUIBefore()` | `HookBase instance` | Before command runs (UI) |
| `$e.hooks.registerUIAfter()` | `HookBase instance` | After command runs (UI) |
| `$e.hooks.registerUICatch()` | `HookBase instance` | When command fails (UI) |

### Data Hooks

| Method | Parameter | Description |
|--------|-----------|-------------|
| `$e.hooks.registerDataDependency()` | `HookBase instance` | Before command (dependency check) |
| `$e.hooks.registerDataAfter()` | `HookBase instance` | After command runs (data) |
| `$e.hooks.registerDataCatch()` | `HookBase instance` | When command fails (data) |

### Hook Convention

```js
import HookUIAfter from 'elementor-api/modules/hooks/ui/after';

export class FooterSaverRefreshMenu extends HookUIAfter {
    getCommand() {
        return 'document/elements/settings';
    }
    getId() {
        return 'footer-saver-refresh-menu--document/elements/settings';
    }
    getContainerType() {
        return 'document'; // optional, improves performance
    }
    getConditions( args ) {
        return args.settings && 'undefined' !== typeof args.settings.post_status;
    }
    apply( args ) {
        const { footerSaver } = $e.components.get( 'document/save' );
        footerSaver.setMenuItems( args.container.document );
        footerSaver.refreshWpPreview();
    }
}
export default FooterSaverRefreshMenu;
```

Import hooks via `defaultHooks()` in your component:

```js
import * as hooks from './hooks/';

export class Component extends $e.modules.ComponentBase {
    getNamespace() {
        return 'component-name';
    }
    defaultHooks() {
        return this.importHooks( hooks );
    }
}
```

---

## 9. Common Patterns

| I want to... | Use this hook |
|---------------|--------------|
| Register a custom widget | `elementor/widgets/register` (action) |
| Register a custom control | `elementor/controls/register` (action) |
| Add a widget category | `elementor/elements/categories_registered` (action) |
| Register a dynamic tag | `elementor/dynamic_tags/register` (action) |
| Enqueue frontend script | `elementor/frontend/after_register_scripts` (action) |
| Enqueue editor script | `elementor/editor/after_enqueue_scripts` (action) |
| Enqueue preview script | `elementor/preview/enqueue_scripts` (action) |
| Add control to existing widget | `elementor/element/{widget}/{section}/before_section_end` (action) |
| Add control to page settings | `elementor/documents/register_controls` (action) |
| Add control to user preferences | `elementor/element/editor-preferences/preferences/before_section_end` (action) |
| Modify widget HTML output | `elementor/widget/render_content` (filter) |
| Modify widget JS template | `elementor/widget/print_template` (filter) |
| Filter entire page output | `elementor/frontend/the_content` (filter) |
| Disable Google Fonts | `elementor/frontend/print_google_fonts` return false (filter) |
| Change placeholder image | `elementor/utils/get_placeholder_image_src` (filter) |
| Add custom shape dividers | `elementor/shapes/additional_shapes` (filter) |
| Add custom mask shapes | `elementor/mask_shapes/additional_shapes` (filter) |
| Validate form data **(Pro)** | `elementor_pro/forms/validation` (action) |
| Process form after submit **(Pro)** | `elementor_pro/forms/new_record` (action) |
| Filter posts widget query **(Pro)** | `elementor/query/{$query_id}` (action) |
| Add CSS rules to elements | `elementor/element/parse_css` (action) |
| Run code when widget ready (JS) | `frontend/element_ready/{widget.skin}` via `elementorFrontend.hooks` |
| Hook into editor panel open (JS) | `panel/open_editor/{type}/{name}` via `elementor.hooks` |
| Register editor command (JS) | `$e.commands.register()` or component `defaultCommands()` |
| Hook before/after command (JS) | `$e.hooks.registerUIBefore()` / `$e.hooks.registerUIAfter()` |
