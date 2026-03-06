import { describe, it, expect } from 'vitest'
import { parse } from '../src/index'
import { renderMarkdown } from '../src/string'

describe('MDC roundtrip', () => {
  const roundtrip = async (input: string) => {
    const ast = await parse(input)
    return renderMarkdown(ast)
  }

  describe('task list', () => {
    it('preserves checked and unchecked items', async () => {
      const input = `- [x] Todo done\n- [ ] Todo`

      const output = await roundtrip(input)
      expect(output).toBe(input)
    })
  })
})
