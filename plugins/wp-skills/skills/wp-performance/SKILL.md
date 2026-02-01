---
name: wp-performance
description: Use when optimizing WordPress performance, debugging slow queries, configuring caching, reviewing database code, or preparing for high traffic — WP_Query optimization, object cache, transients, anti-patterns, profiling, platform-specific guidance.
---

# WordPress Performance Optimization

Comprehensive guide for optimizing WordPress performance: database queries, caching layers, hooks, AJAX, assets, profiling, and anti-pattern detection.

## When to Use

- Reviewing code for performance issues in themes or plugins
- Debugging slow page loads, timeouts, or 500 errors
- Optimizing WP_Query or database operations
- Implementing or auditing caching strategy
- Preparing for high-traffic events (launch, sale, viral moment)
- Investigating memory exhaustion or database locks
- Profiling backend performance without a browser

---

## 1. Database & WP_Query Optimization

### WP_Query Review Checklist

- [ ] `posts_per_page` is set (never -1)
- [ ] `no_found_rows => true` when not paginating
- [ ] `fields => 'ids'` when only IDs needed
- [ ] `update_post_meta_cache => false` if meta not used
- [ ] `update_post_term_cache => false` if terms not used
- [ ] Date limits on archive queries
- [ ] `include_children => false` if child terms not needed
- [ ] No `post__not_in` with large arrays
- [ ] No `meta_query` on `meta_value` (use taxonomy or key presence)
- [ ] Results cached with `wp_cache_set` if repeated

### Unbounded Queries (CRITICAL)

```php
// BAD: Returns ALL posts. OOM on large sites.
$query = new WP_Query( array(
    'post_type'      => 'post',
    'posts_per_page' => -1,
) );

// GOOD: Always set limits.
$query = new WP_Query( array(
    'post_type'      => 'post',
    'posts_per_page' => 100,
    'no_found_rows'  => true,
) );
```

### Never Use query_posts() (CRITICAL)

```php
// BAD: Replaces main query, breaks pagination and conditionals.
query_posts( 'cat=1&posts_per_page=5' );

// GOOD: Modify main query with pre_get_posts.
add_action( 'pre_get_posts', function( $query ) {
    if ( ! is_admin() && $query->is_main_query() && $query->is_home() ) {
        $query->set( 'posts_per_page', 5 );
        $query->set( 'cat', 1 );
    }
} );

// GOOD: Use WP_Query for secondary queries.
$custom = new WP_Query( array( 'cat' => 1, 'posts_per_page' => 5 ) );
```

### Validate IDs Before Querying (CRITICAL)

```php
// BAD: If $post_id is false/null, intval() returns 0, removing WHERE clause.
$query = new WP_Query( array( 'p' => intval( $maybe_false_id ) ) );

// GOOD: Validate first.
if ( ! empty( $maybe_false_id ) ) {
    $query = new WP_Query( array( 'p' => intval( $maybe_false_id ) ) );
}
```

### LIKE with Leading Wildcards (WARNING)

```php
// BAD: Full table scan, indexes cannot help.
$wpdb->get_results( $wpdb->prepare(
    "SELECT * FROM {$wpdb->posts} WHERE post_title LIKE %s", '%search%'
) );

// GOOD: Trailing wildcard only.
$wpdb->get_results( $wpdb->prepare(
    "SELECT * FROM {$wpdb->posts} WHERE post_title LIKE %s",
    $wpdb->esc_like( $term ) . '%'
) );
```

### NOT IN Subqueries (WARNING)

```php
// BAD: Slow with large exclusion lists.
'post__not_in' => $hundreds_of_ids

// GOOD: Fetch extra, filter in PHP.
$query = new WP_Query( array(
    'posts_per_page' => 10 + count( $excluded ),
    'no_found_rows'  => true,
) );
$count = 0;
while ( $query->have_posts() && $count < 10 ) {
    $query->the_post();
    if ( in_array( get_the_ID(), $excluded, true ) ) { continue; }
    // Process post.
    $count++;
}
wp_reset_postdata();
```

