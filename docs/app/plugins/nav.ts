export default defineNuxtPlugin(async () => {
  const { data: examplesNavigation } = await useAsyncData('nav-examples', async () => {
    return queryCollectionNavigation('examples')
  })

  provide('examplesNavigation', examplesNavigation)
})
