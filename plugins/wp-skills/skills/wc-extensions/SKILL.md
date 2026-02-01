---
name: wc-extensions
description: Use when building WooCommerce extensions or integrating with WooCommerce — payment gateways, HPOS order storage, product and order CRUD, Store API, REST API, block checkout, data stores, settings pages, and key hooks.
---

# WooCommerce Extension Development

Reference for building WooCommerce extensions: payment gateways, order and product
CRUD, HPOS, Store API, REST API, block checkout integration, settings, and hooks.

---

## 1. Extension Architecture

### Check WooCommerce Is Active

Always gate your plugin on WooCommerce availability:

```php
add_action( 'plugins_loaded', 'mce_init' );

function mce_init(): void {
    if ( ! class_exists( 'WooCommerce' ) ) {
        add_action( 'admin_notices', function (): void {
            echo '<div class="error"><p>' .
                esc_html__( 'My Extension requires WooCommerce.', 'my-extension' ) .
                '</p></div>';
        } );
        return;
    }
    // Safe to use WooCommerce APIs from here.
}
```

### Plugin Header

```php
/**
 * Plugin Name: My WooCommerce Extension
 * Plugin URI:  https://example.com/my-extension
 * Description: Extends WooCommerce with custom features.
 * Version:     1.0.0
 * Author:      Your Name
 * Requires Plugins: woocommerce
 * WC requires at least: 8.0
 * WC tested up to: 10.4
 * Requires PHP: 7.4
 */
```

The `Requires Plugins: woocommerce` header (WordPress 6.5+) enforces the dependency
automatically. `WC requires at least` and `WC tested up to` are read by WooCommerce
to show compatibility notices.

### Declaring Feature Compatibility

```php
add_action( 'before_woocommerce_init', function (): void {
    if ( class_exists( '\Automattic\WooCommerce\Utilities\FeaturesUtil' ) ) {
        // Declare HPOS compatibility.
        \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility(
            'custom_order_tables',
            __FILE__,
            true
        );
        // Declare Block Checkout compatibility.
        \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility(
            'cart_checkout_blocks',
            __FILE__,
            true
        );
    }
} );
```

---

## 2. Modern WooCommerce Architecture

### DI Container

WooCommerce `src/` classes use dependency injection. Access singletons with:

```php
$instance = wc_get_container()->get( \Automattic\WooCommerce\Internal\SomeClass::class );
```

Extensions can access public WC services through the container. Internal classes
(`src/Internal/`) are private API and may change without notice — only rely on
classes in `src/` root or documented APIs.

### Hook Callback Naming Convention

Name hook callbacks `handle_{hook_name}` with `@internal` annotation:

```php
/**
 * Handle the woocommerce_order_status_changed hook.
 *
 * @internal
 */
public function handle_woocommerce_order_status_changed( int $order_id, string $old, string $new ): void {
    // ...
}
```

### Interactivity API Stores Are Private

All WooCommerce Interactivity API stores use `lock: true` — they are **not
extensible**. Removing or changing store state/selectors is not a breaking
change. Do not depend on WC store internals in your extension.

### Data Integrity

Always verify entity state before deletion or modification:

```php
// ✅ Verify order status before deletion.
$order = wc_get_order( $order_id );
if ( ! $order || ! in_array( $order->get_status(), array( 'draft', 'checkout-draft' ), true ) ) {
    return false;  // Don't delete non-draft orders.
}
$order->delete( true );

// ✅ Verify ownership in batch operations.
foreach ( $order_ids as $id ) {
    $order = wc_get_order( $id );
    if ( $order && (int) $order->get_customer_id() === get_current_user_id() ) {
        $order->delete( true );
    }
}
```

**Checklist:** entity exists → correct state → correct owner → race-condition safe
→ check return value of delete/save.

---

## 3. Payment Gateway API

### Skeleton

