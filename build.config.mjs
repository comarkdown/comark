import { defineBuildConfig } from 'obuild/config'

export default defineBuildConfig({
  entries: [
    {
      type: 'bundle',
      input: ['./src/index.ts', './src/stream.ts'],
    },
    {
      type: 'transform',
      input: './src/vue',
      outDir: './dist/vue',
    },
    {
      type: 'bundle',
      input: './src/react/index.ts',
      outDir: './dist',
      name: 'react/index',
    },
  ],
})
