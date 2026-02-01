---
name: wp-apis
description: Use when working with WordPress core APIs in plugins or themes — admin menus, shortcodes, meta boxes, custom post types, taxonomies, HTTP API, WP-Cron, dashboard widgets, users and roles, privacy tools, and advanced hooks.
---

# WordPress Core APIs

Reference for WordPress APIs that plugin and theme developers use daily:
admin menus, shortcodes, meta boxes, custom post types, taxonomies, HTTP requests,
scheduled events, dashboard widgets, user roles, privacy compliance, and extensibility hooks.

---

## 1. Administration Menus

### Top-Level Menu

```php
add_action( 'admin_menu', 'map_register_menus' );

function map_register_menus(): void {
    add_menu_page(
        __( 'My Plugin', 'my-plugin' ),   // Page title (<title> tag).
        __( 'My Plugin', 'my-plugin' ),   // Menu label.
        'manage_options',                  // Capability required.
        'my-plugin',                       // Menu slug (unique).
        'map_render_admin_page',           // Callback that outputs page HTML.
        'dashicons-admin-generic',         // Icon URL or dashicon class.
        80                                 // Position (lower = higher).
    );
}
```

### Submenus

```php
add_submenu_page(
    'my-plugin',                         // Parent slug.
    __( 'Settings', 'my-plugin' ),       // Page title.
    __( 'Settings', 'my-plugin' ),       // Menu label.
    'manage_options',                     // Capability.
    'my-plugin-settings',                // Submenu slug.
    'map_render_settings_page'           // Callback.
);
```

| Helper Function             | Parent Page              |
|-----------------------------|--------------------------|
| `add_dashboard_page()`      | Dashboard                |
| `add_posts_page()`          | Posts                    |
| `add_media_page()`          | Media                    |
| `add_pages_page()`          | Pages                    |
| `add_comments_page()`       | Comments                 |
| `add_theme_page()`          | Appearance               |
| `add_plugins_page()`        | Plugins                  |
| `add_users_page()`          | Users                    |
| `add_management_page()`     | Tools                    |
| `add_options_page()`        | Settings                 |

### Form Processing Pattern

Use the `load-{$hook_suffix}` action to process form submissions before output:

```php
function map_register_menus(): void {
    $hook = add_menu_page( /* ... */ );
    add_action( "load-{$hook}", 'map_handle_form_submit' );
}

function map_handle_form_submit(): void {
    if ( 'POST' !== $_SERVER['REQUEST_METHOD'] ) {
        return;
    }
    check_admin_referer( 'map_save_action', 'map_nonce' );
    // Process and save, then redirect to avoid resubmit.
    wp_safe_redirect( add_query_arg( 'updated', '1', wp_get_referer() ) );
    exit;
}
```

### Removing Menus

```php
remove_menu_page( 'edit-comments.php' );        // Top-level.
remove_submenu_page( 'options-general.php', 'options-writing.php' ); // Submenu.
```

---

## 2. Shortcodes

### Registration

```php
add_shortcode( 'map_greeting', 'map_greeting_shortcode' );

/**
 * Handler receives three arguments.
 *
 * @param array|string $atts    User-supplied attributes (or empty string if none).
 * @param string|null  $content Content between opening and closing tags (enclosing shortcode).
 * @param string       $tag     The shortcode tag name itself.
 * @return string               HTML output — always RETURN, never echo.
 */
function map_greeting_shortcode( $atts, $content = null, $tag = '' ): string {
    $atts = shortcode_atts(
        array(
            'name'  => 'World',
            'color' => 'blue',
        ),
        $atts,
        $tag  // Enables the shortcode_atts_{$tag} filter for overrides.
    );

    return sprintf(
        '<span style="color:%s">Hello, %s!</span>',
        esc_attr( $atts['color'] ),
        esc_html( $atts['name'] )
    );
}
```

### Self-Closing vs Enclosing

```
[map_greeting name="Alice"]                         <!-- Self-closing -->
[map_box]This is wrapped content.[/map_box]         <!-- Enclosing -->
```