```php
add_filter( 'woocommerce_payment_gateways', function ( array $gateways ): array {
    $gateways[] = 'MCE_Gateway';
    return $gateways;
} );

class MCE_Gateway extends WC_Payment_Gateway {

    public function __construct() {
        $this->id                 = 'mce_gateway';
        $this->icon               = '';                         // URL to icon.
        $this->has_fields         = false;                      // true if you render checkout fields.
        $this->method_title       = __( 'My Gateway', 'my-extension' );
        $this->method_description = __( 'Custom payment gateway.', 'my-extension' );

        $this->supports = array( 'products', 'refunds' );

        $this->init_form_fields();
        $this->init_settings();

        $this->title       = $this->get_option( 'title' );
        $this->description = $this->get_option( 'description' );
        $this->enabled     = $this->get_option( 'enabled' );

        add_action( 'woocommerce_update_options_payment_gateways_' . $this->id, array( $this, 'process_admin_options' ) );
    }

    public function init_form_fields(): void {
        $this->form_fields = array(
            'enabled' => array(
                'title'   => __( 'Enable/Disable', 'my-extension' ),
                'type'    => 'checkbox',
                'label'   => __( 'Enable My Gateway', 'my-extension' ),
                'default' => 'no',
            ),
            'title' => array(
                'title'       => __( 'Title', 'my-extension' ),
                'type'        => 'text',
                'description' => __( 'Payment title the customer sees.', 'my-extension' ),
                'default'     => __( 'My Gateway', 'my-extension' ),
            ),
            'description' => array(
                'title'       => __( 'Description', 'my-extension' ),
                'type'        => 'textarea',
                'default'     => __( 'Pay via My Gateway.', 'my-extension' ),
            ),
        );
    }

    public function process_payment( $order_id ): array {
        $order = wc_get_order( $order_id );

        // Call external API, validate, etc.
        $success = true;

        if ( ! $success ) {
            wc_add_notice( __( 'Payment failed.', 'my-extension' ), 'error' );
            return array( 'result' => 'failure' );
        }

        $order->payment_complete();
        WC()->cart->empty_cart();

        return array(
            'result'   => 'success',
            'redirect' => $this->get_return_url( $order ),
        );
    }

    public function process_refund( $order_id, $amount = null, $reason = '' ): bool|WP_Error {
        // Call refund API. Return true on success, WP_Error on failure.
        return true;
    }
}
```

### Supported Features

| Feature            | Description                              |
|--------------------|------------------------------------------|
| `products`         | Standard product payments                |
| `refunds`          | Admin refund processing                  |
| `subscriptions`    | WooCommerce Subscriptions support        |
| `tokenization`     | Saved payment methods                    |
| `pre-orders`       | Pre-order charge scheduling              |

### Tokenization (Saved Cards)

Extend `WC_Payment_Gateway_CC` (credit cards) or `WC_Payment_Gateway_eCheck` for
built-in tokenization UI. Add `'tokenization'` to `$this->supports` and implement
`add_payment_method()`.

### Validate Fields

```php
public function validate_fields(): bool {
    if ( empty( $_POST['mce_card_number'] ) ) {
        wc_add_notice( __( 'Card number is required.', 'my-extension' ), 'error' );
        return false;
    }
    return true;
}
```

---

## 4. HPOS (High-Performance Order Storage)

Since WooCommerce 8.2, HPOS is the default order storage for new installs.
Orders are stored in custom tables, not `wp_postmeta`.

### Accessing Order Data (HPOS-Compatible)

```php
// Always use CRUD methods — never direct SQL or get_post_meta().
$order = wc_get_order( $order_id );

// Read.
$total    = $order->get_total();
$status   = $order->get_status();
$billing  = $order->get_billing_email();
$meta     = $order->get_meta( '_mce_transaction_id' );

// Write.
$order->set_status( 'completed' );
$order->update_meta_data( '_mce_transaction_id', 'txn_123' );
$order->save();
```

### Querying Orders

```php
// Use wc_get_orders() — works with both HPOS and legacy storage.
$orders = wc_get_orders( array(
    'status'     => 'processing',
    'limit'      => 50,
    'orderby'    => 'date',
    'order'      => 'DESC',
    'meta_query' => array(
        array(
            'key'   => '_mce_synced',
            'value' => 'no',
        ),
    ),
) );
```

### What NOT to Do

