import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  extends: ['docus'],
  app: {
    head: {
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
        { rel: 'icon', href: '/icon.svg', type: 'image/svg+xml' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
    },
  },
  css: ['~/assets/styles/main.css'],
  // @ts-expect-error - Nuxt SEO types are not loaded
  site: {
    url: 'https://mdc-syntax.vercel.app',
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
