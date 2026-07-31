import { describe, expect, it, vi } from 'vitest'
import { parse } from 'comark'
import { isMarkdownDocument } from 'comark/utils'
import type { MarkdownDocument } from 'comark'
import { Markdown } from '../src/components/markdown.component.ts'

/**
 * Angular's high-level Markdown component accepts a string or a pre-parsed
 * MarkdownDocument on `value`. When a tree is passed, parse is skipped and the
 * tree is assigned for MarkdownDocument to render.
 */
function createMarkdown(): Markdown {
  const cdr = { markForCheck: vi.fn() }
  return new Markdown(cdr as any)
}

describe('Markdown value as MarkdownDocument', () => {
  it('assigns a pre-parsed tree without calling parse', async () => {
    const tree = await parse('# Hello **World**')
    const component = createMarkdown()

    component.value = tree
    component.ngOnChanges({
      value: {
        currentValue: tree,
        previousValue: undefined,
        firstChange: true,
        isFirstChange: () => true,
      },
    })

    expect(isMarkdownDocument(component.value)).toBe(true)
    expect(component.tree).toBe(tree)
    expect(component.tree!.nodes[0]?.[0]).toBe('h1')
  })

  it('still parses markdown strings', async () => {
    const component = createMarkdown()
    component.value = 'Hello **world**'
    component.ngOnChanges({
      value: {
        currentValue: 'Hello **world**',
        previousValue: undefined,
        firstChange: true,
        isFirstChange: () => true,
      },
    })

    // Wait for async parse
    await vi.waitFor(() => {
      expect(component.tree).not.toBeNull()
    })

    expect(component.tree!.nodes[0]?.[0]).toBe('p')
  })

  it('accepts an empty tree', () => {
    const empty: MarkdownDocument = { nodes: [], frontmatter: {}, meta: {} }
    const component = createMarkdown()
    component.value = empty
    component.ngOnChanges({
      value: {
        currentValue: empty,
        previousValue: undefined,
        firstChange: true,
        isFirstChange: () => true,
      },
    })

    expect(component.tree).toBe(empty)
    expect(component.tree!.nodes).toEqual([])
  })
})
