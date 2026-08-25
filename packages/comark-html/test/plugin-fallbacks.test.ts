import { describe, expect, it } from 'vitest'
import { Math } from '../src/plugins/math'
import { Mermaid } from '../src/plugins/mermaid'

describe('@comark/html plugin fallback escaping', () => {
  it('escapes raw math source when KaTeX throws', () => {
    // Deeply nested groups make KaTeX rethrow a RangeError even with
    // throwOnError: false — the catch branch must not emit raw markup.
    const content = '<img src=x onerror=alert(1)>' + '{'.repeat(50_000)
    const html = Math(['math', { class: 'math inline', content }] as any)
    expect(html).not.toContain('<img src=x onerror=alert(1)>')
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;')
  })

  it('escapes raw mermaid source when rendering fails', () => {
    const content = '</pre><img src=x onerror=alert(1)>'
    const html = Mermaid(['mermaid', { content }] as any)
    expect(html).not.toContain('<img src=x onerror=alert(1)>')
    expect(html).toContain('&lt;/pre&gt;&lt;img src=x onerror=alert(1)&gt;')
  })
})
