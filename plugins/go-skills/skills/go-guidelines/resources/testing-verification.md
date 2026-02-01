# Testing & Verification

## Testing

### Table-Driven Tests

```go
func TestAdd(t *testing.T) {
    tests := []struct {
        name     string
        a, b     int
        expected int
    }{
        {"positive", 1, 2, 3},
        {"zero", 0, 0, 0},
        {"negative", -1, 1, 0},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            got := Add(tt.a, tt.b)
            if got != tt.expected {
                t.Errorf("Add(%d, %d) = %d, want %d", tt.a, tt.b, got, tt.expected)
            }
        })
    }
}
```

### Testing Patterns

```go
// Parallel tests
func TestSomething(t *testing.T) {
    t.Parallel()  // runs concurrently with other parallel tests
    // ...
}

// Test helpers
func setupTestDB(t *testing.T) *DB {
    t.Helper()  // marks as helper — errors report caller's line
    db := NewDB()
    t.Cleanup(func() { db.Close() })  // automatic cleanup
    return db
}

// testify assertions (popular third-party)
import "github.com/stretchr/testify/assert"
import "github.com/stretchr/testify/require"

func TestUser(t *testing.T) {
    user, err := GetUser(1)
    require.NoError(t, err)          // fails test immediately
    assert.Equal(t, "Alice", user.Name)  // continues on failure
}
```

| Testing rule | Detail |
|--------------|--------|
| `_test.go` suffix | Test files, excluded from production builds |
| `Test` prefix | Functions must start with `TestXxx(t *testing.T)` |
| `t.Run` for subtests | Enables selective running: `go test -run TestAdd/positive` |
| `t.Helper()` | Marks helper functions for better error locations |
| `t.Cleanup()` | Deferred cleanup that runs after test completes |
| `t.Parallel()` | Opt-in parallel execution within a test |
| `testdata/` directory | Test fixtures, ignored by Go tooling |
| Got before want | `t.Errorf("Func(%v) = %v, want %v", input, got, want)` |
| `t.Error` over `t.Fatal` | Keep going — report all failures in one run |
| `t.Fatal` only for setup | When test literally cannot proceed |
| No `t.Fatal` from goroutines | Only call from test function's goroutine |

---

## Static Verification

### golangci-lint

```bash
# Install
go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest

# Run
golangci-lint run ./...
```

### Recommended `.golangci.yml`

```yaml
linters:
  enable:
    # Correctness
    - errcheck         # unchecked errors
    - govet            # go vet
    - staticcheck      # advanced analysis
    - unused           # unused code
    - ineffassign      # ineffectual assignments
    - nilerr           # returning nil when err is non-nil

    # Style
    - misspell         # spelling mistakes
    - whitespace       # unnecessary whitespace
    - unconvert        # unnecessary conversions
    - unparam          # unused function parameters
    - usestdlibvars    # use stdlib constants (http.StatusOK)

    # Safety
    - gosec            # security issues
    - sqlclosecheck    # unclosed SQL rows
    - noctx            # HTTP requests without context
    - wrapcheck        # errors not wrapped

    # Quality
    - prealloc         # suggest pre-allocations
    - goconst          # repeated strings as constants
    - nestif           # deeply nested ifs
    - gocognit         # cognitive complexity
    - funlen           # function length

linters-settings:
  funlen:
    lines: 100
  gocognit:
    min-complexity: 20
  nestif:
    min-complexity: 5
```

### go vet & Race Detector

```bash
go vet ./...                 # built-in static analysis
go test -race ./...          # detect data races at runtime
go test -count=1 ./...       # disable test caching
go test -cover ./...         # coverage report
go test -coverprofile=c.out && go tool cover -html=c.out  # HTML coverage
```
