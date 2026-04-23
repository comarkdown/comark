<script setup lang="ts">
import { reactive } from 'vue'
import { Comark } from '@comark/vue'
import binding, { Binding } from '@comark/vue/plugins/binding'

// Runtime data exposed to bindings via the `data.` namespace.
const data = reactive({
  user: {
    name: 'Ada',
    role: 'admin',
  },
  stats: {
    users: 1200,
    uptime: '99.9%',
  },
})

const markdown = `---
release:
  version: 2.5.1
  codename: Firefly
---

# {{ frontmatter.release.codename || Unnamed }} — v{{ frontmatter.release.version }}

Hello **{{ data.user.name || friend }}** (role: {{ data.user.role }}), welcome back!

## Platform stats

| Metric | Value                            |
| ------ | -------------------------------- |
| Users  | {{ data.stats.users }}           |
| Uptime | {{ data.stats.uptime }}          |
| Plan   | {{ data.plan \\|\\| community }}     |

## Components see their own props

::card{title="Component props"}
Inside the card the binding below pulls the card's title via \`props\`:

{{ props.title }}
::
`
</script>

<template>
  <Suspense>
    <Comark
      :markdown="markdown"
      :plugins="[binding()]"
      :components="{ Binding }"
      :data="data"
    />
  </Suspense>
</template>
