import { defineNuxtModule, createResolver, addImports, addComponent, hasNuxtModule } from '@nuxt/kit'
import fs from 'node:fs/promises'

// Module options TypeScript interface definition
export interface ComarkModuleOptions {}

export default defineNuxtModule<ComarkModuleOptions>({
  meta: {
    name: 'comark',
    configKey: 'comark',
  },
  // Default configuration options of the Nuxt module
  defaults: {},
  async setup(_options, nuxt) {
    addComponent({
      name: 'Comark',
      export: 'Comark',
      filePath: '@comark/vue',
      priority: 1,
    })
    addComponent({
      name: 'ComarkRenderer',
      export: 'ComarkRenderer',
      filePath: '@comark/vue',
      priority: 1,
    })

    addImports({
      name: 'defineComarkComponent',
      as: 'defineComarkComponent',
      from: '@comark/vue',
    })

    if (hasNuxtModule('@nuxt/ui')) {
      setupNuxtUI(nuxt)
    }

    // Register user global components
    const resolver = createResolver(import.meta.url)
    const _layers = [...nuxt.options._layers].reverse()
    for (const layer of _layers) {
      const srcDir = layer.config.srcDir
      const globalComponents = resolver.resolve(srcDir, 'components/prose')
      const dirStat = await fs.stat(globalComponents).catch(() => null)
      if (dirStat && dirStat.isDirectory()) {
        nuxt.hook('components:dirs', (dirs: any[]) => {
          dirs.unshift({
            path: globalComponents,
            global: true,
            pathPrefix: false,
            prefix: '',
          })
        })
      }
    }
  },
})

function setupNuxtUI(nuxt: unknown) {
  // @ts-expect-error - Nuxt UI options are not typed
  nuxt.options.ui = nuxt.options.ui || {}
  // @ts-expect-error - Nuxt UI options are not typed
  nuxt.options.ui.content = true
}