For enclosing shortcodes, call `do_shortcode( $content )` to process nested shortcodes:

```php
function map_box_shortcode( $atts, $content = null ): string {
    return '<div class="map-box">' . do_shortcode( (string) $content ) . '</div>';
}
```

### Rules

- **Return, don't echo** — shortcodes must return HTML, any `echo` corrupts page layout.
- **Prefix names** — use a unique prefix (`map_`) to avoid collisions.
- **Escape output** — all attribute values through `esc_attr()` / `esc_html()`.
- **Remove on deactivation** — call `remove_shortcode()` if needed for cleanup.

---

## 3. Custom Meta Boxes

### Registering

```php
add_action( 'add_meta_boxes', 'map_add_meta_boxes' );

function map_add_meta_boxes(): void {
    add_meta_box(
        'map_details',                      // Unique ID.
        __( 'Extra Details', 'my-plugin' ), // Box title.
        'map_render_details_meta_box',      // Render callback.
        'post',                             // Screen (post type or array of types).
        'side',                             // Context: normal | side | advanced.
        'high'                              // Priority: high | core | default | low.
    );
}
```

### Rendering

```php
function map_render_details_meta_box( WP_Post $post ): void {
    $value = get_post_meta( $post->ID, '_map_detail', true );
    wp_nonce_field( 'map_save_detail', 'map_detail_nonce' );
    printf(
        '<label for="map-detail">%s</label>
         <input type="text" id="map-detail" name="map_detail" value="%s" class="widefat" />',
        esc_html__( 'Detail:', 'my-plugin' ),
        esc_attr( $value )
    );
}
```

### Saving

```php
add_action( 'save_post', 'map_save_detail_meta', 10, 2 );

function map_save_detail_meta( int $post_id, WP_Post $post ): void {
    // 1. Verify nonce.
    if ( ! isset( $_POST['map_detail_nonce'] )
        || ! wp_verify_nonce( $_POST['map_detail_nonce'], 'map_save_detail' )
    ) {
        return;
    }
    // 2. Skip autosave.
    if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
        return;
    }
    // 3. Check permissions.
    if ( ! current_user_can( 'edit_post', $post_id ) ) {
        return;
    }
    // 4. Sanitize and save.
    if ( isset( $_POST['map_detail'] ) ) {
        update_post_meta(
            $post_id,
            '_map_detail',
            sanitize_text_field( wp_unslash( $_POST['map_detail'] ) )
        );
    }
}
```

### OOP Pattern

```php
class MAP_Detail_Meta_Box {
    public static function register(): void {
        add_action( 'add_meta_boxes', array( __CLASS__, 'add' ) );
        add_action( 'save_post', array( __CLASS__, 'save' ), 10, 2 );
    }
    public static function add(): void { /* add_meta_box(...) */ }
    public static function render( WP_Post $post ): void { /* output fields */ }
    public static function save( int $post_id, WP_Post $post ): void { /* save meta */ }
}
MAP_Detail_Meta_Box::register();
```

### Removing Meta Boxes

```php
add_action( 'do_meta_boxes', function (): void {
    remove_meta_box( 'postcustom', 'post', 'normal' );   // Custom Fields.
    remove_meta_box( 'slugdiv', 'post', 'normal' );      // Slug.
} );
```

---

## 4. Custom Post Types & Taxonomies

### Registering a Custom Post Type

```php
add_action( 'init', 'map_register_post_types' );

function map_register_post_types(): void {
    register_post_type( 'map_portfolio', array(
        'labels'             => array(
            'name'               => __( 'Portfolio', 'my-plugin' ),
            'singular_name'      => __( 'Project', 'my-plugin' ),
            'add_new_item'       => __( 'Add New Project', 'my-plugin' ),
            'edit_item'          => __( 'Edit Project', 'my-plugin' ),
            'not_found'          => __( 'No projects found.', 'my-plugin' ),
            'not_found_in_trash' => __( 'No projects found in Trash.', 'my-plugin' ),
        ),
        'public'             => true,
        'has_archive'        => true,
        'show_in_rest'       => true,       // Required for Block Editor + REST API.
        'supports'           => array( 'title', 'editor', 'thumbnail', 'excerpt', 'revisions' ),
        'rewrite'            => array( 'slug' => 'portfolio' ),
        'menu_icon'          => 'dashicons-portfolio',
        'capability_type'    => 'post',
    ) );
}
```

