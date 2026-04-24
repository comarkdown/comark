<script setup lang="ts">
import { joinURL } from 'ufo'
import { useDraggable, useWindowSize, watchDebounced } from '@vueuse/core'
import { createParse } from '@comark/nuxt/parse'
import jsonRenderer from '@comark/nuxt/plugins/json-render'
import binding, { Binding } from '@comark/nuxt/plugins/binding'
import Gallery from '~/components/playground/Gallery.vue'
import RatingBar from '~/components/playground/RatingBar.vue'
import HostInfo from '~/components/playground/HostInfo.vue'
import Facility from '~/components/playground/Facility.vue'
import TwoColumn from '~/components/playground/TwoColumn.vue'
import BookingCard from '~/components/playground/BookingCard.vue'
import Ingredients from '~/components/playground/Ingredients.vue'
import { playgroundExamples } from '~/constants'

definePageMeta({
  layout: 'default',
})

const components = {
  Gallery,
  RatingBar,
  HostInfo,
  Facility,
  TwoColumn,
  BookingCard,
  Ingredients,
  Binding,
}

const route = useRoute()
const slug = computed(() => Array.isArray(route.params.slug) ? route.params.slug.join('/') : route.params.slug as string)
const markdown = ref(
  slug.value
    ? playgroundExamples.find(example => example.value === slug.value)?.content
    : playgroundExamples[0].content,
)
const parse = createParse({
  plugins: [jsonRenderer(), binding()],
})

const { data: page, refresh } = await useAsyncData(() => `play-${slug.value}`, () => parse(markdown.value))
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

const editorWindow = useTemplateRef<HTMLElement>('editorWindow')
const editorHandle = useTemplateRef<HTMLElement>('editorHandle')

const { width: windowWidth, height: windowHeight } = useWindowSize()
const editorWidth = ref(560)
const editorHeight = ref(640)
const MIN_WIDTH = 320
const MIN_HEIGHT = 240
const MARGIN = 20

const { x, y, style } = useDraggable(editorWindow, {
  handle: editorHandle,
  initialValue: { x: 0, y: 0 },
  preventDefault: true,
})

onMounted(() => {
  editorWidth.value = Math.min(560, windowWidth.value - MARGIN * 2)
  editorHeight.value = Math.min(640, windowHeight.value - MARGIN * 2)
  x.value = Math.max(MARGIN, windowWidth.value - editorWidth.value - MARGIN)
  y.value = Math.max(MARGIN, windowHeight.value - editorHeight.value - MARGIN)
})

watchEffect(() => {
  editorWidth.value = Math.max(MIN_WIDTH, Math.min(editorWidth.value, windowWidth.value))
  editorHeight.value = Math.max(MIN_HEIGHT, Math.min(editorHeight.value, windowHeight.value))
  const maxX = Math.max(0, windowWidth.value - editorWidth.value)
  const maxY = Math.max(0, windowHeight.value - editorHeight.value)
  if (x.value < 0) x.value = 0
  else if (x.value > maxX) x.value = maxX
  if (y.value < 0) y.value = 0
  else if (y.value > maxY) y.value = maxY
})

type ResizeDir = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'
const activeResize = ref<ResizeDir | null>(null)
const resizeStart = { px: 0, py: 0, w: 0, h: 0, x: 0, y: 0 }

function onResizeDown(dir: ResizeDir, e: PointerEvent) {
  activeResize.value = dir
  resizeStart.px = e.clientX
  resizeStart.py = e.clientY
  resizeStart.w = editorWidth.value
  resizeStart.h = editorHeight.value
  resizeStart.x = x.value
  resizeStart.y = y.value
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  e.preventDefault()
}

function onResizeMove(e: PointerEvent) {
  const dir = activeResize.value
  if (!dir) return
  const dx = e.clientX - resizeStart.px
  const dy = e.clientY - resizeStart.py

  if (dir.includes('e')) {
    const maxW = windowWidth.value - resizeStart.x
    editorWidth.value = Math.max(MIN_WIDTH, Math.min(maxW, resizeStart.w + dx))
  }
  else if (dir.includes('w')) {
    const rightEdge = resizeStart.x + resizeStart.w
    const newWidth = Math.max(MIN_WIDTH, Math.min(rightEdge, resizeStart.w - dx))
    editorWidth.value = newWidth
    x.value = rightEdge - newWidth
  }

  if (dir.includes('s')) {
    const maxH = windowHeight.value - resizeStart.y
    editorHeight.value = Math.max(MIN_HEIGHT, Math.min(maxH, resizeStart.h + dy))
  }
  else if (dir.includes('n')) {
    const bottomEdge = resizeStart.y + resizeStart.h
    const newHeight = Math.max(MIN_HEIGHT, Math.min(bottomEdge, resizeStart.h - dy))
    editorHeight.value = newHeight
    y.value = bottomEdge - newHeight
  }
}

