import type { ContentNavigationItem } from '@nuxt/content'

export default defineNuxtPlugin(async (nuxtApp) => {
  const { data } = await useAsyncData('navigation_examples', () => queryCollectionNavigation('examples'))
  nuxtApp.vueApp.provide('examplesNavigation', data as Ref<ContentNavigationItem[]>)
})
