import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { parseMarkdown } from 'comark'
import { Markdown } from '../src/components/Markdown'
import { MarkdownDocument } from '../src/components/MarkdownDocument'
import { MarkdownLive } from '../src/components/MarkdownLive'

/**
 * `wrapper` overrides the element the rendered nodes are parented to. The
 * default stays a `div` so existing output is untouched; a component or `false`
 * is what lets a non-DOM React host (terminal renderers, react-three-fiber, …)
 * render Comark at all — those reconcilers throw on an unknown `div` host.
 */
function Section({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <section className={className}>{children}</section>
}

describe('MarkdownDocument wrapper', () => {
  it('defaults to a div carrying comark-content', async () => {
    const document = await parseMarkdown('Hello **world**')
    const html = renderToString(<MarkdownDocument value={document} />)

    expect(html).toContain('<div class="comark-content')
    expect(html).toContain('<strong>world</strong>')
  })

  it('renders identically whether wrapper is omitted or explicitly undefined', async () => {
    const document = await parseMarkdown('# Title\n\nBody **text**')

    expect(renderToString(<MarkdownDocument value={document} />)).toBe(
      renderToString(
        <MarkdownDocument
          value={document}
          wrapper={undefined}
        />
      )
    )
  })

  it('keeps the className passthrough on the default div', async () => {
    const document = await parseMarkdown('Hello')
    const html = renderToString(
      <MarkdownDocument
        value={document}
        className="prose"
      />
    )

    expect(html).toContain('class="comark-content prose"')
  })

  it('renders a custom wrapper component instead of the div', async () => {
    const document = await parseMarkdown('Hello **world**')
    const html = renderToString(
      <MarkdownDocument
        value={document}
        wrapper={Section}
      />
    )

    expect(html).toContain('<section')
    expect(html).not.toContain('<div')
    expect(html).toContain('<strong>world</strong>')
  })

  it('hands the comark-content className to a custom wrapper', async () => {
    const document = await parseMarkdown('Hello')
    const html = renderToString(
      <MarkdownDocument
        value={document}
        wrapper={Section}
        className="prose"
      />
    )

    expect(html).toContain('class="comark-content prose"')
  })

  it('emits nodes bare when wrapper is false', async () => {
    const document = await parseMarkdown('Hello **world**')
    const html = renderToString(
      <MarkdownDocument
        value={document}
        wrapper={false}
      />
    )

    expect(html).not.toContain('comark-content')
    expect(html).not.toContain('<div')
    expect(html).toContain('<p>')
    expect(html).toContain('<strong>world</strong>')
  })

  it('renders an empty document with wrapper false without crashing', () => {
    const html = renderToString(
      <MarkdownDocument
        value={{ nodes: [], frontmatter: {}, meta: {} }}
        wrapper={false}
      />
    )

    expect(html).toBe('')
  })
})

describe('wrapper threading', () => {
  it('reaches MarkdownDocument through Markdown with a pre-parsed document', async () => {
    const document = await parseMarkdown('Hello **world**')
    const element = await Markdown({ value: document, wrapper: Section })
    const html = renderToString(element as React.ReactElement)

    expect(html).toContain('<section')
    expect(html).not.toContain('<div')
  })

  it('reaches MarkdownDocument through Markdown with a markdown string', async () => {
    const element = await Markdown({ value: 'Hello **world**', wrapper: Section })
    const html = renderToString(element as React.ReactElement)

    expect(html).toContain('<section')
    expect(html).not.toContain('<div')
  })

  it('reaches MarkdownDocument through MarkdownLive — the streaming path', async () => {
    const document = await parseMarkdown('Hello **world**')
    const html = renderToString(
      <MarkdownLive
        value={document}
        wrapper={Section}
      />
    )

    expect(html).toContain('<section')
    expect(html).not.toContain('<div')
  })
})
