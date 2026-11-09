import { defineNuxtModule, useLogger } from '@nuxt/kit'
import type { NuxtModule } from '@nuxt/schema'

export interface ComarkModuleOptions {}

/**
 * @deprecated Use `modules: ['@comark/vue']` instead. This module only installs `@comark/vue/nuxt`.
 */
const module: NuxtModule<ComarkModuleOptions> = defineNuxtModule<ComarkModuleOptions>({
  meta: {
    name: '@comark/nuxt',
  },
  moduleDependencies: {
    '@comark/vue': {},
  },
  setup() {
    useLogger('@comark/nuxt').warn(
      "`@comark/nuxt` is deprecated: install `@comark/vue` and use `modules: ['@comark/vue']` instead. " +
        '`~/components/prose` is no longer registered globally. ' +
        'See https://github.com/comarkdown/comark/tree/main/packages/comark-nuxt#migrate-to-comarkvue'
    )
  },
})

export default module
