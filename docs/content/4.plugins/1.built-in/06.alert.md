---
title: Alerts
description: Built-in plugin that transforms GitHub-style blockquote alerts into styled callout blocks with icons and colors.
seo:
  title: Alerts Plugin
navigation:
  icon: i-lucide-bell
links:
  - label: Markdown Syntax
    icon: i-lucide-file-text
    to: /syntax/markdown
    color: neutral
    variant: soft
  - label: Plugins
    icon: i-lucide-plug
    to: /plugins
    color: neutral
    variant: soft
---

The alerts plugin transforms GitHub-flavored alert blockquotes into styled callout blocks with icons and colors — identical to how GitHub renders them in READMEs and issues.

The plugin is **built-in and enabled by default**. No installation or registration required.

## Usage

Alerts use standard blockquote syntax with a special marker on the first line:

```mdc
> [!NOTE]
> Useful information that users should know, even when skimming content.

> [!TIP]
> Helpful advice for doing things better or more easily.

> [!IMPORTANT]
> Key information users need to know to achieve their goal.

> [!WARNING]
> Urgent info that needs immediate user attention to avoid problems.

> [!CAUTION]
> Advises about risks or negative outcomes of certain actions.
```

**Renders as:**

> [!NOTE]
> Useful information that users should know, even when skimming content.

> [!TIP]
> Helpful advice for doing things better or more easily.

> [!IMPORTANT]
> Key information users need to know to achieve their goal.

> [!WARNING]
> Urgent info that needs immediate user attention to avoid problems.

> [!CAUTION]
> Advises about risks or negative outcomes of certain actions.

---

## Features

### Alert Types

| Marker | Color | Use for |
|---|---|---|
| `[!NOTE]` | Blue | Supplementary information |
| `[!TIP]` | Green | Helpful hints and best practices |
| `[!IMPORTANT]` | Purple | Critical information for success |
| `[!WARNING]` | Yellow | Potential issues and gotchas |
| `[!CAUTION]` | Red | Dangerous actions or destructive operations |

### Multi-line Content

Alerts can span multiple lines and contain inline markdown:

```mdc
> [!WARNING]
> **Breaking change** in v2.0: the `parse()` function is now async.
> Update all call sites to use `await parse(...)`.
```

---

## Nuxt UI Integration

When using the [Nuxt module](/rendering/nuxt) alongside `@nuxt/ui`, alert blocks are automatically mapped to Nuxt UI's `<Note>`, `<Warning>`, `<Caution>`, and `<Tip>` components — no extra configuration needed.
