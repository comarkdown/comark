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
