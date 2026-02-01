---
name: wp-guidelines
description: Use when writing, reviewing, or refactoring WordPress PHP code — naming conventions, hooks, i18n, enqueuing, Yoda conditions, WordPress API usage, formatting, deprecated functions. For security see wp-security; for performance see wp-performance; for blocks see wp-blocks.
---

# WordPress Coding Standards & Conventions

Quick-reference for WordPress PHP development. Rules are distilled from the official WordPress Coding Standards (WPCS) sniffs and WordPress core documentation.

---

## 1. Naming Conventions

### 1.1 Functions & Methods

All function and method names MUST be `snake_case`. Magic methods and PHP4 constructors are exempt. Methods in child classes / interface implementations may follow the parent convention.

```php
// BAD
function getPostData() {}
function Get_Post_Data() {}

// GOOD
function get_post_data() {}
```

Do NOT prefix functions with double underscores (`__`) unless they are PHP magic methods.

### 1.2 Variables & Properties

All variables and object properties MUST be `snake_case`.

```php
// BAD
$postTitle = 'Hello';
$this->postTitle = 'Hello';

// GOOD
$post_title = 'Hello';
$this->post_title = 'Hello';
```

**Known exceptions from WP core** (allowed as-is): `$post_ID`, `$comment_ID`, `$user_ID`, `$tag_ID`, `$cat_ID`, `$is_IE`, `$is_IIS`, `$PHP_SELF`.

### 1.3 Classes, Interfaces, Traits, Enums

Use `Pascal_Case` with underscores separating words (WordPress convention, not PSR).

```php
// BAD
class myPlugin {}
class my_plugin {}

// GOOD
class My_Plugin {}
class My_Plugin_Admin {}
```

WP native classes use this pattern: `WP_Query`, `WP_REST_Controller`, `Custom_Background`.

### 1.4 File Names

| Rule | Example |
|------|---------|
| All lowercase | `my-plugin.php` |
| Hyphens as separators (no underscores) | `class-my-widget.php` |
| Files containing a single class: prefix with `class-` | `class-my-plugin-admin.php` |
| Theme template files may use underscores | `single-my_cpt.php` |

### 1.5 Hook Names

Hook names (actions/filters) invoked with `do_action()` / `apply_filters()` MUST be:

- **All lowercase**
- **Words separated by underscores**
- **Prefixed with your plugin/theme slug**

```php
// BAD
do_action( 'MyPlugin_Init' );
do_action( 'my-plugin-init' );

// GOOD
do_action( 'myplugin_init' );
do_action( 'myplugin_after_setup' );
apply_filters( 'myplugin_post_title', $title );
```

### 1.6 Post Type Slugs

Rules enforced by `ValidPostTypeSlugSniff`:

| Rule | Detail |
|------|--------|
| Max length | 20 characters (SQL column limit) |
| Valid characters | Lowercase `a-z`, `0-9`, hyphens, underscores |
| No reserved names | `post`, `page`, `attachment`, `revision`, `nav_menu_item`, `action`, `author`, `order`, `theme` |
| No `wp_` prefix | Reserved for WordPress core post types |

```php
// BAD
register_post_type( 'MyBooks' );            // uppercase
register_post_type( 'wp_custom_books' );    // wp_ prefix reserved
register_post_type( 'page' );              // reserved name
register_post_type( 'a_very_long_custom_post_type_name' ); // >20 chars

// GOOD
register_post_type( 'acme_book' );
```

### 1.7 Global Prefix Rule

ALL globals defined by a plugin or theme must start with a unique prefix (minimum 4 characters). This applies to:

- Functions, classes, interfaces, traits, enums in the global namespace
- Global variables and `$GLOBALS` keys
- Constants (both `const` and `define()`)
- Hook names
- Namespaces

**Blocked prefixes:** `wordpress`, `wp`, `_`, `php`.

```php
// BAD (no prefix or too short)
function init() {}
define( 'VERSION', '1.0' );
$GLOBALS['data'] = [];

// GOOD
function acme_init() {}
define( 'ACME_VERSION', '1.0' );
$GLOBALS['acme_data'] = [];
// Or use a namespace:
namespace Acme\Plugin;
```

---

## 2. PHP Best Practices (WordPress-Specific)

### 2.1 Yoda Conditions

Place the literal/constant on the LEFT side of comparisons. This prevents accidental assignment.

```php
// BAD
if ( $value === true ) {}
if ( $status == 'active' ) {}

// GOOD
if ( true === $value ) {}
if ( 'active' === $status ) {}
```

Applies to `==`, `!=`, `===`, `!==`. Variable-to-variable comparisons are exempt.

