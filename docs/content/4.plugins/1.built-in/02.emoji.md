---
title: Emoji
description: "Convert emoji shortcodes like :smile: into emoji characters."
seo:
  title: Emoji Shortcodes Plugin
navigation:
  icon: i-lucide-smile
links:
  - label: Parse API
    icon: i-lucide-file-code
    to: /api/parse
    color: neutral
    variant: soft
  - label: Markdown Syntax
    icon: i-lucide-file-text
    to: /syntax/markdown
    color: neutral
    variant: soft
---

The `comark/plugins/emoji` plugin converts emoji shortcodes (e.g. `:smile:`) into their corresponding emoji characters. It takes no configuration options.

## Usage

```typescript
import { parse } from 'comark'
import emoji from 'comark/plugins/emoji'

const result = await parse(content, {
  plugins: [emoji()]
})
```

::code-group

```mdc [Input]
I love using Comark :heart: :rocket:

Great job! :thumbsup: :tada:
```

```text [Output]
I love using Comark ❤️ 🚀

Great job! 👍 🎉
```

::

With framework components:

::code-group

```vue [Vue]
<script setup lang="ts">
import { Comark } from '@comark/vue'
import emoji from '@comark/vue/plugins/emoji'
</script>

<template>
  <Comark :plugins="[emoji()]">{{ content }}</Comark>
</template>
```

```tsx [React]
import { Comark } from '@comark/react'
import emoji from '@comark/react/plugins/emoji'

<Comark plugins={[emoji()]}>{content}</Comark>
```

::

::tip
Shortcodes are case-sensitive and must use exact names. Invalid or unknown shortcodes are left unchanged in the output.
::

---

## Features

### Shortcodes

The plugin supports 200+ popular emojis across all common categories:

- **Smileys & Emotions** — `:smile:` `:heart_eyes:` `:thinking:` `:cry:` `:joy:`
- **People & Gestures** — `:thumbsup:` `:clap:` `:wave:` `:muscle:` `:pray:`
- **Hearts** — `:heart:` `:yellow_heart:` `:blue_heart:` `:purple_heart:` `:broken_heart:`
- **Animals** — `:dog:` `:cat:` `:lion:` `:bear:` `:penguin:` `:fish:`
- **Food** — `:pizza:` `:hamburger:` `:coffee:` `:beer:` `:cake:`
- **Activities** — `:soccer:` `:basketball:` `:trophy:` `:guitar:` `:art:`
- **Travel** — `:airplane:` `:rocket:` `:car:` `:train:` `:ship:`
- **Objects** — `:fire:` `:sparkles:` `:bulb:` `:book:` `:computer:`
- **Symbols** — `:white_check_mark:` `:x:` `:warning:` `:star:` `:100:`
- **Nature** — `:tree:` `:sunflower:` `:rainbow:` `:sunny:`

### Aliases

Some emojis have multiple valid shortcodes:

```mdc
:thumbsup: or :+1:          → 👍
:thumbsdown: or :-1:        → 👎
:satisfied: or :laughing:   → 😆
:punch: or :facepunch:      → 👊
```

---

## API

### `emoji()`

Returns a `ComarkPlugin` that converts emoji shortcodes to characters. Takes no configuration options.

**Returns:** `ComarkPlugin`

---

## Examples

### Documentation Markers

```mdc
:white_check_mark: Completed
:construction: In Progress
:x: Blocked
```

### Status Indicators

```mdc
Build status: :white_check_mark:
Test coverage: 95% :fire:
Deployment: :rocket:
```

### Task Lists

```mdc
- :white_check_mark: Setup project
- :construction: Write docs
- :bulb: Add examples
```
