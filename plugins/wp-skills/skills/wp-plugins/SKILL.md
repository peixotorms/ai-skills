---
name: wp-plugins
description: Use when building WordPress plugins or themes — architecture, lifecycle hooks, settings API, data storage, custom tables, WP-CLI commands, PHPStan configuration, PHPCS, testing, build and deploy workflow.
---

# WordPress Plugin & Theme Development

Consolidated reference for plugin architecture, lifecycle, settings, data storage,
WP-CLI integration, static analysis, coding standards, testing, and deployment.

---

## 1. Plugin Architecture

### Main Plugin File

Every plugin starts with a single PHP file containing the plugin header comment.
WordPress reads this header to register the plugin in the admin UI.

```php
<?php
/**
 * Plugin Name: My Awesome Plugin
 * Plugin URI:  https://example.com/my-awesome-plugin
 * Description: A short description of what this plugin does.
 * Version:     1.0.0
 * Author:      Your Name
 * Author URI:  https://example.com
 * License:     GPL-2.0-or-later
 * Text Domain: my-awesome-plugin
 * Domain Path: /languages
 * Requires at least: 6.2
 * Requires PHP: 7.4
 */

// Prevent direct access.
defined( 'ABSPATH' ) || exit;

// Define constants.
define( 'MAP_VERSION', '1.0.0' );
define( 'MAP_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'MAP_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'MAP_PLUGIN_FILE', __FILE__ );

// Autoloader (Composer PSR-4).
if ( file_exists( MAP_PLUGIN_DIR . 'vendor/autoload.php' ) ) {
    require_once MAP_PLUGIN_DIR . 'vendor/autoload.php';
}

// Lifecycle hooks — must be registered at top level, not inside other hooks.
register_activation_hook( __FILE__, [ 'MyAwesomePlugin\\Activator', 'activate' ] );
register_deactivation_hook( __FILE__, [ 'MyAwesomePlugin\\Deactivator', 'deactivate' ] );

// Bootstrap the plugin on `plugins_loaded`.
add_action( 'plugins_loaded', function () {
    MyAwesomePlugin\Plugin::instance()->init();
} );
```

### Bootstrap Pattern

- The main file loads, defines constants, requires the autoloader, registers
  lifecycle hooks, and defers initialization to a `plugins_loaded` callback.
- Avoid heavy side effects at file load time. Load on hooks.
- Keep admin-only code behind `is_admin()` checks or admin-specific hooks.

### Namespaces and Autoloading (PSR-4)

Configure in `composer.json`:

```json
{
    "autoload": {
        "psr-4": {
            "MyAwesomePlugin\\": "includes/"
        }
    },
    "autoload-dev": {
        "psr-4": {
            "MyAwesomePlugin\\Tests\\": "tests/"
        }
    }
}
```

Run `composer dump-autoload` after changes.

### Folder Structure

```
my-awesome-plugin/
  my-awesome-plugin.php      # Main plugin file with header
  uninstall.php              # Cleanup on uninstall
  composer.json / phpstan.neon / phpcs.xml / .distignore
  includes/                  # Core PHP classes (PSR-4 root)
    Plugin.php / Activator.php / Deactivator.php
    Admin/  Frontend/  CLI/  REST/
  admin/  public/            # View partials
  assets/  templates/  languages/  tests/
```

### Singleton vs Dependency Injection

Use singleton for the root plugin class only. Prefer dependency injection for
everything else (testability).

```php
namespace MyAwesomePlugin;

class Plugin {
    private static ?Plugin $instance = null;

    public static function instance(): Plugin {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function init(): void {
        ( new Admin\Settings_Page() )->register();
        ( new Frontend\Assets() )->register();
        if ( defined( 'WP_CLI' ) && WP_CLI ) {
            CLI\Commands::register();
        }
    }
}
```

### Action / Filter Hook Architecture

- **Actions** execute code at a specific point (`do_action` / `add_action`).
- **Filters** modify data and return it (`apply_filters` / `add_filter`).
- Always specify the priority (default 10) and accepted args count.
- Provide your own hooks so other developers can extend your plugin.

