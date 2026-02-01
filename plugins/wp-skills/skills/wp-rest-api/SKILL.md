---
name: wp-rest-api
description: Use when building WordPress REST API endpoints, custom routes, controllers, or using the Abilities API — route registration, schema validation, permission callbacks, authentication, response shaping, field registration, Abilities API for declarative permissions.
---

# WP REST API & Abilities API

## Route Registration

### `register_rest_route()`

Register routes on the `rest_api_init` hook. A **route** is the URL pattern; an **endpoint** is the method + callback bound to that route.

```php
add_action( 'rest_api_init', function () {
    // Simple GET endpoint
    register_rest_route( 'myplugin/v1', '/items', [
        'methods'             => WP_REST_Server::READABLE, // GET
        'callback'            => 'myplugin_get_items',
        'permission_callback' => '__return_true',
    ] );

    // POST endpoint with args
    register_rest_route( 'myplugin/v1', '/items', [
        'methods'             => WP_REST_Server::CREATABLE, // POST
        'callback'            => 'myplugin_create_item',
        'permission_callback' => function ( $request ) {
            return current_user_can( 'edit_posts' );
        },
        'args' => [
            'title' => [
                'type'              => 'string',
                'required'          => true,
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'status' => [
                'type'    => 'string',
                'default' => 'draft',
                'enum'    => [ 'draft', 'publish' ],
            ],
        ],
    ] );

    // Route with regex-constrained parameter
    register_rest_route( 'myplugin/v1', '/items/(?P<id>[\d]+)', [
        'methods'             => WP_REST_Server::EDITABLE, // PUT, PATCH
        'callback'            => 'myplugin_update_item',
        'permission_callback' => function ( $request ) {
            return current_user_can( 'edit_post', $request['id'] );
        },
        'args' => [
            'id' => [
                'type'              => 'integer',
                'required'          => true,
                'validate_callback' => 'rest_validate_request_arg',
                'sanitize_callback' => 'absint',
            ],
        ],
    ] );

    // DELETE endpoint
    register_rest_route( 'myplugin/v1', '/items/(?P<id>[\d]+)', [
        'methods'             => WP_REST_Server::DELETABLE,
        'callback'            => 'myplugin_delete_item',
        'permission_callback' => function ( $request ) {
            return current_user_can( 'delete_post', $request['id'] );
        },
    ] );
} );
```

### Namespacing rules

- Always use a unique namespace: `vendor/v1` (e.g. `myplugin/v1`).
- Never use `wp/*` unless contributing to WordPress core.
- For non-pretty permalinks, routes are accessed via `?rest_route=/namespace/route`.

### HTTP method constants

| Constant | Methods |
|----------|---------|
| `WP_REST_Server::READABLE` | GET |
| `WP_REST_Server::CREATABLE` | POST |
| `WP_REST_Server::EDITABLE` | PUT, PATCH |
| `WP_REST_Server::DELETABLE` | DELETE |
| `WP_REST_Server::ALLMETHODS` | All of the above |

Multiple endpoints can share a route (one per method group).

### `WP_REST_Controller` pattern

Extend `WP_REST_Controller` for non-trivial endpoints. This gives you a structured CRUD pattern with built-in schema wiring.

