import { describe, expect, it } from 'vitest'
import { parse } from '../src/index'

describe('parse - empty content', () => {
  it('should handle empty string', async () => {
    const content = ''
    const result = await parse(content)

    expect(result).toBeDefined()
    expect(result.nodes).toBeDefined()
    expect(Array.isArray(result.nodes)).toBe(true)
  })

  it('should handle whitespace only content', async () => {
    const content = '   \n\n\t  '
    const result = await parse(content)

    expect(result).toBeDefined()
    expect(result.nodes).toBeDefined()
    expect(Array.isArray(result.nodes)).toBe(true)
  })

  it('should handle newlines only', async () => {
    const content = '\n\n\n'
    const result = await parse(content)

    expect(result).toBeDefined()
    expect(result.nodes).toBeDefined()
    expect(Array.isArray(result.nodes)).toBe(true)
  })
})
