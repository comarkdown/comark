import { describe, expect, it, vi } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { parseMarkdown } from 'comark'
import { defineMarkdownComponent, defineMarkdownDocumentComponent } from '../src/index'

async function render(component: any, props: Record<string, any> = {}) {
  const app = createSSRApp({
    setup() {
      return () => h(component, props)
    },
  })
  return renderToString(app as any)
}

describe('defineMarkdownComponent props', () => {
  it('accepts a pre-parsed document without a type warning', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const Custom = defineMarkdownComponent({ name: 'Custom' })
    const document = await parseMarkdown('Hello **world**')

    const html = await render(Custom, { value: document })

    expect(html).toContain('<strong>world</strong>')
    const typeWarnings = warn.mock.calls.filter((call) => String(call[0]).includes('type check failed'))
    expect(typeWarnings).toEqual([])
    warn.mockRestore()
  })

  it('still renders a string value', async () => {
    const Custom = defineMarkdownComponent({ name: 'Custom' })
    expect(await render(Custom, { value: 'Hello **world**' })).toContain('<strong>world</strong>')
  })

  it('forwards data to the renderer', async () => {
    const Custom = defineMarkdownComponent({ name: 'Custom' })
    const html = await render(Custom, {
      value: 'Value is :span{:text="data.answer"}',
      data: { answer: '42' },
    })
    expect(html).toContain('42')
  })

  it('forwards documentKey through to MarkdownDocument', async () => {
    const Custom = defineMarkdownComponent({ name: 'Custom' })
    // The prop must be declared, otherwise it silently falls through as an attr.
    expect(Object.keys((Custom as any).props)).toContain('documentKey')
    expect(await render(Custom, { value: 'Hi', documentKey: 'doc-1' })).toContain('Hi')
  })

  it('keeps config options and per-instance options merged', async () => {
    const Custom = defineMarkdownComponent({ name: 'Custom', unwrap: 'p' })
    const html = await render(Custom, { value: 'Hello **world**' })
    expect(html).not.toContain('<p>')
    expect(html).toContain('<strong>world</strong>')
  })
})

describe('defineMarkdownDocumentComponent props', () => {
  it('forwards data and documentKey', async () => {
    const Custom = defineMarkdownDocumentComponent({ name: 'CustomDocument' })
    expect(Object.keys((Custom as any).props)).toContain('data')
    expect(Object.keys((Custom as any).props)).toContain('documentKey')

    const document = await parseMarkdown('Value is :span{:text="data.answer"}')
    const html = await render(Custom, { value: document, data: { answer: '42' } })
    expect(html).toContain('42')
  })
})
