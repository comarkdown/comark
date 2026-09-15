import { describe, expect, it } from 'vitest'
import { parseMarkdown } from '../../src/index'
import { renderMarkdown } from '../../src/render'
import type { ElementNode, Node } from '../../src/types'
import shiki from '../../src/plugins/shiki'

async function inlineCode(source: string): Promise<ElementNode> {
  const document = await parseMarkdown(source, { plugins: [shiki()] })
  return (document.nodes[0] as ElementNode)[2] as ElementNode
}

/** Collect every `style` on the node's span children, in order. */
function styles(node: ElementNode): string[] {
  return (node.slice(2) as Node[])
    .filter((child): child is ElementNode => Array.isArray(child))
    .map((child) => String((child[1] as Record<string, unknown>).style ?? ''))
}

describe('shiki inline code', () => {
  it('highlights inline code carrying a lang attribute', async () => {
    const code = await inlineCode('`const a = 1`{lang="ts"}')

    expect(String((code[1] as Record<string, unknown>).class)).toMatch(/^shiki /)
    expect(styles(code).some(Boolean)).toBe(true)
  })

  it('tokenizes ts-type as a type expression, not a statement', async () => {
    // Without the `let a:` seed, `Ref` falls through to plain text.
    const asType = await inlineCode('`Ref<T>`{lang="ts-type"}')
    const asStatement = await inlineCode('`Ref<T>`{lang="ts"}')

    expect(styles(asType)).not.toEqual(styles(asStatement))
  })

  it('tokenizes vue-html as template markup', async () => {
    const code = await inlineCode('`<UButton />`{lang="vue-html"}')

    expect(String((code[1] as Record<string, unknown>).class)).toMatch(/^shiki /)
    expect(styles(code).some(Boolean)).toBe(true)
  })

  it('leaves a natural language alone', async () => {
    const code = await inlineCode('`Bonjour`{lang="fr"}')

    expect(code).toEqual(['code', { lang: 'fr' }, 'Bonjour'])
  })

  it('leaves a raw HTML code element alone', async () => {
    const source = 'A <code lang="ts">const a = 1</code> here'
    const document = await parseMarkdown(source, { plugins: [shiki()] })

    expect(await renderMarkdown(document)).toBe(source)
  })

  it('round-trips without the highlighter class', async () => {
    const source = 'The type is `Ref<T>`{lang="ts-type"}.'
    const document = await parseMarkdown(source, { plugins: [shiki()] })

    expect(await renderMarkdown(document)).toBe(source)
  })
})
