---
title: Task list
description: Plugin for rendering GitHub-style task list syntax as disabled checkboxes.
seo:
  title: Task List Plugin
navigation:
  icon: i-lucide-check-square
links:
  - label: Parse API
    icon: i-lucide-file-code
    to: /reference/parse
    color: neutral
    variant: soft
  - label: Plugins
    icon: i-lucide-plug
    to: /plugins
    color: neutral
    variant: soft
---

The `comark/plugins/task-list` plugin converts GitHub-style task list syntax into disabled checkboxes. It runs before inline parsing to prevent Comark from misinterpreting `[ ]` and `[x]` as component syntax.

The plugin is **enabled by default** via `registerDefaultPlugins`. No installation or registration required.

## Usage

```typescript
import { parseMarkdown } from 'comark'

const result = await parseMarkdown(`
- [x] Write the docs
- [ ] Fix the bug
- [x] Ship it
`)
```

Explicit registration is only needed when default plugins are disabled:

```typescript
import { parseMarkdown } from 'comark'
import taskList from 'comark/plugins/task-list'

const result = await parseMarkdown(content, {
  registerDefaultPlugins: false,
  plugins: [taskList()]
})
```

---

## Features

### Syntax

Use `[ ]` for unchecked and `[x]` (or `[X]`) for checked items inside a list:

```mdc
- [x] Completed task
- [ ] Pending task
- [X] Also completed (case-insensitive)
```

Task lists also work in nested lists:

```mdc
- [x] Parent task
  - [x] Sub-task done
  - [ ] Sub-task pending
- [ ] Another parent task
```

### CSS classes

The plugin adds classes to help with styling:

| Element | Class |
|---|---|
| `<ul>` containing tasks | `contains-task-list` |
| `<li>` with a checkbox | `task-list-item` |
| `<input>` checkbox | `task-list-item-checkbox` |

```css
.task-list-item {
  list-style: none;
}

.task-list-item-checkbox {
  margin-right: 0.5em;
}
```

---

## API

### `taskList()`

Returns a `ComarkPlugin` that converts task list syntax to disabled checkboxes. Takes no options.

**Returns:** `ComarkPlugin`