### Meta Query Optimization (WARNING)

```php
// BAD: meta_value is not indexed; full table scan.
'meta_query' => array( array( 'key' => 'color', 'value' => 'red' ) )

// GOOD: Use taxonomy for filterable attributes.
'tax_query' => array( array(
    'taxonomy' => 'color', 'field' => 'slug', 'terms' => 'red'
) )

// GOOD: For boolean flags, use key EXISTS (indexed on meta_key).
'meta_key' => 'is_featured', 'meta_compare' => 'EXISTS'
```

### N+1 Query Problem (CRITICAL)

```php
// BAD: 1 query per post in the loop.
while ( have_posts() ) {
    the_post();
    $meta = get_post_meta( get_the_ID(), 'views', true ); // Query each time!
}

// GOOD: Prime caches before the loop.
$post_ids = wp_list_pluck( $query->posts, 'ID' );
update_postmeta_cache( $post_ids );        // Single query for all meta.
update_object_term_cache( $post_ids, 'post' ); // Single query for all terms.
cache_users( wp_list_pluck( $query->posts, 'post_author' ) );

while ( have_posts() ) {
    the_post();
    $meta = get_post_meta( get_the_ID(), 'views', true ); // Served from cache.
}
```

### Date-Limiting Queries

```php
// GOOD: Limit to recent content on mature sites.
$query = new WP_Query( array(
    'category_name'  => 'news',
    'posts_per_page' => 10,
    'date_query'     => array( array( 'after' => '3 months ago' ) ),
) );
```

### Optimized Query Patterns

```php
// Check if posts exist (minimal work).
$query = new WP_Query( array(
    'post_type'              => 'product',
    'posts_per_page'         => 1,
    'fields'                 => 'ids',
    'no_found_rows'          => true,
    'update_post_meta_cache' => false,
    'update_post_term_cache' => false,
) );
$has_products = $query->have_posts();
```

### EXPLAIN Indicators

| Column  | Good Value                          | Bad Value                               |
|---------|-------------------------------------|-----------------------------------------|
| `type`  | `const`, `eq_ref`, `ref`, `range`   | `ALL` (full table scan)                 |
| `key`   | Named index                         | `NULL` (no index used)                  |
| `rows`  | Small number                        | Large number                            |
| `Extra` | `Using index`                       | `Using filesort`, `Using temporary`     |

---

## 2. Caching Layers

### Caching Architecture

```
User Request
    |
[ CDN / Edge Cache ]       -- Full page HTML, static assets
    |
[ Page Cache (Varnish) ]   -- Bypassed by: cookies, POST, query params
    |
[ Object Cache (Redis) ]   -- DB query results, transients, computed data
    |
[ Database (MySQL) ]       -- InnoDB buffer pool
```

### Page Cache

**Headers:**
```php
function set_cache_headers() {
    if ( ! is_user_logged_in() && ! is_admin() ) {
        header( 'Cache-Control: public, max-age=300, s-maxage=3600' );
        header( 'Vary: Accept-Encoding' );
    }
}
add_action( 'send_headers', 'set_cache_headers' );
```

**TTL Strategy:**

| Content Type   | Recommended TTL |
|----------------|-----------------|
| Homepage       | 5-15 minutes    |
| Archive pages  | 15-60 minutes   |
| Single posts   | 1-24 hours      |
| Static pages   | 24+ hours       |
| Media files    | 1 year (versioned) |

**Bypass Triggers (Avoid):** `session_start()`, `setcookie()` on public pages, POST for read ops, unique query params (UTM/fbclid).

### Object Cache (wp_cache)