| Deprecated Pattern                           | HPOS-Compatible Alternative                   |
|----------------------------------------------|-----------------------------------------------|
| `get_post_meta( $order_id, '_key', true )`   | `$order->get_meta( '_key' )`                  |
| `update_post_meta( $order_id, '_key', $v )`  | `$order->update_meta_data( '_key', $v ); $order->save();` |
| `new WP_Query( ['post_type'=>'shop_order'] )`| `wc_get_orders( [...] )`                      |
| Direct SQL on `wp_posts`/`wp_postmeta`       | Use `OrdersTableDataStore` or CRUD methods    |
| `get_post( $order_id )`                      | `wc_get_order( $order_id )`                   |

---

## 5. Product & Customer CRUD

### Products

```php
// Read.
$product = wc_get_product( $product_id );
$name    = $product->get_name();
$price   = $product->get_price();
$sku     = $product->get_sku();
$stock   = $product->get_stock_quantity();
$type    = $product->get_type();            // simple, variable, grouped, external.
$meta    = $product->get_meta( '_mce_custom' );

// Write.
$product->set_regular_price( '29.99' );
$product->update_meta_data( '_mce_custom', 'value' );
$product->save();
```

### Product Types

| Class                    | Type       | Use Case                        |
|--------------------------|------------|---------------------------------|
| `WC_Product_Simple`      | `simple`   | Standard product                |
| `WC_Product_Variable`    | `variable` | Product with variations         |
| `WC_Product_Variation`   | `variation`| Single variation of a variable  |
| `WC_Product_Grouped`     | `grouped`  | Collection of simple products   |
| `WC_Product_External`    | `external` | Affiliate / external product    |

### Customers

```php
$customer = new WC_Customer( $user_id );
$email    = $customer->get_email();
$orders   = $customer->get_order_count();
$spent    = $customer->get_total_spent();

$customer->update_meta_data( '_mce_loyalty', 'gold' );
$customer->save();
```

---

## 6. Store API (Cart & Checkout)

The Store API is an **unauthenticated** public REST API for customer-facing
cart, checkout, and product functionality.

### Key Endpoints

| Method   | Endpoint                     | Purpose                   |
|----------|------------------------------|---------------------------|
| `GET`    | `/wc/store/v1/products`      | List products             |
| `GET`    | `/wc/store/v1/cart`          | Get current cart           |
| `POST`   | `/wc/store/v1/cart/add-item` | Add item to cart          |
| `POST`   | `/wc/store/v1/checkout`      | Place order               |
| `PUT`    | `/wc/store/v1/checkout`      | Update order (9.8+)       |

### Extending Store API Data

Use `ExtendSchema` to add custom data to Store API responses:

```php
use Automattic\WooCommerce\StoreApi\StoreApi;
use Automattic\WooCommerce\StoreApi\Schemas\V1\CartItemSchema;

add_action( 'woocommerce_blocks_loaded', function (): void {
    $extend = StoreApi::container()->get( \Automattic\WooCommerce\StoreApi\Schemas\ExtendSchema::class );

    $extend->register_endpoint_data( array(
        'endpoint'        => CartItemSchema::IDENTIFIER,
        'namespace'       => 'my-extension',
        'data_callback'   => function ( array $cart_item ): array {
            return array(
                'custom_label' => get_post_meta( $cart_item['product_id'], '_mce_label', true ),
            );
        },
        'schema_callback' => function (): array {
            return array(
                'custom_label' => array(
                    'type'        => 'string',
                    'description' => 'Custom product label',
                    'readonly'    => true,
                ),
            );
        },
    ) );
} );
```

---

## 7. WooCommerce REST API

The REST API is **authenticated** (consumer key + secret) for admin/back-office operations.

### Authentication

```bash
# Generate keys at WooCommerce > Settings > Advanced > REST API.
curl https://example.com/wp-json/wc/v3/products \
  -u ck_xxx:cs_xxx
```

### Key Namespaces

| Namespace       | Purpose                                |
|-----------------|----------------------------------------|
| `wc/v3`         | Core CRUD (products, orders, customers)|
| `wc/store/v1`   | Store API (unauthenticated, cart/checkout) |
| `wc-admin`      | Admin analytics and reports            |
| `wc-analytics`  | Analytics data                         |

### Common Endpoints

