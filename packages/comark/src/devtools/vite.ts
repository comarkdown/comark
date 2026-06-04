/// <reference types="@vitejs/devtools-kit" />
import type { Plugin, ViteDevServer } from 'vite'
import type { Highlighter } from 'shiki'
import type { ComarkTree, ComarkInstanceSummary } from './types.ts'
import { COMARK_DARK_ICON, COMARK_LIGHT_ICON, DEVTOOLS_SHIKI_LANGS, DEVTOOLS_SHIKI_THEMES } from './constants/index.ts'

declare module '@vitejs/devtools-kit' {
  interface DevToolsRpcServerFunctions {
    'comark:parse': (markdown: string) => Promise<ComarkTree>
    'comark:highlight': (markdown: string) => Promise<string | null>
    'comark:list-instances': () => Promise<ComarkInstanceSummary[]>
  }
}

// Lazy Shiki highlighter singleton
let highlighterPromise: Promise<Highlighter | null> | null = null
function getHighlighter(): Promise<Highlighter | null> {
  if (!highlighterPromise) {
    highlighterPromise = import('shiki')
      .then((shiki) =>
        shiki.createHighlighter({
          themes: [...DEVTOOLS_SHIKI_THEMES],
          langs: [...DEVTOOLS_SHIKI_LANGS],
        })
      )
      .catch(() => null)
  }
  return highlighterPromise
}

/**
 * Vite plugin that registers a Comark playground panel in Vite DevTools.
 *
 * The panel provides an interactive markdown editor with live AST inspection,
 * powered by the `comark` parser running on the Vite dev server via RPC.
 *
 * Works with any framework (Vue, React, Svelte, etc.) — just add it to
 * your Vite config alongside `@vitejs/devtools`.
 *
 * @example
 * ```ts
 * import { DevTools } from '@vitejs/devtools'
 * import { comarkDevtools } from 'comark/vite'
 *
 * export default defineConfig({
 *   plugins: [DevTools(), comarkDevtools()],
 * })
 * ```
 */
export function comarkDevtools(): Plugin {
  // Instance data pushed from the user's app via HMR
  let instancesData: ComarkInstanceSummary[] = []

  return {
    name: 'comark:devtools',

    configureServer(_server: ViteDevServer) {
      // Receive instance data from the user's app (sent by the devtools registry)
      _server.hot.on('comark:instances', (data: ComarkInstanceSummary[]) => {
        instancesData = data
      })
    },

    devtools: {
      setup(ctx) {
        // RPC: parse markdown and return the tree
        ctx.rpc.register({
          name: 'comark:parse',
          type: 'query',
          handler: async (markdown: string) => {
            const { parse } = await import('../index.ts')
            return await parse(markdown)
          },
        })

        // RPC: highlight markdown using Shiki with the mdc grammar
        ctx.rpc.register({
          name: 'comark:highlight',
          type: 'query',
          handler: async (markdown: string) => {
            const highlighter = await getHighlighter()
            if (!highlighter) return null
            const html = highlighter.codeToHtml(markdown, {
              lang: 'mdc',
              themes: { light: DEVTOOLS_SHIKI_THEMES[0], dark: DEVTOOLS_SHIKI_THEMES[1] },
              defaultColor: false,
            })
            return html.replace(/^<pre[^>]*><code[^>]*>/, '').replace(/<\/code><\/pre>$/, '')
          },
        })

        // RPC: list live Comark instances on the page
        ctx.rpc.register({
          name: 'comark:list-instances',
          type: 'query',
          handler: () => instancesData,
        })

        // Register the dock entry with a custom renderer
        ctx.docks.register({
          id: 'comark',
          title: 'Comark',
          icon: {
            light: COMARK_LIGHT_ICON,
            dark: COMARK_DARK_ICON,
          },
          type: 'custom-render',
          renderer: {
            importFrom: 'comark/devtools-renderer',
            importName: 'default',
          },
        })
      },
    },
  } as Plugin
}
