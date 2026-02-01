# Elementor Skills Plugin

Comprehensive Elementor development guidelines as focused Claude Code skills, plus a review command.

## What's Included

**Skills** (auto-activate based on context):

| Skill | Focus |
|-------|-------|
| `elementor-development` | Addon structure, widget development (rendering, controls, dependencies, caching, inline editing), manager registration/unregistration, CLI commands, scripts & styles enqueueing, data structure, deprecation handling |
| `elementor-controls` | 56+ editor control types (text, select, color, slider, media, repeater, etc.), group controls (typography, background, border, box-shadow), selectors & selector dictionary, responsive controls, conditional display, dynamic content, AI integration |
| `elementor-hooks` | PHP action hooks (elementor/init, elementor/loaded, widget rendering, editor, frontend), PHP filter hooks (content, styles, queries), JS hooks & commands, injecting controls into existing widgets |
| `elementor-forms` | Form actions (structure, controls, run, export/import), form fields (custom types, rendering, validation, dependencies, content templates) |
| `elementor-themes` | Theme builder (locations, conditions, sub-conditions), dynamic tags (categories, groups, controls, rendering), Hello Elementor theme functions, Finder (categories, items), context menu extensions, hosting integration |

**Command:**

- `/elementor-review` — Review Elementor addon code against development guidelines and best practices

## Installation

```bash
claude plugin marketplace add peixotorms/odinlayer-skills
claude plugin install elementor-skills
```

## Usage

Skills activate automatically when Claude detects Elementor-related work. You can also explicitly review code:

```
/elementor-review wp-content/plugins/my-elementor-addon/
/elementor-review wp-content/plugins/my-addon/widgets/custom-widget.php
```

## Sources

- [Elementor Developer Docs](https://developers.elementor.com/docs/) — Official developer documentation (294 pages)
- [Elementor GitHub](https://github.com/elementor/elementor) — Source code and examples