```php
class MyPlugin_Items_Controller extends WP_REST_Controller {

    protected $namespace = 'myplugin/v1';
    protected $rest_base = 'items';

    public function register_routes() {
        register_rest_route( $this->namespace, '/' . $this->rest_base, [
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [ $this, 'get_items' ],
                'permission_callback' => [ $this, 'get_items_permissions_check' ],
                'args'                => $this->get_collection_params(),
            ],
            [
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => [ $this, 'create_item' ],
                'permission_callback' => [ $this, 'create_item_permissions_check' ],
                'args'                => $this->get_endpoint_args_for_item_schema( WP_REST_Server::CREATABLE ),
            ],
            'schema' => [ $this, 'get_public_item_schema' ],
        ] );

        register_rest_route( $this->namespace, '/' . $this->rest_base . '/(?P<id>[\d]+)', [
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [ $this, 'get_item' ],
                'permission_callback' => [ $this, 'get_item_permissions_check' ],
                'args'                => [ 'context' => $this->get_context_param( [ 'default' => 'view' ] ) ],
            ],
            [
                'methods'             => WP_REST_Server::EDITABLE,
                'callback'            => [ $this, 'update_item' ],
                'permission_callback' => [ $this, 'update_item_permissions_check' ],
                'args'                => $this->get_endpoint_args_for_item_schema( WP_REST_Server::EDITABLE ),
            ],
            [
                'methods'             => WP_REST_Server::DELETABLE,
                'callback'            => [ $this, 'delete_item' ],
                'permission_callback' => [ $this, 'delete_item_permissions_check' ],
            ],
            'schema' => [ $this, 'get_public_item_schema' ],
        ] );
    }

    // Permission checks — use current_user_can() for write operations
    public function get_items_permissions_check( $request )    { return true; }
    public function get_item_permissions_check( $request )     { return true; }
    public function create_item_permissions_check( $request )  { return current_user_can( 'edit_posts' ); }
    public function update_item_permissions_check( $request )  { return current_user_can( 'edit_post', $request['id'] ); }
    public function delete_item_permissions_check( $request )  { return current_user_can( 'delete_post', $request['id'] ); }

    public function get_items( $request ) {
        $items = []; // fetch from DB
        return rest_ensure_response( array_map(
            fn( $item ) => $this->prepare_item_for_response( $item, $request ), $items
        ) );
    }

    public function get_item( $request ) {
        $item = null; // fetch by $request['id']
        if ( ! $item ) {
            return new WP_Error( 'not_found', 'Item not found.', [ 'status' => 404 ] );
        }
        return rest_ensure_response( $this->prepare_item_for_response( $item, $request ) );
    }

    public function create_item( $request ) {
        $item = null; // insert logic
        return new WP_REST_Response( $this->prepare_item_for_response( $item, $request ), 201 );
    }

    public function update_item( $request ) {
        $item = null; // update logic
        return rest_ensure_response( $this->prepare_item_for_response( $item, $request ) );
    }

    public function delete_item( $request ) {
        return new WP_REST_Response( null, 204 );
    }

    public function prepare_item_for_response( $item, $request ) {
        $data     = [];
        $fields   = $this->get_fields_for_response( $request );
        if ( rest_is_field_included( 'id', $fields ) )    { $data['id']    = $item->id; }
        if ( rest_is_field_included( 'title', $fields ) ) { $data['title'] = $item->title; }
        $response = rest_ensure_response( $data );
        $response->add_links( [
            'self'       => [ 'href' => rest_url( "{$this->namespace}/{$this->rest_base}/{$item->id}" ) ],
            'collection' => [ 'href' => rest_url( "{$this->namespace}/{$this->rest_base}" ) ],
        ] );
        return $response;
    }

    public function get_item_schema() {
        if ( $this->schema ) {
            return $this->add_additional_fields_schema( $this->schema );
        }
        $this->schema = [
            '$schema'    => 'http://json-schema.org/draft-04/schema#',
            'title'      => 'myplugin-item',
            'type'       => 'object',
            'properties' => [
                'id'    => [
                    'description' => 'Unique identifier.',
                    'type'        => 'integer',
                    'context'     => [ 'view', 'edit' ],
                    'readonly'    => true,
                ],
                'title' => [
                    'description' => 'Item title.',
                    'type'        => 'string',
                    'context'     => [ 'view', 'edit' ],
                    'required'    => true,
                ],
                'status' => [
                    'description' => 'Publication status.',
                    'type'        => 'string',
                    'enum'        => [ 'draft', 'publish' ],
                    'context'     => [ 'view', 'edit' ],
                    'default'     => 'draft',
                ],
            ],
        ];
        return $this->add_additional_fields_schema( $this->schema );
    }
}

// Register the controller:
add_action( 'rest_api_init', function () {
    $controller = new MyPlugin_Items_Controller();
    $controller->register_routes();
} );
```