```php
// Cache-aside pattern.
function get_featured_posts() {
    $cache_key = 'featured_posts_v1';
    $posts     = wp_cache_get( $cache_key, 'my_plugin' );

    if ( false === $posts ) {
        $query = new WP_Query( array(
            'post_type'      => 'post',
            'posts_per_page' => 5,
            'meta_key'       => 'featured',
            'meta_compare'   => 'EXISTS',
        ) );
        $posts = $query->posts;
        wp_cache_set( $cache_key, $posts, 'my_plugin', HOUR_IN_SECONDS );
    }
    return $posts;
}

// Invalidate on update.
add_action( 'save_post', function( $post_id ) {
    wp_cache_delete( 'featured_posts_v1', 'my_plugin' );
} );
```

**Batch lookups:**
```php
// BAD: Multiple round-trips.
foreach ( $ids as $id ) {
    $data[ $id ] = wp_cache_get( "item_{$id}", 'items' );
}

// GOOD: Single round-trip.
$keys = array_map( fn( $id ) => "item_{$id}", $ids );
$data = wp_cache_get_multiple( $keys, 'items' );
```

**Key versioning for bulk invalidation:**
```php
function get_cache_key( $base ) {
    $version = wp_cache_get( 'cache_version', 'my_plugin' ) ?: 1;
    return "{$base}_v{$version}";
}
function invalidate_all_cache() {
    wp_cache_incr( 'cache_version', 1, 'my_plugin' );
}
```

### Transients

**When to use:** Data with known expiration, external API responses, expensive computed results.

**When NOT to use:** Dynamic per-user keys without object cache (creates wp_options bloat), frequently-changing data.

```php
// BAD: Dynamic keys = table bloat without object cache.
set_transient( "user_{$user_id}_cart", $data, HOUR_IN_SECONDS );

// GOOD: Use object cache for user-specific data.
wp_cache_set( "cart_{$user_id}", $data, 'user_carts', HOUR_IN_SECONDS );

// GOOD: Check for object cache before using transients for large data.
if ( wp_using_ext_object_cache() ) {
    set_transient( 'api_response', $data, DAY_IN_SECONDS );
} else {
    // File cache or skip on shared hosting.
}
```

### In-Memory / Static Variable Caching (Request-Scoped)

```php
function get_expensive_data( $id ) {
    static $cache = array();
    if ( ! isset( $cache[ $id ] ) ) {
        $cache[ $id ] = expensive_computation( $id );
    }
    return $cache[ $id ];
}
```

### Race Conditions: Locking Pattern

```php
function get_expensive_data() {
    $data = wp_cache_get( 'expensive_data' );
    if ( false !== $data ) { return $data; }

    // Acquire lock (atomic).
    if ( wp_cache_add( 'expensive_data_lock', true, '', 30 ) ) {
        $data = expensive_computation();
        wp_cache_set( 'expensive_data', $data, '', 3600 );
        wp_cache_delete( 'expensive_data_lock' );
        return $data;
    }

    // Another process regenerating -- wait and retry.
    usleep( 100000 );
    return get_expensive_data(); // Add max retries in production.
}
```

### Stale-While-Revalidate

```php
function get_data_with_stale() {
    $data = wp_cache_get( 'my_data' );
    if ( false !== $data ) { return $data; }

    $stale = wp_cache_get( 'my_data_stale' );
    if ( false !== $stale ) {
        wp_schedule_single_event( time(), 'regenerate_my_data' );
        return $stale; // Serve stale immediately.
    }

    $data = regenerate_data();
    wp_cache_set( 'my_data', $data, '', 300 );
    wp_cache_set( 'my_data_stale', $data, '', 3600 );
    return $data;
}
```

### Cache Stampede Prevention

**Jitter:** Randomize TTL by +/-10% so keys do not expire simultaneously.

**Pre-warming via cron:** Regenerate popular caches before they expire.

**Early expiry check:** When cache is in last 10% of TTL, trigger background regeneration while serving current value.

### Memcached vs Redis

