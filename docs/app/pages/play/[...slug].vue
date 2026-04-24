<script setup lang="ts">
import { joinURL } from 'ufo'
import { watchDebounced } from '@vueuse/core'
import { createParse } from '@comark/nuxt/parse'
import jsonRenderer from '@comark/nuxt/plugins/json-render'
import Gallery from '~/components/playground/Gallery.vue'
import RatingBar from '~/components/playground/RatingBar.vue'
import HostInfo from '~/components/playground/HostInfo.vue'
import Facility from '~/components/playground/Facility.vue'
import TwoColumn from '~/components/playground/TwoColumn.vue'
import BookingCard from '~/components/playground/BookingCard.vue'
import Ingredients from '~/components/playground/Ingredients.vue'
import { playgroundExamples } from '~/constants'

definePageMeta({
  layout: 'empty',
})

const route = useRoute()

const components = {
  Gallery,
  RatingBar,
  HostInfo,
  Facility,
  TwoColumn,
  BookingCard,
  Ingredients,
}

const slug = computed(() => Array.isArray(route.params.slug) ? route.params.slug.join('/') : route.params.slug as string)

const markdown = ref(
  slug.value
    ? playgroundExamples.find(example => example.value === slug.value)?.content
    : playgroundExamples[0].content,
)
const parse = createParse({
  plugins: [jsonRenderer()],
})

const { data: page, refresh } = await useAsyncData('airbnb-demo-page', () => parse(markdown.value))
if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Example not found',
    message: `${route.path} does not exist`,
    fatal: true,
  })
}

watchDebounced(markdown, () => refresh(), { debounce: 100 })

const isEditing = ref(false)

const site = useSiteConfig()
const path = computed(() => route.path.replace(/\/$/, ''))
prerenderRoutes([joinURL('/raw', `${path.value}.md`)])
useHead({
  link: [
    {
      rel: 'alternate',
      href: joinURL(site.url, 'raw', `${path.value}.md`),
      type: 'text/markdown',
    },
  ],
})

const title = `${page.value?.frontmatter.title} Example`
const description = page.value?.frontmatter.description
useSeoMeta({
  title,
  description,
})
defineOgImage('OgImageDocs', {
  headline: 'Examples',
  title,
  description,
})
</script>

<template>
  <UPage v-if="page">
    <UPageBody
      prose
      class="wrap-break-word mx-auto"
      :style="{ maxWidth: page?.frontmatter?.page?.maxWidth }"
    >
      <Comark>
        {{
          `> [!WARNING]
          > This page is rendered live from Comark markdown. Edit the source inline with **Edit Page** at the bottom right, or jump into the full playground via **Open in Advance Editor**.`
        }}
      </Comark>
      <ComarkRenderer
        v-if="page"
        :tree="page"
        :components="components"
      />
    </UPageBody>

    <div
      v-show="!isEditing"
      class="fixed bottom-5 right-5 flex items-center gap-2 z-50"
    >
      <UButton
        to="/play/editor"
        icon="i-lucide-external-link"
        color="neutral"
        variant="subtle"
        size="md"
        class="shadow-lg"
        label="Open in Advance Editor"
      />
      <UButton
        icon="i-lucide-pencil"
        color="primary"
        size="md"
        class="shadow-lg"
        label="Edit Page"
        @click="isEditing = true"
      />
    </div>

    <div
      v-show="isEditing"
      class="fixed bottom-5 right-5 w-[min(560px,calc(100vw-2.5rem))] h-[min(640px,calc(100vh-2.5rem))] bg-default border border-default rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden"
    >
      <div class="shrink-0 flex items-center gap-2 px-3 h-10 border-b border-default bg-elevated">
        <UIcon
          name="i-lucide-pencil"
          class="size-4 text-muted"
        />
        <span class="text-sm font-medium">Edit Page</span>
        <div class="flex-1" />
        <UButton
          icon="i-lucide-x"
          size="xs"
          variant="ghost"
          color="neutral"
          @click="isEditing = false"
        />
      </div>
      <div class="flex-1 min-h-0">
        <Editor
          v-if="isEditing"
          v-model="markdown"
        />
      </div>
    </div>
  </UPage>
</template>