### 2.2 Strict `in_array()` / `array_search()` / `array_keys()`

Always pass `true` as the third parameter for strict type comparison.

```php
// BAD
in_array( $value, $allowed );
array_search( $key, $haystack );
array_keys( $data, $filter_value );

// GOOD
in_array( $value, $allowed, true );
array_search( $key, $haystack, true );
array_keys( $data, $filter_value, true );
```

### 2.3 Forbidden Functions

| Function | Why | Alternative |
|----------|-----|-------------|
| `extract()` | Pollutes local scope unpredictably | Destructure manually |
| `@` (error suppression) | Hides errors; use proper handling | Check return values; use `wp_safe_*` |
| `ini_set()` | Breaks interoperability between plugins | See table below |

**`ini_set()` replacements:**

| ini directive | Use instead |
|---------------|-------------|
| `display_errors` | `WP_DEBUG_DISPLAY` constant |
| `error_reporting` | `WP_DEBUG` constant |
| `log_errors` | `WP_DEBUG_LOG` constant |
| `memory_limit` | `wp_raise_memory_limit()` |
| `max_execution_time` | `set_time_limit()` |

### 2.4 Development Functions (No Production Use)

These trigger warnings. Remove before shipping:

`var_dump`, `var_export`, `print_r`, `error_log`, `trigger_error`, `set_error_handler`, `debug_backtrace`, `debug_print_backtrace`, `wp_debug_backtrace_summary`, `error_reporting`, `phpinfo`

### 2.5 Use WordPress Functions Over PHP Natives

| PHP Native | WordPress Alternative | Since WP |
|------------|----------------------|----------|
| `json_encode()` | `wp_json_encode()` | 4.1 |
| `parse_url()` | `wp_parse_url()` | 4.4 |
| `curl_*()` | `wp_remote_get()` / `wp_remote_post()` | 2.7 |
| `file_get_contents()` (remote) | `wp_remote_get()` | 2.7 |
| `unlink()` | `wp_delete_file()` | 4.2 |
| `rename()` | `WP_Filesystem::move()` | 2.5 |
| `strip_tags()` | `wp_strip_all_tags()` | 2.9 |
| `rand()` / `mt_rand()` | `wp_rand()` | 2.6.2 |
| `file_put_contents()`, `fopen()`, etc. | `WP_Filesystem` methods | 2.5 |

Note: `file_get_contents()` for local files (using `ABSPATH`, `WP_CONTENT_DIR`, `plugin_dir_path()`, etc.) is acceptable.

### 2.6 Type Casts

Use short, normalized forms:

```php
// BAD
$val = (integer) $input;
$val = (real) $input;
(unset) $var;  // removed in PHP 8.0

// GOOD
$val = (int) $input;
$val = (float) $input;
unset( $var );
```

---

## 3. Hooks & Actions

### 3.1 Registration Patterns

```php
// Actions: side effects (send email, save data, enqueue assets)
add_action( 'init', 'acme_register_post_types' );
add_action( 'wp_enqueue_scripts', 'acme_enqueue_assets' );
add_action( 'admin_menu', 'acme_add_admin_page' );

// Filters: modify and return a value
add_filter( 'the_content', 'acme_append_cta' );
add_filter( 'excerpt_length', 'acme_custom_excerpt_length' );
```

### 3.2 Priority and Argument Count

```php
// Default priority is 10, default accepted args is 1
add_filter( 'the_title', 'acme_modify_title', 10, 2 );

function acme_modify_title( $title, $post_id ) {
    // Always declare the correct number of parameters
    return $title;
}
```

### 3.3 Removing Hooks

Must match the exact callback, priority, and (for objects) the same instance:

```php
// Remove a function callback
remove_action( 'wp_head', 'wp_generator' );

// Remove with matching priority
remove_filter( 'the_content', 'acme_append_cta', 10 );

// Remove an object method (must be same instance)
remove_action( 'init', array( $instance, 'init' ) );
```

### 3.4 Hook Naming Conventions

```php
// Plugin hooks should be prefixed and use underscores
do_action( 'acme_before_render', $context );
$value = apply_filters( 'acme_output_format', $default, $post );

// Dynamic hooks: prefix the static part
do_action( "acme_process_{$type}", $data );
```

---

## 4. Internationalization (i18n)

### 4.1 Core Functions

