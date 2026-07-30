export default defineAppConfig({
  seo: {
    siteName: 'Comark',
  },

  header: {
    title: 'Comark',
    logo: {
      alt: 'Comark',
      mark: 'comark',
    },
    ecosystem: [
      {
        mark: 'comark-cms',
        to: 'https://cms.comark.dev',
        label: 'Comark CMS',
      },
    ],
    // Main nav is driven by the site's useMainNavigation() override in
    // app/composables/useNavigation.ts (adds Playground + Examples tabs that
    // aren't content sections and don't fit the layer's `header.nav` schema).
    nav: [],
    links: [
      {
        icon: 'i-simple-icons-github',
        to: 'https://github.com/comarkdown/comark',
        target: '_blank',
        'aria-label': 'Comark on GitHub',
      },
    ],
  },

  github: {
    owner: 'comarkdown',
    name: 'comark',
    branch: 'main',
    contentDir: 'docs/content',
  },

  footer: {
    icon: 'i-simple-icons-vercel',
    owner: 'Vercel, Inc',
    links: [
      {
        icon: 'i-lucide-rss',
        to: '/rss.xml',
        target: '_blank',
        'aria-label': 'Comark RSS Feed',
      },
      {
        icon: 'i-simple-icons-github',
        to: 'https://github.com/comarkdown/comark',
        target: '_blank',
        'aria-label': 'Comark on GitHub',
      },
    ],
  },

  docs: {
    ogImage: {
      mark: 'comark' as const,
      accent: '#eab308',
      tagline: 'The Markdown engine for the modern web',
    },
    llms: {
      description:
        'Comark is the Markdown engine for the modern web. One parser, every renderer: Vue, React, Svelte, Angular, HTML and ANSI, with components, plugins and streaming.',
    },
    schemaOrg: {
      description:
        'The Markdown engine for the modern web. One parser, every renderer: Vue, React, Svelte, Angular, HTML and ANSI, with components, plugins and streaming.',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Any',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      license: 'https://github.com/comarkdown/comark/blob/main/LICENSE',
      sameAs: ['https://github.com/comarkdown/comark', 'https://comark.dev'],
      programmingLanguage: 'TypeScript',
    },
  },

  ui: {
    colors: {
      primary: 'yellow',
      neutral: 'neutral',
    },
    prose: {
      codePreview: {
        slots: {
          preview: 'flex-col *:w-full [&_a]:w-fit',
        },
      },
      codeIcon: {
        'astro.config.mjs': 'i-simple-icons:astro',
        astro: 'i-simple-icons:astro',
        md: 'i-custom-comark',
        mdc: 'i-custom-comark',
        react: 'i-logos-react',
        html: 'i-vscode-icons-file-type-html',
        svelte: 'i-logos-svelte-icon',
        nuxt: 'i-logos-nuxt-icon',
      },
    },
  },
})
