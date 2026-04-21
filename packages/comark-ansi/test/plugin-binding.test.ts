import { describe, expect, it } from 'vitest'
import { parse } from 'comark'
import { renderANSI } from '../src/render'
import binding, { Binding } from '../src/plugins/binding'

const parseWithBinding = (md: string) => parse(md, { plugins: [binding()] })

describe('@comark/ansi plugins/binding — Binding handler', () => {
  it('resolves a `{{ path }}` binding against frontmatter', async () => {
    const tree = await parseWithBinding(`---
user:
  name: Ada
---

Hello {{ frontmatter.user.name }}!
`)
    const out = await renderANSI(tree, { colors: false, components: { binding: Binding } })
    expect(out).toContain('Hello Ada!')
  })

  it('resolves a `{{ path }}` binding from the `data` render option', async () => {
    const tree = await parseWithBinding('Score: {{ data.score }}')
    const out = await renderANSI(tree, {
      colors: false,
      components: { binding: Binding },
      data: { score: 42 },
    })
    expect(out).toContain('Score: 42')
  })

  it('falls back to `|| default` when the path does not resolve', async () => {
    const tree = await parseWithBinding('Hello {{ data.missing || guest }}!')
    const out = await renderANSI(tree, { colors: false, components: { binding: Binding } })
    expect(out).toContain('Hello guest!')
  })

  it('shows a dim placeholder when the path is unresolved and no default is set', async () => {
    const tree = await parseWithBinding('before-{{ missing.path }}-after')
    const plain = await renderANSI(tree, { colors: false, components: { binding: Binding } })
    expect(plain).toContain('before-{{ missing.path }}-after')

    const colored = await renderANSI(tree, { colors: true, components: { binding: Binding } })
    // Dim escape code sits around the placeholder.
    expect(colored).toContain('\x1B[2m{{ missing.path }}\x1B[0m')
  })
})
