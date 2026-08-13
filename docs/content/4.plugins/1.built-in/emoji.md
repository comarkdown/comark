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
    to: /reference/parse
    color: neutral
    variant: soft
  - label: Markdown Syntax
    icon: i-lucide-file-text
    to: /syntax/markdown
    color: neutral
    variant: soft
---

The `comark/plugins/emoji` plugin converts emoji shortcodes (e.g. `:smile:`) into their corresponding emoji characters. It ships with a curated set of common emojis, and you can add the full GitHub set or your own shortcodes with the [`extend`](#extend) option.

## Usage

```typescript
import { parseMarkdown } from 'comark'
import emoji from 'comark/plugins/emoji'

const result = await parseMarkdown(content, {
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
import { Markdown } from '@comark/vue'
import emoji from '@comark/vue/plugins/emoji'
</script>

<template>
  <Markdown :plugins="[emoji()]">{{ content }}</Markdown>
</template>
```

```tsx [React]
import { Markdown } from '@comark/react'
import emoji from '@comark/react/plugins/emoji'

<Markdown plugins={[emoji()]}>{content}</Markdown>
```

::

::tip
Shortcodes are case-sensitive and must use exact names. Invalid or unknown shortcodes are left unchanged in the output.
::

---

## Features

### Shortcodes

The plugin ships with 200+ popular emojis across all common categories:

- **Smileys & Emotions**: `:smile:` `:heart_eyes:` `:thinking:` `:cry:` `:joy:`
- **People & Gestures**: `:thumbsup:` `:clap:` `:wave:` `:muscle:` `:pray:`
- **Hearts**: `:heart:` `:yellow_heart:` `:blue_heart:` `:purple_heart:` `:broken_heart:`
- **Animals**: `:dog:` `:cat:` `:lion:` `:bear:` `:penguin:` `:fish:`
- **Food**: `:pizza:` `:hamburger:` `:coffee:` `:beer:` `:cake:`
- **Activities**: `:soccer:` `:basketball:` `:trophy:` `:guitar:` `:art:`
- **Travel**: `:airplane:` `:rocket:` `:car:` `:train:` `:ship:`
- **Objects**: `:fire:` `:sparkles:` `:bulb:` `:book:` `:computer:`
- **Symbols**: `:white_check_mark:` `:x:` `:warning:` `:star:` `:100:`
- **Nature**: `:tree:` `:sunflower:` `:rainbow:` `:sunny:`

### Aliases

Some emojis have multiple valid shortcodes:

```mdc
:thumbsup: or :+1:          → 👍
:thumbsdown: or :-1:        → 👎
:satisfied: or :laughing:   → 😆
:punch: or :facepunch:      → 👊
```

### Custom shortcodes

Use the `extend` option to add your own shortcodes or override built-in ones. This is handy for team-specific emojis or GitHub custom shortcodes that aren't part of the Unicode set (e.g. `:shipit:`):

```typescript
import emoji from 'comark/plugins/emoji'

parseMarkdown(content, {
  plugins: [
    emoji({
      extend: {
        shipit: '🚀',
        myteam: '🦄',
      },
    }),
  ],
})
```

Values in `extend` take precedence over the built-in set, so you can also remap an existing shortcode.

### Full emoji set

The built-in set is intentionally small to keep the bundle light. To support the complete GitHub set, install a dataset such as [`gemoji`](https://github.com/wooorm/gemoji) and pass its map through `extend`:

```typescript
import emoji from 'comark/plugins/emoji'
import { nameToEmoji } from 'gemoji'

parseMarkdown(content, {
  plugins: [emoji({ extend: nameToEmoji })],
})
```

---

## API

### `emoji(options?)`

Returns a `ComarkPlugin` that converts emoji shortcodes to characters.

#### `extend`

- Type: `Record<string, string>`
- Optional

A map of shortcode names (without colons) to emoji characters. Added on top of the built-in set; values override built-in shortcodes of the same name.

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
