import { defineNuxtModule, createResolver, addComponent, hasNuxtModule } from '@nuxt/kit'
import type { Nuxt, NuxtModule } from 'nuxt/schema'
import { setupDevTools } from './devtools'
import fs from 'node:fs/promises'

// Module options TypeScript interface definition
export interface ComarkModuleOptions {}

const module: NuxtModule<ComarkModuleOptions> = defineNuxtModule<ComarkModuleOptions>({
  meta: {
    name: 'comark',
    configKey: 'comark',
  },
  // Default configuration options of the Nuxt module
  defaults: {},
  async setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)

    addComponent({
      name: 'Comark',
      export: 'Comark',
      filePath: resolver.resolve('../vue/components/Comark'),
      priority: 1,
    })
    addComponent({
      name: 'ComarkRenderer',
      export: 'ComarkRenderer',
      filePath: resolver.resolve('../vue/components/ComarkRenderer'),
      priority: 1,
    })

    if (hasNuxtModule('@nuxt/ui')) {
      setupNuxtUI(nuxt)
    }

    // Set up Nuxt DevTools integration
    setupDevTools(nuxt)

    // Register user global components
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

export default module

function setupNuxtUI(nuxt: Nuxt) {
  // @ts-expect-error - Nuxt UI options are not typed
  nuxt.options.ui = nuxt.options.ui || {}
  // @ts-expect-error - Nuxt UI options are not typed
  nuxt.options.ui.content = true
}
