import { defineNuxtModule, createResolver, addImports, addComponent } from '@nuxt/kit'
import fs from 'node:fs/promises'

// Module options TypeScript interface definition
export interface ComarkModuleOptions {}

export default defineNuxtModule<ComarkModuleOptions>({
  moduleDependencies: {
    '@nuxt/ui': {
      defaults: {
        prose: true,
      },
      optional: true,
    },
  },
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
