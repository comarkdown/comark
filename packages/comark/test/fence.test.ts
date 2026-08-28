import { describe, expect, it } from 'vitest'
import { pickFence } from '../src/internal/stringify/fence.ts'

describe('pickFence', () => {
  it('defaults to a 3-backtick fence for empty content', () => {
    expect(pickFence('')).toBe('```')
  })

  it('defaults to a 3-backtick fence when content has no fence runs', () => {
    expect(pickFence('hello\nworld')).toBe('```')
  })

  it('prefers the fence character with the shorter maximum run', () => {
    // Backticks present, no tildes → switch to tildes so content cannot close it
    expect(pickFence('```')).toBe('~~~')
    expect(pickFence('line\n````\nline')).toBe('~~~')
    expect(pickFence('`````')).toBe('~~~')

    // Tildes present, no backticks → stay on backticks
    expect(pickFence('~~~')).toBe('```')
    expect(pickFence('~~~~~')).toBe('```')
  })

  it('on a tie, prefers backticks one longer than the run', () => {
    expect(pickFence('```\n~~~')).toBe('````')
    expect(pickFence('````\n~~~~')).toBe('`````')
  })

  it('picks tildes when backticks need a longer fence', () => {
    // maxB=4, maxT=3 → '~' length 4
    expect(pickFence('````\n~~~')).toBe('~~~~')
    // maxB=4, maxT=3 → same
    expect(pickFence('~~~\n````')).toBe('~~~~')
  })

  it('picks backticks when tildes need a longer fence', () => {
    // maxB=3, maxT=5 → '`' length 4
    expect(pickFence('~~~~~\n```')).toBe('````')
  })

  it('only counts fence runs at the start of a line (up to 3 spaces)', () => {
    // maxB=3, maxT=4 → prefer backticks length 4
    expect(pickFence('  ```\n   ~~~~')).toBe('````')
    // 4+ leading spaces is indented code, not a fence closer candidate
    expect(pickFence('    ```\nhello')).toBe('```')
    // Mid-line runs must not influence the fence
    expect(pickFence('code with ``` inside\nand ~~~ too')).toBe('```')
  })

  it('uses the longest run of the chosen character, minimum 3', () => {
    // only short backtick runs; still length-3 tilde fence
    expect(pickFence('`\n``')).toBe('~~~')
    // maxB=4, maxT=0 → ~~~ (min 3, not maxT+1)
    expect(pickFence('`\n``\n```\n````')).toBe('~~~')
  })
})
