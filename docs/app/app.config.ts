export default defineAppConfig({
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

  assistant: {
    faqQuestions: [
      {
        category: 'Getting Started',
        items: [
          'What is Comark and how does it differ from MDX?',
          'How do I install Comark in my project?',
          'Can I use Comark with both Vue and React?',
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
          'What does the Comark AST look like?',
        ],
      },
    ],
  },

  title: 'Comark',
  description: 'Components in Markdown (Comark) parser with streaming support for Vue and React.',
  url: 'https://comark.dev',

  ui: {
    colors: {
      primary: 'yellow',
      neutral: 'zinc',
    },
    prose: {
      codePreview: {
        slots: {
          preview: 'flex-col [&>*]:w-full [&_a]:w-fit',
        },
      },
      codeIcon: {
        'astro.config.mjs': 'i-simple-icons:astro',
        'astro': 'i-simple-icons:astro',
        'md': 'i-custom-comark',
        'react': 'i-logos-react',
        'html': 'i-vscode-icons-file-type-html',
      },
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
