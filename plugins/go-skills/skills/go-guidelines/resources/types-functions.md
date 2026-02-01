# Types, Functions & Control Flow

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

---

## Functions

### Multiple Return Values

```go
// Return value + error — the Go pattern
func (f *File) Write(b []byte) (n int, err error)

// Named return values — document meaning in godoc
func ReadFull(r Reader, buf []byte) (n int, err error) {
    for len(buf) > 0 && err == nil {
        var nr int
        nr, err = r.Read(buf)
        n += nr
        buf = buf[nr:]
    }
    return // naked return — uses named values
}
// NOTE: naked returns OK in short functions; avoid in long ones (>10 lines)
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

---

## Data Types

### new vs make

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
