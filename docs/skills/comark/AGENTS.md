# Comark: AI agents and LLM streaming

A guide for using Comark in AI agent and LLM applications where Markdown streams in incrementally.

## Why Comark for AI?

LLMs stream Markdown token by token. Standard Markdown parsers expect complete input and produce broken markup on partial streams. Comark handles partial input directly:

- **`autoClose`** (default: `true`): closes unfinished syntax such as `**bold text`, open code fences, and half-open components on every parse
- **Streaming mode**: reuses completed blocks as new chunks arrive
- **Stream effects**: `caret()`, `fade()`, and more from `comark/stream` decorate the active text while streaming
- **ANSI rendering**: renders styled terminal output for CLI agents

---

## Vue

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Markdown } from '@comark/vue'
import { caret } from 'comark/stream'

const effects = [caret()]
const content = ref('')
const streaming = ref(false)

async function generate(prompt: string) {
  content.value = ''
  streaming.value = true

  const res = await fetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ prompt }),
  })

  const reader = res.body!.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    content.value += decoder.decode(value, { stream: true })
  }

  streaming.value = false
}
</script>

<template>
  <Markdown :streaming="streaming" :effects="effects">{{ content }}</Markdown>
</template>
```

---

## React

```tsx
import { useState } from 'react'
import { Markdown } from '@comark/react'
import { caret } from 'comark/stream'

const effects = [caret()]

export default function Chat() {
  const [content, setContent] = useState('')
  const [streaming, setStreaming] = useState(false)

  async function generate(prompt: string) {
    setContent('')
    setStreaming(true)

    const res = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    })

    const reader = res.body!.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      setContent(prev => prev + decoder.decode(value, { stream: true }))
    }

    setStreaming(false)
  }

  return <Markdown streaming={streaming} effects={effects}>{content}</Markdown>
}
```

---

## Svelte

```svelte
<script lang="ts">
  import { Markdown } from '@comark/svelte'
  import { caret } from 'comark/stream'

  const effects = [caret()]

  let content = $state('')
  let streaming = $state(false)

  async function generate(prompt: string) {
    content = ''
    streaming = true

    const res = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    })

    const reader = res.body!.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      content += decoder.decode(value, { stream: true })
    }

    streaming = false
  }
</script>

<Markdown value={content} {streaming} {effects} />
```

---

## Angular

```typescript
import { Component } from '@angular/core'
import { Markdown } from '@comark/angular'
import { caret } from 'comark/stream'

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [Markdown],
  template: `
    <comark-markdown
      [value]="content"
      [streaming]="streaming"
      [effects]="effects"
    />
  `,
})
export class ChatComponent {
  effects = [caret()]
  content = ''
  streaming = false

  async generate(prompt: string) {
    this.content = ''
    this.streaming = true

    const res = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    })

    const reader = res.body!.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      this.content += decoder.decode(value, { stream: true })
    }

    this.streaming = false
  }
}
```

---

## Terminal and CLI agents

Use `@comark/ansi` to render LLM Markdown output in terminal agents:

```typescript
import { printAnsi } from '@comark/ansi'

// Print a complete LLM response to stdout with ANSI styling
await printAnsi(llmResponse)
```

For repeated terminal output, use `createAnsiPrinter` with a custom `writer` function:

```typescript
import { createAnsiPrinter } from '@comark/ansi'

const writeMarkdown = createAnsiPrinter({
  writer: (output) => process.stdout.write(output),
})

await writeMarkdown(markdown)
```

---

## Stream effects

The `effects` prop takes an array of effects from `comark/stream`. `caret()` appends a blinking cursor to the last text node while `streaming` is `true`, and `fade()` fades in new text. Effects run in array order. Define the array once, outside the render, so effects keep their state between renders. Pass `class` to `caret()` to customize it:

```vue
<script setup lang="ts">
import { caret, fade } from 'comark/stream'

const effects = [fade(), caret({ class: 'animate-blink' })]
</script>

<template>
  <Markdown :streaming="streaming" :effects="effects">{{ content }}</Markdown>
</template>
```

```tsx
import { caret, fade } from 'comark/stream'

const effects = [fade(), caret({ class: 'animate-blink' })]

<Markdown streaming={streaming} effects={effects}>{content}</Markdown>
```

```svelte
<script lang="ts">
  import { caret, fade } from 'comark/stream'

  const effects = [fade(), caret({ class: 'animate-blink' })]
