import { describe, expect, it } from 'vitest'
import { render } from 'svelte/server'
import { parseMarkdown } from 'comark'
import MarkdownDocument from '../src/components/MarkdownDocument.svelte'
import { If } from '../src/plugins/binding'
import { nestedIfCases, nestedIfMarkdown } from '../../../test/fixtures/if'

describe('@comark/svelte plugins/binding — If SSR', () => {
  it.each(nestedIfCases)('selects nested branches for $data', async ({ data, expected }) => {
    const value = await parseMarkdown(nestedIfMarkdown)
    const { body } = render(MarkdownDocument, { props: { value, components: { If }, data } })
    expect(body.replace(/<[^>]*>/g, '').trim()).toBe(expected)
  })
})

describe('@comark/svelte prop interpolation SSR', () => {
  it('resolves `{{ path }}` placeholders in :href', async () => {
    const value = await parseMarkdown('Go :a[Docs]{:href="/d/{{ data.id }}"}')
    const { body } = render(MarkdownDocument, { props: { value, data: { id: 7 } } })
    expect(body).toContain('href="/d/7"')
  })

  it('omits a rejected URL while keeping the link text', async () => {
    const value = await parseMarkdown(':a[x]{:href="{{ data.url }}"}')
    const bad = render(MarkdownDocument, { props: { value, data: { url: 'javascript:alert(1)' } } }).body
    expect(bad).not.toContain('javascript:')
    expect(bad).not.toContain('href')
    expect(bad.replace(/<!--.*?-->/g, '')).toContain('<a>x</a>')
    const ok = render(MarkdownDocument, { props: { value, data: { url: '/ok' } } }).body
    expect(ok).toContain('href="/ok"')
  })
})
