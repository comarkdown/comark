<script setup lang="ts">
definePageMeta({
  layout: false,
})

const { data: page } = await useAsyncData('index', () => queryCollection('landing').path('/').first())

const title = page.value?.seo?.title || page.value?.title
const description = page.value?.seo?.description || page.value?.description

useSeo({
  title,
  description,
  type: 'website',
  ogImage: page.value?.seo?.ogImage as string,
})

if (!page.value?.seo?.ogImage) {
  defineOgImage('OgImageDocs', {
    title,
    description: description?.replace(/,/g, ''),
    headline: 'Components in Markdown',
  })
}

useHead({
  bodyAttrs: { class: 'landing-page' },
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Comark',
        description: description,
        url: 'https://comark.dev',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Any',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        license: 'https://github.com/comarkdown/comark/blob/main/LICENSE',
        codeRepository: 'https://github.com/comarkdown/comark',
        programmingLanguage: 'TypeScript',
      }),
    },
  ],
})
</script>

<template>
  <div class="min-h-dvh bg-default text-default">
    <UContainer class="overflow-x-hidden p-0! lg:border-x lg:border-default">
      <ContentRenderer
        v-if="page"
        :value="page as any"
      />
    </UContainer>
  </div>
</template>

<style>
.landing-page footer[data-slot='root'] {
  display: none;
}

@media (min-width: 1024px) {
  .landing-page header[data-slot='root'] > div {
    max-width: var(--ui-container);
    margin-inline: auto;
    box-shadow:
      inset 1px 0 0 var(--ui-border),
      inset -1px 0 0 var(--ui-border);
  }
}
</style>
