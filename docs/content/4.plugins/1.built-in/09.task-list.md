---
title: Task List
description: Plugin for rendering interactive checkboxes from GitHub-style task list syntax.
seo:
  title: Task List Plugin
navigation:
  icon: i-lucide-check-square
links:
  - label: Parse API
    icon: i-lucide-file-code
    to: /api/parse
    color: neutral
    variant: soft
  - label: Plugins
    icon: i-lucide-plug
    to: /plugins
    color: neutral
    variant: soft
---

The `comark/plugins/task-list` plugin converts GitHub-style task list syntax into interactive checkboxes. It runs before inline parsing to prevent Comark from misinterpreting `[ ]` and `[x]` as component syntax.

## Usage

```typescript
import { parse } from 'comark'
import taskList from 'comark/plugins/task-list'

const result = await parse(`
- [x] Write the docs
- [ ] Fix the bug
- [x] Ship it
`, {
  plugins: [taskList()]
})
```

With framework components:

::code-group

```vue [Vue]
<script setup lang="ts">
import { Comark } from '@comark/vue'
import taskList from '@comark/vue/plugins/task-list'
</script>

<template>
  <Comark :plugins="[taskList()]">{{ content }}</Comark>
</template>
```

```tsx [React]
import { Comark } from '@comark/react'
import taskList from '@comark/react/plugins/task-list'

<Comark plugins={[taskList()]}>{content}</Comark>
```

::

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

### CSS Classes

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

Returns a `ComarkPlugin` that converts task list syntax to checkboxes. Takes no options.

**Returns:** `ComarkPlugin`
