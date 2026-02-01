---
description: Review Rust code against Microsoft Pragmatic Rust Guidelines
argument-hint: [file-or-module]
allowed-tools: [Read, Glob, Grep, Bash]
---

# Rust Guidelines Review

Review Rust code against the Microsoft Pragmatic Rust Guidelines skill (rust-guidelines).

## Target

If $ARGUMENTS is provided, review that file or module. Otherwise review the most recently discussed or edited Rust file.

## Review Checklist

Check all applicable guidelines. Focus on actionable findings only — skip rules that don't apply.

### Error Handling
- M-APP-ERROR: Apps use anyhow/eyre; libraries use canonical error structs
- M-ERRORS-CANONICAL-STRUCTS: Error structs with Backtrace, Display, std::error::Error
- M-PANIC-IS-STOP: Panics only for programming bugs, never control flow
- M-PANIC-ON-BUG: Contract violations panic, not Result

### Safety
- M-UNSAFE: Valid reason required (novel abstraction, perf, FFI). Safety comments present.
- M-UNSOUND: No unsound code — safe wrappers around unsafe must be truly safe

### API Design
- M-IMPL-ASREF: Functions accept impl AsRef<str/Path/[u8]> where feasible
- M-AVOID-WRAPPERS: No Arc/Rc/Box/RefCell in public API signatures
- M-STRONG-TYPES: PathBuf for paths, not String
- M-DI-HIERARCHY: Concrete > generics > dyn Trait
- M-ESSENTIAL-FN-INHERENT: Core functionality as inherent methods

### Documentation
- M-FIRST-DOC-SENTENCE: Summary < 15 words
- M-CANONICAL-DOCS: Examples, Errors, Panics, Safety sections where applicable
- M-MODULE-DOCS: Module-level //! docs present

### Naming & Style
- M-CONCISE-NAMES: No weasel words (Service, Manager, Factory)
- M-DOCUMENTED-MAGIC: Magic values have comments explaining why
- M-LINT-OVERRIDE-EXPECT: #[expect] not #[allow] for lint overrides

### Performance
- M-THROUGHPUT: Batch operations where possible
- M-YIELD-POINTS: Long CPU tasks yield in async context

### Library Resilience
- M-AVOID-STATICS: No correctness-critical statics
- M-NO-GLOB-REEXPORTS: No pub use foo::*
- M-FEATURES-ADDITIVE: Features are additive
- M-TYPES-SEND: Public types are Send

## Output Format

For each finding, report:
1. **Guideline**: The M-CODE that applies
2. **Location**: file:line
3. **Issue**: What's wrong
4. **Fix**: Concrete suggestion

If the code follows guidelines well, say so briefly and highlight any particularly good patterns.
