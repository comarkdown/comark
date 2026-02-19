import { defineBuildConfig } from 'obuild/config'

export default defineBuildConfig({
  entries: [
    {
      type: 'bundle',
      input: [
        './src/index.ts',
        './src/react/index.ts',
        './src/react/components/Comark.tsx',
        './src/react/components/ComarkAst.tsx',
        './src/react/components/index.tsx',
        './src/react/components/prose/ProsePre.tsx',
        './src/ast/index.ts',
        './src/string.ts',
      ],
    },
    {
      type: 'transform',
      input: './src/vue',
      outDir: './dist/vue',
    },
    {
      type: 'transform',
      input: './src/utils',
      outDir: './dist/utils',
    },
    {
      type: 'transform',
      input: './src/plugins',
      outDir: './dist/plugins',
    },
  ],
})
