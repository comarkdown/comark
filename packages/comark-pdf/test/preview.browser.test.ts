import { describe, expect, it } from 'vitest'
import { renderPdf } from '../src/index.ts'
import { mount } from '../src/preview.ts'
import { BASIC_MARKDOWN } from './fixtures/markdown.ts'

const isPdf = (bytes: Uint8Array) =>
  Buffer.from(bytes.slice(0, 4)).toString('ascii') === '%PDF'

describe('mount', () => {
  it('basic — mounts a PDF as an iframe in the target element', async () => {
    const bytes = await renderPdf(BASIC_MARKDOWN)
    expect(isPdf(bytes)).toBe(true)

    const target = document.createElement('div')
    document.body.appendChild(target)

    const handle = mount(target, bytes)

    expect(target.querySelector('iframe')).not.toBeNull()
    const iframe = target.querySelector('iframe')!
    expect(iframe.src).toMatch(/^blob:/)

    handle.revoke()
  }, 15_000)

  it('replaces previous iframe on repeated mount calls', async () => {
    const bytes = await renderPdf('# Second mount')
    const target = document.createElement('div')
    document.body.appendChild(target)

    const h1 = mount(target, bytes)
    const h2 = mount(target, bytes)

    expect(target.querySelectorAll('iframe').length).toBe(1)

    h1.revoke()
    h2.revoke()
  }, 15_000)
})
