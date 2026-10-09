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
        sections: ['getting-started', 'syntax', 'rendering', 'reference', 'kb'],
      },
      { label: 'Plugins', sections: ['plugins'], link: 'section' as const },
      { label: 'Use cases', sections: ['use-cases', 'compare'], link: 'section' as const },
      { label: 'Examples', sections: ['examples'], link: 'section' as const },
      { label: 'Playground', to: '/play' },
      { label: 'Ecosystem', sections: ['ecosystem'], link: 'section' as const },
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
      tagline: 'The Markdown parser and renderer for everything',
    },
    llms: {
      description:
        'Comark is an open-source Markdown parser and renderer with components, attributes and plugins. It streams AI output to React, Vue, Svelte, Angular, HTML and the terminal.',
    },
    schemaOrg: {
      description:
        'Comark is an open-source Markdown parser and renderer with components, attributes and plugins. It streams AI output to React, Vue, Svelte, Angular, HTML and the terminal.',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Any',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      license: 'https://github.com/comarkdown/comark/blob/main/LICENSE',
      sameAs: ['https://github.com/comarkdown/comark', 'https://www.npmjs.com/package/comark'],
      programmingLanguage: 'TypeScript',
      organization: {
        url: 'https://comark.dev',
        sameAs: ['https://github.com/comarkdown', 'https://www.npmjs.com/org/comark'],
      },
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
    },
  },
})
