import { describe, it, expect } from 'vitest'
import { parseMarkdown } from 'comark'
import { renderAnsiFromDocument } from '../src/index'
import { stripControlChars } from '../src/utils/escape'

async function renderAnsiFromMarkdown(markdown: string, options?: Parameters<typeof renderAnsiFromDocument>[1]) {
  const tree = await parseMarkdown(markdown)
  return renderAnsiFromDocument(tree, options)
}

const plain = (markdown: string) => renderAnsiFromMarkdown(markdown, { colors: false })

describe('control character sanitization', () => {
  it('strips ANSI escape sequences from text content', async () => {
    const out = await plain('safe \x1B[2J\x1B[H done')
    expect(out).not.toContain('\x1B')
    expect(out).toContain('safe')
    expect(out).toContain('done')
  })

  it('strips OSC sequences from code block content', async () => {
    const md =
      '```\n' +
      String.fromCharCode(27) +
      ']8;;https://evil.com' +
      String.fromCharCode(7) +
      'click' +
      String.fromCharCode(27) +
      ']8;;' +
      String.fromCharCode(7) +
      '\n```'
    const out = await plain(md)
    expect(out).not.toContain(String.fromCharCode(27))
    expect(out).not.toContain(String.fromCharCode(7))
  })

  it('strips escape characters from link hrefs', async () => {
    const out = await plain('[x](https://example.com/\x1B)')
    expect(out).not.toContain('\x1B')
  })

  it('strips C1 control characters', async () => {
    const out = await plain('a\u009Bb')
    expect(out).not.toContain('\u009B')
    expect(out).toContain('ab')
  })

  it('keeps newlines and tabs intact', () => {
    expect(stripControlChars('a\tb\nc')).toBe('a\tb\nc')
  })
})