```php
// Registering hooks in your plugin.
add_action( 'init', [ $this, 'register_post_types' ] );
add_filter( 'the_content', [ $this, 'append_cta' ], 20 );

// Providing extensibility.
$output = apply_filters( 'map_formatted_price', $formatted, $raw_price );
do_action( 'map_after_order_processed', $order_id );
```

---

## 2. Lifecycle Hooks

Lifecycle hooks **must** be registered at top-level scope in the main plugin
file, not inside other hooks or conditional blocks.

### Activation

```php
namespace MyAwesomePlugin;

class Activator {
    public static function activate(): void {
        self::create_tables();

        if ( false === get_option( 'map_settings' ) ) {
            update_option( 'map_settings', [
                'enabled' => true, 'api_key' => '', 'max_results' => 10,
            ], false );
        }

        update_option( 'map_db_version', MAP_VERSION, false );

        // Register CPTs first, then flush so rules exist.
        ( new Plugin() )->register_post_types();
        flush_rewrite_rules();
    }

    private static function create_tables(): void {
        global $wpdb;
        $table = $wpdb->prefix . 'map_logs';
        $sql = "CREATE TABLE {$table} (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            user_id bigint(20) unsigned NOT NULL DEFAULT 0,
            action varchar(100) NOT NULL DEFAULT '',
            data longtext NOT NULL DEFAULT '',
            created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY user_id (user_id)
        ) {$wpdb->get_charset_collate()};";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta( $sql );
    }
}
```

### Deactivation

```php
namespace MyAwesomePlugin;

class Deactivator {
    public static function deactivate(): void {
        // Clear scheduled cron events.
        wp_clear_scheduled_hook( 'map_daily_cleanup' );
        wp_clear_scheduled_hook( 'map_hourly_sync' );

        // Flush rewrite rules to remove custom rewrites.
        flush_rewrite_rules();
    }
}
```

### Uninstall

Create `uninstall.php` in the plugin root (preferred over `register_uninstall_hook`):

```php
<?php
// uninstall.php — runs when plugin is deleted via admin UI.
defined( 'WP_UNINSTALL_PLUGIN' ) || exit;

global $wpdb;
delete_option( 'map_settings' );
delete_option( 'map_db_version' );
$wpdb->query( "DELETE FROM {$wpdb->postmeta} WHERE meta_key LIKE 'map\_%'" );
$wpdb->query( "DROP TABLE IF EXISTS {$wpdb->prefix}map_logs" );
$wpdb->query(
    "DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_map_%'
     OR option_name LIKE '_transient_timeout_map_%'"
);
$wpdb->query( "DELETE FROM {$wpdb->usermeta} WHERE meta_key LIKE 'map\_%'" );
```

**Key rule:** Never run expensive operations on every request. Activation,
deactivation, and uninstall hooks exist precisely so you can perform setup and
teardown only when needed.

---

## 3. Settings API

### Registering Settings