| Feature            | Memcached        | Redis                          |
|--------------------|------------------|--------------------------------|
| Speed              | Slightly faster  | Fast                           |
| Data types         | String only      | Strings, lists, sets, hashes   |
| Persistence        | No               | Optional                       |
| Memory efficiency  | Higher           | Lower                          |
| Cache groups       | Limited          | Full support (`flush_group`)   |

**Recommendation:** Use what your host provides. Redis if you need advanced features (groups, persistence).

---

## 3. Hooks & Actions Anti-Patterns

### Expensive Code on init / wp_loaded (WARNING)

```php
// BAD: HTTP call on every request.
add_action( 'init', function() {
    $data = wp_remote_get( 'https://api.example.com/data' );
} );

// GOOD: Cache the result.
add_action( 'init', function() {
    $data = get_transient( 'prefix_external_data' );
    if ( false === $data ) {
        $response = wp_remote_get( 'https://api.example.com/data' );
        if ( ! is_wp_error( $response ) ) {
            $data = wp_remote_retrieve_body( $response );
            set_transient( 'prefix_external_data', $data, HOUR_IN_SECONDS );
        }
    }
} );
```

### Database Writes on Frontend Page Loads (CRITICAL)

```php
// BAD: DB write on every page view.
add_action( 'wp_head', function() {
    update_option( 'page_views', get_option( 'page_views', 0 ) + 1 );
} );

// GOOD: Buffer in object cache, flush via cron.
add_action( 'shutdown', function() {
    wp_cache_incr( 'page_views_buffer', 1, 'counters' );
} );
```

### Conditional Loading Patterns

```php
// BAD: Runs on admin AND frontend.
add_action( 'init', 'prefix_frontend_only_function' );

// GOOD: Use appropriate hook.
add_action( 'template_redirect', 'prefix_frontend_only_function' );

// GOOD: Guard with context check.
add_action( 'init', function() {
    if ( is_admin() || wp_doing_cron() ) { return; }
    // Frontend-only code.
} );
```

---

## 4. AJAX & External Requests

### REST API Over admin-ajax.php

```php
// BAD: admin-ajax.php loads full WP including admin_init hooks.
add_action( 'wp_ajax_nopriv_get_posts', 'prefix_ajax_handler' );

// GOOD: REST API has leaner bootstrap.
add_action( 'rest_api_init', function() {
    register_rest_route( 'prefix/v1', '/posts', array(
        'methods'             => 'GET',
        'callback'            => 'prefix_rest_get_posts',
        'permission_callback' => '__return_true',
    ) );
} );
```

### No AJAX Polling (CRITICAL)

```javascript
// BAD: Self-DDoS. Every user hits server every 5 seconds.
setInterval(() => fetch('/wp-json/myapp/v1/updates'), 5000);

// GOOD: Use WebSockets, SSE, or long-polling with exponential backoff.
```

### Cache External HTTP Requests

```php
// BAD: Blocks page render, no timeout.
$response = wp_remote_get( $url );

// GOOD: Timeout + cache + error handling.
function prefix_get_api_data( $url ) {
    $cached = wp_cache_get( 'api_' . md5( $url ), 'external' );
    if ( false !== $cached ) { return $cached; }

    $response = wp_remote_get( $url, array( 'timeout' => 2 ) );
    if ( is_wp_error( $response ) ) { return get_fallback_data(); }

    $body = wp_remote_retrieve_body( $response );
    wp_cache_set( 'api_' . md5( $url ), $body, 'external', 300 );
    return $body;
}
```

### Batch External API Calls

Move heavy remote work to cron/queue. Never call external APIs synchronously on every page load.

---

## 5. Asset Loading

### Conditional Enqueue

