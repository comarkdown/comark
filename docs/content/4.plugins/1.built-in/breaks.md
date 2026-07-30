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
  // <p>Hello<br>world</p>
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