## Schema & Validation

### JSON Schema

WordPress REST API uses a subset of JSON Schema (draft 4) for both resource definitions and argument validation. Schema serves as documentation AND validation.

- Provide schema via `get_item_schema()` on controllers or a `schema` callback on routes.
- Schema is returned on `OPTIONS` requests, enabling API discovery.
- Cache the schema on the controller instance (`$this->schema`) to avoid recomputation.

### Common formats and types

| Format | Example |
|--------|---------|
| `date-time` | `2025-01-15T10:30:00` |
| `uri` | `https://example.com` |
| `email` | `user@example.com` |
| `ip` | `192.168.1.1` |
| `uuid` | `550e8400-e29b-41d4-a716-446655440000` |
| `hex-color` | `#ff0000` |

For `array` types, define `items` schema. For `object` types, define `properties`.

### validate_callback and sanitize_callback

```php
'args' => [
    'email' => [
        'type'              => 'string',
        'format'            => 'email',
        'required'          => true,
        'validate_callback' => 'rest_validate_request_arg', // uses schema
        'sanitize_callback' => 'sanitize_email',
    ],
    'count' => [
        'type'              => 'integer',
        'minimum'           => 1,
        'maximum'           => 100,
        'default'           => 10,
        'validate_callback' => function ( $value, $request, $param ) {
            if ( ! is_numeric( $value ) ) {
                return new WP_Error( 'invalid_param', "$param must be numeric." );
            }
            return true;
        },
        'sanitize_callback' => 'absint',
    ],
],
```

**Important:** If you override `sanitize_callback`, built-in schema validation will not run automatically. Use `rest_validate_request_arg` as `validate_callback` to preserve it.

The controller method `get_endpoint_args_for_item_schema()` wires validation automatically from the schema.

## Permission & Authentication

### permission_callback is REQUIRED

Every route MUST have a `permission_callback`. Omitting it triggers a `_doing_it_wrong` notice.

- Public read endpoints: use `'permission_callback' => '__return_true'`.
- Write endpoints: NEVER use `__return_true`. Always check capabilities.
- Use `current_user_can()` for capability checks, not just "is logged in".

```php
'permission_callback' => function ( $request ) {
    return current_user_can( 'edit_post', $request['id'] );
},
```

### Authentication methods

**Cookie + nonce (logged-in frontend JS):**

```php
// Localize in PHP:
wp_localize_script( 'my-script', 'MyPlugin', [
    'root'  => esc_url_raw( rest_url() ),
    'nonce' => wp_create_nonce( 'wp_rest' ),
] );
```

```js
// In JS:
fetch( MyPlugin.root + 'myplugin/v1/items', {
    headers: { 'X-WP-Nonce': MyPlugin.nonce },
} );
```

If the nonce is missing, the request is treated as unauthenticated even if cookies exist.

**Application Passwords (external clients, WP 5.6+):**

```bash
# HTTPS required. Use Basic Auth with the application password.
curl -u "username:xxxx xxxx xxxx xxxx xxxx xxxx" \
  https://example.com/wp-json/myplugin/v1/items
```

**OAuth/JWT (via plugins):** Use only when required. Follow the specific plugin's documentation.

**`rest_authentication_errors` filter:** Hook into this to add custom authentication or block unauthenticated access globally. Return `WP_Error` to deny, `true` to approve, or pass through existing results.

## Response Shaping

### WP_REST_Response

```php
function myplugin_get_items( $request ) {
    $items = []; // fetch data
    $total = 100;
    $pages = 10;

    $response = new WP_REST_Response( $items, 200 );
    $response->header( 'X-WP-Total', $total );
    $response->header( 'X-WP-TotalPages', $pages );
    return $response;
}
```

Use `rest_ensure_response()` to wrap arrays/scalars into `WP_REST_Response` automatically.

### Field registration with register_rest_field()

