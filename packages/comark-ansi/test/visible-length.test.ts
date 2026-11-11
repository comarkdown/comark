import { describe, it, expect } from 'vitest'
import { padEndVisible, visibleLength } from '../src/utils/escape'

describe('visibleLength', () => {
  it.each([
    ['plain ASCII', 'hello', 5],
    ['CJK', '東京', 4],
    ['precomposed が', 'が', 2],
    ['か + U+3099', 'か\u3099', 2],
    ['e + U+0301', 'e\u0301', 1],
    ['e + U+3099', 'e\u3099', 1],
    ['a + U+302A', 'a\u302A', 1],
    ['lone U+3099', '\u3099', 0],
    ['lone U+302A', '\u302A', 0],
    ['emoji', '✅', 2],
    ['heart + VS16', '❤️', 2],
    ['keycap', '1️⃣', 2],
    ['flag', '🇯🇵', 2],
    ['ZWJ sequence', '👩‍💻', 2],
    ['ANSI codes ignored', '\x1B[1m東\x1B[0m', 2],
  ])('%s', (_, text, expected) => {
    expect(visibleLength(text)).toBe(expected)
  })
})

describe('padEndVisible', () => {
  it('pads a narrow base with a CJK-range combining mark as one column', () => {
    expect(padEndVisible('e\u3099', 3)).toBe('e\u3099  ')
  })
})
