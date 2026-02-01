---
name: rust-guidelines
description: Use when writing, reviewing, refactoring, building, or deploying Rust code. Covers error handling, API design, type-driven design, ownership, lifetimes, smart pointers, generics, trait objects, domain modeling, resource lifecycle (RAII), documentation, naming, logging, lints, ecosystem integration, build/deploy workflow, test file placement, and anti-patterns. For unsafe/FFI see rust-unsafe, for async/concurrency see rust-async, for performance see rust-performance.
---

# Rust Guidelines

## Overview

Comprehensive Rust guidelines combining Microsoft's Pragmatic Rust Guidelines (48 production rules) with community patterns for ownership, type-driven design, domain modeling, and ecosystem integration. For specialized topics see: `rust-unsafe`, `rust-async`, `rust-performance`, and domain skills (`rust-web`, `rust-cli`, etc.).

Full Microsoft reference: @microsoft-rust-guidelines.md

---

## Error Handling

| Context | Pattern | Guideline |
|---------|---------|-----------|
| Applications | Use `anyhow`/`eyre` for convenience | M-APP-ERROR |
| Libraries | Canonical error structs with `Backtrace` | M-ERRORS-CANONICAL-STRUCTS |
| Bugs detected | Panic, not `Result` | M-PANIC-ON-BUG |
| Panics | Mean "stop the program", never for control flow | M-PANIC-IS-STOP |
| Library code | Never `panic!` — return `Result` | Anti-pattern #6 |
| Silent failure | Never `let _ = file.write_all(data)` — propagate or log | Anti-pattern #5 |
| Propagation | Use `?` operator, not `try!()` macro | Coding guideline |
| Assertions | `expect("reason")` over bare `unwrap()` | Coding guideline |

```rust
// BAD: library panics on bad input
pub fn parse(input: &str) -> Data {
    if input.is_empty() { panic!("empty"); }
    // ...
}

// GOOD: return Result
pub fn parse(input: &str) -> Result<Data, ParseError> {
    if input.is_empty() { return Err(ParseError::EmptyInput); }
    // ...
}
```

### Domain Error Strategy

| Error Type | Audience | Recovery | Example |
|------------|----------|----------|---------|
| User-facing | End users | Guide action | `InvalidEmail`, `NotFound` |
| Internal | Developers | Debug info | `DatabaseError`, `ParseError` |
| System | Ops/SRE | Monitor/alert | `ConnectionTimeout`, `RateLimited` |
| Transient | Automation | Retry | `NetworkError`, `ServiceUnavailable` |
| Permanent | Human | Investigate | `ConfigInvalid`, `DataCorrupted` |

| Recovery Pattern | When | Implementation |
|------------------|------|----------------|
| Retry | Transient failures | Exponential backoff (`tokio-retry`) |
| Fallback | Degraded mode | Cached/default value |
| Circuit Breaker | Cascading failures | `failsafe-rs` |
| Timeout | Slow operations | `tokio::time::timeout` |
| Bulkhead | Isolation | Separate thread pools |

```rust
#[derive(thiserror::Error, Debug)]
pub enum AppError {
    #[error("Invalid input: {0}")]
    Validation(String),

    #[error("Service temporarily unavailable")]
    ServiceUnavailable(#[source] reqwest::Error),

    #[error("Internal error")]
    Internal(#[source] anyhow::Error),
}

impl AppError {
    pub fn is_retryable(&self) -> bool {
        matches!(self, Self::ServiceUnavailable(_))
    }
}
```

---

## API Design