| Endpoint            | Methods          | Description          |
|---------------------|------------------|----------------------|
| `/wc/v3/products`   | GET, POST        | Products CRUD        |
| `/wc/v3/orders`     | GET, POST        | Orders CRUD          |
| `/wc/v3/customers`  | GET, POST        | Customers CRUD       |
| `/wc/v3/coupons`    | GET, POST        | Coupons CRUD         |
| `/wc/v3/reports`    | GET              | Sales reports        |
| `/wc/v3/webhooks`   | GET, POST        | Webhook management   |

---

## 8. Block Checkout Integration

The Block Checkout (default since WooCommerce 8.3) requires separate registration
from the classic `WC_Payment_Gateway`.

### Server-Side Registration

```php
use Automattic\WooCommerce\Blocks\Payments\Integrations\AbstractPaymentMethodType;

class MCE_Block_Gateway extends AbstractPaymentMethodType {
    protected $name = 'mce_gateway';

    public function initialize(): void {
        $this->settings = get_option( 'woocommerce_mce_gateway_settings', array() );
    }

    public function is_active(): bool {
        return ! empty( $this->settings['enabled'] ) && 'yes' === $this->settings['enabled'];
    }

    public function get_payment_method_script_handles(): array {
        wp_register_script(
            'mce-gateway-block',
            plugins_url( 'assets/js/block.js', MCE_PLUGIN_FILE ),
            array(),
            '1.0.0',
            true
        );
        return array( 'mce-gateway-block' );
    }

    public function get_payment_method_data(): array {
        return array(
            'title'       => $this->settings['title'] ?? '',
            'description' => $this->settings['description'] ?? '',
            'supports'    => array( 'products' ),
        );
    }
}

// Register with WooCommerce Blocks.
add_action( 'woocommerce_blocks_payment_method_type_registration', function ( $registry ): void {
    $registry->register( new MCE_Block_Gateway() );
} );
```

### Client-Side (block.js)

```js
const { registerPaymentMethod } = wc.wcBlocksRegistry;

const MCE_Gateway = {
    name: 'mce_gateway',
    label: 'My Gateway',
    content: React.createElement( 'div', null, 'Pay with My Gateway.' ),
    edit: React.createElement( 'div', null, '[My Gateway]' ),
    canMakePayment: () => true,
    ariaLabel: 'My Gateway',
    supports: { features: [ 'products' ] },
};

registerPaymentMethod( MCE_Gateway );
```

---

## 9. Settings Page Integration

### Adding a Settings Tab

```php
add_filter( 'woocommerce_settings_tabs_array', function ( array $tabs ): array {
    $tabs['mce_settings'] = __( 'My Extension', 'my-extension' );
    return $tabs;
}, 50 );

add_action( 'woocommerce_settings_tabs_mce_settings', 'mce_render_settings' );

function mce_render_settings(): void {
    woocommerce_admin_fields( mce_get_settings() );
}

add_action( 'woocommerce_update_options_mce_settings', function (): void {
    woocommerce_update_options( mce_get_settings() );
} );

function mce_get_settings(): array {
    return array(
        array(
            'title' => __( 'My Extension Settings', 'my-extension' ),
            'type'  => 'title',
            'id'    => 'mce_section_title',
        ),
        array(
            'title'   => __( 'API Key', 'my-extension' ),
            'type'    => 'text',
            'id'      => 'mce_api_key',
            'default' => '',
        ),
        array(
            'title'   => __( 'Enable Feature', 'my-extension' ),
            'type'    => 'checkbox',
            'id'      => 'mce_enable_feature',
            'default' => 'no',
        ),
        array( 'type' => 'sectionend', 'id' => 'mce_section_end' ),
    );
}
```

### Settings Field Types

| Type         | Description                          |
|--------------|--------------------------------------|
| `text`       | Text input                           |
| `textarea`   | Multi-line text                      |
| `checkbox`   | Enable/disable toggle                |
| `select`     | Dropdown with `options` array        |
| `multiselect`| Multiple selection                   |
| `radio`      | Radio buttons                        |
| `number`     | Numeric input                        |
| `password`   | Password field                       |
| `color`      | Color picker                         |
| `title`      | Section heading (no input)           |
| `sectionend` | Closes a section                     |

---

## 10. Key Hooks Reference

### Order Lifecycle

