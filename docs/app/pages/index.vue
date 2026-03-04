<script setup lang="ts">
import LandingHero from '~/components/landing/LandingHero.vue'
import LandingFeatures from '~/components/landing/LandingFeatures.vue'
import LandingFeatureAutoClose from '~/components/landing/LandingFeatureAutoClose.vue'
import LandingFeaturePlugins from '~/components/landing/LandingFeaturePlugins.vue'
import LandingCode from '~/components/landing/LandingCode.vue'
import LandingCta from '~/components/landing/LandingCta.vue'

definePageMeta({
  layout: false,
})

const { data: page } = await useAsyncData('index', () =>
  queryCollection('landing').path('/').first(),
)

useSeoMeta({
  title: 'Comark - Components in Markdown',
  description: 'Fast, streaming-ready markdown parser with Vue and React component support. Parse Comark content from strings or streams with TypeScript support.',
  ogImage: '/social-card.png',
})

useHead({
  bodyAttrs: { class: 'landing-page' },
})

const landingComponents = {
  'landing-hero': LandingHero,
  'landing-features': LandingFeatures,
  'landing-feature-auto-close': LandingFeatureAutoClose,
  'landing-feature-plugins': LandingFeaturePlugins,
  'landing-code': LandingCode,
  'landing-cta': LandingCta,
}
</script>

<template>
  <div class="min-h-dvh bg-default text-default">
    <UContainer class="p-0! border-x border-default">
      <ContentRenderer
        v-if="page"
        :value="page as any"
        :components="landingComponents"
      />
    </UContainer>
  </div>
</template>

<style>
.landing-page footer[data-slot="root"] {
  display: none;
}
</style>