### Key `supports` Values

| Value          | Feature Enabled                |
|----------------|--------------------------------|
| `title`        | Title field                    |
| `editor`       | Content editor                 |
| `thumbnail`    | Featured image                 |
| `excerpt`      | Excerpt field                  |
| `revisions`    | Revision history               |
| `page-attributes` | Template + menu order       |
| `custom-fields` | Custom fields meta box        |
| `comments`     | Comments                       |

### Registering a Custom Taxonomy

```php
add_action( 'init', 'map_register_taxonomies' );

function map_register_taxonomies(): void {
    register_taxonomy( 'map_skill', array( 'map_portfolio' ), array(
        'labels'            => array(
            'name'          => __( 'Skills', 'my-plugin' ),
            'singular_name' => __( 'Skill', 'my-plugin' ),
            'add_new_item'  => __( 'Add New Skill', 'my-plugin' ),
        ),
        'hierarchical'      => true,       // true = categories, false = tags.
        'show_in_rest'      => true,       // Block Editor support.
        'rewrite'           => array( 'slug' => 'skill' ),
        'show_admin_column' => true,       // Column in post list table.
    ) );
}
```

### Flushing Rewrite Rules

Rewrite rules are cached. Flush on activation only — never on every request:

```php
register_activation_hook( __FILE__, function (): void {
    map_register_post_types();
    map_register_taxonomies();
    flush_rewrite_rules();
} );
```

### Template Hierarchy for CPTs

WordPress looks for templates in this order:

| Template File                      | When                        |
|------------------------------------|-----------------------------|
| `single-map_portfolio.php`        | Single CPT post             |
| `archive-map_portfolio.php`       | CPT archive                 |
| `taxonomy-map_skill.php`          | Custom taxonomy archive     |
| `taxonomy-map_skill-{slug}.php`   | Specific term archive       |

---

## 5. HTTP API

### GET Request

```php
$response = wp_remote_get( 'https://api.example.com/data', array(
    'timeout' => 15,
    'headers' => array(
        'Authorization' => 'Bearer ' . $api_key,
        'Accept'        => 'application/json',
    ),
) );

if ( is_wp_error( $response ) ) {
    error_log( 'API error: ' . $response->get_error_message() );
    return;
}

$code = wp_remote_retrieve_response_code( $response );
$body = wp_remote_retrieve_body( $response );
$data = json_decode( $body, true );
```

### POST Request

```php
$response = wp_remote_post( 'https://api.example.com/submit', array(
    'timeout' => 30,
    'body'    => wp_json_encode( array( 'name' => 'Alice' ) ),
    'headers' => array(
        'Content-Type' => 'application/json',
    ),
) );
```

### Default Args

| Argument      | Default        | Notes                                  |
|---------------|----------------|----------------------------------------|
| `method`      | `GET`          | Or `POST`, `PUT`, `DELETE`, etc.       |
| `timeout`     | `5`            | Seconds. Increase for slow APIs.       |
| `redirection` | `5`            | Max redirects to follow.               |
| `httpversion` | `1.0`          | Use `1.1` for keep-alive.             |
| `sslverify`   | `true`         | **Never disable in production.**       |
| `blocking`    | `true`         | `false` = fire-and-forget.             |
| `user-agent`  | WordPress/X.Y  | Override for API requirements.         |

### Error Checking

Always check errors before using the response:

