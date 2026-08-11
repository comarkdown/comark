import { describe, expect, it } from 'vitest'
import { parseMarkdown } from '../../src/parse'
import math, { renderMath, validateMath } from '../../src/plugins/math'

describe('math plugin', () => {
  it('parses inline and display math without loading katex', async () => {
    const { nodes } = await parseMarkdown('Inline $x^2$ and display $$E = mc^2$$', {
      plugins: [math()],
    })

    expect(JSON.stringify(nodes)).toContain('math')
  })

  it('renders math lazily via katex', async () => {
    await expect(renderMath('E = mc^2', false)).resolves.toContain('katex')
  })

  it('validates math lazily via katex', async () => {
    await expect(validateMath('E = mc^2')).resolves.toBe(true)
    await expect(validateMath('\\invalid')).resolves.toBe(false)
  })
})