```php
namespace MyAwesomePlugin\Admin;

class Settings_Page {

    public function register(): void {
        add_action( 'admin_menu', [ $this, 'add_menu' ] );
        add_action( 'admin_init', [ $this, 'register_settings' ] );
    }

    public function add_menu(): void {
        add_options_page(
            __( 'My Awesome Plugin', 'my-awesome-plugin' ),   // Page title
            __( 'My Plugin', 'my-awesome-plugin' ),            // Menu title
            'manage_options',                                   // Capability
            'my-awesome-plugin',                                // Menu slug
            [ $this, 'render_page' ]                           // Callback
        );
    }

    public function register_settings(): void {
        register_setting(
            'map_options_group',       // Option group
            'map_settings',            // Option name
            [
                'type'              => 'array',
                'sanitize_callback' => [ $this, 'sanitize' ],
                'default'           => [],
            ]
        );

        add_settings_section(
            'map_general',
            __( 'General Settings', 'my-awesome-plugin' ),
            '__return_null',
            'my-awesome-plugin'
        );

        add_settings_field(
            'map_api_key',
            __( 'API Key', 'my-awesome-plugin' ),
            [ $this, 'render_api_key_field' ],
            'my-awesome-plugin',
            'map_general'
        );

        add_settings_field(
            'map_max_results',
            __( 'Max Results', 'my-awesome-plugin' ),
            [ $this, 'render_max_results_field' ],
            'my-awesome-plugin',
            'map_general'
        );
    }

    public function sanitize( $input ): array {
        $clean = [];
        $clean['api_key']     = sanitize_text_field( $input['api_key'] ?? '' );
        $clean['max_results'] = absint( $input['max_results'] ?? 10 );
        $clean['enabled']     = ! empty( $input['enabled'] );
        return $clean;
    }

    public function render_page(): void {
        if ( ! current_user_can( 'manage_options' ) ) {
            return;
        }
        ?>
        <div class="wrap">
            <h1><?php echo esc_html( get_admin_page_title() ); ?></h1>
            <form action="options.php" method="post">
                <?php
                settings_fields( 'map_options_group' );
                do_settings_sections( 'my-awesome-plugin' );
                submit_button();
                ?>
            </form>
        </div>
        <?php
    }

    public function render_api_key_field(): void {
        $options = get_option( 'map_settings', [] );
        printf(
            '<input type="text" name="map_settings[api_key]" value="%s" class="regular-text" />',
            esc_attr( $options['api_key'] ?? '' )
        );
    }

    public function render_max_results_field(): void {
        $options = get_option( 'map_settings', [] );
        printf(
            '<input type="number" name="map_settings[max_results]" value="%d" min="1" max="100" />',
            absint( $options['max_results'] ?? 10 )
        );
    }
}
```

### Options API

```php
$settings = get_option( 'map_settings', [] );          // Read.
update_option( 'map_settings', $new_values );           // Write.
delete_option( 'map_settings' );                        // Delete.
update_option( 'map_large_cache', $data, false );       // autoload=false for infrequent options.
```

---

## 4. Data Storage

### When to Use What

| Storage            | Use Case                                  | Size Guidance            |
|--------------------|-------------------------------------------|--------------------------|
| Options API        | Small config, plugin settings             | < 1 MB per option        |
| Post meta          | Per-post data tied to a specific post     | Keyed per post           |
| User meta          | Per-user preferences or state             | Keyed per user           |
| Custom tables      | Structured, queryable, or large datasets  | No practical limit       |
| Transients         | Cached data with expiration               | Temporary, auto-expires  |

### Custom Tables with dbDelta

`dbDelta()` rules: each field on its own line, two spaces between name and type,
`PRIMARY KEY` with two spaces before, use `KEY` not `INDEX`.

```php
function map_create_table(): void {
    global $wpdb;
    $sql = "CREATE TABLE {$wpdb->prefix}map_events (
        id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
        name varchar(255) NOT NULL DEFAULT '',
        status varchar(20) NOT NULL DEFAULT 'draft',
        event_date datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
        PRIMARY KEY  (id),
        KEY status (status)
    ) {$wpdb->get_charset_collate()};";

    require_once ABSPATH . 'wp-admin/includes/upgrade.php';
    dbDelta( $sql );
}
```

### Schema Upgrades

Store a version and compare on `plugins_loaded`:

```php
add_action( 'plugins_loaded', function () {
    if ( version_compare( get_option( 'map_db_version', '0' ), MAP_VERSION, '<' ) ) {
        map_create_table();  // dbDelta handles ALTER for existing tables.
        update_option( 'map_db_version', MAP_VERSION, false );
    }
} );
```

### Transients

```php
$data = get_transient( 'map_api_results' );
if ( false === $data ) {
    $data = map_fetch_from_api();
    set_transient( 'map_api_results', $data, HOUR_IN_SECONDS );
}
```

### Safe SQL

Always use `$wpdb->prepare()` for user input. Never concatenate variables into SQL.

