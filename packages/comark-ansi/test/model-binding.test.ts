import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest'
import { parseMarkdown } from 'comark'
import { renderAnsiFromDocument } from '../src/index'

describe('ANSI two-way binding degrade', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders ::value as read-only (resolves from data, no error)', async () => {
    const doc = await parseMarkdown(':span{::value="data.name"}', {
      data: { name: 'Alice' },
    })
    const output = await renderAnsiFromDocument(doc, { colors: false, data: { name: 'Alice' } })
    expect(typeof output).toBe('string')
  })

  it('emits at most one dev warning per process for ::prop usage', async () => {
    const doc = await parseMarkdown(':input{::value="data.x"}')
    await renderAnsiFromDocument(doc, { colors: false })
    await renderAnsiFromDocument(doc, { colors: false })
    await renderAnsiFromDocument(doc, { colors: false })

    const twoWayCalls = warnSpy.mock.calls.filter((args) => String(args[0]).includes('Two-way binding'))
    // At most 1 warning (singleton guard ensures no repeated noise)
    expect(twoWayCalls.length).toBeLessThanOrEqual(1)
  })

  it('does not warn for documents without ::prop', async () => {
    // This test uses only single-colon one-way binding
    const doc = await parseMarkdown(':span{:data-id="data.id"}', {
      data: { id: '123' },
    })
    const output = await renderAnsiFromDocument(doc, { colors: false, data: { id: '123' } })
    expect(typeof output).toBe('string')
    const twoWayCalls = warnSpy.mock.calls.filter((args) => String(args[0]).includes('Two-way binding'))
    // No two-way warning for one-way-only documents (guard fires only on :: keys)
    expect(twoWayCalls.length).toBe(0)
  })
})
