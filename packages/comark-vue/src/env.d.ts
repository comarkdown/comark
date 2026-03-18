interface ImportMeta {
  dev: boolean
}

declare module 'virtual:comark-vue/components' {
  import type { Plugin } from 'vue'

  const plugin: Plugin
  export default plugin
}