```php
$results = $wpdb->get_results( $wpdb->prepare(
    "SELECT * FROM {$wpdb->prefix}map_events WHERE status = %s AND event_date > %s",
    $status, $date
) );
```

---

## 5. WP-CLI Integration

### Registering Custom Commands

```php
namespace MyAwesomePlugin\CLI;

use WP_CLI;
use WP_CLI\Utils;

class Commands {
    public static function register(): void {
        WP_CLI::add_command( 'my-plugin sync', [ self::class, 'sync' ] );
        WP_CLI::add_command( 'my-plugin cleanup', [ self::class, 'cleanup' ] );
    }

    /**
     * Sync data from external API.
     *
     * ## OPTIONS
     * [--dry-run]  : Preview changes without writing.
     * [--limit=<n>]: Max items to sync. Default 100.
     *
     * ## EXAMPLES
     *     wp my-plugin sync --dry-run
     *     wp my-plugin sync --limit=50
     */
    public static function sync( array $args, array $assoc_args ): void {
        $dry_run = Utils\get_flag_value( $assoc_args, 'dry-run', false );
        $limit   = (int) Utils\get_flag_value( $assoc_args, 'limit', 100 );

        $items    = map_fetch_items( $limit );
        $progress = Utils\make_progress_bar( 'Syncing', count( $items ) );

        foreach ( $items as $item ) {
            if ( ! $dry_run ) {
                map_process_item( $item );
            }
            $progress->tick();
        }
        $progress->finish();
        WP_CLI::success( sprintf( 'Processed %d items.', count( $items ) ) );
    }

    /**
     * Clean up stale data.
     * ## OPTIONS
     * [--yes]: Skip confirmation prompt.
     */
    public static function cleanup( array $args, array $assoc_args ): void {
        WP_CLI::confirm( 'Delete all stale records?', $assoc_args );
        global $wpdb;
        $deleted = $wpdb->query(
            "DELETE FROM {$wpdb->prefix}map_logs
             WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY)"
        );
        WP_CLI::success( sprintf( 'Deleted %d stale records.', $deleted ) );
    }
}
```

### wp-cli.yml

```yaml
path: /var/www/html
url: https://example.com
apache_modules: [mod_rewrite]
@staging:
  url: https://staging.example.com
```

---

## 6. WP-CLI Operations Reference

### Search-Replace (Always Dry-Run First)

```bash
# 1. Backup.
wp db export backup.sql

# 2. Dry run — review impact.
wp search-replace 'http://old.example.com' 'https://new.example.com' --dry-run

# 3. Run for real (include non-core tables if needed).
wp search-replace 'http://old.example.com' 'https://new.example.com' \
    --all-tables-with-prefix --report-changed-only

# 4. Flush caches and rewrites.
wp cache flush
wp rewrite flush
```

Useful flags: `--dry-run`, `--precise`, `--skip-columns=guid`,
`--report-changed-only`, `--all-tables-with-prefix`.

### Other Common Operations

```bash
# Database.
wp db export backup.sql       # Backup.
wp db import backup.sql       # Restore (overwrites).
wp db optimize                # Optimize tables.

# Plugins / themes.
wp plugin list                # List with status.
wp plugin install <slug>      # Install.
wp plugin activate <slug>     # Activate.
wp plugin update --all        # Update all (avoid on prod without window).
wp theme activate <slug>

# Cron.
wp cron event list            # Show scheduled events.
wp cron event run <hook>      # Run specific event.

# Cache.
wp cache flush                # Flush object cache.
wp transient delete --all     # Delete all transients.
wp rewrite flush              # Regenerate rewrite rules.

# Multisite.
wp site list
wp option get siteurl --url=sub.example.com
wp plugin activate my-plugin --network       # Network-wide.
# Iterate: for URL in $(wp site list --field=url); do wp <cmd> --url="$URL"; done
```

---

## 7. Static Analysis (PHPStan)

### Configuration: phpstan.neon

```neon
includes:
    - phpstan-baseline.neon

parameters:
    level: 5
    paths:
        - includes/
    excludePaths:
        - vendor/
        - vendor-prefixed/
        - node_modules/
        - tests/
    ignoreErrors:
        # Narrow, documented exceptions only.
```

