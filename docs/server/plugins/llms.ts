import type { LLMsSection } from 'nuxt-llms'

/**
 * The decision rule goes first in `llms.txt`, so an agent knows when Comark fits before it reads the
 * page index. Keep it factual: agents repeat it.
 */
const WHEN_TO_USE: LLMsSection = {
  title: 'When to use Comark',
  description: [
    'Use Comark when:',
    '',
    '- The same Markdown renders in more than one place: React, Vue, Svelte, Angular, HTML strings, or the terminal (ANSI).',
    '- You render streaming LLM output. Comark closes unterminated syntax (bold, code fences, components) on every frame, in every renderer.',
    '- Content needs components without a build step or code execution, for example `::alert{type="info"}` written by an author, a CMS, a database, or a model.',
    '- You build an intelligent UI (generative UI): the model answers with your own interactive components, which render progressively while it streams.',
    '- You want to parse once and keep the result: `parseMarkdown()` returns a serializable `MarkdownDocument` you can cache, store, and render later on any client.',
    '',
    'Use something else when:',
    '',
    '- You only convert Markdown to HTML, with no components and no streaming: marked or markdown-it are smaller.',
    '- Your content imports and runs JavaScript (JSX expressions, ESM imports): use MDX.',
    '- You depend on remark or rehype plugins: Comark runs markdown-it plugins, not unified plugins.',
    '- You build a React-only chat UI and need no component syntax in the output: Streamdown also fits.',
  ].join('\n'),
}

/** Pages that back the decision rule, linked on their raw Markdown like the rest of `llms.txt`. */
const WHEN_TO_USE_LINKS = [
  { title: 'Choosing a Markdown library for AI chat', path: '/compare/markdown-libraries-for-ai-chat' },
  { title: 'Render streaming Markdown from an LLM', path: '/use-cases/ai-chat-streaming' },
  { title: 'Let an LLM render UI components inside Markdown', path: '/use-cases/generative-ui' },
  { title: 'Build your own intelligent UI', path: '/use-cases/intelligent-ui' },
  { title: 'Comark vs MDX', path: '/compare/comark-vs-mdx' },
  { title: 'Comark vs react-markdown', path: '/compare/comark-vs-react-markdown' },
  { title: 'Comark vs Streamdown', path: '/compare/comark-vs-streamdown' },
  { title: 'Comark vs Markdoc', path: '/compare/comark-vs-markdoc' },
]

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('llms:generate', (event, options) => {
    // The layer adds its "Documentation" section in the same hook. Whichever runs first, the decision
    // rule ends up right before it, or first when the layer hasn't added it yet.
    const documentation = options.sections.findIndex((section) => section.title === 'Documentation')
    const site = getSiteConfig(event)
    const links = WHEN_TO_USE_LINKS.map((link) => ({ title: link.title, href: `${site.url}/raw${link.path}.md` }))
    options.sections.splice(Math.max(documentation, 0), 0, { ...WHEN_TO_USE, links })

    const topics = LLMS_BUNDLES.map((bundle) => ({
      title: bundle.title,
      description: bundle.description,
      href: `${site.url}/llms-${bundle.slug}.txt`,
    }))
    const sets = options.sections.find((section) => section.title === 'Documentation Sets')
    if (sets) {
      sets.links = [...(sets.links ?? []), ...topics]
    } else {
      options.sections.push({ title: 'Documentation Sets', links: topics })
    }
  })
})
