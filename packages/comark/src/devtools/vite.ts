import type { Plugin, ViteDevServer } from 'vite'
import { loadEnv } from 'vite'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import type { ComarkInstanceSummary } from './registry.ts'

const COMARK_LIGHT_ICON = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 212 212"><path stroke="#000" stroke-width="8" fill="none" d="M200.4 52.5v110H10.4v-110h190z"/><path fill="#000" d="M129.4 94.8V75.5h19.9v19.3h-19.9zm0 44.7v-19.2h19.9v19.2h-19.9zm30.1-44.7V75.5h19.9v19.3h-19.9zm0 44.7v-19.2h19.9v19.2h-19.9zM31.4 141.5v-68h20l20 25 20-25h20v68h-20v-39l-20 25-20-25v39h-20z"/></svg>')}`
const COMARK_DARK_ICON = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 212 212"><path stroke="#fff" stroke-width="8" fill="none" d="M200.4 52.5v110H10.4v-110h190z"/><path fill="#fff" d="M129.4 94.8V75.5h19.9v19.3h-19.9zm0 44.7v-19.2h19.9v19.2h-19.9zm30.1-44.7V75.5h19.9v19.3h-19.9zm0 44.7v-19.2h19.9v19.2h-19.9zM31.4 141.5v-68h20l20 25 20-25h20v68h-20v-39l-20 25-20-25v39h-20z"/></svg>')}`

/**
 * Vite plugin that registers the Comark playground in Vite DevTools.
 *
 * The playground opens as a remote dock — it connects back to the local dev
 * server over WebSocket and can detect live `<Comark>` / `<ComarkRenderer>`
 * instances on the page, letting you edit their markdown in real time.
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
  let playgroundUrl = 'https://comark.dev/play'

  // Instance data pushed from the user's app via HMR
  let instancesData: ComarkInstanceSummary[] = []
  let server: ViteDevServer | undefined

  return {
    name: 'comark:devtools',

    config(userConfig, { mode }) {
      // Load COMARK_PLAYGROUND_URL from .env at the workspace root
      const root = findWorkspaceRoot(userConfig.root || process.cwd())
      if (root) {
        const env = loadEnv(mode, root, 'COMARK_')
        if (env.COMARK_PLAYGROUND_URL) {
          playgroundUrl = env.COMARK_PLAYGROUND_URL
        }
      }
    },

    configureServer(_server: ViteDevServer) {
      server = _server

      // Receive instance data from the user's app (sent by the devtools registry)
      server!.hot.on('comark:instances', (data: ComarkInstanceSummary[]) => {
        instancesData = data
      })
    },

    // `devtools` is augmented by @vitejs/devtools — cast to avoid TS error
    devtools: {
      setup(ctx: any) {
        // RPC: list live Comark instances
        ctx.rpc.register({
          name: 'comark:list-instances',
          handler: () => instancesData,
        })

        // RPC: update an instance's markdown
        ctx.rpc.register({
          name: 'comark:update-instance',
          handler: (args: { id: string, markdown: string }) => {
            // Relay the update to the user's app via Vite HMR
            server?.hot.send('comark:update', {
              id: args.id,
              markdown: args.markdown,
            })
            return { ok: true }
          },
        })

        ctx.docks.register({
          id: 'comark',
          title: 'Comark',
          icon: {
            light: COMARK_LIGHT_ICON,
            dark: COMARK_DARK_ICON,
          },
          type: 'iframe',
          url: playgroundUrl,
          remote: true,
        })
      },
    },
  } as any as Plugin
}

function findWorkspaceRoot(startDir: string): string | undefined {
  let dir = startDir
  while (dir !== dirname(dir)) {
    if (existsSync(join(dir, 'pnpm-workspace.yaml'))) return dir
    dir = dirname(dir)
  }
}
