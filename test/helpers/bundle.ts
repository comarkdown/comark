import { join } from 'node:path'
import { build, type InlineConfig } from 'vite'

export async function bundledModules(root: string, source: string, options: InlineConfig = {}): Promise<string[]> {
  const entry = join(root, 'bundle-test-entry.ts')
  const result = await build({
    ...options,
    configFile: false,
    root,
    logLevel: 'silent',
    plugins: [
      ...(options.plugins || []),
      {
        name: 'bundle-test-entry',
        resolveId: (id) => (id === entry ? entry : undefined),
        load: (id) => (id === entry ? source : undefined),
      },
    ],
    build: {
      write: false,
      lib: { entry, formats: ['es'] },
      rollupOptions: {
        external: (id) =>
          id === 'react' ||
          id.startsWith('react/') ||
          id === 'vue' ||
          id.startsWith('@angular/') ||
          id === 'svelte' ||
          id.startsWith('svelte/'),
      },
    },
  })
  if ('close' in result) throw new Error('Unexpected watch build')
  return (Array.isArray(result) ? result : [result]).flatMap((bundle) =>
    bundle.output.flatMap((output) =>
      output.type === 'chunk'
        ? Object.entries(output.modules)
            .filter(([, module]) => module.renderedLength > 0)
            .map(([id]) => id.replaceAll('\\', '/'))
        : []
    )
  )
}

export function bindingModules(modules: string[]): string[] {
  return modules.filter((id) =>
    /\/(?:plugins\/binding|components\/(?:Binding|If|binding.component|if.component))\.(?:[cm]?[jt]sx?|svelte)$/.test(
      id
    )
  )
}
