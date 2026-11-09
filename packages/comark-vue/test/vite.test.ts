import { afterEach, describe, expect, it, vi } from 'vitest'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

afterEach(() => {
  vi.resetModules()
  vi.doUnmock('node:url')
})

describe('@comark/vue vite plugin', () => {
  it('normalizes injected runtime import paths to forward slashes on Windows', async () => {
    vi.doMock('node:url', async () => {
      const actual = await vi.importActual<typeof import('node:url')>('node:url')
      return {
        ...actual,
        fileURLToPath: () => String.raw`D:\Code\gqt\packages\comark-vue\src\utils`,
      }
    })

    const { default: comark } = await import('../src/vite.ts')
    const plugin = comark()
    const vueOptions: Record<string, any> = {}

    // @ts-expect-error -- configResolved is not callable
    plugin.configResolved?.({
      root: '/repo',
      plugins: [
        {
          name: 'vite:vue',
          api: {
            options: vueOptions,
          },
        },
      ],
    } as any)

    const transform = vueOptions.template.compilerOptions.nodeTransforms[0]

    function transformSlotOutlet(node: Record<string, any>) {
      node.codegenNode = { callee: 'renderSlot' }
    }

    const node = {
      tag: 'slot',
      props: [{ name: 'unwrap' }],
    }

    const context = {
      ssr: false,
      nodeTransforms: [transformSlotOutlet],
      imports: [],
    }

    const run = transform(node, context)
    run?.()

    // @ts-expect-error -- node.codegenNode is not defined
    expect(node.codegenNode.callee).toBe('_renderComarkSlot')
    expect(context.imports).toHaveLength(1)
    expect(context.imports[0]).toMatchObject({
      exp: '{ renderSlot as _renderComarkSlot }',
      path: 'D:/Code/gqt/packages/comark-vue/src/utils/slot',
    })
  })

  it('ignores components/prose when prose is false', async () => {
    const root = await mkdtemp(join(tmpdir(), 'comark-vite-'))
    await mkdir(join(root, 'components', 'prose'), { recursive: true })
    await writeFile(join(root, 'components', 'prose', 'ProseH1.vue'), '<template><h1><slot /></h1></template>')

    const { default: comark } = await import('../src/vite.ts')
    const entry = "createApp(App).mount('#app')"

    async function run(options: { prose?: boolean }) {
      const plugin = comark(options) as any
      plugin.configResolved({ root, plugins: [{ name: 'vite:vue', api: { options: {} } }] })
      const watched: string[] = []
      plugin.configureServer({ watcher: { add: (dir: string) => watched.push(dir), on: () => {} } })
      return { watched, transformed: await plugin.transform(entry) }
    }

    const enabled = await run({})
    expect(enabled.watched).toEqual([join(root, 'components', 'prose')])
    expect(enabled.transformed.code).toContain('.use(__comarkProse).mount(')

    const disabled = await run({ prose: false })
    expect(disabled.watched).toEqual([])
    expect(disabled.transformed).toBeNull()

    await rm(root, { recursive: true, force: true })
  })
})
