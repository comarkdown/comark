<script setup lang="ts">
import type { DocsCollectionItem } from '@nuxt/content'

defineProps<{
  page?: DocsCollectionItem | null
}>()

const menuDrawerOpen = ref(false)
const onThisPageDrawerOpen = ref(false)
const filteredNavigation = useFilteredNavigation()
const mainNavigation = useMainNavigation()
const nuxtApp = useNuxtApp()
const currentSectionTitle = computed(() => {
  return mainNavigation.value.find((item) => item.active)?.label
})

function refreshHeading(opened: boolean) {
  if (!opened) return
  nextTick(() => nuxtApp.callHook('page:loading:end'))
}
</script>

<template>
  <div>
    <UContentToc
      :links="page?.body?.toc?.links"
      highlight
      highlight-variant="circuit"
      class="hidden lg:block lg:backdrop-blur-none lg:col-span-2"
    />
    <div
      class="order-first lg:hidden sticky top-(--ui-header-height) z-10 bg-default/75 lg:bg-[initial] backdrop-blur -mx-4 p-6 border-b border-dashed border-default flex justify-between"
    >
      <UDrawer
        v-model:open="menuDrawerOpen"
        direction="left"
        :title="currentSectionTitle"
        inset
        :handle="false"
        side="left"
        class="lg:hidden"
        :ui="{
          content: 'w-full max-w-2/3',
        }"
      >
        <UButton
          label="Menu"
          icon="i-lucide-text-align-start"
          color="neutral"
          variant="link"
          size="xs"
          aria-label="Open navigation"
          class="-m-4"
        />
        <template #body>
          <UContentNavigation
            :navigation="filteredNavigation"
            expand-all
            trailing-icon="i-lucide-chevron-right"
            :ui="{ linkTrailingIcon: 'group-data-[state=open]:rotate-90' }"
            highlight
          />
        </template>
      </UDrawer>
      <UDrawer
        v-model:open="onThisPageDrawerOpen"
        direction="right"
        :handle="false"
        side="right"
        inset
        class="lg:hidden"
        no-body-styles
        :ui="{
          content: 'w-full max-w-2/3',
        }"
        @update:open="refreshHeading"
      >
        <UButton
          label="On this page"
          trailing-icon="i-lucide-chevron-right"
          color="neutral"
          variant="link"
          size="xs"
          aria-label="Open on this page"
          class="-m-4"
        />
        <template #body>
          <UContentToc
            :links="page?.body?.toc?.links"
            :open="true"
            default-open
            :ui="{
              root: 'mx-0! px-1! top-0 overflow-visible',
              container: 'pt-0! border-b-0',
              trailingIcon: 'hidden',
              bottom: 'flex flex-col',
            }"
          />
        </template>
      </UDrawer>
    </div>
  </div>
</template>
