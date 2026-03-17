// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@comark/nuxt', '@nuxt/ui'],
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  routeRules: {
    '/': { prerender: true },
    '/blog/**': { prerender: true },
  },
  compatibilityDate: '2025-07-15',
  nitro: {
    prerender: {
      crawlLinks: true,
    },
  },
})
