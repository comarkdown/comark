import { addComponent, addImports, addServerImports, addVitePlugin, defineNuxtModule } from '@nuxt/kit'
import comark from './vite.ts'

export interface ComarkModuleOptions {}

/**
 * Nuxt module for @comark/vue. Nuxt resolves `modules: ['@comark/vue']` to this entry.
 *
 * - Auto-imports the `<Markdown>` and `<MarkdownDocument>` components.
 * - Auto-imports `defineMarkdownComponent()` and `defineMarkdownDocumentComponent()`.
 * - Auto-imports `parseMarkdown()` in the app and in server routes.
 * - Adds `<slot unwrap="...">` support through the `@comark/vue/vite` plugin.
 * - Turns on Nuxt UI prose components when `@nuxt/ui` is installed.
 */
export default defineNuxtModule<ComarkModuleOptions>({
  meta: {
    name: 'comark',
    configKey: 'comark',
  },
  moduleDependencies: {
    '@nuxt/ui': {
      defaults: {
        prose: true,
      },
      optional: true,
    },
  },
  setup(_options, nuxt) {
    // Nuxt forbids app code from importing a module's entry point. When `@comark/vue` is linked from
    // outside `node_modules` (a workspace), Nuxt records the name from `modules`, `@comark/vue`, instead
    // of `@comark/vue/nuxt`, which would block the auto-imports below.
    nuxt.hook('module:done', () => {
      const installed = nuxt.options._installedModules?.find((m) => m.entryPath === '@comark/vue')
      if (installed) installed.entryPath = '@comark/vue/nuxt'
    })

    for (const name of ['Markdown', 'MarkdownDocument']) {
      addComponent({ name, export: name, filePath: '@comark/vue', priority: 1 })
    }

    addImports(
      ['defineMarkdownComponent', 'defineMarkdownDocumentComponent'].map((name) => ({ name, from: '@comark/vue' }))
    )

    // Auto-imports are added only to the files that use them, so the parser stays out of bundles that don't.
    const parseImport = { name: 'parseMarkdown', from: '@comark/vue/parse' }
    addImports(parseImport)
    addServerImports(parseImport)

    addVitePlugin(comark({ prose: false }))
  },
})
