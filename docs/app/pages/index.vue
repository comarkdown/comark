<script setup lang="ts">
definePageMeta({
  layout: false,
})

useSeoMeta({
  title: 'Comark - Components in Markdown',
  description: 'Fast, streaming-ready markdown parser with Vue and React component support. Parse Comark content from strings or streams with TypeScript support.',
  ogImage: '/social-card.png',
})

useHead({
  bodyAttrs: { class: 'landing-page' },
})
</script>

<template>
  <div class="min-h-dvh bg-default text-default">
    <UContainer class="p-0! border-x border-default">
      <LandingHero />
      <LandingFeatures />
      <LandingCode />
      <LandingCta />
    </UContainer>
  </div>
</template>

<style>
.landing-page footer[data-slot="root"] {
  display: none;
}
</style>
