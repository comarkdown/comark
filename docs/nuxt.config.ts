export default defineNuxtConfig({
  // Develop against a local checkout of the layer:
  // COMARK_DOCS_LAYER=../../comark-docs pnpm dev
  extends: [process.env.COMARK_DOCS_LAYER || 'comark-docs'],

  modules: ['@vercel/analytics', '@vercel/speed-insights'],

  site: {
    url: 'https://comark.dev',
    name: 'Comark',
  },

  app: {
    head: {
      link: [
        { rel: 'icon', href: '/favicon.ico', type: 'image/x-icon' },
        { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
    },
  },

  colorMode: {
    preference: 'dark',
  },

  routeRules: {
    '/plugins/built-in/highlight': { redirect: '/plugins/built-in/syntax-highlight' },
  },

  $production: {
    routeRules: {
      /*
       * ISR for this site's content URLs (top-level dirs of `content/`),
       * revalidated on-demand by the push webhook with a 300s safety-net TTL.
       * Both the bare section index and everything under it, per section.
       * The layer declares rules for its own routes (/, /tree/**, /blob/**,
       * /raw/**, /llms*.txt, /rss.xml, search-sections, /api/code-explorer/**).
       */
      '/getting-started': { isr: 300 },
      '/getting-started/**': { isr: 300 },
      '/syntax': { isr: 300 },
      '/syntax/**': { isr: 300 },
      '/rendering': { isr: 300 },
      '/rendering/**': { isr: 300 },
      '/plugins': { isr: 300 },
      '/plugins/**': { isr: 300 },
      '/compare': { isr: 300 },
      '/compare/**': { isr: 300 },
      '/examples': { isr: 300 },
      '/examples/**': { isr: 300 },
      '/kb': { isr: 300 },
      '/kb/**': { isr: 300 },
    },
  },
})
