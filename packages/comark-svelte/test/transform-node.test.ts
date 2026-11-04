import { describe, expect, it } from 'vitest'
import { render } from 'svelte/server'
import { parseMarkdown } from 'comark'
import type { NodeTransform } from 'comark'
import MarkdownDocument from '../src/components/MarkdownDocument.svelte'
import Badge from './test-components/Badge.svelte'
import Probe from './test-components/Probe.svelte'

async function renderMarkdown(markdown: string, transformNode: NodeTransform) {
  const value = await parseMarkdown(markdown)
  return render(MarkdownDocument, { props: { value, transformNode, components: { badge: Badge, probe: Probe } } }).body
}

describe('MarkdownDocument — transformNode', () => {
  it('swaps a node for a component with new props', async () => {
    const html = await renderMarkdown('---\nname: Ada\n---\n:pill{:text="frontmatter.name"}', ({ tag, props }) =>
      tag === 'pill' ? { tag: 'badge', props: { label: `${props.text}!`, count: 2 } } : undefined
    )
    expect(html).toContain('data-count="2"')
    expect(html).toContain('Ada!')
  })

  it('gives children the transformed props as their parent scope', async () => {
    const html = await renderMarkdown('::div{label="Raw"}\n:probe{:text="props.label"}\n::', ({ tag, props }) =>
      tag === 'div' ? { props: { ...props, label: 'Changed' } } : undefined
    )
    expect(html).toContain('[Changed]')
  })
})