| Rule | Guideline |
|------|-----------|
| Accept `impl AsRef<str/Path/[u8]>` in functions | M-IMPL-ASREF |
| Accept `impl Read/Write` for I/O (sans-io) | M-IMPL-IO |
| Avoid `Arc/Rc/Box/RefCell` in public APIs | M-AVOID-WRAPPERS |
| Prefer concrete types > generics > `dyn Trait` | M-DI-HIERARCHY |
| Use `PathBuf`/`Path` not `String` for filesystem | M-STRONG-TYPES |
| Essential functionality as inherent methods, not just traits | M-ESSENTIAL-FN-INHERENT |
| Builders for 3+ optional params | M-INIT-BUILDER |
| Accept `&str` not `String` when you don't need ownership | Anti-pattern #7 |
| Borrow (`&Config`) when you only read, don't take ownership | Anti-pattern #19 |

### Type-Driven Design

| Pattern | Purpose | Example |
|---------|---------|---------|
| Newtype | Type safety for primitives | `struct UserId(u64);` |
| Type State | Compile-time state machine | `Connection<Connected>` |
| PhantomData | Lifetime/variance tracking | `PhantomData<&'a T>` |
| Marker Trait | Capability flag | `trait Validated {}` |
| Builder | Gradual construction | `Builder::new().name("x").build()` |
| Sealed Trait | Prevent external impl | `mod private { pub trait Sealed {} }` |

```rust
// Newtype: validate once, trust forever
struct Email(String);
impl Email {
    pub fn new(s: &str) -> Result<Self, ValidationError> {
        validate_email(s)?;
        Ok(Self(s.to_string()))
    }
}

// Type State: compiler enforces valid transitions
struct Connection<State>(TcpStream, PhantomData<State>);
struct Disconnected;
struct Connected;
struct Authenticated;

impl Connection<Disconnected> {
    fn connect(self) -> Connection<Connected> { ... }
}
impl Connection<Connected> {
    fn authenticate(self) -> Connection<Authenticated> { ... }
}
```

```rust
// BAD: stringly typed — wrong order compiles fine
fn connect(host: &str, port: &str, timeout: &str) { ... }
connect("8080", "localhost", "30"); // swapped!

// GOOD: strong types prevent misuse at compile time
struct Host(String);
struct Port(u16);
struct Timeout(Duration);
fn connect(host: Host, port: Port, timeout: Timeout) { ... }
```

```rust
// BAD: boolean parameters — unclear at call site
fn fetch(url: &str, use_cache: bool, validate_ssl: bool) { ... }

// GOOD: options struct
struct FetchOptions { use_cache: bool, validate_ssl: bool }
fn fetch(url: &str, options: FetchOptions) { ... }

// BAD: Option<Option<T>> — ambiguous semantics
fn find(id: u32) -> Option<Option<User>> { ... }

// GOOD: explicit enum
enum FindResult { Found(User), NotFound, Error(String) }
```

---

## Ownership & Lifetimes

### Common Ownership Errors

| Error | Cause | Fix |
|-------|-------|-----|
| E0382 | Use of moved value | Borrow (`&`), clone, or use `Rc`/`Arc` |
| E0597 | Borrowed value doesn't live long enough | Return owned value or extend lifetime |
| E0499 | Multiple mutable borrows | Sequential borrows or `RefCell` |
| E0502 | Mutable borrow while immutable exists | Copy value out, then mutate |
| E0507 | Cannot move out of borrowed content | Clone, or take ownership in signature |
| E0515 | Return reference to local variable | Return owned value or `&'static` |
| E0716 | Temporary dropped while borrowed | Bind to named variable first |

### Key Anti-Patterns

```rust
// BAD: clone to dodge borrow checker
for item in data.clone() { println!("{}", item); }
use_data(data);

// GOOD: borrow when you don't need ownership
for item in &data { println!("{}", item); }
use_data(data);
```

```rust
// BAD: holding reference prevents mutation
let mut data = vec![1, 2, 3];
let first = &data[0];
data.push(4); // ERROR: data is borrowed

// GOOD: copy the value out
let first = data[0]; // i32 is Copy
data.push(4); // OK
```