```php
// BAD: Assets load globally.
add_action( 'wp_enqueue_scripts', function() {
    wp_enqueue_script( 'contact-form-js', get_template_directory_uri() . '/js/contact.js' );
} );

// GOOD: Only load on pages that need it.
add_action( 'wp_enqueue_scripts', function() {
    if ( is_page( 'contact' ) ) {
        wp_enqueue_script( 'contact-form-js', get_template_directory_uri() . '/js/contact.js' );
    }
} );
```

### Script Loading Strategy (WordPress 6.3+)

```php
// BAD: Blocks rendering (default).
wp_enqueue_script( 'my-script', $url );

// GOOD: Non-blocking with defer.
wp_enqueue_script( 'my-script', $url, array(), '1.0.0', array(
    'strategy' => 'defer',
) );
```

### Bundle Splitting

```javascript
// BAD: Full lodash (~70KB).
import _ from 'lodash';

// GOOD: Import only what you need (~2KB).
import map from 'lodash/map';
```

### Version Strings

```php
// BAD: No version -- stale assets after deploy.
wp_enqueue_script( 'my-script', $url );

// GOOD: Use theme version constant.
define( 'THEME_VERSION', '1.0.0' );
wp_enqueue_script( 'my-script', $url, array(), THEME_VERSION );
```

---

## 6. Transients & Options

### Large Autoloaded Options (WARNING)

All autoloaded options load on every request into `alloptions` cache.

```php
// BAD: Large data autoloaded (default is autoload=yes).
add_option( 'prefix_plugin_log', $massive_array );

// GOOD: Disable autoload for large/infrequent data.
add_option( 'prefix_plugin_log', $massive_array, '', 'no' );
// Or:
update_option( 'prefix_plugin_log', $data, false );
```

**WP-CLI diagnostic:**
```bash
wp option list --autoload=on --fields=option_name,size_bytes --format=table | sort -k2 -n | tail -20
```

---

## 7. WP-Cron

### Default Behavior

WP-Cron fires on page requests, adding latency to real users.

```php
// In wp-config.php:
define( 'DISABLE_WP_CRON', true );
// Server crontab:
// * * * * * cd /path/to/wp && wp cron event run --due-now
```

### Batch Processing

```php
// BAD: Process all 50k users in one cron run.
add_action( 'my_daily_sync', function() {
    foreach ( get_users() as $user ) { sync_user_data( $user ); }
} );

// GOOD: Process in batches, reschedule.
add_action( 'my_batch_sync', function() {
    $offset = (int) get_option( 'sync_offset', 0 );
    $users  = get_users( array( 'number' => 100, 'offset' => $offset ) );
    if ( empty( $users ) ) { delete_option( 'sync_offset' ); return; }
    foreach ( $users as $user ) { sync_user_data( $user ); }
    update_option( 'sync_offset', $offset + 100 );
    wp_schedule_single_event( time() + 60, 'my_batch_sync' );
} );
```

### Always Check Before Scheduling

```php
// BAD: Creates duplicate schedules.
wp_schedule_event( time(), 'hourly', 'my_task' );

// GOOD:
if ( ! wp_next_scheduled( 'my_task' ) ) {
    wp_schedule_event( time(), 'hourly', 'my_task' );
}
```

---

## 8. Uncached Function Calls

These WordPress functions query the database on every call without internal caching:

| Function                      | Issue                        | Fix                        |
|-------------------------------|------------------------------|----------------------------|
| `url_to_postid()`            | Full posts table scan        | Wrap with `wp_cache`       |
| `attachment_url_to_postid()` | Expensive meta lookup        | Wrap with `wp_cache`       |
| `count_user_posts()`         | COUNT query per call         | Cache per user             |
| `get_adjacent_post()`        | Complex query                | Cache or avoid in loops    |
| `wp_oembed_get()`            | External HTTP + parsing      | Cache with transient       |
| `wp_old_slug_redirect()`     | Meta table lookup            | Cache result               |

### Generic Caching Wrapper

