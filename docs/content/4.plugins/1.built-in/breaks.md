---
title: Breaks
description: Convert soft line breaks into <br> elements.
navigation:
  icon: i-lucide-corner-down-left
seo:
  title: Breaks Plugin
  description: Convert soft line breaks into <br> elements in Comark documents.
links:
  - label: Parse API
    icon: i-lucide-code
    to: /reference/parse
    color: neutral
    variant: soft
---

The `comark/plugins/breaks` plugin converts soft line breaks (single newlines inside a paragraph) into `<br>` elements. It requires no peer dependencies.

## Basic usage

### With Vue

```vue [App.vue]
<script setup lang="ts">
import { Markdown } from '@comark/vue'
import breaks from '@comark/vue/plugins/breaks'

const markdown = `Hello
world`
</script>

<template>
  <Suspense>
    <Markdown :plugins="[breaks()]">{{ markdown }}</Markdown>
    <!-- <p>Hello<br>world</p> -->
  </Suspense>
</template>
```

### With React

```tsx [App.tsx]
import { Markdown } from '@comark/react'
import breaks from '@comark/react/plugins/breaks'

const markdown = `Hello
World`

function App() {
  return (
    <Markdown plugins={[breaks()]}>{markdown}</Markdown>
  )
  // <p>Hello<br>World</p>
}
```

### With Svelte

```svelte [App.svelte]
<script lang="ts">
  import { Markdown } from '@comark/svelte'
  import breaks from '@comark/svelte/plugins/breaks'

  const markdown = `Hello
  world`
</script>

<Markdown value={markdown} plugins={[breaks()]} />
<!-- <p>Hello<br>world</p> -->
```

### With Angular

```typescript [app.component.ts]
import { Component } from '@angular/core'
import { Markdown } from '@comark/angular'
import breaks from '@comark/angular/plugins/breaks'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Markdown],
  template: `<comark-markdown [value]="markdown" [plugins]="[breaks()]" />`,
})
export class AppComponent {
  markdown = `Hello
world`
  // <p>Hello<br>world</p>
}
```

### With parse API

```typescript [parse.ts]
import { parseMarkdown } from 'comark'
import breaks from 'comark/plugins/breaks'

const result = await parseMarkdown('Hello\nWorld', {
  plugins: [breaks()]
})
/**
{
  frontmatter: {},
  meta: {},
  nodes: [ [ 'p', {}, 'Hello', ['br', {}], 'World'] ]
}
 */
```
