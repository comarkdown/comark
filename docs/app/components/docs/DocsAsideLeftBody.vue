<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const route = useRoute()
const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

const { data: examplesNavigation } = await useAsyncData('nav-examples', () =>
  queryCollectionNavigation('examples'),
)

function flattenExamplesNav(items: ContentNavigationItem[]): ContentNavigationItem[] {
  const result: ContentNavigationItem[] = []
  for (const item of items) {
    const readme = item.children?.find(c => c.path?.endsWith('/readme'))
    if (readme) {
      result.push({ ...readme, path: readme.path!.replace(/\/readme$/, ''), children: undefined })
    }
    else if (item.children?.length) {
      result.push(...flattenExamplesNav(item.children))
    }
    else if (item.path) {
      result.push({ ...item, path: item.path.replace(/\/readme$/, '') })
    }
  }
  return result
}

const filteredNavigation = computed(() => {
  if (route.path.startsWith('/plugins')) {
    const pluginsSection = navigation?.value?.find(item => item.path === '/plugins')
    return pluginsSection?.children || []
  }

  if (route.path.startsWith('/examples')) {
    return flattenExamplesNav(examplesNavigation.value || [])
  }

  return (navigation?.value || []).filter(item =>
    item.path !== '/plugins' && item.path !== '/examples',
  )
})
</script>

<template>
  <UContentNavigation
    highlight
    :navigation="filteredNavigation"
  />
</template>
