# Rust Skills Plugin

Microsoft Pragmatic Rust Guidelines as a Claude Code skill with review command.

## What's Included

- **Skill: `rust-guidelines`** — Auto-activates when writing or reviewing Rust code. Provides quick-reference tables for all 48 guidelines.
- **Command: `/rust-review`** — Manually review Rust code against the guidelines.

## Installation

```bash
claude plugin marketplace add /home/skills    # or your GitHub repo
claude plugin install rust-skills
```

## Usage

The skill activates automatically when Claude detects Rust-related work. You can also explicitly review code:

```
/rust-review src/main.rs
/rust-review src/api/routes.rs
```

## Source

Based on [Microsoft Pragmatic Rust Guidelines](https://microsoft.github.io/rust-guidelines/).
