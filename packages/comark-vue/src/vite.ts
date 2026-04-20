import { fileURLToPath } from 'node:url'
import { readdir } from 'node:fs/promises'
import { join, basename } from 'node:path'
import type { Plugin, ResolvedConfig } from 'vite'
import type { ElementNode, DirectiveNode, TransformContext } from '@vue/compiler-core'
import { existsSync } from 'node:fs'

const runtimeDir = fileURLToPath(new URL('./utils', import.meta.url))

function viteComarkSlot(node: ElementNode, context: TransformContext) {
  const isVueSlotWithUnwrap = node.tag === 'slot'
    && node.props.find(p => p.name === 'unwrap' || p.name === 'mdc-unwrap' || (p.name === 'bind' && (p as DirectiveNode).rawName === ':comark-unwrap'))

  if (isVueSlotWithUnwrap) {
    const transform = context.ssr
      ? context.nodeTransforms.find(nt => nt.name === 'ssrTransformSlotOutlet')
      : context.nodeTransforms.find(nt => nt.name === 'transformSlotOutlet')

    return () => {
      node.tag = 'slot'
      node.type = 1
      node.tagType = 2

      transform?.(node, context)

      const codegen = context.ssr ? (node as any).ssrCodegenNode : node.codegenNode
      codegen.callee = context.ssr ? '_ssrRenderComarkSlot' : '_renderComarkSlot'

      const importExp = context.ssr
        ? '{ ssrRenderSlot as _ssrRenderComarkSlot }'
        : '{ renderSlot as _renderComarkSlot }'

      if (!context.imports.some(i => String(i.exp) === importExp)) {
        context.imports.push({
          exp: importExp,
          path: `${runtimeDir}/${context.ssr ? 'ssrSlot' : 'slot'}`,
        })
      }
    }
  }

  if (context.nodeTransforms[0]?.name !== 'viteComarkSlot') {
    const index = context.nodeTransforms.findIndex(f => f.name === 'viteComarkSlot')
    if (index !== -1) {
      const nt = context.nodeTransforms.splice(index, 1)
      context.nodeTransforms.unshift(nt[0]!)
    }
  }
}

const VIRTUAL_COMPONENTS_ID = 'virtual:comark-vue/components'
const RESOLVED_COMPONENTS_ID = '\0' + VIRTUAL_COMPONENTS_ID

function toPascalCase(str: string): string {
  return str.replace(/(^|[-_.])(\w)/g, (_, __, c: string) => c.toUpperCase())
}

async function getProseFiles(proseDir: string): Promise<string[]> {
  const files: string[] = []
  try {
    const entries = await readdir(proseDir, { withFileTypes: true, recursive: true })
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith('.vue')) continue
      // parentPath was added in Node 21.4 / 20.12; path is the legacy name
      const dir = (entry as any).parentPath ?? (entry as any).path
      files.push(join(dir, entry.name))
    }
  }
  catch {
    // prose directory doesn't exist — that's fine
  }
  return files
}

function generateComponentsModule(files: string[]): string {
  if (!files.length) {
    return 'export default { install(app) {} }'
  }

  const lines: string[] = []
  for (let i = 0; i < files.length; i++) {
    lines.push(`import __comp_${i} from ${JSON.stringify(files[i]!.replace(/\\/g, '/'))}`)
  }
  lines.push('')
  lines.push('export default {')
  lines.push('  install(app) {')
  for (let i = 0; i < files.length; i++) {
    const name = toPascalCase(basename(files[i]!, '.vue'))
    lines.push(`    app.component(${JSON.stringify(name)}, __comp_${i})`)
  }
  lines.push('  },')
  lines.push('}')
  return lines.join('\n')
}

/**
 * Vite plugin for @comark/vue.
 *
 * - Adds `<slot unwrap="...">` support inside custom markdown components.
 * - Auto-registers every `.vue` file in `src/components/prose` as a global
 *   component
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import { defineConfig } from 'vite'
 * import vue from '@vitejs/plugin-vue'
 * import comark from '@comark/vue/vite'
 *
 * export default defineConfig({
 *   plugins: [vue(), comark()],
 * })
 * ```
 */
export default function comark(opts: { prose?: boolean } = {}): Plugin {
  let proseDir: string
  let proseFilesCache: string[] | null = null

  async function resolveProseFiles(): Promise<string[]> {
    if (!proseDir) return []

    if (!proseFilesCache) {
      proseFilesCache = await getProseFiles(proseDir)
    }
    return proseFilesCache
  }

  function invalidateCache(file: string) {
    if (file.startsWith(proseDir)) {
      proseFilesCache = null
    }
  }

  return {
    name: 'comark-vue',
    enforce: 'pre',

    configResolved(config: ResolvedConfig) {
      if (existsSync(join(config.root, 'src', 'components', 'prose'))) {
        proseDir = join(config.root, 'src', 'components', 'prose')
      }
      if (existsSync(join(config.root, 'components', 'prose'))) {
        proseDir = join(config.root, 'components', 'prose')
      }

      const vuePlugin = config.plugins.find(p => p.name === 'vite:vue')
      if (!vuePlugin) {
        console.warn('[comark-vue] @vitejs/plugin-vue not found. Make sure vue() is in your plugins.')
        return
      }

      const vueOptions = (vuePlugin as any).api?.options
      if (!vueOptions) return

      vueOptions.template ??= {}
      vueOptions.template.compilerOptions ??= {}
      vueOptions.template.compilerOptions.nodeTransforms ??= []
      vueOptions.template.compilerOptions.nodeTransforms.unshift(viteComarkSlot)
    },

    resolveId(id) {
      if (id === VIRTUAL_COMPONENTS_ID) return RESOLVED_COMPONENTS_ID
    },

    async load(id) {
      if (id !== RESOLVED_COMPONENTS_ID) return
      const files = await resolveProseFiles()
      return generateComponentsModule(files)
    },

    async transform(code) {
      if (opts.prose === false) return null
      if (!code.includes('createApp') || !code.includes('.mount(')) return null
      // Skip if already injected
      if (code.includes(VIRTUAL_COMPONENTS_ID)) return null

      const files = await resolveProseFiles()
      if (!files.length) return null

      const injected = `import __comarkProse from ${JSON.stringify(VIRTUAL_COMPONENTS_ID)};\n`
        + code.replace(/\.mount\s*\(/, '.use(__comarkProse).mount(')

      return { code: injected, map: null }
    },

    configureServer(server) {
      if (!proseDir) return

      server.watcher.add(proseDir)

      const invalidate = (file: string) => {
        invalidateCache(file)
        const mod = server.moduleGraph.getModuleById(RESOLVED_COMPONENTS_ID)
        if (mod) server.moduleGraph.invalidateModule(mod)
      }

      server.watcher.on('add', invalidate)
      server.watcher.on('unlink', invalidate)
    },
  }
}