```php
if ( is_wp_error( $response ) ) {
    // Network-level failure (DNS, timeout, connection refused).
    return new WP_Error( 'api_failure', $response->get_error_message() );
}

$code = wp_remote_retrieve_response_code( $response );
if ( $code < 200 || $code >= 300 ) {
    // HTTP error (4xx, 5xx).
    return new WP_Error( 'api_http_error', "HTTP {$code}" );
}
```

### Caching External Requests with Transients

```php
function map_get_external_data(): array {
    $cached = get_transient( 'map_api_data' );
    if ( false !== $cached ) {
        return $cached;
    }

    $response = wp_remote_get( 'https://api.example.com/data' );
    if ( is_wp_error( $response ) ) {
        return array();
    }

    $data = json_decode( wp_remote_retrieve_body( $response ), true );
    if ( ! is_array( $data ) ) {
        return array();
    }

    set_transient( 'map_api_data', $data, HOUR_IN_SECONDS );
    return $data;
}
```

---

## 6. WP-Cron

### Scheduling a Recurring Event

```php
register_activation_hook( __FILE__, 'map_activate_cron' );

function map_activate_cron(): void {
    if ( ! wp_next_scheduled( 'map_daily_cleanup' ) ) {
        wp_schedule_event( time(), 'daily', 'map_daily_cleanup' );
    }
}

add_action( 'map_daily_cleanup', 'map_run_cleanup' );

function map_run_cleanup(): void {
    // Perform daily maintenance task.
}
```

### Single Event

```php
wp_schedule_single_event( time() + 300, 'map_deferred_task', array( $post_id ) );

add_action( 'map_deferred_task', function ( int $post_id ): void {
    // Runs once, ~5 minutes later.
} );
```

### Custom Intervals

```php
add_filter( 'cron_schedules', function ( array $schedules ): array {
    $schedules['map_five_minutes'] = array(
        'interval' => 300,
        'display'  => __( 'Every 5 Minutes', 'my-plugin' ),
    );
    return $schedules;
} );
```

### Cleanup on Deactivation

```php
register_deactivation_hook( __FILE__, function (): void {
    $timestamp = wp_next_scheduled( 'map_daily_cleanup' );
    if ( $timestamp ) {
        wp_unschedule_event( $timestamp, 'map_daily_cleanup' );
    }
} );
```

### Real Cron for Production

WP-Cron is triggered by page visits — unreliable on low-traffic sites.

```php
// wp-config.php
define( 'DISABLE_WP_CRON', true );
```

```bash
# System crontab — runs WP-Cron every minute.
* * * * * curl -s https://example.com/wp-cron.php?doing_wp_cron > /dev/null 2>&1
# Or use WP-CLI:
* * * * * cd /var/www/html && wp cron event run --due-now > /dev/null 2>&1
```

---

## 7. Dashboard Widgets

### Basic Widget

```php
add_action( 'wp_dashboard_setup', 'map_add_dashboard_widget' );

function map_add_dashboard_widget(): void {
    wp_add_dashboard_widget(
        'map_status_widget',                     // Widget ID.
        __( 'Plugin Status', 'my-plugin' ),      // Title.
        'map_render_status_widget'                // Render callback.
    );
}

function map_render_status_widget(): void {
    $count = wp_count_posts( 'map_portfolio' );
    printf(
        '<p>%s</p>',
        sprintf(
            /* translators: %d: number of published projects */
            esc_html__( 'Published projects: %d', 'my-plugin' ),
            absint( $count->publish )
        )
    );
}
```

### Side Column Placement

`wp_add_dashboard_widget()` places widgets in the main column. For the side column:

```php
add_meta_box(
    'map_quick_stats',
    __( 'Quick Stats', 'my-plugin' ),
    'map_render_quick_stats',
    'dashboard',        // Screen = dashboard.
    'side',             // Context = side column.
    'high'              // Priority.
);
```

### Removing Default Widgets

```php
add_action( 'wp_dashboard_setup', function (): void {
    remove_meta_box( 'dashboard_quick_press', 'dashboard', 'side' );
    remove_meta_box( 'dashboard_primary', 'dashboard', 'side' );
} );
```

