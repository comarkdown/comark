<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const route = useRoute()
const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

const { data: examplesNavigation } = await useAsyncData('nav-examples', () =>
  queryCollectionNavigation('examples'),
)

function collapseReadmeNav(items: ContentNavigationItem[]): ContentNavigationItem[] {
  return items.map((item) => {
    if (!item.children?.length) {
      const path = item.path?.replace(/\/readme$/, '')
      return { ...item, path, icon: item.icon }
    }
    const readme = item.children.find(c => c.path?.endsWith('/readme'))
    if (readme) {
      const path = readme.path!.replace(/\/readme$/, '')
      return { ...readme, path, icon: readme.icon, children: undefined }
    }
    return { ...item, children: collapseReadmeNav(item.children) }
  })
}

const filteredNavigation = computed(() => {
  if (route.path.startsWith('/plugins')) {
    const pluginsSection = navigation?.value?.find(item => item.path === '/plugins')
    return pluginsSection?.children || []
  }

  if (route.path.startsWith('/examples')) {
    const raw = examplesNavigation.value || []
    const root = raw.find(item => item.path === '/examples')
    const categories = root?.children || raw
    return categories.map(category => ({
      ...category,
      children: category.children ? collapseReadmeNav(category.children) : [],
    }))
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