| Function | Purpose |
|----------|---------|
| `__( $text, $domain )` | Return translated string |
| `_e( $text, $domain )` | Echo translated string |
| `_x( $text, $context, $domain )` | Return with disambiguation context |
| `_ex( $text, $context, $domain )` | Echo with disambiguation context |
| `_n( $single, $plural, $number, $domain )` | Pluralization |
| `_nx( $single, $plural, $number, $context, $domain )` | Plural + context |
| `esc_html__( $text, $domain )` | Return translated + HTML-escaped |
| `esc_html_e( $text, $domain )` | Echo translated + HTML-escaped |
| `esc_attr__( $text, $domain )` | Return translated + attribute-escaped |
| `esc_attr_e( $text, $domain )` | Echo translated + attribute-escaped |
| `esc_html_x( $text, $context, $domain )` | Return translated + escaped + context |
| `esc_attr_x( $text, $context, $domain )` | Return translated + escaped + context |

### 4.2 Rules

- **Text domain** must match your plugin/theme slug exactly.
- **All user-facing strings** must be wrapped in a translation function.
- **Prefer combined escape+translate** over separate calls:

```php
// BAD - separate escape and translate
echo esc_html( __( 'Hello', 'acme-plugin' ) );

// GOOD - combined function
echo esc_html__( 'Hello', 'acme-plugin' );
```

If you pass two parameters to `esc_html()` or `esc_attr()`, you probably meant `esc_html__()` / `esc_attr__()`.

### 4.3 Translator Comments

Add translator comments for ambiguous strings, sprintf placeholders, or context:

```php
// BAD
printf( __( '%s: %s', 'acme-plugin' ), $label, $value );

// GOOD
/* translators: 1: field label, 2: field value */
printf( __( '%1$s: %2$s', 'acme-plugin' ), $label, $value );
```

### 4.4 sprintf Placeholder Rules

- With 2+ placeholders, use **ordered** placeholders: `%1$s`, `%2$s` (not `%s`, `%s`).
- Do NOT use `%1$s` if there is only one placeholder (use `%s`).
- The number of placeholders must match the number of arguments.

---

## 5. Enqueuing Assets

### 5.1 Never Use Direct Tags

```php
// BAD - direct output
echo '<script src="my-script.js"></script>';
echo '<link rel="stylesheet" href="my-style.css">';

// GOOD - proper enqueue
function acme_enqueue_assets() {
    wp_enqueue_script(
        'acme-main',
        plugin_dir_url( __FILE__ ) . 'js/main.js',
        array( 'jquery' ),
        '1.2.0',
        true  // in_footer
    );
    wp_enqueue_style(
        'acme-styles',
        plugin_dir_url( __FILE__ ) . 'css/styles.css',
        array(),
        '1.2.0'
    );
}
add_action( 'wp_enqueue_scripts', 'acme_enqueue_assets' );
```

### 5.2 Required Parameters

| Parameter | Required? | Notes |
|-----------|-----------|-------|
| `$handle` | Yes | Unique identifier |
| `$src` | Conditional | Omit only when registering dependency-only handle |
| `$deps` | Recommended | Array of dependency handles |
| `$ver` | Yes (when src given) | Must be non-false; use explicit version string. `false` = WP core version (bad for cache busting). `null` = no version query string (also discouraged). |
| `$in_footer` (scripts) | Yes | Explicitly set `true` (footer) or `false` (header). Defaults to header if omitted. |
| `$media` (styles) | Optional | Default `'all'` |

```php
// BAD - missing version, missing in_footer
wp_enqueue_script( 'acme-main', $url );

// GOOD
wp_enqueue_script( 'acme-main', $url, array(), '1.0.0', true );
```

### 5.3 Conditional Loading

Load assets only where needed:

```php
function acme_admin_assets( $hook ) {
    if ( 'toplevel_page_acme-settings' !== $hook ) {
        return;
    }
    wp_enqueue_style( 'acme-admin', ... );
}
add_action( 'admin_enqueue_scripts', 'acme_admin_assets' );

function acme_frontend_assets() {
    if ( ! is_singular( 'acme_portfolio' ) ) {
        return;
    }
    wp_enqueue_script( 'acme-portfolio', ... );
}
add_action( 'wp_enqueue_scripts', 'acme_frontend_assets' );
```

---

## 6. WordPress API Usage

### 6.1 Capabilities, Not Roles

Use specific capabilities in `current_user_can()`, not role names.

```php
// BAD
if ( current_user_can( 'administrator' ) ) {}
if ( current_user_can( 'editor' ) ) {}

// GOOD
if ( current_user_can( 'manage_options' ) ) {}
if ( current_user_can( 'edit_others_posts' ) ) {}
```

Common capabilities: `manage_options`, `edit_posts`, `edit_others_posts`, `publish_posts`, `delete_posts`, `upload_files`, `edit_theme_options`, `activate_plugins`.

