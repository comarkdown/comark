import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  extends: ['docus'],
  css: ['~/assets/styles/main.css'],
  // @ts-expect-error - Nuxt Content types are not loaded
  content: {
    experimental: {
      sqliteConnector: 'native',
    },
    build: {
      markdown: {
        highlight: {
          langs: ['tsx', 'tsx', 'vue', 'html', 'css', 'json', 'markdown', 'bash', 'shell'],
        },
      },
    },
  },
})
