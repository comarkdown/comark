import { describe, expect, it } from 'vitest'
import type { ValueProvider } from '@angular/core'
import type { NodeTransform } from 'comark'
import { provideMarkdown, provideMarkdownDocument } from '../src/provider.ts'
import { MARKDOWN_CONFIG, MARKDOWN_DOCUMENT_CONFIG } from '../src/config.ts'

describe('provideMarkdown', () => {
  it('returns a MARKDOWN_CONFIG provider with defaults and overrides', () => {
    const empty = provideMarkdown() as ValueProvider
    expect(empty.provide).toBe(MARKDOWN_CONFIG)
    expect(empty.useValue).toMatchObject({ options: {}, plugins: [], components: {} })

    const plugin = { name: 'test', setup: () => {} }
    const transformNode: NodeTransform = () => undefined
    class FakeComponent {}
    const provider = provideMarkdown({
      plugins: [plugin as any],
      components: { alert: FakeComponent },
      class: 'prose',
      autoClose: true,
      transformNode,
    }) as ValueProvider

    expect(provider.provide).toBe(MARKDOWN_CONFIG)
    expect(provider.useValue).toEqual({
      options: { autoClose: true },
      plugins: [plugin],
      components: { alert: FakeComponent },
      transformNode,
      class: 'prose',
    })
  })
})

describe('provideMarkdownDocument', () => {
  it('returns a MARKDOWN_DOCUMENT_CONFIG provider with defaults and overrides', () => {
    const empty = provideMarkdownDocument() as ValueProvider
    expect(empty.provide).toBe(MARKDOWN_DOCUMENT_CONFIG)
    expect(empty.useValue.components).toEqual({})

    const transformNode: NodeTransform = () => undefined
    class FakeComponent {}
    const provider = provideMarkdownDocument({
      components: { Math: FakeComponent },
      class: 'prose',
      transformNode,
    }) as ValueProvider

    expect(provider.provide).toBe(MARKDOWN_DOCUMENT_CONFIG)
    expect(provider.useValue).toEqual({
      components: { Math: FakeComponent },
      class: 'prose',
      transformNode,
    })
  })
})
