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
