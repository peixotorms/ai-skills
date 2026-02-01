---
name: rust-guidelines
description: Use when writing, reviewing, or refactoring Rust code. Covers error handling, API design, unsafe usage, performance, documentation, naming, logging, testing, and library resilience. Based on Microsoft's Pragmatic Rust Guidelines.
---

# Rust Guidelines

## Overview

Pragmatic Rust guidelines (Microsoft) for writing production-quality Rust. 48 guidelines covering API design, safety, performance, documentation, error handling, and library architecture.

Full reference: @microsoft-rust-guidelines.md

## Quick Reference — Most Important Rules

### Error Handling
| Context | Pattern | Guideline |
|---------|---------|-----------|
| Applications | Use `anyhow`/`eyre` for convenience | M-APP-ERROR |
| Libraries | Canonical error structs with `Backtrace` | M-ERRORS-CANONICAL-STRUCTS |
| Bugs detected | Panic, not `Result` | M-PANIC-ON-BUG |
| Panics | Mean "stop the program", never for control flow | M-PANIC-IS-STOP |

### Safety
| Rule | Guideline |
|------|-----------|
| `unsafe` only for UB risk (not "dangerous") | M-UNSAFE-IMPLIES-UB |
| Must have valid reason: novel abstraction, perf, FFI | M-UNSAFE |
| All code must be sound — no exceptions | M-UNSOUND |
| Must pass Miri, include safety comments | M-UNSAFE |

### API Design
| Rule | Guideline |
|------|-----------|
| Accept `impl AsRef<str/Path/[u8]>` in functions | M-IMPL-ASREF |
| Accept `impl Read/Write` for I/O (sans-io) | M-IMPL-IO |
| Avoid `Arc/Rc/Box/RefCell` in public APIs | M-AVOID-WRAPPERS |
| Prefer concrete types > generics > `dyn Trait` | M-DI-HIERARCHY |
| Use `PathBuf`/`Path` not `String` for filesystem | M-STRONG-TYPES |
| Essential functionality as inherent methods, not just traits | M-ESSENTIAL-FN-INHERENT |
| Builders for 3+ optional params | M-INIT-BUILDER |

### Documentation
| Rule | Guideline |
|------|-----------|
| Summary sentence < 15 words | M-FIRST-DOC-SENTENCE |
| Canonical sections: Examples, Errors, Panics, Safety | M-CANONICAL-DOCS |
| Module-level `//!` docs required | M-MODULE-DOCS |
| No parameter tables — describe in prose | M-CANONICAL-DOCS |
| `#[doc(inline)]` on `pub use` re-exports | M-DOC-INLINE |

### Naming & Style
| Rule | Guideline |
|------|-----------|
| No weasel words (Service, Manager, Factory) | M-CONCISE-NAMES |
| Use `Builder` not `Factory` | M-CONCISE-NAMES |
| Magic values need comments explaining *why* | M-DOCUMENTED-MAGIC |
| Use `#[expect]` not `#[allow]` for lint overrides | M-LINT-OVERRIDE-EXPECT |

### Performance
| Rule | Guideline |
|------|-----------|
| Use mimalloc as global allocator in apps | M-MIMALLOC-APPS |
| Profile hot paths early with criterion/divan | M-HOTPATH |
| Optimize items/CPU-cycle, avoid empty cycles | M-THROUGHPUT |
| `yield_now().await` every 10-100us in CPU loops | M-YIELD-POINTS |

### Library Resilience
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

### Logging
| Rule | Guideline |
|------|-----------|
| Structured logging with message templates | M-LOG-STRUCTURED |
| Named events: `component.operation.state` | M-LOG-STRUCTURED |
| OTel semantic conventions for attributes | M-LOG-STRUCTURED |
| Redact sensitive data | M-LOG-STRUCTURED |

### Static Verification

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

## Common Mistakes

- Using `unsafe` to "simplify" enum casts via `transmute` — always unsound
- Returning `Arc<Mutex<T>>` from public APIs — hide wrappers behind clean interface
- Using `String` for file paths instead of `PathBuf`
- `panic = "abort"` in downstream + your library panics = killed process
- `static` items duplicated across crate versions silently
- `#[allow(clippy::...)]` accumulates stale overrides — use `#[expect]` instead
- `pub use foo::*` leaks unintended types on upstream changes