```php
function prefix_cached_url_to_postid( $url ) {
    $cache_key = 'url_to_postid_' . md5( $url );
    $post_id   = wp_cache_get( $cache_key, 'url_lookups' );
    if ( false === $post_id ) {
        $post_id = url_to_postid( $url );
        wp_cache_set( $cache_key, $post_id, 'url_lookups', HOUR_IN_SECONDS );
    }
    return $post_id;
}
```

### VIP Platform Helpers

On WordPress VIP, use built-in cached alternatives:

```php
// Instead of:                          // Use:
url_to_postid( $url )                   wpcom_vip_url_to_postid( $url )
attachment_url_to_postid( $url )        wpcom_vip_attachment_url_to_postid( $url )
count_user_posts( $uid )                wpcom_vip_count_user_posts( $uid )
get_adjacent_post()                     wpcom_vip_get_adjacent_post()
wp_oembed_get( $url )                   wpcom_vip_wp_oembed_get( $url )
wp_remote_get( $url )                   vip_safe_wp_remote_get( $url )
```

---

## 9. Profiling & Measurement

### WP-CLI Profile (No Browser Required)

```bash
# Install if missing:
wp package install wp-cli/profile-command

# Stage overview:
wp profile stage --fields=stage,time,cache_ratio --url=https://example.com/

# Find slow hooks:
wp profile hook --spotlight --url=https://example.com/

# Drill into a specific hook:
wp profile hook init --spotlight
```

### WP-CLI Doctor (Quick Diagnostics)

```bash
wp package install wp-cli/doctor-command
wp doctor check
# Checks: autoload-options-size, SAVEQUERIES, WP_DEBUG, cron duplicates, etc.
```

### Server-Timing Headers

With Performance Lab plugin enabled:
```bash
curl -sS -D - https://example.com/ -o /dev/null | grep -i "server-timing:"
```

### Query Monitor (Headless via REST)

Authenticate with Application Password, then inspect `x-qm-*` response headers or use `?_envelope` to get `qm` property with DB queries, cache stats, HTTP API timing.

### Performance Targets

| Metric              | Target    | Investigate |
|---------------------|-----------|-------------|
| Page generation     | < 200ms   | > 500ms     |
| TTFB                | < 200ms   | > 500ms     |
| Database queries    | < 50      | > 100       |
| Duplicate queries   | 0         | > 5         |
| Slowest query       | < 50ms    | > 100ms     |
| Object cache hits   | > 90%     | < 80%       |
| Total query time    | < 100ms   | > 500ms     |

---

## 10. Platform-Specific Guidance

| Platform                | Object Cache | Key Notes                                                       |
|-------------------------|--------------|-----------------------------------------------------------------|
| **WordPress VIP**       | Built-in     | Use `wpcom_vip_*` helpers; page cache at edge; strict code review |
| **WP Engine**           | Built-in     | EverCache page cache; Redis object cache; purge API available    |
| **Pantheon**            | Built-in     | Redis object cache; Varnish page cache; Fastly CDN               |
| **Self-hosted + Redis** | Manual setup | Install `wp-redis` or `object-cache-pro`; configure TTLs         |
| **Shared hosting**      | Usually none | Transients fall back to DB; be extra cautious with unbounded queries |

---

## 11. Anti-Pattern Quick Reference

