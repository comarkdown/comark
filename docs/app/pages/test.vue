<script setup lang="ts">
import { Comark } from 'comark/vue'
import resolveComponent from '../utils/components-manifest'

const markdown = ref(`

:landing-get-started


::u-page-section
#title
Everything you need for modern content parsing

#default
Everything you need for modern content parsing
::
`)
</script>

<template>
  <Comark
    :components-manifest="resolveComponent"
  >{{ markdown }}</Comark>
</template>
