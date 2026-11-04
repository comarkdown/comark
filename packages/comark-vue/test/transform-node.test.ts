import { describe, expect, it } from 'vitest'
import { createSSRApp, defineComponent, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { parseMarkdown } from 'comark'
import type { NodeTransform } from 'comark'
import { MarkdownDocument } from '../src/components/MarkdownDocument'
import { defineMarkdownDocumentComponent } from '../src/index'

const Pill = defineComponent({
  name: 'Pill',
  props: { label: { type: String, default: '' }, tone: { type: String, default: '' } },
  setup(props, { slots }) {
    return () => h('span', { class: `pill ${props.tone}` }, [props.label, slots.default?.()])
  },
})

async function render(component: any, props: Record<string, any>) {
  const app = createSSRApp({ setup: () => () => h(component, props) })
  return (await renderToString(app as any)).replace(/<!--[[\]]-->/g, '')
}

describe('MarkdownDocument — transformNode', () => {
  it('swaps a node for a component with new props, and children see those props', async () => {
    const value = await parseMarkdown(
      '---\nname: Ada\n---\n::badge{:label="frontmatter.name"}\n:span{:title="props.tone"}\n::'
    )
    const transformNode: NodeTransform = ({ tag, props }) =>
      tag === 'badge' ? { tag: 'pill', props: { ...props, tone: 'info' } } : undefined

    const html = await render(MarkdownDocument, { value, transformNode, components: { pill: Pill } })
    expect(html).toContain('<span class="pill info">Ada<span title="info"></span></span>')
  })

  it('passes the props a transform returns as-is, functions included', async () => {
    const value = await parseMarkdown('[x](/safe)')
    let clicked = false
    const transformNode: NodeTransform = ({ tag, props }) =>
      tag === 'a' ? { props: { ...props, onClick: () => (clicked = true), onmouseover: 'alert(1)' } } : undefined
    const Probe = defineComponent({
      props: { onClick: Function, onmouseover: String, href: String },
      setup(props) {
        return () => {
          props.onClick?.()
          return h('i', { 'data-over': String(props.onmouseover) }, props.href)
        }
      },
    })

    const html = await render(MarkdownDocument, { value, transformNode, components: { a: Probe } })
    expect(clicked).toBe(true)
    expect(html).toContain('data-over="alert(1)"')
    expect(html).toContain('/safe')
  })

  it('runs config-level transforms before instance-level ones', async () => {
    const value = await parseMarkdown('# Title')
    const Renderer = defineMarkdownDocumentComponent({
      transformNode: ({ tag }) => (tag === 'h1' ? { tag: 'h2' } : undefined),
    })
    const html = await render(Renderer, {
      value,
      transformNode: ({ tag, props }: Parameters<NodeTransform>[0]) =>
        tag === 'h2' ? { props: { ...props, class: 'demoted' } } : undefined,
    })
    expect(html).toContain('<h2 id="title" class="demoted">Title</h2>')
  })
})
