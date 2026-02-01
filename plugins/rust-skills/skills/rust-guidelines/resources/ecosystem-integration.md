# Ecosystem Integration

## Standard Crate Choices

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

## Language Interop

| Integration | Crate/Tool |
|-------------|------------|
| C/C++ -> Rust | `bindgen` |
| Rust -> C | `cbindgen` |
| Python <-> Rust | `pyo3` |
| Node.js <-> Rust | `napi-rs` |
| WebAssembly | `wasm-bindgen` |

## Crate Selection Criteria

| Criterion | Good Sign | Warning Sign |
|-----------|-----------|--------------|
| Maintenance | Recent commits | Years inactive |
| Community | Active issues/PRs | No response |
| Documentation | Examples, API docs | Minimal docs |
| Stability | Semantic versioning | Frequent breaking |
| Dependencies | Minimal, well-known | Heavy, obscure |

## Deprecated -> Modern Replacements

| Deprecated | Better | Since |
|------------|--------|-------|
| `lazy_static!` | `std::sync::OnceLock` | Rust 1.70 |
| `once_cell::Lazy` | `std::sync::LazyLock` | Rust 1.80 |
| `std::sync::mpsc` | `crossbeam::channel` | -- |
| `std::sync::Mutex` | `parking_lot::Mutex` | -- |
| `failure`/`error-chain` | `thiserror`/`anyhow` | -- |
| `try!()` | `?` operator | Edition 2018 |
| `extern crate` | Just `use` | Edition 2018 |
| `#[macro_use]` | Explicit `use crate::macro_name!` | -- |

---

# Mental Models

## Key Analogies

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

## Coming From Other Languages

| From | Key Shift |
|------|-----------|
| Java/C# | Values are owned, not references by default |
| C/C++ | Compiler enforces safety rules |
| Python/Go | No GC -- deterministic destruction |
| Functional | Mutability is safe via ownership |
| JavaScript | No null -- use `Option` instead |

## Common Misconceptions

| Wrong Model | Correct Model |
|-------------|---------------|
| GC cleans up -> clone freely | Ownership = unique key transfer |
| Multiple writers OK | Only one writer at a time (`&mut`) |
| Lifetimes are GC | Compile-time validity scope |
| Clone solves everything | Restructure ownership first |
| Fight the borrow checker | Work with the compiler |
| `unsafe` to avoid rules | Understand safe patterns first |
