import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  extends: ['docus'],
  modules: ['nuxt-studio', '@comark/nuxt', '@vercel/speed-insights', '@vercel/analytics', '@nuxtjs/mcp-toolkit'],

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

  content: {
    experimental: {
      sqliteConnector: 'native',
    },
    build: {
      markdown: {
        highlight: {
          langs: ['tsx', 'svelte', 'vue', 'html', 'css', 'json', 'markdown', 'bash', 'shell', 'astro'],
        },
      },
      transformers: [
        '~~/utils/comark-transformers.ts',
      ],
    },
  },

  fonts: {
    families: [
      { name: 'Geist', weights: [400, 500, 600, 700], global: true },
      { name: 'Geist Mono', weights: [400, 500, 600], global: true },
    ],
  },

  llms: {
    domain: 'https://comark.dev',
  },

  studio: false,
})
