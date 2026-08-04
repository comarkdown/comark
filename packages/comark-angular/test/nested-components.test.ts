import { describe, expect, it, vi } from 'vitest'
import { MarkdownNode } from '../src/components/markdown-node.component.ts'

function createRenderer() {
  return {
    createText: (value: string) => ({ value }),
    appendChild: vi.fn(),
  }
}

function createNode(overrides: Record<string, unknown> = {}) {
  const node = Object.create(MarkdownNode.prototype) as any
  Object.assign(node, {
    node: ['root', {}],
    components: { Badge: class Badge {} },
    renderer: createRenderer(),
    vcr: { createComponent: vi.fn() },
    ...overrides,
  })
  return node
}

describe('MarkdownNode nested component rendering', () => {
  it('passes nested inputs through Angular input binding', () => {
    const componentRef = {
      setInput: vi.fn(),
      changeDetectorRef: { detectChanges: vi.fn() },
      location: { nativeElement: { style: {} } },
    }
    const node = createNode({
      vcr: { createComponent: vi.fn(() => componentRef) },
    })

    node.renderChildren(
      {},
      [['badge', {}, 'shown']],
      { frontmatter: {}, meta: {}, data: {}, props: {} },
    )

    expect(componentRef.setInput).toHaveBeenCalledWith('node', ['badge', {}, 'shown'])
    expect(componentRef.setInput).toHaveBeenCalledWith('components', node.components)
    expect(componentRef.setInput).toHaveBeenCalledWith('parent', node.node)
    expect(componentRef.changeDetectorRef.detectChanges).toHaveBeenCalledOnce()
  })

  it('logs a failed custom component and continues with later siblings', () => {
    const error = new Error('constructor failed')
    const renderer = createRenderer()
    const node = createNode({
      renderer,
      vcr: {
        createComponent: vi.fn(() => {
          throw error
        }),
      },
    })
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    node.renderChildren(
      {},
      [['badge', {}, 'gone'], 'still rendered'],
      { frontmatter: {}, meta: {}, data: {}, props: {} },
    )

    expect(consoleError).toHaveBeenCalledWith('Failed to render custom component "badge"', error)
    expect(renderer.appendChild).toHaveBeenCalledWith({}, { value: 'still rendered' })
    consoleError.mockRestore()
  })
})
