import { expect, it } from 'vitest'
import { build } from 'vite'
import { fileURLToPath } from 'node:url'

it.each(['none', 'inline', 'if', 'for'] as const)(
  'only includes the requested binding component (%s)',
  async (mode) => {
    const requestedExports = { none: '', inline: 'default as binding, Binding', if: 'If', for: 'For' }[mode]
    const renderer = fileURLToPath(new URL('../src/components/MarkdownDocument.tsx', import.meta.url))
    const binding = fileURLToPath(new URL('../src/plugins/binding.ts', import.meta.url))
    const result = await build({
      configFile: false,
      logLevel: 'silent',
      plugins: [
        {
          name: 'binding-bundle-probe',
          resolveId(id) {
            return id.endsWith('virtual:probe') ? '\0virtual:probe' : null
          },
          load(id) {
            if (id !== '\0virtual:probe') return null
            return (
              `export { MarkdownDocument } from ${JSON.stringify(renderer)};` +
              (requestedExports ? `export { ${requestedExports} } from ${JSON.stringify(binding)};` : '')
            )
          },
        },
      ],
      build: {
        write: false,
        minify: false,
        lib: { entry: 'virtual:probe', formats: ['es'] },
        rollupOptions: { external: ['react'] },
      },
    })
    const outputs = Array.isArray(result) ? result : [result]
    const code = outputs
      .flatMap((output) => ('output' in output ? output.output : []))
      .map((chunk) => (chunk.type === 'chunk' ? chunk.code : ''))
      .join('\n')
    expect(code.includes('For each must be an array')).toBe(mode === 'for')
    expect(code.includes('Duplicate For key:')).toBe(mode === 'for')
    expect(code.includes('Unsupported If wrapper tag:')).toBe(mode === 'if')
  },
  30_000
)