### 6.2 Cron Intervals

Cron schedules must not be shorter than 15 minutes (900 seconds) per VIP/hosting guidelines.

```php
// BAD
add_filter( 'cron_schedules', function( $schedules ) {
    $schedules['every_minute'] = array(
        'interval' => 60,
        'display'  => 'Every Minute',
    );
    return $schedules;
} );

// GOOD
add_filter( 'cron_schedules', function( $schedules ) {
    $schedules['every_thirty_min'] = array(
        'interval' => 1800,
        'display'  => 'Every 30 Minutes',
    );
    return $schedules;
} );
```

### 6.3 Posts Per Page

Avoid excessively high `posts_per_page` values (default limit: 100). Use pagination instead of `-1`.

```php
// BAD
$query = new WP_Query( array( 'posts_per_page' => -1 ) );
$query = new WP_Query( array( 'posts_per_page' => 999 ) );

// GOOD
$query = new WP_Query( array( 'posts_per_page' => 50 ) );
```

### 6.4 Do Not Override WordPress Globals

Never overwrite WP native globals like `$post`, `$wp_query`, `$authordata`, `$currentday`, `$page`, etc. in the global scope.

```php
// BAD (in global scope or after global import)
global $post;
$post = get_post( 123 ); // overwrites the global

// GOOD
$my_post = get_post( 123 );
```

### 6.5 `get_post_meta()` -- Always Pass `$single`

When calling `get_post_meta()` (or any `get_*_meta()`) with a `$key`, always specify the `$single` parameter to make the return type explicit.

```php
// BAD - ambiguous return type (array vs string)
$value = get_post_meta( $post_id, 'acme_field' );

// GOOD
$value = get_post_meta( $post_id, 'acme_field', true );   // returns string
$values = get_post_meta( $post_id, 'acme_field', false );  // returns array
```

Applies to: `get_post_meta`, `get_user_meta`, `get_term_meta`, `get_comment_meta`, `get_site_meta`, `get_metadata`, `get_metadata_raw`, `get_metadata_default`.

### 6.6 `current_time()` Is NOT a Unix Timestamp

`current_time( 'timestamp' )` returns a "WordPress timestamp" (Unix time + timezone offset) -- NOT a real Unix timestamp. This causes bugs in date math.

```php
// BAD
$now = current_time( 'timestamp' );
$now = current_time( 'U' );

// GOOD - for UTC timestamp
$now = time();

// GOOD - for formatted local time
$now = current_time( 'mysql' );
$now = current_time( 'Y-m-d H:i:s' );

// GOOD - if you explicitly need UTC via current_time
$now = current_time( 'U', true );  // gmt=true, but time() is simpler
```

---

## 7. Deprecated Functions (Common Replacements)

| Deprecated | Since | Replacement |
|-----------|-------|-------------|
| `get_currentuserinfo()` | 4.5 | `wp_get_current_user()` |
| `get_page_by_title()` | 6.2 | `WP_Query` |
| `is_taxonomy()` | 3.0 | `taxonomy_exists()` |
| `is_term()` | 3.0 | `term_exists()` |
| `get_settings()` | 2.1 | `get_option()` |
| `get_usermeta()` | 3.0 | `get_user_meta()` |
| `update_usermeta()` | 3.0 | `update_user_meta()` |
| `delete_usermeta()` | 3.0 | `delete_user_meta()` |
| `wp_get_sites()` | 4.6 | `get_sites()` |
| `like_escape()` | 4.0 | `$wpdb->esc_like()` |
| `get_all_category_ids()` | 4.0 | `get_terms()` |
| `post_permalink()` | 4.4 | `get_permalink()` |
| `force_ssl_login()` | 4.4 | `force_ssl_admin()` |
| `wp_no_robots()` | 5.7 | `wp_robots_no_robots()` |
| `wp_make_content_images_responsive()` | 5.5 | `wp_filter_content_tags()` |
| `add_option_whitelist()` | 5.5 | `add_allowed_options()` |
| `remove_option_whitelist()` | 5.5 | `remove_allowed_options()` |
| `wp_get_loading_attr_default()` | 6.3 | `wp_get_loading_optimization_attributes()` |
| `the_meta()` | 6.0.2 | `get_post_meta()` |
| `readonly()` | 5.9 | `wp_readonly()` |
| `attribute_escape()` | 2.8 | `esc_attr()` |
| `wp_specialchars()` | 2.8 | `esc_html()` |
| `js_escape()` | 2.8 | `esc_js()` |
| `clean_url()` | 3.0 | `esc_url()` |
| `seems_utf8()` | 6.9 | `wp_is_valid_utf8()` |
| `current_user_can_for_blog()` | 6.7 | `current_user_can_for_site()` |

