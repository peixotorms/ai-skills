---
name: go-guidelines
description: Use when writing, reviewing, or refactoring Go code. Covers formatting, naming conventions, control structures, functions, multiple returns, defer, data types (slices, maps, arrays), composite literals, new vs make, methods, pointer vs value receivers, interfaces, embedding, type assertions, initialization, iota, and common anti-patterns.
---

# Go Guidelines

## Overview

Idiomatic Go guidelines based on [Effective Go](https://go.dev/doc/effective_go). Go has its own conventions — writing good Go means embracing them, not porting patterns from other languages.

## Formatting

| Rule | Detail |
|------|--------|
| Use `gofmt` | No exceptions — all Go code is gofmt'd |
| Indentation | Tabs, not spaces |
| Line length | No hard limit; break long lines naturally |
| Braces | Opening brace on same line (mandatory — semicolon insertion) |

## Naming Conventions

| What | Convention | Example |
|------|-----------|---------|
| Packages | Lowercase, single-word, no underscores | `bufio`, `strconv` |
| Exported names | `MixedCaps` (upper first letter) | `ReadWriter` |
| Unexported | `mixedCaps` (lower first letter) | `readBuf` |
| Getters | `Owner()` not `GetOwner()` | `func (o *Obj) Name() string` |
| Setters | `SetOwner()` | `func (o *Obj) SetName(n string)` |
| One-method interfaces | Method name + `-er` suffix | `Reader`, `Writer`, `Stringer` |
| Acronyms | All caps | `URL`, `HTTP`, `ID` (not `Url`, `Http`, `Id`) |
| Local variables | Short names in small scope | `i`, `buf`, `err` |

```go
// BAD: Java/C# naming
func GetUserName() string { ... }
type IReader interface { ... }

// GOOD: Go naming
func UserName() string { ... }
type Reader interface { ... }
```

## Control Structures

### If

```go
// Initialization statement — keeps scope tight
if err := file.Chmod(0664); err != nil {
    log.Print(err)
    return err
}

// BAD: unnecessary else
if condition {
    return x
} else {
    return y
}

// GOOD: early return
if condition {
    return x
}
return y
```

### For

```go
// Three forms
for init; condition; post { }  // C-style
for condition { }              // while
for { }                        // infinite

// Range — the idiomatic way
for key, value := range myMap { ... }
for i, v := range mySlice { ... }
for _, v := range mySlice { ... }  // discard index
for i := range mySlice { ... }     // index only

// Range on string iterates runes (UTF-8), not bytes
for i, runeValue := range "Hello, 世界" {
    fmt.Printf("%d: %c\n", i, runeValue)
}
```

### Switch

```go
// No automatic fall-through (unlike C)
switch c {
case ' ', '?', '&', '=':  // comma-separated list
    return true
}

// Switch on true for if-else chains
switch {
case x > 0:
    return 1
case x < 0:
    return -1
default:
    return 0
}

// Type switch
switch v := value.(type) {
case string:
    return v
case int:
    return strconv.Itoa(v)
}
```

## Functions

### Multiple Return Values

```go
// Return value + error — the Go pattern
func (f *File) Write(b []byte) (n int, err error)

// Named return values clarify docs
func ReadFull(r Reader, buf []byte) (n int, err error) {
    for len(buf) > 0 && err == nil {
        var nr int
        nr, err = r.Read(buf)
        n += nr
        buf = buf[nr:]
    }
    return // bare return — uses named values
}
```

### Defer

```go
func Contents(filename string) (string, error) {
    f, err := os.Open(filename)
    if err != nil {
        return "", err
    }
    defer f.Close()  // runs when function returns

    var result []byte
    // ... read file
    return string(result), nil
}

// Defers run LIFO — last deferred runs first
func trace(s string) string { log.Println("entering:", s); return s }
func un(s string)           { log.Println("leaving:", s) }
func a() {
    defer un(trace("a"))  // trace evaluated now, un runs on return
    // ... do work
}
```

| Defer rule | Detail |
|------------|--------|
| Arguments evaluated immediately | When `defer` statement executes, not when function returns |
| LIFO order | Last `defer` runs first |
| Runs on any return path | Including panics |
| Use for cleanup | Files, locks, connections |

## Data Types

### new vs make

| Function | Returns | Use for | Initializes |
|----------|---------|---------|-------------|
| `new(T)` | `*T` | Any type | Zeroed memory |
| `make(T, ...)` | `T` | Slices, maps, channels only | Internal data structures |

```go
p := new(SyncedBuffer)     // *SyncedBuffer, zeroed, ready to use
v := make([]int, 100)       // []int with len=100, cap=100
m := make(map[string]int)   // initialized map, ready to use
ch := make(chan int, 10)     // buffered channel
```

### Composite Literals

```go
// Struct literal — prefer field names
f := File{fd: fd, name: name}

// Can take address — allocates and returns pointer
return &File{fd: fd, name: name}

// Array/slice literals
primes := []int{2, 3, 5, 7, 11}
```

### Slices

```go
// Slicing doesn't copy — shares underlying array
b := buf[0:32]

// Append — MUST use return value
slice = append(slice, elem1, elem2)
slice = append(slice, anotherSlice...)  // spread with ...

// Pre-allocate known capacity
result := make([]string, 0, len(input))
for _, v := range input {
    result = append(result, process(v))
}
```

| Slice rule | Detail |
|------------|--------|
| Always use return value of `append` | Underlying array may move |
| Pre-allocate with `make([]T, 0, cap)` | When size is known or estimable |
| `len(s)` vs `cap(s)` | Length is current size, capacity is maximum before reallocation |
| Nil slice is valid | `len(nil) == 0`, `append(nil, x)` works |

### Maps

```go
// Literal initialization
timeZone := map[string]int{
    "UTC": 0,
    "EST": -5 * 60 * 60,
}

// Comma-ok idiom — distinguish missing from zero value
if seconds, ok := timeZone[tz]; ok {
    return seconds
}

// Delete
delete(timeZone, "PDT")
```

| Map rule | Detail |
|----------|--------|
| Zero value for missing key | `m["absent"]` returns zero, not error |
| Always use comma-ok for presence check | `v, ok := m[key]` |
| Not safe for concurrent access | Use `sync.Map` or mutex |
| Iteration order is random | Don't rely on order |

### Printing

```go
fmt.Printf("%v\n", value)   // default format
fmt.Printf("%+v\n", s)      // struct with field names
fmt.Printf("%#v\n", s)      // full Go syntax
fmt.Printf("%T\n", value)   // type name

// Custom formatting — implement Stringer
func (t *T) String() string {
    return fmt.Sprintf("%d/%g/%q", t.a, t.b, t.c)
}
```

## Methods

### Pointer vs Value Receivers

| Receiver | Can modify? | Called on | Use when |
|----------|-------------|-----------|----------|
| `func (t T) Method()` | No (copy) | Values and pointers | Read-only, small types |
| `func (t *T) Method()` | Yes | Pointers only* | Mutation, large structs |

\* Go auto-takes address for addressable values.

```go
// BAD: value receiver on large struct
func (b BigStruct) Process() { ... }  // copies entire struct

// GOOD: pointer receiver
func (b *BigStruct) Process() { ... }

// CONSISTENCY: if any method needs pointer receiver, all should use pointer
type MyType struct { ... }
func (m *MyType) Read() { ... }   // pointer
func (m *MyType) Write() { ... }  // pointer too — stay consistent
```

## Interfaces

### Design Principles

```go
// Small interfaces — one or two methods
type Reader interface {
    Read(p []byte) (n int, err error)
}

// Compose bigger interfaces from small ones
type ReadWriter interface {
    Reader
    Writer
}

// Accept interfaces, return structs
func Process(r io.Reader) (*Result, error) { ... }
```

| Interface rule | Detail |
|----------------|--------|
| Keep interfaces small | 1-2 methods ideal |
| Accept interfaces, return concrete types | Maximum flexibility for callers |
| Don't export implementation types when interface suffices | Return interface from constructors |
| Interfaces are satisfied implicitly | No `implements` keyword |
| Name one-method interfaces with `-er` | `Reader`, `Writer`, `Closer`, `Stringer` |

### Type Assertions

```go
// Safe form — comma-ok
str, ok := value.(string)
if !ok {
    // value is not a string
}

// Type switch — multiple type checks
switch v := value.(type) {
case string:
    return v
case fmt.Stringer:
    return v.String()
default:
    return fmt.Sprintf("%v", value)
}
```

### Embedding

```go
// Interface embedding — compose interfaces
type ReadWriter interface {
    Reader
    Writer
}

// Struct embedding — promote methods
type Job struct {
    Command string
    *log.Logger  // promoted: job.Println() works
}

job := &Job{"cmd", log.New(os.Stderr, "Job: ", log.Ldate)}
job.Println("starting now...")

// Override embedded method
func (job *Job) Printf(format string, args ...interface{}) {
    job.Logger.Printf("%q: %s", job.Command, fmt.Sprintf(format, args...))
}
```

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

## Anti-Pattern Quick Reference

| Anti-Pattern | Better Alternative |
|--------------|--------------------|
| `GetName()` getter | `Name()` |
| Stuttering: `user.UserName` | `user.Name` |
| `interface{}` everywhere | Specific types or generics |
| Large interfaces (10+ methods) | Small, composed interfaces |
| Returning `error` and ignoring it | Always handle or explicitly `_ =` |
| `else` after `return` | Early return pattern |
| Naked goroutines (fire-and-forget) | Track with `sync.WaitGroup` or `errgroup` |
| `init()` with complex logic | Explicit initialization in `main()` |
| Mutable package-level vars | Pass config explicitly |
| Value receiver on large struct | Pointer receiver |
| Checking `== nil` on interface | Check concrete value (interfaces have type+value) |
| `panic` for expected errors | Return `error` |
| Underscore imports without comment | Document why: `import _ "pkg" // register driver` |
| `new(T)` when make is needed | `make` for slices/maps/channels |
| Ignoring `append` return value | Always `s = append(s, ...)` |
