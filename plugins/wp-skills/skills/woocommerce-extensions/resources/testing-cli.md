# Testing & WP-CLI — Full Code Examples

Detailed code for WP-CLI WooCommerce commands and extension testing patterns.
See the main `SKILL.md` for quick references.

---

## WP-CLI for WooCommerce

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

## Testing WooCommerce Extensions

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