---

## 8. Users & Roles

### Adding a Custom Role

```php
// Run once on activation — roles are stored in the database.
register_activation_hook( __FILE__, function (): void {
    add_role( 'map_project_manager', __( 'Project Manager', 'my-plugin' ), array(
        'read'                    => true,
        'edit_posts'              => true,
        'delete_posts'            => true,
        'publish_posts'           => true,
        'upload_files'            => true,
        'edit_published_posts'    => true,
        'delete_published_posts'  => true,
    ) );
} );

// Remove on uninstall.
register_uninstall_hook( __FILE__, function (): void {
    remove_role( 'map_project_manager' );
} );
```

### Custom Capabilities

```php
register_activation_hook( __FILE__, function (): void {
    $admin = get_role( 'administrator' );
    if ( $admin ) {
        $admin->add_cap( 'manage_map_settings' );
        $admin->add_cap( 'edit_map_projects' );
    }
} );

// Check in code:
if ( current_user_can( 'manage_map_settings' ) ) {
    // Show admin-only UI.
}
```

### User Meta

```php
// Store.
update_user_meta( $user_id, '_map_onboarded', '1' );

// Retrieve.
$onboarded = get_user_meta( $user_id, '_map_onboarded', true );

// Delete.
delete_user_meta( $user_id, '_map_onboarded' );
```

### Querying Users

```php
$query = new WP_User_Query( array(
    'role'       => 'map_project_manager',
    'orderby'    => 'registered',
    'order'      => 'DESC',
    'number'     => 20,
    'meta_query' => array(                    // phpcs:ignore WordPress.DB.SlowDBQuery
        array(
            'key'     => '_map_onboarded',
            'value'   => '1',
            'compare' => '=',
        ),
    ),
) );

foreach ( $query->get_results() as $user ) {
    // $user is a WP_User object.
}
```

---

## 9. Privacy API

WordPress 4.9.6+ includes tools for GDPR/privacy compliance. Plugins that store
personal data should register exporters and erasers.

### Personal Data Exporter

```php
add_filter( 'wp_privacy_personal_data_exporters', function ( array $exporters ): array {
    $exporters['my-plugin'] = array(
        'exporter_friendly_name' => __( 'My Plugin Data', 'my-plugin' ),
        'callback'               => 'map_privacy_exporter',
    );
    return $exporters;
} );

function map_privacy_exporter( string $email, int $page = 1 ): array {
    $user = get_user_by( 'email', $email );
    $data = array();

    if ( $user ) {
        $pref = get_user_meta( $user->ID, '_map_preference', true );
        if ( $pref ) {
            $data[] = array(
                'group_id'          => 'map-preferences',
                'group_label'       => __( 'Plugin Preferences', 'my-plugin' ),
                'group_description' => __( 'Settings stored by My Plugin.', 'my-plugin' ),
                'item_id'           => "map-pref-{$user->ID}",
                'data'              => array(
                    array(
                        'name'  => __( 'Preference', 'my-plugin' ),
                        'value' => $pref,
                    ),
                ),
            );
        }
    }

    return array(
        'data' => $data,
        'done' => true,     // Set false + increment $page for large datasets.
    );
}
```

### Personal Data Eraser

```php
add_filter( 'wp_privacy_personal_data_erasers', function ( array $erasers ): array {
    $erasers['my-plugin'] = array(
        'eraser_friendly_name' => __( 'My Plugin Data', 'my-plugin' ),
        'callback'             => 'map_privacy_eraser',
    );
    return $erasers;
} );

function map_privacy_eraser( string $email, int $page = 1 ): array {
    $user          = get_user_by( 'email', $email );
    $items_removed = 0;

    if ( $user ) {
        $deleted = delete_user_meta( $user->ID, '_map_preference' );
        if ( $deleted ) {
            ++$items_removed;
        }
    }

    return array(
        'items_removed'  => $items_removed,
        'items_retained' => 0,
        'messages'       => array(),
        'done'           => true,
    );
}
```

