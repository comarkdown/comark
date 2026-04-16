import type { Plugin } from 'vite'

const COMARK_LIGHT_ICON = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 212 212"><path stroke="#000" stroke-width="8" fill="none" d="M200.4 52.5v110H10.4v-110h190z"/><path fill="#000" d="M129.4 94.8V75.5h19.9v19.3h-19.9zm0 44.7v-19.2h19.9v19.2h-19.9zm30.1-44.7V75.5h19.9v19.3h-19.9zm0 44.7v-19.2h19.9v19.2h-19.9zM31.4 141.5v-68h20l20 25 20-25h20v68h-20v-39l-20 25-20-25v39h-20z"/></svg>')}`
const COMARK_DARK_ICON = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 212 212"><path stroke="#fff" stroke-width="8" fill="none" d="M200.4 52.5v110H10.4v-110h190z"/><path fill="#fff" d="M129.4 94.8V75.5h19.9v19.3h-19.9zm0 44.7v-19.2h19.9v19.2h-19.9zm30.1-44.7V75.5h19.9v19.3h-19.9zm0 44.7v-19.2h19.9v19.2h-19.9zM31.4 141.5v-68h20l20 25 20-25h20v68h-20v-39l-20 25-20-25v39h-20z"/></svg>')}`

/**
 * Vite plugin that registers the Comark playground in Vite DevTools.
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
  return {
    name: 'comark:devtools',
    devtools: {
      setup(ctx) {
        ctx.docks.register({
          id: 'comark',
          title: 'Comark',
          icon: {
            light: COMARK_LIGHT_ICON,
            dark: COMARK_DARK_ICON,
          },
          type: 'iframe',
          url: 'https://comark.dev/play',
        })
      },
    },
  }
}
