/// <reference types="@vitejs/devtools-kit" />
import type { Plugin, ViteDevServer } from 'vite'
import type { ComarkTree } from '../types.ts'
import type { ComarkInstanceSummary } from './registry.ts'
import { COMARK_DARK_ICON, COMARK_LIGHT_ICON } from './constants/index.ts'

declare module '@vitejs/devtools-kit' {
  interface DevToolsRpcServerFunctions {
    'comark:parse': (markdown: string) => Promise<ComarkTree>
    'comark:render-markdown': (markdown: string) => Promise<string>
    'comark:list-instances': () => Promise<ComarkInstanceSummary[]>
  }
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

        // RPC: render tree back to markdown (roundtrip)
        ctx.rpc.register({
          name: 'comark:render-markdown',
          type: 'query',
          handler: async (markdown: string) => {
            const { parse } = await import('../index.ts')
            const { renderMarkdown } = await import('../render.ts')
            const tree = await parse(markdown)
            return await renderMarkdown(tree)
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