### WordPress Stubs

```bash
# Required for most WordPress plugin/theme repos.
composer require --dev szepeviktor/phpstan-wordpress

# Additional stubs as needed.
composer require --dev php-stubs/wordpress-stubs
composer require --dev php-stubs/woocommerce-stubs
composer require --dev php-stubs/acf-pro-stubs
```

Ensure stubs are loaded in `phpstan.neon`:

```neon
parameters:
    scanFiles:
        - %rootDir%/../../php-stubs/wordpress-stubs/wordpress-stubs.php
    bootstrapFiles:
        - %rootDir%/../../php-stubs/woocommerce-stubs/woocommerce-stubs.php
```

### Baseline for Legacy Code

```bash
# Generate baseline.
vendor/bin/phpstan analyse --generate-baseline phpstan-baseline.neon

# Ongoing: never baseline new errors. Fix them. Chip away at baseline over time.
```

### Level Progression

Start at level 0, increase gradually: 0=basic, 1=undefined vars, 2=unknown
methods, 3=return types, 4=dead code, 5=argument types, 6=missing typehints,
7=union types, 8=nullability, 9=mixed restrictions.

### WordPress-Specific Annotations

```php
// REST request typing.
/** @phpstan-param WP_REST_Request<array{post?: int, per_page?: int}> $request */
public function get_items( WP_REST_Request $request ): WP_REST_Response { ... }

// Hook callbacks — add accurate @param types.
/** @param string $new @param string $old @param WP_Post $post */
function handle_transition( string $new, string $old, WP_Post $post ): void { ... }
add_action( 'transition_post_status', 'handle_transition', 10, 3 );

// Database results — use object shapes.
/** @return array<object{id: int, name: string}> */
function get_user_data(): array { ... }
```

### Third-Party Class Handling

Prefer stubs over ignoreErrors. If stubs unavailable, use targeted patterns:

```neon
parameters:
    ignoreErrors:
        - '#.*(unknown class|call to method .* on an unknown class) WC_.*#'   # WooCommerce
        - '#.*(unknown class|call to method .* on an unknown class) ACF.*#'   # ACF Pro
```

---

## 8. Coding Standards (PHPCS)

```bash
composer require --dev wp-coding-standards/wpcs dealerdirect/phpcodesniffer-composer-installer
```

### phpcs.xml

```xml
<?xml version="1.0"?>
<ruleset name="My Awesome Plugin">
    <file>./includes</file>
    <file>./my-awesome-plugin.php</file>
    <exclude-pattern>./vendor/*</exclude-pattern>
    <exclude-pattern>./node_modules/*</exclude-pattern>
    <arg name="extensions" value="php"/>
    <rule ref="WordPress">
        <exclude name="WordPress.Files.FileName.InvalidClassFileName"/>
    </rule>
    <rule ref="WordPress.WP.I18n">
        <properties>
            <property name="text_domain" type="array">
                <element value="my-awesome-plugin"/>
            </property>
        </properties>
    </rule>
    <config name="minimum_supported_wp_version" value="6.2"/>
</ruleset>
```

Run: `vendor/bin/phpcs` (check) and `vendor/bin/phpcbf` (auto-fix).

---

## 9. Testing

### PHPUnit with wp-phpunit

```json
{
    "require-dev": {
        "yoast/phpunit-polyfills": "^2.0",
        "wp-phpunit/wp-phpunit": "^6.5"
    }
}
```

### Test Class Example

