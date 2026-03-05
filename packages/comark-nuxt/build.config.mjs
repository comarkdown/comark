import { defineBuildConfig } from 'obuild/config'

export default defineBuildConfig({
  entries: [
    {
      type: 'bundle',
      input: ['./src/module.ts'],
    },
  ],
  externals: ['@nuxt/kit', 'nuxt', 'nuxt/schema', 'vue', '@comark/vue'],
})