### Privacy Policy Suggestion

```php
add_action( 'admin_init', function (): void {
    if ( ! function_exists( 'wp_add_privacy_policy_content' ) ) {
        return;
    }
    wp_add_privacy_policy_content(
        __( 'My Plugin', 'my-plugin' ),
        wp_kses_post( __( '<p>This plugin stores your preferences in your user profile.</p>', 'my-plugin' ) )
    );
} );
```

---

## 10. Advanced Hooks

### Removing Actions & Filters

Removal must happen after the original `add_action()` has run and at the same priority:

```php
// Original added at priority 10 (default).
// Remove during plugins_loaded or later:
add_action( 'plugins_loaded', function (): void {
    remove_action( 'wp_head', 'wp_generator' );            // Default priority 10.
    remove_filter( 'the_content', 'wpautop' );             // Default priority 10.
} );
```

For class-based hooks, you need the exact instance:

```php
// If the plugin stores a global: remove_action( 'init', array( $instance, 'init' ) );
// If it doesn't — you may need to use the same priority or $wp_filter global (fragile).
```

### Single-Run Guards

```php
add_action( 'save_post', function ( int $post_id ): void {
    // did_action() returns how many times the action has fired.
    if ( did_action( 'save_post' ) > 1 ) {
        return;     // Prevent recursive triggers.
    }
    // Safe to call wp_update_post() or similar here.
} );
```

### Inspection Functions

| Function             | Returns                                          |
|----------------------|--------------------------------------------------|
| `did_action()`       | Number of times an action has fired (int).       |
| `doing_action()`     | Whether a specific action is currently running.  |
| `doing_filter()`     | Whether a specific filter is currently running.  |
| `current_action()`   | Name of the action currently being executed.     |
| `current_filter()`   | Name of the current filter (works for actions).  |
| `has_action()`       | Whether a callback is registered for an action.  |
| `has_filter()`       | Whether a callback is registered for a filter.   |

### Making Your Plugin Extensible

Provide hooks so other developers can extend your plugin without modifying its source:

```php
// Action — let others react to events.
function map_process_order( array $order ): void {
    // Core processing...
    do_action( 'map_order_processed', $order );
}

// Filter — let others modify data.
function map_get_display_name( int $user_id ): string {
    $name = get_user_meta( $user_id, 'display_name', true );
    return apply_filters( 'map_display_name', $name, $user_id );
}
```

**Rules for extensibility hooks:**

- Prefix all hook names with your plugin prefix.
- Document hooks with `@since`, `@param`, and example usage in PHPDoc.
- Pass enough context parameters for downstream consumers.
- Don't change hook signatures after release (breaking change).

---

## 11. Common Mistakes

| Mistake | Fix |
|---------|-----|
| Flushing rewrite rules on every request | Only flush on activation: `register_activation_hook` + `flush_rewrite_rules()` |
| Registering CPTs/taxonomies in `admin_init` | Use `init` — they must be available on the frontend too |
| `echo` inside a shortcode handler | Always `return` the HTML string |
| Saving meta without nonce/capability check | Verify nonce, check `DOING_AUTOSAVE`, check `current_user_can()` |
| Scheduling cron without `wp_next_scheduled()` guard | Always check first or you create duplicate events |
| Not cleaning up cron on deactivation | `wp_unschedule_event()` in `register_deactivation_hook` |
| Using `$wpdb->query()` for HTTP API work | Use `wp_remote_get()` / `wp_remote_post()` — WordPress HTTP API handles proxies, SSL, redirects |
| Disabling `sslverify` in production | Only disable for local development; never in production |
| Adding roles/caps on every page load | Roles persist in DB — add on activation, remove on uninstall |
| Forgetting `show_in_rest => true` on CPTs | Required for Block Editor and REST API access |
| Not paginating privacy exporters/erasers | For large datasets, set `done => false` and use `$page` parameter |
| Calling `remove_action()` too early | Must run after the original `add_action()` and match priority |