Add computed fields to existing endpoints. Do NOT remove or change core fields (breaks clients including wp-admin).

```php
add_action( 'rest_api_init', function () {
    register_rest_field( 'post', 'word_count', [
        'get_callback' => function ( $post_arr ) {
            return str_word_count( wp_strip_all_tags( $post_arr['content']['rendered'] ) );
        },
        'update_callback' => null, // read-only
        'schema'          => [
            'description' => 'Word count of the post content.',
            'type'        => 'integer',
            'context'     => [ 'view', 'edit' ],
            'readonly'    => true,
        ],
    ] );
} );
```

### Meta fields with register_meta()

```php
register_post_meta( 'post', 'myplugin_rating', [
    'type'          => 'integer',
    'single'        => true,
    'show_in_rest'  => true,
    'auth_callback' => function () {
        return current_user_can( 'edit_posts' );
    },
] );

// For object/array meta, provide a schema:
register_post_meta( 'post', 'myplugin_settings', [
    'type'         => 'object',
    'single'       => true,
    'show_in_rest' => [
        'schema' => [
            'type'       => 'object',
            'properties' => [
                'color' => [ 'type' => 'string' ],
                'size'  => [ 'type' => 'integer' ],
            ],
        ],
    ],
] );
```

### Links and embedding

```php
$response->add_link( 'author', rest_url( 'wp/v2/users/' . $post->post_author ), [
    'embeddable' => true, // allows ?_embed to inline this
] );
```

Register CURIEs (compact URIs) via the `rest_response_link_curies` filter.

### Sparse responses with `_fields`

Clients can request `?_fields=id,title,meta.myplugin_rating` to receive only specific fields. Supports nested keys.

### Pagination

Collections should return these headers:

| Header | Purpose |
|--------|---------|
| `X-WP-Total` | Total number of items |
| `X-WP-TotalPages` | Total number of pages |

Standard params: `page`, `per_page` (capped at 100), `offset`.

### Raw vs rendered content

`content.rendered` reflects filters (plugins may inject HTML). Use `?context=edit&_fields=content.raw` (authenticated) to access raw content.

## Custom Post Types & Taxonomies

### Exposing a CPT

```php
register_post_type( 'book', [
    'label'               => 'Books',
    'public'              => true,
    'show_in_rest'        => true,            // Required for REST
    'rest_base'           => 'books',          // Custom URL slug
    'rest_controller_class' => 'WP_REST_Posts_Controller', // Default
    'supports'            => [ 'title', 'editor', 'custom-fields' ],
] );
```

### Exposing a custom taxonomy

```php
register_taxonomy( 'genre', 'book', [
    'label'          => 'Genres',
    'show_in_rest'   => true,
    'rest_base'      => 'genres',
    // rest_controller_class defaults to WP_REST_Terms_Controller
] );
```

### Adding REST to existing types you do not control

Use `register_post_type_args` or `register_taxonomy_args` filters to set `show_in_rest => true` and `rest_base` on types you do not own.

### Custom controllers

Set `rest_controller_class` to a class extending `WP_REST_Controller`. Use `rest_route_for_post` or `rest_route_for_term` filters for discovery links.

## Discovery & Features

### API discovery

REST API root is discovered via the `Link: <.../wp-json/>; rel="https://api.w.org/"` header or the equivalent `<link>` element in HTML. The `/wp-json/` index lists all namespaces and routes. For non-pretty permalinks use `?rest_route=/`.

### Global parameters

| Parameter | Purpose |
|-----------|---------|
| `_fields` | Sparse field selection |
| `_embed` | Include linked resources in `_embedded` |
| `_method` | Simulate PUT/DELETE via POST |
| `_envelope` | Wrap status + headers in response body |
| `_jsonp` | JSONP for legacy clients |

Also: `X-HTTP-Method-Override` header as alternative to `_method`.

### Batch API

Send multiple requests in one call: `POST /wp-json/batch/v1` with a `requests` array of `{ "method", "path" }` objects.

