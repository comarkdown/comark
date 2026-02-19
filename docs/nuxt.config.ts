import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  extends: ['docus'],

  modules: ['nuxt-studio'],

  app: {
    head: {
      link: [
        { rel: 'icon', href: '/favicon.ico', type: 'image/x-icon' },
        { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
    },
  },

  css: ['~/assets/styles/main.css'],

  // @ts-expect-error - Nuxt SEO types are not loaded
  site: {
    url: 'https://comark.vercel.app',
  },

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