| Hook (Action)                            | When                                     |
|------------------------------------------|------------------------------------------|
| `woocommerce_new_order`                  | Order first created                      |
| `woocommerce_checkout_order_processed`   | After checkout places order              |
| `woocommerce_payment_complete`           | Payment marked complete                  |
| `woocommerce_order_status_changed`       | Any status transition ($old, $new, $order)|
| `woocommerce_order_status_{status}`      | Transitioned to specific status          |
| `woocommerce_order_refunded`             | Refund processed                         |

### Cart & Checkout

| Hook                                      | Type   | Purpose                              |
|-------------------------------------------|--------|--------------------------------------|
| `woocommerce_add_to_cart`                 | Action | Item added to cart                   |
| `woocommerce_cart_calculate_fees`         | Action | Add custom fees                      |
| `woocommerce_before_calculate_totals`     | Action | Modify cart items before totals      |
| `woocommerce_cart_item_price`             | Filter | Modify displayed cart item price     |
| `woocommerce_checkout_fields`             | Filter | Add/modify checkout fields           |
| `woocommerce_checkout_process`            | Action | Validate checkout before processing  |

### Product

| Hook                                      | Type   | Purpose                              |
|-------------------------------------------|--------|--------------------------------------|
| `woocommerce_product_options_general_product_data` | Action | Add fields to General tab    |
| `woocommerce_process_product_meta`        | Action | Save custom product fields           |
| `woocommerce_single_product_summary`      | Action | Output on single product page        |
| `woocommerce_product_get_price`           | Filter | Modify product price dynamically     |
| `woocommerce_is_purchasable`              | Filter | Control whether product can be bought|

### Email

| Hook                                      | Purpose                                  |
|-------------------------------------------|------------------------------------------|
| `woocommerce_email_classes`               | Register custom email classes            |
| `woocommerce_email_order_details`         | Add content to order emails              |
| `woocommerce_email_before_order_table`    | Content before order table in emails     |
| `woocommerce_email_after_order_table`     | Content after order table in emails      |

### Admin

| Hook                                      | Purpose                                  |
|-------------------------------------------|------------------------------------------|
| `woocommerce_admin_order_data_after_billing_address` | Add fields after billing    |
| `woocommerce_admin_order_data_after_shipping_address`| Add fields after shipping   |
| `manage_edit-shop_order_columns`          | Add columns to orders list               |
| `woocommerce_product_data_tabs`           | Add product data tabs                    |
| `woocommerce_product_data_panels`         | Render product data tab panels           |

---

## 11. Custom Emails

```php
add_filter( 'woocommerce_email_classes', function ( array $emails ): array {
    $emails['MCE_Custom_Email'] = new MCE_Custom_Email();
    return $emails;
} );

class MCE_Custom_Email extends WC_Email {
    public function __construct() {
        $this->id             = 'mce_custom_email';
        $this->title          = __( 'Custom Notification', 'my-extension' );
        $this->description    = __( 'Sent when a custom event occurs.', 'my-extension' );
        $this->heading        = __( 'Custom Notification', 'my-extension' );
        $this->subject        = __( '[{site_title}] Custom notification', 'my-extension' );
        $this->template_html  = 'emails/mce-custom.php';
        $this->template_plain = 'emails/plain/mce-custom.php';
        $this->template_base  = MCE_PLUGIN_DIR . 'templates/';
        $this->recipient      = $this->get_option( 'recipient', get_option( 'admin_email' ) );

        // Trigger on custom action.
        add_action( 'mce_custom_event', array( $this, 'trigger' ), 10, 2 );

        parent::__construct();
    }

    public function trigger( int $order_id, WC_Order $order ): void {
        $this->object = $order;
        if ( $this->is_enabled() && $this->get_recipient() ) {
            $this->send(
                $this->get_recipient(),
                $this->get_subject(),
                $this->get_content(),
                $this->get_headers(),
                $this->get_attachments()
            );
        }
    }

    public function get_content_html(): string {
        return wc_get_template_html(
            $this->template_html,
            array( 'order' => $this->object, 'email' => $this ),
            '',
            $this->template_base
        );
    }
}
```

---

## 12. WP-CLI for WooCommerce