```rust
// BAD: loop consumes the vector
for s in strings { println!("{}", s); }
println!("{:?}", strings); // ERROR: moved

// GOOD: iterate by reference
for s in &strings { println!("{}", s); }
println!("{:?}", strings); // OK
```

### Lifetime Elision Rules

The compiler infers lifetimes in this order:
1. Each reference parameter gets its own lifetime
2. If exactly one input lifetime, it applies to all outputs
3. If `&self`/`&mut self` exists, its lifetime applies to all outputs

When elision doesn't work, annotate explicitly. Use meaningful names:

```rust
struct Parser<'src> {
    source: &'src str, // 'src not 'a — more readable
}
```

---

## Smart Pointers & Resource Management

### Smart Pointer Decision

| Type | Ownership | Thread-Safe | Use When |
|------|-----------|-------------|----------|
| `Box<T>` | Single | Yes | Heap allocation, recursive types |
| `Rc<T>` | Shared | No | Single-thread shared ownership |
| `Arc<T>` | Shared | Yes | Multi-thread shared ownership |
| `Weak<T>` | Weak ref | Same as Rc/Arc | Break reference cycles |
| `Cell<T>` | Single | No | Interior mutability (Copy types) |
| `RefCell<T>` | Single | No | Interior mutability (runtime check) |

### Decision Flowchart

```
Need heap allocation?
├─ Yes → Single owner?
│        ├─ Yes → Box<T>
│        └─ No → Multi-thread?
│                ├─ Yes → Arc<T>
│                └─ No → Rc<T>
└─ No → Stack allocation (default)

Have reference cycles?
├─ Yes → Use Weak for one direction
└─ No → Regular Rc/Arc

Need interior mutability?
├─ Yes → Thread-safe needed?
│        ├─ Yes → Mutex<T> or RwLock<T>
│        └─ No → T: Copy? → Cell<T> : RefCell<T>
└─ No → Use &mut T
```

| Anti-Pattern | Why Bad | Better |
|--------------|---------|--------|
| Arc everywhere | Unnecessary atomic overhead | Use Rc for single-thread |
| RefCell everywhere | Runtime panics | Design clear ownership |
| Box for small types | Unnecessary allocation | Stack allocation |
| Ignore Weak for cycles | Memory leaks | Design parent-child with Weak |

---

## Generics & Trait Objects

### Static vs Dynamic Dispatch

| Pattern | Dispatch | Code Size | Runtime Cost |
|---------|----------|-----------|--------------|
| `fn foo<T: Trait>()` | Static | +bloat | Zero |
| `fn foo(x: &dyn Trait)` | Dynamic | Minimal | vtable lookup |
| `impl Trait` return | Static | +bloat | Zero |
| `Box<dyn Trait>` | Dynamic | Minimal | Allocation + vtable |

### When to Choose

| Scenario | Choose | Why |
|----------|--------|-----|
| Performance critical | Generics | Zero runtime cost |
| Heterogeneous collection | `dyn Trait` | Different types at runtime |
| Plugin architecture | `dyn Trait` | Unknown types at compile time |
| Reduce compile time | `dyn Trait` | Less monomorphization |
| Small, known type set | `enum` | No indirection |

### Object Safety

A trait is object-safe if it:
- Doesn't have `Self: Sized` bound
- Doesn't return `Self`
- Doesn't have generic methods
- Uses `where Self: Sized` for non-object-safe methods

```rust
// Static dispatch
fn process(x: impl Display) { }
fn process<T: Display>(x: T) { }

// Dynamic dispatch
fn process(x: &dyn Display) { }
fn process(x: Box<dyn Display>) { }
```

---

## Domain Modeling

### Domain Concept → Rust Pattern

| DDD Concept | Rust Pattern | Example |
|-------------|--------------|---------|
| Value Object | Newtype | `struct Email(String);` |
| Entity | Struct + ID | `struct User { id: UserId, ... }` |
| Aggregate | Module boundary | `mod order { ... }` |
| Repository | Trait | `trait UserRepo { fn find(...) }` |
| Domain Event | Enum | `enum OrderEvent { Created, ... }` |
| Service | impl block / free fn | Stateless operations |

