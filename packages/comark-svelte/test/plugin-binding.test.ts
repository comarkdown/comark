import { forCases } from '../../../test/fixtures/for'
import { describe, expect, it } from 'vitest'
import { render } from 'svelte/server'
import { parseMarkdown } from 'comark'
import MarkdownDocument from '../src/components/MarkdownDocument.svelte'
import binding, { Binding, For, If } from '../src/plugins/binding'
import { nestedIfCases, nestedIfMarkdown } from '../../../test/fixtures/if'

describe('@comark/svelte plugins/binding — If SSR', () => {
  it.each(nestedIfCases)('selects nested branches for $data', async ({ data, expected }) => {
    const value = await parseMarkdown(nestedIfMarkdown)
    const { body } = render(MarkdownDocument, { props: { value, components: { Binding, For, If }, data } })
    expect(body.replace(/<[^>]*>/g, '').trim()).toBe(expected)
  })
})

it.each(forCases)('For: $name', async ({ markdown, data, expected, absent }) => {
  const output = render(MarkdownDocument, {
    props: { value: await parseMarkdown(markdown, { plugins: [binding()] }), components: { Binding, For, If }, data },
  })
    .body.replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  for (const text of expected) expect(output).toContain(text)
  for (const text of absent) expect(output).not.toContain(text)
})
