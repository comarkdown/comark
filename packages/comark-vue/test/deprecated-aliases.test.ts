import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createSSRApp, defineComponent, h, Suspense } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { parseMarkdown } from 'comark'
import { Comark, ComarkRenderer, Markdown, MarkdownDocument } from '../src/index'

function renderInSuspense(component: any, props: Record<string, unknown>) {
  const app = createSSRApp(
    defineComponent({
      setup() {
        return () => h(Suspense, null, { default: () => h(component, props) })
      },
    })
  )
  return renderToString(app)
}

describe('deprecated aliases', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    warnSpy.mockRestore()
  })

  it('Comark renders like Markdown and warns once', async () => {
    const html = await renderInSuspense(Comark, { value: 'Hello **world**' })
    expect(html).toContain('<strong>world</strong>')
    const calls = warnSpy.mock.calls.filter((c: unknown[]) => String(c[0]).includes('`Comark` is deprecated'))
    expect(calls.length).toBe(1)

    // Warning is one-time only
    await renderInSuspense(Comark, { value: 'again' })
    const callsAfter = warnSpy.mock.calls.filter((c: unknown[]) => String(c[0]).includes('`Comark` is deprecated'))
    expect(callsAfter.length).toBe(1)
  })

  it('Comark still accepts the deprecated markdown prop', async () => {
    const html = await renderInSuspense(Comark, { markdown: 'Hello **world**' })
    expect(html).toContain('<strong>world</strong>')
  })

  it('ComarkRenderer renders like MarkdownDocument with the deprecated tree prop', async () => {
    const tree = await parseMarkdown('Hello **world**')
    const html = await renderInSuspense(ComarkRenderer, { tree })
    expect(html).toContain('<strong>world</strong>')
    expect(warnSpy.mock.calls.some((c: unknown[]) => String(c[0]).includes('`ComarkRenderer` is deprecated'))).toBe(
      true
    )
  })

  it('Markdown accepts value prop', async () => {
    const html = await renderInSuspense(Markdown, { value: 'Hello **world**' })
    expect(html).toContain('<strong>world</strong>')
  })

  it('MarkdownDocument accepts value prop', async () => {
    const tree = await parseMarkdown('Hello **world**')
    const html = await renderInSuspense(MarkdownDocument, { value: tree })
    expect(html).toContain('<strong>world</strong>')
  })
})