## Abilities API (WordPress 6.9+)

The Abilities API is a declarative permission/feature system for exposing server-side capabilities to client-side code.

### Hooks (registration order matters)

Categories MUST be registered before abilities:

1. `wp_abilities_api_categories_init` -- register categories here.
2. `wp_abilities_api_init` -- register abilities here.

Registering abilities outside `wp_abilities_api_init` triggers `_doing_it_wrong()`.

### Registering categories and abilities

```php
// 1. Register category
add_action( 'wp_abilities_api_categories_init', function () {
    wp_register_ability_category( 'my-plugin', [
        'label' => __( 'My Plugin', 'my-plugin' ),
    ] );
} );

// 2. Register abilities
add_action( 'wp_abilities_api_init', function () {
    wp_register_ability( 'my-plugin/get-info', [
        'label'               => __( 'Get Site Info', 'my-plugin' ),
        'description'         => __( 'Returns basic site information.', 'my-plugin' ),
        'category'            => 'my-plugin',
        'callback'            => 'my_plugin_get_info_callback',
        'permission_callback' => function () {
            return current_user_can( 'manage_options' );
        },
        'input_schema'  => [
            'type'       => 'object',
            'properties' => [
                'include_stats' => [ 'type' => 'boolean', 'default' => false ],
            ],
        ],
        'output_schema' => [
            'type'       => 'object',
            'properties' => [
                'name' => [ 'type' => 'string' ],
                'url'  => [ 'type' => 'string', 'format' => 'uri' ],
            ],
        ],
        'meta' => [
            'show_in_rest' => true,
            'readonly'     => false,
        ],
    ] );

    // Informational / read-only ability (feature flag pattern)
    wp_register_ability( 'my-plugin/supports-feature-x', [
        'label'    => __( 'Supports Feature X', 'my-plugin' ),
        'category' => 'my-plugin',
        'meta'     => [ 'show_in_rest' => true, 'readonly' => true ],
    ] );
} );
```

### Key arguments for wp_register_ability()

| Argument | Description |
|----------|-------------|
| `label` | Human-readable name for UI (e.g., command palette) |
| `description` | What the ability does |
| `category` | Category ID (must already be registered) |
| `callback` | Function that executes the ability |
| `permission_callback` | Check if current user can execute (required for write abilities) |
| `input_schema` | JSON Schema for expected input |
| `output_schema` | JSON Schema for returned output |
| `meta.show_in_rest` | `true` to expose via REST (required for client visibility) |
| `meta.readonly` | `true` if ability is informational only |

### REST endpoints

The Abilities API exposes:

- `GET /wp-json/wp-abilities/v1/abilities` -- list all visible abilities
- `GET /wp-json/wp-abilities/v1/categories` -- list all categories

Abilities only appear if `meta.show_in_rest` is `true`.

### Client-side: @wordpress/abilities

```js
import { useAbility, hasAbility } from '@wordpress/abilities';

// In a React component:
function FeaturePanel() {
    const canGetInfo = useAbility( 'my-plugin/get-info' );
    if ( ! canGetInfo ) {
        return null; // Progressive disclosure
    }
    return <div>Feature panel content</div>;
}

// Imperative check:
if ( hasAbility( 'my-plugin/supports-feature-x' ) ) {
    enableFeatureX();
}
```

### Use cases

- **Feature flags:** Gate UI features based on server-declared abilities.
- **Progressive disclosure:** Show controls only when the user/site supports them.
- **Capability-driven UI:** Replace hardcoded role checks with declarative ability checks.
- **AI/agent integration:** `input_schema` and `output_schema` help external agents understand available operations.

### Best practices

- Namespace IDs (e.g. `my-plugin:feature.edit` or `my-plugin/feature`).
- Treat IDs as stable API; changing them is a breaking change.
- Always include `permission_callback` for abilities that modify data.
- Use `input_schema` and `output_schema` for validation and discoverability.

## Error Handling

### WP_Error for error responses

