import { describe, expect, it } from 'vitest'
import type { ValueProvider } from '@angular/core'
import type { NodeTransform } from 'comark'
import { defineMarkdownComponent, defineMarkdownDocumentComponent } from '../src/define.ts'
import { MARKDOWN_CONFIG, MARKDOWN_DOCUMENT_CONFIG } from '../src/config.ts'

describe('defineMarkdownComponent', () => {
  it('returns a MARKDOWN_CONFIG provider with defaults and overrides', () => {
    const empty = defineMarkdownComponent() as ValueProvider
    expect(empty.provide).toBe(MARKDOWN_CONFIG)
    expect(empty.useValue).toMatchObject({ options: {}, plugins: [], components: {} })

    const plugin = { name: 'test', setup: () => {} }
    const transformNode: NodeTransform = () => undefined
    class FakeComponent {}
    const provider = defineMarkdownComponent({
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

describe('defineMarkdownDocumentComponent', () => {
  it('returns a MARKDOWN_DOCUMENT_CONFIG provider with defaults and overrides', () => {
    const empty = defineMarkdownDocumentComponent() as ValueProvider
    expect(empty.provide).toBe(MARKDOWN_DOCUMENT_CONFIG)
    expect(empty.useValue.components).toEqual({})

    const transformNode: NodeTransform = () => undefined
    class FakeComponent {}
    const provider = defineMarkdownDocumentComponent({
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
