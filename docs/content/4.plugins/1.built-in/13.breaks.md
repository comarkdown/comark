---
title: Breaks
description: Plugin for converting soft line breaks into br components. 
navigation:
  icon: i-lucide-corner-down-left
seo:
  title: Breaks Plugin
  description: Plugin for converting soft line breaks into br components in Comark documents.
links:
  - label: Parse API
    icon: i-lucide-code
    to: /api/parse
    color: neutral
    variant: soft
---

The Breaks plugin transforms soft line breaks into `<br>` components.

No peer dependencies are required.

## Basic Usage

### With Vue

```vue [App.vue]
<script setup lang="ts">
import { Comark } from '@comark/vue'
import breaks from '@comark/vue/plugins/breaks'

const markdown = `Hello
world`
</script>

<template>
  <Suspense>
    <Comark :plugins="[breaks()]">{{ markdown }}</Comark>
    <!-- <p>Hello<br>world</p> -->
  </Suspense>
</template>
```

### With React

```tsx [App.tsx]
import { Comark } from '@comark/react'
import breaks from '@comark/react/plugins/breaks'

const markdown = `Hello
World`

function App() {
  return (
    <Comark plugins={[breaks()]}>{markdown}</Comark>
  )
  // <p>Hello<br>world</p>
}
```

### With Svelte

```svelte [App.svelte]
<script lang="ts">
  import { Comark } from '@comark/svelte'
  import breaks from '@comark/svelte/plugins/breaks'

  const markdown = `Hello
  world`
</script>

<Comark {markdown} plugins={[breaks()]} />
<!-- <p>Hello<br>world</p> -->
```

### With Parse API

```typescript [parse.ts]
import { parse } from 'comark'
import breaks from 'comark/plugins/breaks'

const result = await parse('Hello\nWorld', {
  plugins: [breaks()]
})
/**
{
  frontmatter: {},
  meta: {},
  nodes: [ [ 'p', {}, 'Hello', ['br', {}], 'world'] ]
}
 */
```