# Patterns

## Methods

### Pointer vs Value Receivers

```go
// BAD: value receiver on large struct
func (b BigStruct) Process() { ... }  // copies entire struct

// GOOD: pointer receiver
func (b *BigStruct) Process() { ... }

// Don't pass pointers to small basic types — pass values
// BAD: func Process(name *string, count *int)
// GOOD: func Process(name string, count int)

// CONSISTENCY: if any method needs pointer receiver, all should use pointer
type MyType struct { ... }
func (m *MyType) Read() { ... }   // pointer
func (m *MyType) Write() { ... }  // pointer too — stay consistent
```

---

## Initialization

### Constants & iota

```go
type ByteSize float64

const (
    _           = iota  // ignore zero
    KB ByteSize = 1 << (10 * iota)
    MB
    GB
    TB
)
```

### init Functions

```go
func init() {
    if user == "" {
        log.Fatal("$USER not set")
    }
}
```

| Init rule | Detail |
|-----------|--------|
| Called after all variable declarations | Automatic |
| All imports initialized first | Dependency order |
| Multiple `init()` per file allowed | Run in order |
| Use for verification | Not complex logic |

---

## Functional Options Pattern

The standard Go pattern for flexible, extensible configuration:

```go
// Option type — a function that modifies the target
type Option func(*Server)

func WithPort(port int) Option {
    return func(s *Server) { s.port = port }
}

func WithTimeout(d time.Duration) Option {
    return func(s *Server) { s.timeout = d }
}

func WithLogger(l *log.Logger) Option {
    return func(s *Server) { s.logger = l }
}

// Constructor applies options over defaults
func NewServer(opts ...Option) *Server {
    s := &Server{
        port:    8080,           // sensible defaults
        timeout: 30 * time.Second,
        logger:  log.Default(),
    }
    for _, opt := range opts {
        opt(s)
    }
    return s
}

// Usage — clean, self-documenting, extensible
srv := NewServer(
    WithPort(9090),
    WithTimeout(60 * time.Second),
)
```

| When to use | When NOT to use |
|-------------|-----------------|
| 3+ optional configuration fields | 1-2 required parameters — just use arguments |
| Library APIs (callers shouldn't know internals) | Internal structs with few fields — use literal |
| Defaults should work out of the box | Config loaded from file — use a config struct |

### With Generics (Go 1.18+)

```go
type AgentOption[T any] func(*Agent[T])

func WithName[T any](name string) AgentOption[T] {
    return func(a *Agent[T]) { a.name = name }
}

func NewAgent[T any](opts ...AgentOption[T]) (*Agent[T], error) {
    a := &Agent[T]{name: "default"}
    for _, opt := range opts {
        opt(a)
    }
    return a, a.validate()
}
```

---

## Constructor & Validation

```go
// NewX returns (*X, error) — validate at construction time
func NewServer(opts ...Option) (*Server, error) {
    s := &Server{port: 8080}
    for _, opt := range opts {
        opt(s)
    }
    if err := s.validate(); err != nil {
        return nil, fmt.Errorf("invalid server config: %w", err)
    }
    return s, nil
}

func (s *Server) validate() error {
    if s.port <= 0 || s.port > 65535 {
        return fmt.Errorf("port %d out of range", s.port)
    }
    if s.timeout <= 0 {
        return fmt.Errorf("timeout must be positive")
    }
    return nil
}
```

| Pattern | When |
|---------|------|
| `NewX() *X` | Simple construction, always succeeds |
| `NewX() (*X, error)` | Validation needed, may fail |
| `MustX() *X` | Panics on error — only for compile-time constants or tests |

---

## Generics (Go 1.18+)

```go
// Type constraints
func Map[T, U any](s []T, f func(T) U) []U {
    result := make([]U, len(s))
    for i, v := range s {
        result[i] = f(v)
    }
    return result
}

// Constraint interfaces
type Number interface {
    ~int | ~int64 | ~float64
}

func Sum[T Number](values []T) T {
    var total T
    for _, v := range values {
        total += v
    }
    return total
}
```

| Use generics for | Don't use generics for |
|------------------|------------------------|
| Type-safe collections/containers | Simple functions that work with `interface{}` |
| Algorithm reuse across types | When only one type is ever used |
| Reducing code duplication | When it makes code harder to read |
| Options/builder patterns | Premature abstraction |