WPCS flags usage as an error if the function was deprecated before your configured minimum WP version, and a warning otherwise.

---

## 8. Formatting

### 8.1 Spacing

WordPress uses spaces inside parentheses, brackets, and around operators:

```php
// BAD
if($condition){
    $arr = array('a'=>1,'b'=>2);
    foreach($arr as $k=>$v){}
}

// GOOD
if ( $condition ) {
    $arr = array( 'a' => 1, 'b' => 2 );
    foreach ( $arr as $k => $v ) {}
}
```

**Control structures** always use spaces after keywords and inside parentheses:

```php
if ( $a ) {}
elseif ( $b ) {}
for ( $i = 0; $i < 10; $i++ ) {}
while ( $condition ) {}
switch ( $var ) {}
```

### 8.2 Indentation

- Use **tabs** for indentation, not spaces.
- Array items: one item per line for multi-line arrays, with trailing comma.

```php
$args = array(
    'post_type'      => 'acme_book',
    'posts_per_page' => 10,
    'orderby'        => 'date',
    'order'          => 'DESC',
);
```

### 8.3 Operator Spacing

```php
// BAD
$a=$b+$c;
$d = $e.$f;

// GOOD
$a = $b + $c;
$d = $e . $f;
```

### 8.4 Cast Spacing

A space after the cast, no space inside:

```php
// BAD
$id = (int)$_GET['id'];
$id = ( int ) $_GET['id'];

// GOOD
$id = (int) $_GET['id'];
```

### 8.5 Object Operator Spacing

No spaces around `->` or `?->`:

```php
// BAD
$post -> post_title;

// GOOD
$post->post_title;
```

---

## 9. Testing

### 9.1 PHP Testing

- Use **PHPUnit** with the WordPress test framework (`WP_UnitTestCase`).
- Install via `composer require --dev phpunit/phpunit` or use `wp scaffold plugin-tests`.
- Test files go in `tests/` directory.
- Class test files: `test-class-{name}.php` or `class-test-{name}.php`.

```php
class Test_Acme_Feature extends WP_UnitTestCase {
    public function test_something_returns_expected() {
        $result = acme_do_something();
        $this->assertEquals( 'expected', $result );
    }
}
```

### 9.2 JavaScript Testing

- Use `@wordpress/scripts` which bundles Jest: `npx wp-scripts test-unit-js`.
- Tests in `__tests__/` or `*.test.js` files.
- For E2E: `@wordpress/e2e-test-utils` with Puppeteer/Playwright.

### 9.3 Linting

```bash
# PHP coding standards
composer require --dev wp-coding-standards/wpcs dealerdirect/phpcodesniffer-composer-installer
vendor/bin/phpcs --standard=WordPress src/

# JS/CSS lint
npx wp-scripts lint-js
npx wp-scripts lint-style
```

---

## 10. Quick Reference Tables

### Control Structure Spacing

| Pattern | BAD | GOOD |
|---------|-----|------|
| if | `if($x)` | `if ( $x )` |
| elseif | `elseif($x)` | `elseif ( $x )` |
| foreach | `foreach($a as $b)` | `foreach ( $a as $b )` |
| for | `for($i=0;$i<10;$i++)` | `for ( $i = 0; $i < 10; $i++ )` |
| switch | `switch($x)` | `switch ( $x )` |
| while | `while($x)` | `while ( $x )` |

### Naming Quick Reference

| Element | Convention | Example |
|---------|-----------|---------|
| Functions | `snake_case` | `acme_get_settings()` |
| Variables | `snake_case` | `$post_title` |
| Classes | `Pascal_Case` (underscored) | `Acme_Plugin_Admin` |
| Constants | `UPPER_SNAKE_CASE` | `ACME_VERSION` |
| Files | `lowercase-hyphens` | `class-acme-admin.php` |
| Hook names | `lowercase_underscores` | `acme_after_init` |
| Post type slugs | `lowercase`, `a-z0-9_-` | `acme_book` |

### WordPress i18n Functions at a Glance

| Need | Function |
|------|----------|
| Return translated string | `__()` |
| Echo translated string | `_e()` |
| Return + HTML escape | `esc_html__()` |
| Echo + HTML escape | `esc_html_e()` |
| Return + attr escape | `esc_attr__()` |
| Echo + attr escape | `esc_attr_e()` |
| With context | `_x()`, `esc_html_x()`, `esc_attr_x()` |
| Singular/plural | `_n()` |
| Singular/plural + context | `_nx()` |
