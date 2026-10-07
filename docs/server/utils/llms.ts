import type { H3Event } from 'h3'

/** The fields of a comark-content navigation node that the topic files read. */
interface NavigationItem {
  path?: string
  page?: false
  children?: NavigationItem[]
}

/** A topic file served next to `llms-full.txt`, for agents that can't read the whole documentation. */
export interface LlmsBundle {
  /** Served at `/llms-<slug>.txt`. */
  slug: string
  title: string
  description: string
  /** Pages in reading order. A path ending in `/**` adds every page under it, in sidebar order. */
  pages: string[]
}

export const LLMS_BUNDLES: LlmsBundle[] = [
  {
    slug: 'core',
    title: 'Comark core',
    description: 'Parse Markdown into a serializable document, the Comark syntax, and the core APIs.',
    pages: [
      '/getting-started/introduction',
      '/getting-started/installation',
      '/getting-started/document-model',
      '/syntax/**',
      '/reference/parse',
      '/reference/render',
      '/reference/reference',
    ],
  },
  {
    slug: 'streaming',
    title: 'Streaming Markdown with Comark',
    description: 'Render streaming LLM output: auto-close, AI chat in every framework, and components in model output.',
    pages: [
      '/reference/auto-close',
      '/use-cases/ai-chat-streaming',
      '/use-cases/vue-ai-chat',
      '/use-cases/svelte-ai-chat',
      '/use-cases/angular-ai-chat',
      '/use-cases/generative-ui',
      '/plugins/built-in/security',
    ],
  },
  {
    slug: 'vue',
    title: 'Comark for Vue and Nuxt',
    description: 'Render Markdown in Vue 3 and Nuxt, with custom components, plugins, and streaming.',
    pages: ['/rendering/vue', '/rendering/nuxt', '/use-cases/vue-ai-chat', '/reference/auto-close'],
  },
  {
    slug: 'react',
    title: 'Comark for React',
    description: 'Render Markdown in React and Next.js, with custom components, plugins, and streaming.',
    pages: [
      '/rendering/react',
      '/use-cases/ai-chat-streaming',
      '/reference/auto-close',
      '/compare/comark-vs-react-markdown',
      '/compare/comark-vs-streamdown',
    ],
  },
  {
    slug: 'svelte',
    title: 'Comark for Svelte',
    description: 'Render Markdown in Svelte 5 and SvelteKit, with custom components, plugins, and streaming.',
    pages: ['/rendering/svelte', '/use-cases/svelte-ai-chat', '/reference/auto-close'],
  },
  {
    slug: 'angular',
    title: 'Comark for Angular',
    description: 'Render Markdown in Angular 17+, with standalone components, plugins, and streaming.',
    pages: ['/rendering/angular', '/use-cases/angular-ai-chat', '/reference/auto-close'],
  },
  {
    slug: 'plugins',
    title: 'Comark plugins',
    description: 'Every built-in plugin, and the APIs to write your own.',
    pages: ['/plugins', '/plugins/**'],
  },
]

/**
 * Concatenates the raw Markdown of a bundle's pages, the same documents `/raw/**` serves, so a topic file
 * never drifts from the pages it is built from. A page that doesn't exist (yet) is skipped.
 */
export async function renderLlmsBundle(event: H3Event, bundle: LlmsBundle): Promise<string> {
  const pages = navigationPaths(await (await getProdContent()).navigation())
  const paths: string[] = []
  for (const entry of bundle.pages) {
    const prefix = entry.endsWith('/**') ? entry.slice(0, -3) : undefined
    const matches = prefix ? pages.filter((path) => path.startsWith(`${prefix}/`)) : [entry]
    for (const path of matches) {
      if (!paths.includes(path)) paths.push(path)
    }
  }

  const documents = await Promise.all(
    paths.map((path) => event.$fetch<string>(`/raw${path}.md`, { responseType: 'text' }).catch(() => undefined))
  )

  const site = getSiteConfig(event)
  const header = [
    `# ${bundle.title}`,
    `> ${bundle.description} Part of the ${site.name} documentation. The index of every page is ${site.url}/llms.txt.`,
  ].join('\n\n')
  const bodies = documents.filter((document): document is string => Boolean(document?.trim()))
  return [header, ...bodies.map((document) => document.trim())].join('\n\n')
}

/** Every page path of the navigation tree, in sidebar order. */
function navigationPaths(items: NavigationItem[]): string[] {
  const paths: string[] = []
  const collect = (entries: NavigationItem[]) => {
    for (const entry of entries) {
      if (entry.page !== false && entry.path && !paths.includes(entry.path)) paths.push(entry.path)
      if (entry.children?.length) collect(entry.children)
    }
  }
  collect(items)
  return paths
}

/** Event handler for one topic file. */
export function defineLlmsBundle(slug: string) {
  const bundle = LLMS_BUNDLES.find((entry) => entry.slug === slug)
  if (!bundle) throw new Error(`Unknown llms bundle: ${slug}`)
  return defineEventHandler(async (event) => {
    setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
    return renderLlmsBundle(event, bundle)
  })
}
