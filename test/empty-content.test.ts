import { describe, expect, it } from 'vitest'
import { parse } from '../src/index'

describe('parse - empty content', () => {
  it('should handle empty string', () => {
    const content = ''
    const result = parse(content)

    expect(result).toBeDefined()
    expect(result.body).toBeDefined()
    expect(result.body.type).toBe('minimark')
  })

  it('should handle whitespace only content', () => {
    const content = '   \n\n\t  '
    const result = parse(content)

    expect(result).toBeDefined()
    expect(result.body).toBeDefined()
    expect(result.body.type).toBe('minimark')
  })

  it('should handle newlines only', () => {
    const content = '\n\n\n'
    const result = parse(content)

    expect(result).toBeDefined()
    expect(result.body).toBeDefined()
    expect(result.body.type).toBe('minimark')
  })
})