```php
// In a callback:
$post = get_post( $request['id'] );
if ( ! $post ) {
    return new WP_Error(
        'myplugin_not_found',
        __( 'Item not found.', 'myplugin' ),
        [ 'status' => 404 ]
    );
}

// In permission_callback (returning WP_Error gives the client a reason):
if ( ! current_user_can( 'edit_posts' ) ) {
    return new WP_Error(
        'rest_forbidden',
        __( 'You do not have permission to create items.', 'myplugin' ),
        [ 'status' => 403 ]
    );
}
```

Always include `status` in the `data` array. Standard codes:

| HTTP Status | When |
|-------------|------|
| 400 | Invalid parameters / bad request |
| 401 | Not authenticated |
| 403 | Authenticated but insufficient permissions |
| 404 | Resource not found |
| 500 | Server error |

Use `rest_validate_request_arg()` to validate individual args against their schema (returns `WP_Error` on failure).

Do NOT call `wp_send_json()` or `die()` inside REST callbacks. Always return data, `WP_REST_Response`, or `WP_Error`.

## Common Patterns

### Custom collection parameters (filtering, sorting)

```php
public function get_collection_params() {
    $params = parent::get_collection_params();
    $params['status'] = [
        'description' => 'Limit results to a specific status.',
        'type'        => 'string',
        'enum'        => [ 'draft', 'publish', 'archived' ],
        'default'     => 'publish',
    ];
    $params['orderby'] = [
        'description' => 'Sort collection by attribute.',
        'type'        => 'string',
        'enum'        => [ 'date', 'title', 'rating' ],
        'default'     => 'date',
    ];
    return $params;
}
```

### Registering custom REST fields on existing endpoints

```php
add_action( 'rest_api_init', function () {
    register_rest_field( 'comment', 'author_avatar_url', [
        'get_callback' => function ( $comment_arr ) {
            return get_avatar_url( $comment_arr['author_email'], [ 'size' => 48 ] );
        },
        'schema' => [
            'type'        => 'string',
            'format'      => 'uri',
            'description' => 'Avatar URL for the comment author.',
            'context'     => [ 'view', 'embed' ],
        ],
    ] );
} );
```

## Common Mistakes

| Mistake | Consequence | Fix |
|---------|-------------|-----|
| Omitting `permission_callback` | `_doing_it_wrong` notice; route may not work | Always provide it; use `__return_true` for public reads |
| Using `__return_true` on write endpoints | Any visitor can create/update/delete data | Check capabilities with `current_user_can()` |
| Reading `$_GET`/`$_POST` directly | Bypasses validation and sanitization | Use `$request->get_param()` or `$request['key']` |
| Calling `wp_send_json()` or `die()` | Breaks response lifecycle, no proper headers | Return data, `WP_REST_Response`, or `WP_Error` |
| Missing `status` in `WP_Error` data | Client receives 500 instead of correct code | Always pass `['status' => 4xx]` in error data |
| Using `wp/*` namespace | Conflicts with WordPress core routes | Use your own vendor namespace |
| Forgetting `show_in_rest` on CPT | Post type not exposed in REST API | Set `show_in_rest => true` |
| Missing `custom-fields` support on CPT | Meta fields not available via REST | Add `'supports' => ['custom-fields']` |
| Not sending `X-WP-Nonce` with cookie auth | Request treated as unauthenticated | Send nonce as header or `_wpnonce` param |
| Setting `per_page` above 100 | WP rejects the request | Cap at 100; use pagination |
| Removing core fields from default endpoints | Breaks wp-admin and other clients | Add new fields instead; clients use `_fields` to limit |
| Registering abilities outside proper hooks | `_doing_it_wrong()`; registration fails | Use `wp_abilities_api_init` / `wp_abilities_api_categories_init` |
| Missing `meta.show_in_rest` on abilities | Ability invisible to REST clients | Set `meta.show_in_rest => true` |
| Registering abilities before categories | Ability has no category association | Register categories on `wp_abilities_api_categories_init` first |