```php
namespace MyAwesomePlugin\Tests;

use WP_UnitTestCase;

class Test_Plugin extends WP_UnitTestCase {

    public function test_activation_creates_table(): void {
        global $wpdb;
        \MyAwesomePlugin\Activator::activate();
        $table = $wpdb->prefix . 'map_logs';
        $this->assertSame( $table, $wpdb->get_var( "SHOW TABLES LIKE '{$table}'" ) );
    }

    public function test_settings_sanitize(): void {
        $page  = new \MyAwesomePlugin\Admin\Settings_Page();
        $clean = $page->sanitize( [
            'api_key' => '<script>alert(1)</script>', 'max_results' => '-5',
        ] );
        $this->assertSame( '', $clean['api_key'] );
        $this->assertSame( 0, $clean['max_results'] );
    }

    public function test_factory_helpers(): void {
        $id = self::factory()->post->create( [ 'post_title' => 'Test' ] );
        $this->assertSame( 'Test', get_post( $id )->post_title );
    }
}
```

JavaScript tests: `npx wp-scripts test-unit-js`.

---

## 10. Build & Deploy

### Composer for Dependencies

```bash
# Production install (no dev dependencies).
composer install --no-dev --optimize-autoloader
```

### JavaScript / CSS Build

```bash
# Build with @wordpress/scripts.
npx wp-scripts build

# Development watch mode.
npx wp-scripts start
```

### .distignore

Exclude dev files: `/.git`, `/.github`, `/node_modules`, `/tests`, `/.distignore`,
`/.editorconfig`, `/.gitignore`, `/phpcs.xml`, `/phpstan.neon`,
`/phpstan-baseline.neon`, `/phpunit.xml`, `/composer.json`, `/composer.lock`,
`/package.json`, `/package-lock.json`, `/webpack.config.js`.

### Version Bumping

Update in: plugin header (`Version:`), plugin constant (`MAP_VERSION`),
`readme.txt` (`Stable tag:`), and `package.json`.

### WordPress.org SVN Deployment

```bash
svn checkout https://plugins.svn.wordpress.org/my-awesome-plugin svn-repo
rsync -av --delete --exclude-from=.distignore ./ svn-repo/trunk/
cd svn-repo && svn add --force trunk/ && svn cp trunk tags/1.0.0
svn ci -m "Release 1.0.0"
```

---

## 11. Security Checklist

- Sanitize on input, escape on output. Never trust `$_POST`/`$_GET` directly.
- Use `wp_unslash()` before sanitizing superglobals. Read explicit keys only.
- Pair nonce checks with `current_user_can()`. Nonces prevent CSRF, not authz.
- Use `$wpdb->prepare()` for all SQL with user input.
- Escape output: `esc_html()`, `esc_attr()`, `esc_url()`, `wp_kses_post()`.

---

## 12. Common Mistakes

| Mistake | Why It Fails | Fix |
|---------|-------------|-----|
| Lifecycle hooks inside `add_action('init', ...)` | Activation/deactivation hooks not detected | Register at top-level scope in main file |
| `flush_rewrite_rules()` without registering CPTs first | Rules flushed before custom post types exist | Call CPT registration, then flush |
| Missing `sanitize_callback` on `register_setting()` | Unsanitized data saved to database | Always provide sanitize callback |
| `autoload` left as `yes` for large/infrequent options | Every page load fetches unused data | Pass `false` as 4th arg to `update_option()` |
| Using `$wpdb->query()` with string concatenation | SQL injection vulnerability | Use `$wpdb->prepare()` |
| Nonce check without capability check | CSRF prevented but no authorization | Always pair nonce + `current_user_can()` |
| `innerHTML =` in admin JS | XSS vector | Use `textContent` or DOM creation methods |
| No `defined('ABSPATH')` guard | Direct file access possible | Add `defined('ABSPATH') \|\| exit;` to every PHP file |
| Running `dbDelta()` on every request | Slow table introspection on every page load | Run only on activation or version upgrade |
| Not checking `WP_UNINSTALL_PLUGIN` in uninstall.php | File could be loaded outside uninstall context | Check constant before running cleanup |
| PHPStan baseline grows unchecked | New errors silently added to baseline | Review baseline changes in PRs; never baseline new code |
| Missing `--dry-run` on `wp search-replace` | Irreversible changes to production database | Always dry-run first, then backup, then run |
| Forgetting `--url=` in multisite WP-CLI | Command hits wrong site | Always include `--url=` for site-specific operations |
