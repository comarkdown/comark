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
    ecosystem: [],
    nav: [
      {
        label: 'Documentation',
        sections: ['getting-started', 'syntax', 'rendering', 'api', 'compare', 'kb'],
      },
      { label: 'Plugins', sections: ['plugins'], link: 'section' as const },
      { label: 'Examples', sections: ['examples'], link: 'section' as const },
      {
        label: 'Playground',
        to: '/play',
        children: [
          { label: 'Booking', to: '/play/booking' },
          { label: 'Recipe', to: '/play/recipe' },
          { label: 'Nuxt UI', to: '/play/nuxt-ui' },
          { label: 'All Features', to: '/play/editor?example=all-features', activePath: '/play/all-features' },
        ],
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

  assistant: {
    enabled: true,
    faqQuestions: [
      {
        category: 'Getting Started',
        items: ['What is Comark and how does it differ from MDX?', 'How do I install and set up Comark in my project?'],
      },
      {
        category: 'Syntax',
        items: ['How do I write components in Comark?', 'How do I pass props and attributes to components?'],
      },
      {
        category: 'Rendering & Streaming',
        items: [
          'How do I stream AI-generated Markdown with Comark?',
          'How do I add syntax highlighting to code blocks?',
          'How do I render math formulas with Comark?',
          'What does a MarkdownDocument look like?',
        ],
      },
    ],
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
        angular: 'i-logos-angular-icon',
      },
    },
  },
})
