import { defineNuxtModule, createResolver, addImports, addComponent, extendViteConfig } from '@nuxt/kit'
import fs from 'node:fs/promises'
import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from 'nuxt/schema'
import comark from '@comark/vue/vite'

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

    addImports([
      {
        name: 'defineComarkComponent',
        as: 'defineComarkComponent',
        from: '@comark/vue',
      }, {
        name: 'defineComarkRendererComponent',
        as: 'defineComarkRendererComponent',
        from: '@comark/vue',
      },
    ])

    const resolver = createResolver(import.meta.url)

    extendViteConfig((config) => {
      config.plugins ??= []
      config.plugins.push(comark())
    })

    // Register user global components
    await registerComarkGlobalComponents(resolver, nuxt as unknown as Nuxt)
  },
})

async function registerComarkGlobalComponents(resolver: Resolver, nuxt: Nuxt) {
  const _layers = [...nuxt.options._layers].reverse()
    // main layer will be handled by vite plugin
    .slice(0, -1)
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
}
