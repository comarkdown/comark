import { describe, expect, it } from 'vitest'
import { createMarkdownParser } from 'comark'
import { renderAnsiFromDocument } from '../src/index.ts'
import math, { Math } from '../src/plugins/math.ts'

describe('math plugin', () => {
  it('renders inline and block math through the ANSI handler', async () => {
    const parseMarkdown = createMarkdownParser({ plugins: [math()] })
    const document = await parseMarkdown('Inline $E = mc^2$ end.\n\n$$\n\\frac{-b}{2a}\n$$')

    const output = await renderAnsiFromDocument(document, {
      colors: false,
      components: { Math },
    })

    expect(output).toBe('Inline $E = mc^2$ end.\n\n$$\n\\frac{-b}{2a}\n$$\n')
  })
})