```bash
# Products.
wp wc product list --user=1
wp wc product create --name="Test" --regular_price="9.99" --user=1

# Orders.
wp wc order list --status=processing --user=1
wp wc order update <id> --status=completed --user=1

# Customers.
wp wc customer list --user=1

# Tools.
wp wc tool run clear_transients --user=1
wp wc tool run clear_template_cache --user=1
```

### Custom WP-CLI Command

```php
if ( defined( 'WP_CLI' ) && WP_CLI ) {
    WP_CLI::add_command( 'mce sync', function ( $args, $assoc_args ): void {
        $orders = wc_get_orders( array( 'status' => 'processing', 'limit' => -1 ) );
        $progress = \WP_CLI\Utils\make_progress_bar( 'Syncing orders', count( $orders ) );

        foreach ( $orders as $order ) {
            // Sync logic.
            $progress->tick();
        }

        $progress->finish();
        WP_CLI::success( sprintf( 'Synced %d orders.', count( $orders ) ) );
    } );
}
```

---

## 13. Testing WooCommerce Extensions

### Base Class and Naming

Extend `WC_Unit_Test_Case`. Name the variable under test `$sut` ("System Under
Test"). Use `@testdox` in every test docblock:

```php
declare( strict_types = 1 );

namespace MyExtension\Tests;

use WC_Unit_Test_Case;

class MCE_Order_Sync_Test extends WC_Unit_Test_Case {
    /** @var MCE_Order_Sync The System Under Test. */
    private $sut;

    public function setUp(): void {
        parent::setUp();
        $this->sut = new \MyExtension\MCE_Order_Sync();
    }

    /**
     * @testdox Should sync order when status is processing.
     */
    public function test_syncs_processing_order(): void {
        $order = wc_create_order();
        $order->set_status( 'processing' );
        $order->save();

        $result = $this->sut->sync( $order->get_id() );

        $this->assertTrue( $result, 'Processing orders should sync' );
    }
}
```

### Mocking the WC Logger

Inject a fake logger via the `woocommerce_logging_class` filter. Pass an **object**
(not a class name string) to bypass the internal cache:

```php
$fake = new class implements \WC_Logger_Interface {
    public array $warning_calls = [];
    // Implement all interface methods; track calls in public arrays.
    public function warning( $message, $context = [] ) { $this->warning_calls[] = $message; }
    // ...
};

add_filter( 'woocommerce_logging_class', fn() => $fake );
$this->sut->do_something_that_warns();
$this->assertCount( 1, $fake->warning_calls );
remove_all_filters( 'woocommerce_logging_class' );
```

---

## 14. Common Mistakes

| Mistake | Fix |
|---------|-----|
| Using `get_post_meta()` for order data | Use `$order->get_meta()` — required for HPOS |
| `new WP_Query(['post_type'=>'shop_order'])` | Use `wc_get_orders()` — works with HPOS and legacy |
| Not declaring HPOS compatibility | Add `FeaturesUtil::declare_compatibility('custom_order_tables', ...)` |
| Not declaring Block Checkout compatibility | Add `FeaturesUtil::declare_compatibility('cart_checkout_blocks', ...)` |
| Only implementing classic checkout | Register `AbstractPaymentMethodType` for block checkout too |
| Calling `$order->set_status()` without `$order->save()` | CRUD changes are only persisted after `save()` |
| Using `$woocommerce` global instead of `WC()` | Use the `WC()` function — it's the singleton accessor |
| Modifying cart totals with direct property access | Use `woocommerce_before_calculate_totals` hook |
| Direct SQL queries on order tables | Use WC CRUD or `wc_get_orders()` |
| Not checking if WooCommerce is active | Wrap init in `class_exists('WooCommerce')` check |
| Standalone functions outside classes | Always use class methods — standalone functions are hard to mock in tests |
| Using `new` for DI-managed WC classes | Use `wc_get_container()->get( ClassName::class )` for `src/` singletons |
| `call_user_func_array` with associative keys | Always use positional (numerically indexed) arrays — keys are silently ignored |
| Deleting orders without verifying status | Check `$order->get_status()` before `$order->delete()` — could delete completed orders |
| Depending on WC Interactivity API stores | All WC stores are `lock: true` (private) — they can change without notice |
| Batch operations without per-item validation | Verify each item exists, has correct state, and correct owner before modifying |
