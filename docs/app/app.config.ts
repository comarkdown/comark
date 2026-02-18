// @ts-expect-error - Nuxt types are not loaded
export default defineAppConfig({
  site: {
    url: 'https://comark.vercel.app',
  },
  seo: {
    title: 'Comark',
    description: 'Components in Markdown (Comark) parser with streaming support for Vue and React.',
    url: 'https://comark.dev',
    socials: {
      github: 'comarkdown/comark',
    },
  },
  docs: {
    github: 'comarkdown/comark',
  },

  title: 'Comark',
  description: 'Components in Markdown (Comark) parser with streaming support for Vue and React.',
  url: 'https://comark.dev',

  ui: {
    colors: {
      primary: 'yellow',
      neutral: 'neutral',
    },
  },

  docus: {
    footer: {
      credits: {
        text: 'Made with Comark',
        href: 'https://github.com/comarkdown/comark',
      },
    },
  },
  aside: {
    level: 1,
    collapsed: false,
    exclude: [],
  },
  header: {
    title: 'Comark',
  },
})
