---
name: go-review
description: Review Go code against Effective Go guidelines and idiomatic patterns
user-invocable: true
arguments:
  - name: file
    description: Path to the Go file to review
    required: true
---

Review the Go file at `$ARGUMENTS` against the go-guidelines, go-concurrency, and go-errors skills.

## Review Checklist

For each category below, identify violations and suggest fixes:

### 1. Naming & Style
- Getter naming (no `Get` prefix)
- Package naming (lowercase, no underscores)
- Interface naming (`-er` suffix for single-method)
- MixedCaps convention
- Acronym casing (URL, HTTP, ID)

### 2. Error Handling
- All errors checked (no `_ = ...` for operations that can fail)
- Errors wrapped with context (`fmt.Errorf("...: %w", err)`)
- Sentinel errors used appropriately
- No panic for expected failures
- Error strings lowercase, no punctuation

### 3. Functions & Methods
- Defer for resource cleanup
- Pointer vs value receivers used consistently
- Named return values where they clarify
- Early returns instead of deep nesting

### 4. Data Types
- `make` vs `new` used correctly
- Slices pre-allocated when size known
- Map access uses comma-ok idiom
- Append return value captured

### 5. Interfaces
- Small interfaces (1-2 methods)
- Accept interfaces, return structs
- No unnecessary interface pollution

### 6. Concurrency (if applicable)
- No goroutine leaks
- Channels properly closed (sender closes)
- Context used for cancellation
- Loop variables not captured in closures
- sync.WaitGroup/errgroup for coordination

## Output Format

For each issue found:
```
[CATEGORY] file:line — Description
  BAD:  current code
  GOOD: suggested fix
```

End with a summary: number of issues by severity (critical / warning / suggestion).
