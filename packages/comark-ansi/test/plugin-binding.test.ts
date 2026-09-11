import { forCases } from '../../../test/fixtures/for'
import { describe, expect, it } from 'vitest'
import { parseMarkdown } from 'comark'
import { renderAnsiFromDocument } from '../src/render'
import binding, { Binding, For, If } from '../src/plugins/binding'
import { nestedIfCases, nestedIfMarkdown } from '../../../test/fixtures/if'

const parseWithBinding = (md: string) => parseMarkdown(md, { plugins: [binding()] })

describe('@comark/ansi plugins/binding — Binding handler', () => {
  it('resolves a `{{ path }}` binding against frontmatter', async () => {
    const tree = await parseWithBinding(`---
user:
  name: Ada
---

Hello {{ frontmatter.user.name }}!
`)
    const out = await renderAnsiFromDocument(tree, { colors: false, components: { binding: Binding } })
    expect(out).toContain('Hello Ada!')
  })

  it('resolves a `{{ path }}` binding from the `data` render option', async () => {
    const tree = await parseWithBinding('Score: {{ data.score }}')
    const out = await renderAnsiFromDocument(tree, {
      colors: false,
      components: { binding: Binding },
      data: { score: 42 },
    })
    expect(out).toContain('Score: 42')
  })

  it('falls back to `|| default` when the path does not resolve', async () => {
    const tree = await parseWithBinding('Hello {{ data.missing || guest }}!')
    const out = await renderAnsiFromDocument(tree, { colors: false, components: { binding: Binding } })
    expect(out).toContain('Hello guest!')
  })

  it('shows a dim placeholder when the path is unresolved and no default is set', async () => {
    const tree = await parseWithBinding('before-{{ missing.path }}-after')
    const plain = await renderAnsiFromDocument(tree, { colors: false, components: { binding: Binding } })
    expect(plain).toContain('before-{{ missing.path }}-after')

    const colored = await renderAnsiFromDocument(tree, { colors: true, components: { binding: Binding } })
    // Dim escape code sits around the placeholder.
    expect(colored).toContain('\x1B[2m{{ missing.path }}\x1B[0m')
  })
})

describe('@comark/ansi plugins/binding — If handler', () => {
  it.each(nestedIfCases)('selects nested branches for $data', async ({ data, expected }) => {
    const doc = await parseMarkdown(nestedIfMarkdown)
    const output = await renderAnsiFromDocument(doc, { components: { If }, data, colors: false })
    expect(output.trim()).toBe(expected)
  })

  it('renders comparison failures in the else slot with surrounding paragraphs', async () => {
    const doc = await parseMarkdown(
      'Before\n\n::if{:value="data.score" :gte="80" as="section"}\nPassed\n#else\nFailed\n::\n\nAfter'
    )
    const output = await renderAnsiFromDocument(doc, { components: { If }, data: { score: 70 }, colors: false })
    expect(output.trim()).toBe('Before\n\nFailed\n\nAfter')
  })

  it('renders only truthy branches', async () => {
    const tree = await parseMarkdown('Before\n\n::if{:value="data.score" :gte="80"}\nPassed\n::\n\nAfter')

    const passed = await renderAnsiFromDocument(tree, {
      colors: false,
      components: { If },
      data: { score: 90 },
    })
    const failed = await renderAnsiFromDocument(tree, {
      colors: false,
      components: { If },
      data: { score: 70 },
    })

    expect(passed).toContain('Before\n\nPassed\n\nAfter')
    expect(failed).toContain('Before\n\nAfter')
  })
})

it.each(forCases)('For: $name', async ({ markdown, data, expected, absent }) => {
  const output = (
    await renderAnsiFromDocument(await parseWithBinding(markdown), {
      components: { Binding, For, If },
      data,
      colors: false,
    })
  )
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  for (const text of expected) expect(output).toContain(text)
  for (const text of absent) expect(output).not.toContain(text)
})
