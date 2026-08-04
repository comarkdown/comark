import { describe, expect, it, vi } from 'vitest'
import { parseMarkdown } from 'comark'
import { isMarkdownDocument } from 'comark/utils'
import type { MarkdownDocument } from 'comark'
import { Markdown } from '../src/components/markdown.component.ts'

/**
 * Angular's high-level Markdown component accepts a string or a pre-parsed
 * MarkdownDocument on `value`. When a document is passed, parsing is skipped and
 * the document is assigned for MarkdownDocument to render.
 */
function createMarkdown(): Markdown {
  const cdr = { markForCheck: vi.fn() }
  return new Markdown(cdr as any)
}

describe('Markdown value as MarkdownDocument', () => {
  it('assigns a pre-parsed document without calling parse', async () => {
    const document = await parseMarkdown('# Hello **World**')
    const component = createMarkdown()

    component.value = document
    component.ngOnChanges({
      value: {
        currentValue: document,
        previousValue: undefined,
        firstChange: true,
        isFirstChange: () => true,
      },
    })

    expect(isMarkdownDocument(component.value)).toBe(true)
    expect(component.document).toBe(document)
    expect(component.document!.nodes[0]?.[0]).toBe('h1')
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
      expect(component.document).not.toBeNull()
    })

    expect(component.document!.nodes[0]?.[0]).toBe('p')
  })

  it('accepts an empty document', () => {
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

    expect(component.document).toBe(empty)
    expect(component.document!.nodes).toEqual([])
  })
})
