import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderToString } from 'react-dom/server'
import { parse } from 'comark'
import { Comark, ComarkRenderer, Markdown, MarkdownDocument } from '../src/index'

describe('deprecated aliases', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    warnSpy.mockRestore()
  })

  it('Comark renders like Markdown and warns once', async () => {
    const element = await Comark({ value: 'Hello **world**' })
    const html = renderToString(element as React.ReactElement)
    expect(html).toContain('<strong>world</strong>')
    const calls = warnSpy.mock.calls.filter((c: unknown[]) => String(c[0]).includes('`Comark` is deprecated'))
    expect(calls.length).toBe(1)

    // Warning is one-time only
    await Comark({ value: 'again' })
    const callsAfter = warnSpy.mock.calls.filter((c: unknown[]) => String(c[0]).includes('`Comark` is deprecated'))
    expect(callsAfter.length).toBe(1)
  })

  it('Comark still accepts the deprecated markdown prop', async () => {
    const element = await Comark({ markdown: 'Hello **world**' })
    const html = renderToString(element as React.ReactElement)
    expect(html).toContain('<strong>world</strong>')
  })

  it('ComarkRenderer renders like MarkdownDocument with the deprecated tree prop', async () => {
    const tree = await parse('Hello **world**')
    const html = renderToString(<ComarkRenderer tree={tree} />)
    expect(html).toContain('<strong>world</strong>')
    expect(warnSpy.mock.calls.some((c: unknown[]) => String(c[0]).includes('`ComarkRenderer` is deprecated'))).toBe(
      true
    )
  })

  it('Markdown accepts value prop', async () => {
    const element = await Markdown({ value: 'Hello **world**' })
    const html = renderToString(element as React.ReactElement)
    expect(html).toContain('<strong>world</strong>')
  })

  it('MarkdownDocument accepts value prop', async () => {
    const tree = await parse('Hello **world**')
    const html = renderToString(<MarkdownDocument value={tree} />)
    expect(html).toContain('<strong>world</strong>')
  })
})