| # | Pattern | Severity | Fix |
|---|---------|----------|-----|
| 1 | `posts_per_page => -1` | CRITICAL | Set limit, paginate |
| 2 | `query_posts()` | CRITICAL | Use `WP_Query` or `pre_get_posts` |
| 3 | `session_start()` on frontend | CRITICAL | Remove or restrict to logged-in users |
| 4 | `setInterval` + fetch/ajax | CRITICAL | WebSockets, SSE, or backoff polling |
| 5 | DB writes on every page load | CRITICAL | Buffer in cache, flush via cron |
| 6 | `intval($falsy)` in query args | CRITICAL | Validate before querying |
| 7 | N+1 queries in loops | CRITICAL | `update_postmeta_cache()` / batch |
| 8 | Long-running cron callbacks | CRITICAL | Batch processing with reschedule |
| 9 | Redirect loops | CRITICAL | Debug with `x-redirect-by` header |
| 10 | `cache_results => false` | WARNING | Remove (let WP cache results) |
| 11 | `LIKE '%term%'` (leading wildcard) | WARNING | Trailing wildcard or search engine |
| 12 | `post__not_in` large arrays | WARNING | Fetch extra, filter in PHP |
| 13 | `meta_query` on `meta_value` | WARNING | Use taxonomy or key EXISTS |
| 14 | Uncached `wp_remote_get` | WARNING | Cache response, set timeout |
| 15 | `$.post()` for read operations | WARNING | Use GET (cacheable) |
| 16 | `add_option` without `autoload=no` | WARNING | Set autoload to `'no'` for large data |
| 17 | `setcookie()` on public pages | WARNING | JS cookies or restrict scope |
| 18 | `url_to_postid()` uncached | WARNING | Wrap with `wp_cache` |
| 19 | `admin-ajax.php` for public use | WARNING | Use REST API |
| 20 | Dynamic transient keys without obj cache | WARNING | Use `wp_cache_set` directly |
| 21 | `in_array()` without strict, large array | WARNING | `isset()` on associative array |
| 22 | Expensive code on `init` hook | WARNING | Use `template_redirect` or guard |
| 23 | Assets loaded globally | WARNING | Conditional `wp_enqueue_script` |
| 24 | `get_template_part` in large loops | WARNING | Cache rendered output |
| 25 | `wp_schedule_event` without `wp_next_scheduled` | WARNING | Check before scheduling |
| 26 | POST infinite scroll | WARNING | Use GET requests (cacheable) |
| 27 | Full lodash import | WARNING | Import specific modules |
| 28 | Missing `no_found_rows` (non-paginated) | INFO | Add `'no_found_rows' => true` |
| 29 | Missing script version string | INFO | Use `THEME_VERSION` constant |
| 30 | Missing `defer`/`async` strategy | INFO | Use `'strategy' => 'defer'` (WP 6.3+) |

---

## 12. Search Patterns for Quick Detection

```bash
# Critical issues
grep -rn "posts_per_page.*-1\|numberposts.*-1" .
grep -rn "query_posts\s*(" .
grep -rn "session_start\s*(" .
grep -rn "setInterval.*fetch\|setInterval.*ajax" .

# DB writes on frontend
grep -rn "update_option\|add_option" . | grep -v "admin\|activate\|install"

# Uncached expensive functions
grep -rn "url_to_postid\|attachment_url_to_postid\|count_user_posts" .

# External HTTP without caching
grep -rn "wp_remote_get\|wp_remote_post" .

# Asset loading issues
grep -rn "wp_enqueue_script\|wp_enqueue_style" . | grep -v "is_page\|is_singular\|is_admin"

# Transient misuse
grep -rn "set_transient.*\\\$" .

# WP-Cron issues
grep -rn "wp_schedule_event" . | grep -v "wp_next_scheduled"
```

---

## Severity Definitions

| Severity     | Description                                           |
|--------------|-------------------------------------------------------|
| **Critical** | Will cause failures at scale (OOM, 500s, DB locks)    |
| **Warning**  | Degrades performance under load                       |
| **Info**     | Optimization opportunity                              |

## Output Format

When reporting findings, structure as:

```
## Performance Review: [filename/component]

### Critical Issues
- **Line X**: [Issue] - [Explanation] - [Fix]

### Warnings
- **Line X**: [Issue] - [Explanation] - [Fix]

### Recommendations
- [Optimization opportunities]

### Summary
- Total issues: X Critical, Y Warnings, Z Info
- Estimated impact: [High/Medium/Low]
```
