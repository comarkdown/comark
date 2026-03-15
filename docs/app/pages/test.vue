<script setup lang="ts">
import highlight from 'comark/plugins/highlight'
import resolveComponent from '../utils/components-manifest'

useHead({
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

const markdown = ref(`
---
seo:
  title: Big Markdown Example — Components, Code, Lists, Tables!
  description: Showcase of Markdown, MDC components, code blocks, lists, tables, and more using Comark.
  ogImage: '/social-card.jpg'
---

# Comark Playground

Try out a large markdown sample mixing **all the features**!

::ahad

::p
:p[kjkkj]
::
::
`)
</script>

<template>
  <UContainer>
    <Comark
      :plugins="[highlight()]"
    >
      {{ markdown }}
    </Comark>
  </UContainer>
</template>
