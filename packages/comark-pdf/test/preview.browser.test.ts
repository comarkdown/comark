import { describe, expect, it } from 'vitest'
import { paginate } from '../src/preview.ts'

const PAGE_CSS = '@page { size: A4; margin: 20mm; }'
const BASIC_BODY = '<article><h1>PDF Preview</h1><p>Hello World paragraph.</p></article>'
const ADVANCED_BODY = `
  <article>
    <h1>Advanced Preview</h1>
    <p>First paragraph of content for the advanced paged.js test.</p>
    <h2>Section B</h2>
    <p>Second paragraph of content to verify stylesheet injection.</p>
    <pre><code>const x = 42</code></pre>
  </article>
`

describe('paginate', () => {
  it('basic — paginates explicit HTML and returns a page flow', async () => {
    const target = document.createElement('div')
    document.body.appendChild(target)

    const flow = await paginate(target, [PAGE_CSS], BASIC_BODY)

    expect(flow).toBeDefined()
    expect(typeof flow.total).toBe('number')
    expect(flow.total).toBeGreaterThanOrEqual(1)
  }, 15_000)

  it('advanced — accepts additional stylesheets and still returns a flow', async () => {
    const target = document.createElement('div')
    document.body.appendChild(target)

    const flow = await paginate(
      target,
      [PAGE_CSS, 'body { font-size: 12pt; font-family: serif; }'],
      ADVANCED_BODY,
    )

    expect(typeof flow.total).toBe('number')
    expect(flow.total).toBeGreaterThanOrEqual(1)
  }, 15_000)
})