```rust
// Entity: identity equality
struct UserId(Uuid);
struct User { id: UserId, email: Email }

impl PartialEq for User {
    fn eq(&self, other: &Self) -> bool {
        self.id == other.id // identity, not value
    }
}

// Aggregate: parent owns children, enforces invariants
mod order {
    pub struct Order {
        id: OrderId,
        items: Vec<OrderItem>, // owned children
    }
    impl Order {
        pub fn add_item(&mut self, item: OrderItem) {
            // enforce aggregate invariants here
        }
    }
}
```

| Mistake | Why Wrong | Better |
|---------|-----------|--------|
| Primitive obsession | No type safety | Newtype wrappers |
| Public fields with invariants | Invariants violated | Private + validated `new()` |
| Leaked aggregate internals | Broken encapsulation | Methods on aggregate root |

---

## Resource Lifecycle (RAII)

| Pattern | When | Implementation |
|---------|------|----------------|
| RAII | Auto cleanup on scope exit | `Drop` trait |
| Lazy init | Deferred creation | `OnceLock`, `LazyLock` |
| Pool | Reuse expensive resources | `r2d2`, `deadpool` |
| Guard | Scoped access | `MutexGuard` pattern |
| Scope | Transaction boundary | Custom struct + Drop |

```rust
// RAII Guard: cleanup on drop
struct FileGuard { path: PathBuf, _handle: File }

impl Drop for FileGuard {
    fn drop(&mut self) {
        let _ = std::fs::remove_file(&self.path);
    }
}

// Lazy Singleton (modern Rust — no lazy_static!)
use std::sync::OnceLock;

static CONFIG: OnceLock<Config> = OnceLock::new();

fn get_config() -> &'static Config {
    CONFIG.get_or_init(|| Config::load().expect("config required"))
}
```

| Anti-Pattern | Why Bad | Better |
|--------------|---------|--------|
| Manual cleanup | Easy to forget | RAII/Drop |
| `lazy_static!` | External dep, deprecated | `std::sync::OnceLock` (1.70+) |
| Global mutable state | Thread unsafety | `OnceLock` or proper sync |

---

## Documentation

| Rule | Guideline |
|------|-----------|
| Summary sentence < 15 words | M-FIRST-DOC-SENTENCE |
| Canonical sections: Examples, Errors, Panics, Safety | M-CANONICAL-DOCS |
| Module-level `//!` docs required | M-MODULE-DOCS |
| No parameter tables — describe in prose | M-CANONICAL-DOCS |
| `#[doc(inline)]` on `pub use` re-exports | M-DOC-INLINE |

---

## Naming & Style

| Rule | Guideline |
|------|-----------|
| No weasel words (Service, Manager, Factory) | M-CONCISE-NAMES |
| Use `Builder` not `Factory` | M-CONCISE-NAMES |
| Magic values need comments explaining *why* | M-DOCUMENTED-MAGIC |
| Use `#[expect]` not `#[allow]` for lint overrides | M-LINT-OVERRIDE-EXPECT |
| No `get_` prefix | `fn name()` not `fn get_name()` |
| Conversion naming | `as_` (cheap &), `to_` (expensive), `into_` (ownership) |
| Iterator convention | `iter()` / `iter_mut()` / `into_iter()` |
| Meaningful lifetimes | `'src`, `'ctx` not just `'a` |
| Shadowing for transformation | `let x = x.parse()?` |

```
Naming: snake_case (fn/var), CamelCase (type), SCREAMING_CASE (const)
Format: rustfmt (just use it)
Docs: /// for public items, //! for module docs
```

---

## Library Resilience