function onResizeUp(e: PointerEvent) {
  activeResize.value = null
  ;(e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId)
}

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
  <UPage
    v-if="page"
    :style="{ maxWidth: page?.frontmatter?.page?.maxWidth }"
    class="mx-auto"
  >
    <UPageHeader>
      <Comark>
        {{
          `> [!NOTE]
        > This page is rendered live from Comark markdown. Edit the source inline with **Edit Page** at the bottom right.`
        }}
      </Comark>
    </UPageHeader>
    <UPageBody
      prose
      class="wrap-break-word mx-auto"
    >
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
        icon="i-lucide-pencil"
        color="primary"
        size="md"
        class="shadow-lg"
        label="Edit Page"
        @click="isEditing = true"
      />
    </div>

    <ClientOnly>
      <!-- Prevent hydration due to useDraggable styles (display: none on server) -->
      <div
        v-show="isEditing"
        ref="editorWindow"
        :style="[style, { width: `${editorWidth}px`, height: `${editorHeight}px` }]"
        class="fixed top-0 left-0 p-1 z-50 bg-border rounded-lg hover:opacity-100 xl:opacity-40"
      >
        <div class="relative size-full bg-default rounded-md shadow-2xl flex flex-col overflow-hidden">
          <div
            ref="editorHandle"
            class="shrink-0 flex items-center gap-2 px-3 h-10 border-b border-default bg-elevated/50 cursor-move select-none touch-none"
          >
            <UIcon
              name="i-lucide-pencil"
              class="size-4 text-muted"
            />
            <span class="text-sm font-medium">Page editor</span>
            <div class="flex-1" />
            <UButton
              :to="`/play/editor?example=${slug}`"
              icon="i-lucide-expand"
              color="neutral"
              variant="ghost"
              size="xs"
            />
            <UButton
              icon="i-lucide-minus"
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

        <div
          class="absolute top-0 inset-x-3 h-2 cursor-ns-resize touch-none"
          @pointerdown="(e: PointerEvent) => onResizeDown('n', e)"
          @pointermove="onResizeMove"
          @pointerup="onResizeUp"
        />
        <div
          class="absolute bottom-0 inset-x-3 h-2 cursor-ns-resize touch-none"
          @pointerdown="(e: PointerEvent) => onResizeDown('s', e)"
          @pointermove="onResizeMove"
          @pointerup="onResizeUp"
        />
        <div
          class="absolute left-0 inset-y-3 w-2 cursor-ew-resize touch-none"
          @pointerdown="(e: PointerEvent) => onResizeDown('w', e)"
          @pointermove="onResizeMove"
          @pointerup="onResizeUp"
        />
        <div
          class="absolute right-0 inset-y-3 w-2 cursor-ew-resize touch-none"
          @pointerdown="(e: PointerEvent) => onResizeDown('e', e)"
          @pointermove="onResizeMove"
          @pointerup="onResizeUp"
        />

        <div
          class="absolute top-0 left-0 size-3 cursor-nwse-resize touch-none"
          @pointerdown="(e: PointerEvent) => onResizeDown('nw', e)"
          @pointermove="onResizeMove"
          @pointerup="onResizeUp"
        />
        <div
          class="absolute top-0 right-0 size-3 cursor-nesw-resize touch-none"
          @pointerdown="(e: PointerEvent) => onResizeDown('ne', e)"
          @pointermove="onResizeMove"
          @pointerup="onResizeUp"
        />
        <div
          class="absolute bottom-0 left-0 size-3 cursor-nesw-resize touch-none"
          @pointerdown="(e: PointerEvent) => onResizeDown('sw', e)"
          @pointermove="onResizeMove"
          @pointerup="onResizeUp"
        />
        <div
          class="absolute bottom-0 right-0 size-3 cursor-nwse-resize touch-none"
          @pointerdown="(e: PointerEvent) => onResizeDown('se', e)"
          @pointermove="onResizeMove"
          @pointerup="onResizeUp"
        />
      </div>
    </ClientOnly>
  </UPage>
</template>
