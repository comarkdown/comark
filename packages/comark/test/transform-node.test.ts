import { describe, expect, it, vi } from 'vitest'
import { parseMarkdown } from '../src/index'
import { renderHtmlFromDocument } from '../src/render/html'
import { render } from '../src/render/index'
import { mergeNodeTransforms, resolveAttributes } from '../src/utils/index'
import type { NodeTransform } from '../src/types'

const html = async (markdown: string, transformNode: NodeTransform | NodeTransform[], options = {}) =>
  renderHtmlFromDocument(await parseMarkdown(markdown), { transformNode, ...options })

describe('transformNode (HTML renderer)', () => {
  it('renders the returned tag and props, with bindings already resolved', async () => {
    const seen: unknown[] = []
    const out = await html(
      '---\nslug: intro\n---\n::card{:to="frontmatter.slug" title="Hi"}\nBody\n::',
      ({ tag, props }) => {
        if (tag !== 'card') return
        seen.push(props)
        return { tag: 'a', props: { href: `/docs/${props.to}`, title: props.title } }
      }
    )
    expect(seen).toEqual([{ to: 'intro', title: 'Hi' }])
    expect(out).toBe('<a href="/docs/intro" title="Hi">Body</a>')
  })

  it('gives hooks the same props as the framework renderers', async () => {
    const markdown =
      '---\nt: 1\n---\n::counter{:count="5" :active="true" :cfg=\'{"a":1}\' :title="frontmatter.missing" :ok="frontmatter.t" label="x"}\nhi\n::'
    const document = await parseMarkdown(markdown)
    const seen: Record<string, unknown>[] = []
    await renderHtmlFromDocument(document, {
      transformNode: ({ tag, props }) => {
        if (tag === 'counter') seen.push(props)
      },
    })
    // Vue, React, Svelte and Angular resolve attributes this way before calling the hook
    const renderData = { frontmatter: document.frontmatter, meta: document.meta, data: {}, props: {} }
    const frameworkProps = resolveAttributes(document.nodes[0][1] as Record<string, unknown>, renderData, {
      parseJson: true,
    })
    expect(seen).toEqual([frameworkProps])
    expect(seen[0]).toEqual({ count: 5, active: true, cfg: { a: 1 }, title: undefined, ok: 1, label: 'x' })
    expect(':count' in seen[0]).toBe(false)
  })

  it('renders props a hook passes through unchanged', async () => {
    const out = await html('::counter{:count="5" :cfg=\'{"a":1}\' label="x"}\nhi\n::', ({ tag, props }) =>
      tag === 'counter' ? { props: { ...props, big: (props.count as number) > 3 } } : undefined
    )
    expect(out).toBe('<counter count="5" cfg="{&quot;a&quot;:1}" label="x" big>\n  hi\n</counter>')
  })

  it('gives children the normalized props a hook returns', async () => {
    const out = await html('::card{:count="5"}\n:span{:title="props.count"}\n::', ({ tag, props }) =>
      tag === 'card' ? { props: { ...props } } : undefined
    )
    expect(out).toContain('<span title="5"></span>')
  })

  it('looks the new tag up in components, like any tag', async () => {
    const out = await html(':badge', ({ tag }) => (tag === 'badge' ? { tag: 'pill' } : undefined), {
      components: { pill: () => '<b>pill</b>' },
    })
    expect(out).toBe('<b>pill</b>')
  })

  it('gives children the transformed props as their parent scope', async () => {
    const out = await html('::card{title="Raw"}\n:span{:title="props.title"}\n::', ({ tag, props }) =>
      tag === 'card' ? { props: { ...props, title: 'Changed' } } : undefined
    )
    expect(out).toContain('<span title="Changed"></span>')
  })

  it('keeps the parent scope for wrappers when only the tag changes', async () => {
    const out = await html('::card{title="Kept"}\n- :span{:title="props.title"}\n::', ({ tag }) =>
      tag === 'ul' ? { tag: 'ol' } : undefined
    )
    expect(out).toContain('<ol>')
    expect(out).toContain('<span title="Kept"></span>')
  })

  it('runs a list of transforms in order, each seeing the previous result', async () => {
    const out = await html('# Title', [
      ({ tag }) => (tag === 'h1' ? { tag: 'h2' } : undefined),
      ({ tag, props }) => (tag === 'h2' ? { props: { ...props, class: 'demoted' } } : undefined),
    ])
    expect(out).toBe('<h2 id="title" class="demoted">Title</h2>')
  })

  it('renders the returned props and tag as-is, without sanitizing them', async () => {
    const out = await html('[x](/safe){title="t"}', ({ tag, props }) =>
      tag === 'a' ? { tag: 'object', props: { ...props, rel: 'nofollow', ping: '/track' } } : undefined
    )
    expect(out).toBe('<p><object href="/safe" title="t" rel="nofollow" ping="/track">x</object></p>')
  })

  it('renders the same output as without transforms when nothing changes', async () => {
    const markdown = '---\nt: x\n---\n# A\n\n::card{:title="frontmatter.t"}\n**b** [c](/d)\n::'
    const transform = vi.fn(() => undefined)
    const document = await parseMarkdown(markdown)
    expect(await renderHtmlFromDocument(document, { transformNode: transform })).toBe(
      await renderHtmlFromDocument(document)
    )
    expect(transform).toHaveBeenCalled()
  })

  it('does not mutate the document', async () => {
    const document = await parseMarkdown('::card{title="a"}\nx\n::')
    const before = JSON.stringify(document.nodes)
    await renderHtmlFromDocument(document, { transformNode: () => ({ tag: 'div', props: { title: 'b' } }) })
    expect(JSON.stringify(document.nodes)).toBe(before)
  })
})

describe('transformNode (string renderer)', () => {
  it('lets handlers read the transformed node', async () => {
    const out = await render(await parseMarkdown(':badge{label="a"}'), {
      transformNode: ({ tag, props }) =>
        tag === 'badge' ? { tag: 'pill', props: { label: `${props.label}!` } } : undefined,
      components: { pill: ([, attrs]) => `pill:${attrs.label}` },
    })
    expect(out).toBe('pill:a!\n')
  })
})

describe('mergeNodeTransforms', () => {
  const a: NodeTransform = () => undefined
  const b: NodeTransform = () => undefined

  it('returns a lone source as it is, and a stable merged list', () => {
    expect(mergeNodeTransforms(a, undefined)).toBe(a)
    expect(mergeNodeTransforms(undefined, b)).toBe(b)
    const list = [b]
    expect(mergeNodeTransforms(a, list)).toEqual([a, b])
    expect(mergeNodeTransforms(a, list)).toBe(mergeNodeTransforms(a, list))
  })
})