| Rule | Guideline |
|------|-----------|
| Avoid `static` if consistent view matters | M-AVOID-STATICS |
| I/O and syscalls must be mockable | M-MOCKABLE-SYSCALLS |
| No glob re-exports (`pub use foo::*`) | M-NO-GLOB-REEXPORTS |
| Test utilities behind `test-util` feature | M-TEST-UTIL |
| Features must be additive | M-FEATURES-ADDITIVE |
| Don't leak external types in public APIs | M-DONT-LEAK-TYPES |
| Types should be `Send` | M-TYPES-SEND |
| Split crates when in doubt | M-SMALLER-CRATES |

---

## Logging

| Rule | Guideline |
|------|-----------|
| Structured logging with message templates | M-LOG-STRUCTURED |
| Named events: `component.operation.state` | M-LOG-STRUCTURED |
| OTel semantic conventions for attributes | M-LOG-STRUCTURED |
| Redact sensitive data | M-LOG-STRUCTURED |

---

## Static Verification

Recommended `Cargo.toml` lints:

```toml
[lints.rust]
missing_debug_implementations = "warn"
redundant_imports = "warn"
unsafe_op_in_unsafe_fn = "warn"
unused_lifetimes = "warn"

[lints.clippy]
cargo = { level = "warn", priority = -1 }
pedantic = { level = "warn", priority = -1 }
correctness = { level = "warn", priority = -1 }
perf = { level = "warn", priority = -1 }
style = { level = "warn", priority = -1 }
suspicious = { level = "warn", priority = -1 }
undocumented_unsafe_blocks = "warn"
```

---

## Ecosystem Integration

### Standard Crate Choices

| Need | Crate |
|------|-------|
| Serialization | serde, serde_json |
| Async runtime | tokio |
| HTTP client | reqwest |
| HTTP server | axum, actix-web |
| Database | sqlx, diesel |
| CLI parsing | clap |
| Error handling (app) | anyhow |
| Error handling (lib) | thiserror |
| Logging | tracing |

### Language Interop

| Integration | Crate/Tool |
|-------------|------------|
| C/C++ → Rust | `bindgen` |
| Rust → C | `cbindgen` |
| Python ↔ Rust | `pyo3` |
| Node.js ↔ Rust | `napi-rs` |
| WebAssembly | `wasm-bindgen` |

### Crate Selection Criteria

| Criterion | Good Sign | Warning Sign |
|-----------|-----------|--------------|
| Maintenance | Recent commits | Years inactive |
| Community | Active issues/PRs | No response |
| Documentation | Examples, API docs | Minimal docs |
| Stability | Semantic versioning | Frequent breaking |
| Dependencies | Minimal, well-known | Heavy, obscure |

### Deprecated → Modern Replacements

| Deprecated | Better | Since |
|------------|--------|-------|
| `lazy_static!` | `std::sync::OnceLock` | Rust 1.70 |
| `once_cell::Lazy` | `std::sync::LazyLock` | Rust 1.80 |
| `std::sync::mpsc` | `crossbeam::channel` | — |
| `std::sync::Mutex` | `parking_lot::Mutex` | — |
| `failure`/`error-chain` | `thiserror`/`anyhow` | — |
| `try!()` | `?` operator | Edition 2018 |
| `extern crate` | Just `use` | Edition 2018 |
| `#[macro_use]` | Explicit `use crate::macro_name!` | — |

---

## Mental Models

### Key Analogies

| Concept | Mental Model | Analogy |
|---------|--------------|---------|
| Ownership | Unique key | Only one person has the house key |
| Move | Key handover | Giving away your key |
| `&T` | Lending for reading | Lending a book |
| `&mut T` | Exclusive editing | Only you can edit the doc |
| Lifetime `'a` | Valid scope | "Ticket valid until..." |
| `Box<T>` | Heap pointer | Remote control to TV |
| `Rc<T>` | Shared ownership | Multiple remotes, last turns off |
| `Arc<T>` | Thread-safe Rc | Remotes from any room |

