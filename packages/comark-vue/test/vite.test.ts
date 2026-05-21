import { afterEach, describe, expect, it, vi } from 'vitest'

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

    expect(node.codegenNode.callee).toBe('_renderComarkSlot')
    expect(context.imports).toHaveLength(1)
    expect(context.imports[0]).toMatchObject({
      exp: '{ renderSlot as _renderComarkSlot }',
      path: 'D:/Code/gqt/packages/comark-vue/src/utils/slot',
    })
  })
})
