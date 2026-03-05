import { defineBuildConfig } from 'obuild/config'

export default defineBuildConfig({
  entries: [
    {
      type: 'transform',
      input: './src/plugins',
      outDir: './dist/plugins',
    },
    {
      type: 'bundle',
      input: [
        './src/index.ts',
        './src/plugins/summary.ts',
        './src/plugins/security.ts',
        './src/ast/index.ts',
        './src/string.ts',
      ],
    },
    {
      type: 'transform',
      input: './src/utils',
      outDir: './dist/utils',
    },
  ],
})
