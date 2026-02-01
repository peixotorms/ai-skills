# Domain Modeling

## Domain Concept -> Rust Pattern

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