### Coming From Other Languages

| From | Key Shift |
|------|-----------|
| Java/C# | Values are owned, not references by default |
| C/C++ | Compiler enforces safety rules |
| Python/Go | No GC — deterministic destruction |
| Functional | Mutability is safe via ownership |
| JavaScript | No null — use `Option` instead |

### Common Misconceptions

| Wrong Model | Correct Model |
|-------------|---------------|
| GC cleans up → clone freely | Ownership = unique key transfer |
| Multiple writers OK | Only one writer at a time (`&mut`) |
| Lifetimes are GC | Compile-time validity scope |
| Clone solves everything | Restructure ownership first |
| Fight the borrow checker | Work with the compiler |
| `unsafe` to avoid rules | Understand safe patterns first |

---

## Anti-Pattern Quick Reference

| Anti-Pattern | Better Alternative |
|--------------|--------------------|
| Clone to satisfy borrow checker | Borrow with `&` |
| `unwrap()` everywhere | Propagate with `?` |
| `String` parameters | `&str` parameters |
| Index loops `vec[i]` | Iterator loops `for item in &vec` |
| Collect then process | Chain iterators |
| `Mutex` for read-heavy data | `RwLock` |
| Lock held across `.await` | Scope the lock |
| `std::thread::sleep` in async | `tokio::time::sleep` |
| Stringly typed APIs | Newtype wrappers |
| Boolean parameters | Options struct or enum |
| `Box<T>` returns unnecessarily | Return `T` directly |
| Macro for simple operations | Plain function |
| `Option<Option<T>>` | Custom enum with clear semantics |
| `pub use foo::*` | Explicit re-exports |
| `#[allow(clippy::...)]` | `#[expect(clippy::...)]` |
| `transmute` for enum casts | `match` or `TryFrom` |
| `Arc<Mutex<T>>` in public API | Clean interface hiding internals |
| `String` for file paths | `PathBuf` / `Path` |
| `static` items across crate versions | Config struct passed at init |
| OOP via Deref | Composition, not Deref inheritance |
| Giant match arms | Extract to methods or use enum dispatch |
| Over-generic everything | Concrete types when possible |
| `dyn` for known types | Generics for static dispatch |
| `Rc` when single owner | Just use the value directly |
| `format!` for simple concatenation | `push_str` or `+` |

---

## Build & Deploy

### Always Use Makefile

Before running `cargo build` or any build command, check if a `Makefile` exists. If it does, **use it** — the Makefile encodes project-specific build steps (embedding assets, setting flags, post-build hooks) that raw commands miss.

| Situation | Action |
|-----------|--------|
| Makefile exists with relevant target | `make deploy`, `make build`, `make test`, etc. |
| Makefile exists, no matching target | List targets, pick closest match |
| No Makefile | Fall back to `cargo build`, `cargo test`, etc. |

### Permissions & Ownership

Before building or deploying, check file permissions and ownership. Fix to match the project majority:

```bash
# Identify majority owner:group
stat -c '%U:%G' * | sort | uniq -c | sort -rn | head -5
# Fix if needed
chown -R <user>:<group> .
```

### Temporary Files

| File type | Location |
|-----------|----------|
| Build intermediates, scratch files | `/tmp` — never the project directory |
| Final build artifacts | Project output dir (`target/`, `dist/`) |
| Downloaded dependencies | Standard location (`~/.cargo/`) |

**Exception:** If project instructions (CLAUDE.md, Makefile) specify a different temp location, follow those.

### Test File Placement

| Test type | Location |
|-----------|----------|
| Temporary (debugging, one-off) | `/tmp` |
| Permanent, Rust convention | Inline `#[cfg(test)] mod tests` in source files |
| Permanent, integration tests | `tests/` directory (create if it doesn't exist) |
| Specific instructions exist | Follow those |

