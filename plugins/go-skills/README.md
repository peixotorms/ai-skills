# Go Skills Plugin

Idiomatic Go guidelines as focused Claude Code skills, plus a review command.

## What's Included

**Skills** (auto-activate based on context):

| Skill | Focus |
|-------|-------|
| `go-guidelines` | Formatting, naming, doc comments, control structures, functions, defer, data types (slices, maps), methods, interfaces, embedding, initialization, functional options, generics, testing, linting, design principles, anti-patterns |
| `go-concurrency` | Goroutines, channels, select, worker pools, fan-out/fan-in, sync primitives, context rules, cancellation patterns |
| `go-errors` | Error interface, wrapping with `%w`, `errors.Is`/`errors.As`, sentinel errors, custom types, errors-as-values patterns, panic/recover |

**Command:**

- `/go-review` — Review Go code against the guidelines

## Installation

```bash
claude plugin marketplace add peixotorms/odinlayer-skills
claude plugin install go-skills
```

## Usage

Skills activate automatically when Claude detects Go-related work. You can also explicitly review code:

```
/go-review main.go
/go-review internal/server/handler.go
```

## Sources

- [Effective Go](https://go.dev/doc/effective_go)
- [Google Go Style Guide](https://google.github.io/styleguide/go/)
- [Go Code Review Comments](https://go.dev/wiki/CodeReviewComments)
- [Go Proverbs](https://go-proverbs.github.io/)
