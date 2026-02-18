import { defineBuildConfig } from 'obuild/config'

export default defineBuildConfig({
  entries: [
    {
      type: 'bundle',
      input: ['./src/index.ts', './src/vue.ts', './src/react.tsx'],
    },
  ],
  externals: ['vue', 'react'],
})
