# Block Checkout, Settings & Emails — Full Code Examples

Detailed code for Store API extension, Block Checkout integration, Settings pages,
and Custom Emails. See the main `SKILL.md` for tables and quick references.

---

## Extending Store API Data

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

## Block Checkout Integration

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

## Settings Page Integration

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

---

## Custom Emails

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
