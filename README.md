# AI Skills Marketplace

A curated collection of [Claude Code](https://docs.anthropic.com/en/docs/claude-code) plugins for development best practices and coding standards.

## Quick Start

```bash
# 1. Add this marketplace (one-time setup)
claude plugin marketplace add peixotorms/odinlayer-skills

# 2. Install the plugins you want
claude plugin install rust-skills
claude plugin install go-skills
claude plugin install php-skills
claude plugin install wp-skills
claude plugin install compliance-skills
```

## Available Plugins

### rust-skills

**Comprehensive Rust guidelines** — 11 focused skills covering core guidelines, unsafe/FFI, async/concurrency, performance, and 7 domain-specific areas.

```bash
claude plugin install rust-skills
```

One install gives you all 11 skills. Claude loads only the relevant ones per conversation based on what you're working on.

**Skills included:**

| Skill | Auto-activates when... |
|-------|------------------------|
| `rust-guidelines` | Writing, reviewing, building, or deploying Rust code — error handling, API design, types, ownership, lifetimes, smart pointers, generics, domain modeling, RAII, docs, naming, lints, build/deploy workflow, test placement |
| `rust-unsafe` | Writing unsafe code, FFI bindings, raw pointers, or C interop |
| `rust-async` | Writing async/concurrent code with tokio, channels, mutexes, threads |
| `rust-performance` | Optimizing performance — profiling, allocations, collections, Rayon, memory layout |
| `rust-web` | Building web services with axum, actix-web, warp, or rocket |
| `rust-cloud-native` | Building cloud-native apps, microservices, or Kubernetes deployments |
| `rust-cli` | Building CLI tools or TUI apps with clap, ratatui |
| `rust-fintech` | Building financial, trading, or payment systems |
| `rust-embedded` | Developing embedded/no_std/bare-metal for microcontrollers |
| `rust-iot` | Building IoT applications, sensor networks, or edge devices |
| `rust-ml` | Building ML/AI inference pipelines |

**Command included:**

| Command | Description |
|---------|-------------|
| `/rust-review` | Review any Rust file against the guidelines. Usage: `/rust-review src/main.rs` |

**Sources:**

- [Microsoft Pragmatic Rust Guidelines](https://microsoft.github.io/rust-guidelines/) (48 production rules)
- [ZhangHanDong/rust-skills](https://github.com/ZhangHanDong/rust-skills) (community patterns for ownership, concurrency, type-driven design, domain modeling)

---

### go-skills

**Idiomatic Go guidelines** — 3 focused skills covering core idioms, concurrency patterns, and error handling.

```bash
claude plugin install go-skills
```

One install gives you all 3 skills. Claude loads only the relevant ones per conversation.

**Skills included:**

| Skill | Auto-activates when... |
|-------|------------------------|
| `go-guidelines` | Writing, reviewing, building, or deploying Go code — formatting, naming, doc comments, control structures, functions, defer, data types, methods, interfaces, embedding, initialization, functional options, generics, testing, linting, build/deploy workflow, test placement, anti-patterns |
| `go-concurrency` | Writing concurrent Go with goroutines, channels, select, sync primitives, worker pools, fan-out/fan-in, context cancellation |
| `go-errors` | Handling errors — wrapping, `errors.Is`/`errors.As`, sentinel errors, custom types, errors-as-values patterns, panic/recover |

**Command included:**

| Command | Description |
|---------|-------------|
| `/go-review` | Review any Go file against the guidelines. Usage: `/go-review main.go` |

**Sources:**

- [Effective Go](https://go.dev/doc/effective_go)
- [Google Go Style Guide](https://google.github.io/styleguide/go/)
- [Go Code Review Comments](https://go.dev/wiki/CodeReviewComments)
- [Go Proverbs](https://go-proverbs.github.io/)

---

### php-skills

**Comprehensive PHP guidelines** — 5 focused skills covering modern PHP 8.x patterns, type system, OOP, security, performance, networking, internationalization, and version migration.

```bash
claude plugin install php-skills
```

One install gives you all 5 skills. Claude loads only the relevant ones per conversation based on what you're working on.

**Skills included:**

| Skill | Auto-activates when... |
|-------|------------------------|
| `php-guidelines` | Writing, reviewing, or deploying PHP code — type system, strict types, OOP, enums, modern PHP 8.x patterns, DI & SOLID, PSR standards, Composer, JSON, functions, generators, fibers, namespaces, error handling, attributes, version migration (8.0-8.5), testing, build/deploy, anti-patterns |
| `php-security` | Handling user input, database queries, file operations, authentication — SQL injection, XSS, CSRF, input validation, output escaping, password hashing, session management, serialization security, file uploads, cryptography, php.ini hardening (OWASP) |
| `php-performance` | Optimizing performance — OPcache, JIT, preloading, database (PDO), caching (Redis, Memcached), SPL data structures, micro-optimizations, memory management, profiling |
| `php-networking` | Making HTTP requests with cURL, multi-curl, writing regex (PCRE), parallel/async execution (pcntl_fork, stream_select, parallel extension, fibers) |
| `php-intl` | Working with multibyte strings, UTF-8 encoding, internationalization (mbstring, intl extension, Collator, NumberFormatter, IntlDateFormatter, Transliterator) |

**Command included:**

| Command | Description |
|---------|-------------|
| `/php-review` | Review any PHP file against the guidelines. Usage: `/php-review src/Controller/UserController.php` |

**Sources:**

- [PHP Manual](https://www.php.net/manual/en/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [PHP The Right Way](https://phptherightway.com/)
- PHP 8.0-8.5 Migration Guides

---

### wp-skills

**Comprehensive WordPress, WooCommerce, and Elementor guidelines** — 17 focused skills covering the full WordPress ecosystem.

```bash
claude plugin install wp-skills
```

One install gives you all 17 skills. Claude loads only the relevant ones per conversation based on what you're working on.

**WordPress Core (8 skills):**

| Skill | Auto-activates when... |
|-------|------------------------|
| `wp-guidelines` | Writing, reviewing, or refactoring WordPress PHP code — naming conventions, hooks, i18n, enqueuing, Yoda conditions, WordPress API usage, formatting, deprecated functions |
| `wp-security` | Handling user input, database queries, file operations, authentication, or output in WordPress — escaping, nonces, sanitization, SQL safety, capabilities, file uploads, AJAX security, REST API permissions |
| `wp-performance` | Optimizing WordPress performance, debugging slow queries, configuring caching, reviewing database code — WP_Query optimization, object cache, transients, anti-patterns, profiling, platform-specific guidance |
| `wp-blocks` | Building Gutenberg blocks, block themes, or using the Interactivity API — block.json, static and dynamic rendering, InnerBlocks, deprecations, theme.json, templates, patterns, data-wp-* directives, server-side rendering, WordPress 6.9 features |
| `wp-rest-api` | Building WordPress REST API endpoints, custom routes, controllers, or using the Abilities API — route registration, schema validation, permission callbacks, authentication, response shaping, field registration, Abilities API for declarative permissions |
| `wp-plugins` | Building WordPress plugins or themes — architecture, lifecycle hooks, settings API, data storage, custom tables, WP-CLI commands, PHPStan configuration, PHPCS, testing, build and deploy workflow |
| `wp-apis` | Working with WordPress core APIs in plugins or themes — admin menus, shortcodes, meta boxes, custom post types, taxonomies, HTTP API, WP-Cron, dashboard widgets, users and roles, privacy (GDPR), theme mods and Customizer, Site Health, global variables, responsive images, advanced hooks |
| `wp-javascript` | Using JavaScript in WordPress — script enqueuing, wp_localize_script, wp_add_inline_script, AJAX handlers (wp_ajax_), Heartbeat API, wp.apiFetch, jQuery noConflict, wp.template, defer/async loading strategies |

**WooCommerce (4 skills):**

| Skill | Auto-activates when... |
|-------|------------------------|
| `woocommerce-setup` | Starting a new WooCommerce extension — plugin headers, WooCommerce availability check, FeaturesUtil compatibility declarations (HPOS, block checkout), DI container |
| `woocommerce-payments` | Building payment gateways — WC_Payment_Gateway, process_payment, process_refund, tokenization, block checkout (AbstractPaymentMethodType, registerPaymentMethod) |
| `woocommerce-data` | Working with WooCommerce data — HPOS order storage, wc_get_order, wc_get_orders, product/customer CRUD, Store API, REST API, ExtendSchema |
| `woocommerce-hooks` | Hooking into WooCommerce events — order lifecycle, cart/checkout, product, email, admin hooks, settings pages, custom emails, WP-CLI, testing |

**Elementor (5 skills):**

| Skill | Auto-activates when... |
|-------|------------------------|
| `elementor-development` | Building Elementor addons or widgets — addon structure, widget lifecycle, rendering, controls, dependencies, caching, inline editing, manager registration, scripts & styles |
| `elementor-controls` | Using Elementor editor controls — 56+ control types (text, select, color, slider, media, repeater, etc.), group controls (typography, background, border, box-shadow), selectors, responsive controls, dynamic content |
| `elementor-hooks` | Working with Elementor hooks — PHP action hooks, PHP filter hooks, JS hooks & commands, injecting controls into existing widgets |
| `elementor-forms` | Extending Elementor Pro forms — form actions, custom field types, validation, rendering, dependencies, content templates |
| `elementor-themes` | Building with Elementor theme features — theme builder locations, conditions, dynamic tags, Hello Elementor theme, Finder categories, context menu extensions |

**Commands included:**

| Command | Description |
|---------|-------------|
| `/wp-review` | Review WordPress code against coding standards, security, and performance guidelines. Usage: `/wp-review wp-content/plugins/my-plugin/` |
| `/elementor-review` | Review Elementor addon code against development guidelines. Usage: `/elementor-review wp-content/plugins/my-addon/` |

**Sources:**

- [WordPress Coding Standards (WPCS)](https://github.com/WordPress/WordPress-Coding-Standards)
- [WordPress Agent Skills](https://github.com/WordPress/agent-skills)
- [WordPress Developer Resources](https://developer.wordpress.org/)
- [WooCommerce CLAUDE.md](https://github.com/woocommerce/woocommerce/blob/trunk/CLAUDE.md)
- [Elementor Developer Docs](https://developers.elementor.com/docs/) (294 pages)

---

### compliance-skills

**Compliance coding guidelines** — 6 focused skills covering PCI DSS, GDPR, WCAG accessibility, HIPAA, SOX, and SOC 2 with practical coding patterns.

```bash
claude plugin install compliance-skills
```

One install gives you all 6 skills. Claude loads only the relevant ones per conversation based on what you're working on.

**Skills included:**

| Skill | Auto-activates when... |
|-------|------------------------|
| `pci-compliance` | Building payment processing, handling credit card data, checkout flows, tokenization, or any code touching cardholder information — PCI DSS data classification, encryption, audit logging, scope reduction |
| `gdpr-compliance` | Handling personal data, user registration, consent forms, cookie banners, data export, account deletion, privacy policies, or processing EU/EEA user data — consent management, data subject rights, privacy by design |
| `accessibility-compliance` | Building web interfaces, HTML templates, forms, navigation, modals, dynamic content, or any user-facing UI — WCAG 2.1/2.2, ARIA roles, semantic HTML, keyboard navigation, screen reader support, color contrast |
| `hipaa-compliance` | Handling health data, patient records, medical systems, ePHI, healthcare APIs, EHR integrations, or any code processing Protected Health Information — HIPAA Security Rule, PHI identification, de-identification, audit controls |
| `sox-compliance` | Building financial reporting systems, accounting software, ERP integrations, ledger systems, audit trails, or any code handling financial data at publicly traded companies — SOX Section 302/404, ITGC, segregation of duties |
| `soc2-compliance` | Building SaaS platforms, cloud services, customer-facing APIs, multi-tenant systems, or any service requiring SOC 2 certification — Trust Services Criteria, Common Criteria CC1-CC9, access controls, change management |

**Command included:**

| Command | Description |
|---------|-------------|
| `/compliance-review` | Review code against applicable compliance standards (PCI, GDPR, WCAG, HIPAA, SOX, SOC 2). Usage: `/compliance-review src/checkout/` |

**Sources:**

- [PCI DSS v4.0](https://www.pcisecuritystandards.org/document_library/) (PCI Security Standards Council)
- [GDPR Full Text](https://gdpr-info.eu/) (EU Regulation 2016/679)
- [WCAG 2.1](https://www.w3.org/TR/WCAG21/) / [WCAG 2.2](https://www.w3.org/TR/WCAG22/) (W3C)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [HHS HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html)
- [COSO Internal Control Framework](https://www.coso.org/guidance-on-ic)
- [AICPA Trust Services Criteria](https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-2)

## Managing Plugins

```bash
# Update all marketplace plugins
claude plugin marketplace update odinlayer-skills

# List installed plugins
claude plugin list

# Disable/enable a plugin temporarily
claude plugin disable rust-skills
claude plugin enable rust-skills

# Uninstall
claude plugin uninstall rust-skills

# Remove the marketplace entirely
claude plugin marketplace remove odinlayer-skills
```

## Contributing

To add a new plugin to this marketplace:

1. Create a directory under `plugins/your-plugin-name/`
2. Add `.claude-plugin/plugin.json` with name, description, version, author
3. Add skills in `skills/`, commands in `commands/`, or other components
4. Add an entry to `.claude-plugin/marketplace.json`
5. Submit a PR

See the [Claude Code plugin docs](https://docs.anthropic.com/en/docs/claude-code/plugins) for the full plugin specification.
