# Comark — AI Agents & LLM Streaming

A guide for using Comark in AI agent and LLM-powered applications where markdown is generated incrementally by a language model.

## Why Comark for AI?

LLMs stream markdown token-by-token. Standard markdown parsers expect complete input — they fail or produce broken output on partial streams. Comark was built to handle exactly this:

- **`autoClose`** (default: `true`) — incomplete syntax like `**bold text` is automatically closed on every parse, so partial tokens always render correctly
- **Streaming mode** — re-renders efficiently as content arrives
- **Caret indicator** — shows a live cursor during generation
- **ANSI rendering** — styled terminal output for CLI agents

---

## Vue

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Comark } from '@comark/vue'

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
  <Comark :streaming="streaming" caret>{{ content }}</Comark>
</template>
```

---

## React

```tsx
import { useState } from 'react'
import { Comark } from '@comark/react'

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

  return <Comark streaming={streaming} caret>{content}</Comark>
}
```

---

## Svelte

```svelte
<script lang="ts">
  import { Comark } from '@comark/svelte'

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

<Comark markdown={content} {streaming} caret />
```

---

## Terminal / CLI Agents

Use `@comark/ansi` to render LLM markdown output in terminal-based agents:

```typescript
import { log } from '@comark/ansi'

// Print a complete LLM response to stdout with ANSI styling
await log(llmResponse)
```

For streaming terminal output, use `createLog` with a custom `write` function:

```typescript
import { createLog } from '@comark/ansi'

const logStream = createLog({
  write: (s) => process.stdout.write(s),
})

// Call after each chunk to show partial output
await logStream(partialMarkdown)
```

---

## Caret Customization

The `caret` prop appends a blinking cursor to the last text node while `streaming` is `true`. Customize it with a CSS class:

```vue
<Comark :streaming="streaming" :caret="{ class: 'animate-blink' }">{{ content }}</Comark>
```

```tsx
<Comark streaming={streaming} caret={{ class: 'animate-blink' }}>{content}</Comark>
```

```svelte
<Comark markdown={content} {streaming} caret={{ class: 'animate-blink' }} />
```

---

## With Custom Components

If your LLM produces Comark component syntax (e.g., `::alert`), register components before streaming begins:

```vue
<script setup lang="ts">
import { Comark } from '@comark/vue'
import Alert from './Alert.vue'
import CodeBlock from './CodeBlock.vue'
</script>

<template>
  <Comark :components="{ alert: Alert, pre: CodeBlock }" :streaming="streaming" caret>
    {{ content }}
  </Comark>
</template>
```

---

## With Syntax Highlighting

Syntax highlighting works during streaming — each re-parse will highlight newly completed code blocks:

```vue
<script setup lang="ts">
import { Comark } from '@comark/vue'
import highlight from '@comark/vue/plugins/highlight'
import githubDark from '@shikijs/themes/github-dark'

const plugins = [highlight({ themes: { light: githubDark, dark: githubDark } })]
</script>

<template>
  <Suspense>
    <Comark :plugins="plugins" :streaming="streaming" caret>{{ content }}</Comark>
  </Suspense>
</template>
```

```tsx
import { Comark } from '@comark/react'
import highlight from '@comark/react/plugins/highlight'
import githubDark from '@shikijs/themes/github-dark'

const plugins = [highlight({ themes: { light: githubDark, dark: githubDark } })]

export default function Chat({ content, streaming }) {
  return (
    <Comark plugins={plugins} streaming={streaming} caret>
      {content}
    </Comark>
  )
}
```

---

## defineComarkComponent for AI Chat

Pre-configure a Comark component for your AI chat UI once, then reuse it everywhere:

```typescript
// comark.ts
import { defineComarkComponent } from '@comark/vue'
import highlight from '@comark/vue/plugins/highlight'
import math, { Math } from '@comark/vue/plugins/math'
import githubDark from '@shikijs/themes/github-dark'
import Alert from './components/Alert.vue'

export const ChatComark = defineComarkComponent({
  name: 'ChatComark',
  plugins: [
    math(),
    highlight({ themes: { light: githubDark, dark: githubDark } }),
  ],
  components: { Math, alert: Alert },
  autoClose: true,
})
```

```vue
<template>
  <ChatComark :streaming="streaming" caret>{{ content }}</ChatComark>
</template>
```

---

[← Back to Skills Guide](./SKILL.md)
