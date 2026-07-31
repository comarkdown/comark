export default defineAppConfig({
  seo: {
    title: 'Comark',
    description:
      'The Markdown engine for the modern web. One parser, every renderer: Vue, React, Svelte, Angular, HTML and ANSI, with components, plugins and streaming.',
    url: 'https://comark.dev',
    socials: {
      github: 'comarkdown/comark',
    },
  },
  docs: {
    github: 'comarkdown/comark',
  },

  assistant: {
    faqQuestions: [
      {
        category: 'Getting Started',
        items: [
          'What is Comark and how does it differ from MDX?',
          'How do I install Comark in my project?',
          'Can I use Comark with both Vue, React, Svelte and Angular?',
        ],
      },
      {
        category: 'Syntax',
        items: [
          'How do I write block and inline components in Comark?',
          'How do I pass props to a component using YAML frontmatter?',
          'How do I use named slots in Comark components?',
        ],
      },
      {
        category: 'Rendering & Streaming',
        items: [
          'How do I render Comark content in a Vue or React app?',
          'How do I stream AI-generated Markdown with Comark?',
          'What does autoCloseMarkdown do?',
        ],
      },
      {
        category: 'Plugins & Advanced',
        items: [
          'How do I add syntax highlighting to code blocks?',
          'How do I render math formulas with Comark?',
          'What does the Markdown AST look like?',
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
      },
    },
  },
  footer: {
    sections: [
      {
        title: 'Documentation',
        links: [
          {
            label: 'Getting Started',
            to: '/getting-started/introduction',
          },
          {
            label: 'Syntax',
            to: '/syntax/components',
          },
          {
            label: 'Rendering',
            to: '/rendering/vue',
          },
          {
            label: 'API Reference',
            to: '/api/parse',
          },
          {
            label: 'Comark vs MDX',
            to: '/compare/comark-vs-mdx',
          },
        ],
      },
      {
        title: 'Plugins',
        links: [
          {
            label: 'Syntax Highlighting',
            to: '/plugins/built-in/syntax-highlight',
          },
          {
            label: 'Math',
            to: '/plugins/built-in/math',
          },
          {
            label: 'Mermaid',
            to: '/plugins/built-in/mermaid',
          },
        ],
      },
      {
        title: 'Community',
        links: [
          {
            label: 'GitHub',
            to: 'https://github.com/comarkdown/comark',
            external: true,
          },
          {
            label: 'Issues',
            to: 'https://github.com/comarkdown/comark/issues',
            external: true,
          },
          {
            label: 'Changelog',
            to: 'https://github.com/comarkdown/comark/blob/main/CHANGELOG.md',
            external: true,
          },
          {
            label: 'License',
            to: 'https://github.com/comarkdown/comark/blob/main/LICENSE',
            external: true,
          },
        ],
      },
    ],
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
