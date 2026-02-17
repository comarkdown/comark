// @ts-expect-error - Nuxt types are not loaded
export default defineAppConfig({
  site: {
    url: 'https://comark.vercel.app',
  },
  seo: {
    title: 'Comark',
    description: 'Markdown with Components',
    url: 'https://comark.vercel.app',
    socials: {
      github: 'comarkdown/comark',
    },
  },
  docs: {
    github: 'comarkdown/comark',
  },

  title: 'Comark',
  description: 'Markdown with Components',
  url: 'https://comark.vercel.app',

  ui: {
    colors: {
      primary: 'yellow',
      neutral: 'neutral',
    },
  },

  docus: {
    footer: {
      credits: {
        text: 'Made with 💚',
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

    logo: {
      alt: 'Comark Logo',
      light: '/logo-light.svg',
      dark: '/logo-dark.svg',
    },
  },
})
