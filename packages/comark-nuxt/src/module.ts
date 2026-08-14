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
  async setup(_options: ComarkModuleOptions, nuxt: Nuxt) {
    addComponent({
      name: 'Markdown',
      export: 'Markdown',
      filePath: '@comark/vue',
      priority: 1,
    })
    addComponent({
      name: 'MarkdownDocument',
      export: 'MarkdownDocument',
      filePath: '@comark/vue',
      priority: 1,
    })

    addImports([
      {
        name: 'defineMarkdownComponent',
        as: 'defineMarkdownComponent',
        from: '@comark/vue',
      },
      {
        name: 'defineMarkdownDocumentComponent',
        as: 'defineMarkdownDocumentComponent',
        from: '@comark/vue',
      },
    ])

    const resolver = createResolver(import.meta.url)

    extendViteConfig((config) => {
      config.plugins ??= []
      config.plugins.push(comark({ prose: false }))
    })

    // Register user global components
    await registerComarkGlobalComponents(resolver, nuxt)
  },
})

async function registerComarkGlobalComponents(resolver: Resolver, nuxt: Nuxt) {
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
}