</script>

<Markdown value={content} {streaming} {effects} />
```

```typescript
// Angular
import { caret, fade } from 'comark/stream'

class ChatComponent {
  effects = [fade(), caret({ class: 'animate-blink' })]
}
```

```html
<comark-markdown [value]="content" [streaming]="streaming" [effects]="effects" />
```

### Pacing and typewriter

`fade()` and `typewriter()` show each chunk as soon as it arrives. To release text at a steady rate regardless of chunk timing, put `pace()` before them. Order matters: `pace()` first, then `fade()` or `typewriter()`, then `caret()` last.

```typescript
import { caret, fade, pace, typewriter } from 'comark/stream'

// Steady word-by-word fade (speed in characters per second, catchUp in ms)
const effects = [pace({ speed: 80, catchUp: 1000 }), fade({ delay: 30 }), caret()]

// Character-by-character typing; match the speeds so the queue never grows
const typing = [pace({ speed: 100 }), typewriter({ speed: 100 }), caret()]
```

- `pace()` options: `speed` (default `45`), `catchUp` (default `Infinity`), `exclude`
- `fade()` options: `duration` (default `300`), `easing`, `animation` (`'fade'`, `'blur'`, `'slide'`), `delay` (default `30` per word, `0` fades each chunk whole), `unit` (`'word'` or `'char'`), `class`, `styles`, `exclude`. It also fades `img`, `hr`, task list checkboxes, and new list item markers, and splits CJK text per character.
- `typewriter()` options: `speed` (default `100`), `class`, `styles`, `exclude`
- The renderer keeps rendering until the paced backlog drains, even after `streaming` turns `false`
- Code blocks, math, and diagrams never fade or type; they appear whole

---

## With custom components

If your LLM emits Comark component syntax (for example, `::alert`), register those components before streaming begins:

```vue
<script setup lang="ts">
import { Markdown } from '@comark/vue'
import { caret } from 'comark/stream'
import Alert from './Alert.vue'
import CodeBlock from './CodeBlock.vue'

const effects = [caret()]
</script>

<template>
  <Markdown :components="{ alert: Alert, pre: CodeBlock }" :streaming="streaming" :effects="effects">
    {{ content }}
  </Markdown>
</template>
```

---

## With syntax highlighting

Syntax highlighting works during streaming. Each re-parse highlights newly completed code blocks:

```vue
<script setup lang="ts">
import { Markdown } from '@comark/vue'
import shiki from '@comark/vue/plugins/shiki'
import githubDark from '@shikijs/themes/github-dark'
import { caret } from 'comark/stream'

const plugins = [shiki({ themes: { light: githubDark, dark: githubDark } })]
const effects = [caret()]
</script>

<template>
  <Suspense>
    <Markdown :plugins="plugins" :streaming="streaming" :effects="effects">{{ content }}</Markdown>
  </Suspense>
</template>
```

```tsx
import { Markdown } from '@comark/react'
import shiki from '@comark/react/plugins/shiki'
import githubDark from '@shikijs/themes/github-dark'
import { caret } from 'comark/stream'

const plugins = [shiki({ themes: { light: githubDark, dark: githubDark } })]
const effects = [caret()]

export default function Chat({ content, streaming }) {
  return (
    <Markdown plugins={plugins} streaming={streaming} effects={effects}>
      {content}
    </Markdown>
  )
}
```

---

## defineMarkdownComponent for AI chat

Pre-configure a Comark component for your AI chat UI once, then reuse it across views:

```typescript
// markdown.ts
import { defineMarkdownComponent } from '@comark/vue'
import shiki from '@comark/vue/plugins/shiki'
import math, { Math } from '@comark/vue/plugins/math'
import githubDark from '@shikijs/themes/github-dark'
import Alert from './components/Alert.vue'

export const ChatMarkdown = defineMarkdownComponent({
  name: 'ChatMarkdown',
  plugins: [
    math(),
    shiki({ themes: { light: githubDark, dark: githubDark } }),
  ],
  components: { Math, alert: Alert },
  autoClose: true,
})
```

```vue
<script setup lang="ts">
import { caret } from 'comark/stream'

const effects = [caret()]
</script>

<template>
  <ChatMarkdown :streaming="streaming" :effects="effects">{{ content }}</ChatMarkdown>
</template>
```

---

[Back to skill guide](./SKILL.md)
