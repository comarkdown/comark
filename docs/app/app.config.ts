// @ts-expect-error - Nuxt types are not loaded
export default defineAppConfig({
  site: {
    url: 'https://mdc-syntax.vercel.app',
  },
  docs: {
    github: 'nuxt-content/mdc-syntax',
  },
  docus: {
    title: 'MDC Syntax',
    description: 'Modern Markdown Component Parser',
    url: 'https://mdc-syntax.dev',
    socials: {
      github: 'nuxt-content/mdc-syntax',
    },
    aside: {
      level: 1,
      collapsed: false,
      exclude: [],
    },
    header: {
      title: 'MDC Syntax',
      logo: false,
      showLinkIcon: true,
      exclude: [],
      fluid: true,
    },
    footer: {
      credits: {
        text: 'Made with 💚',
        href: 'https://github.com/nuxt-content/mdc-syntax',
      },
    },
    main: {
      fluid: true,
      padded: true,
    },
  },
})
