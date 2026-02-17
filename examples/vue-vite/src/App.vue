<script setup lang="ts">
import { Comark } from 'comark/vue'
import Alert from './components/Alert.vue'

const markdown = `
# Hello *World*

::alert{type="info"}
This is an alert!
::
`
</script>

<template>
  <Suspense>
    <Comark
      :markdown="markdown"
      :components="{ Alert }"
    />
  </Suspense>
</template>
