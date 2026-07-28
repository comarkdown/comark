import { describe, expect, it } from 'vitest'
import { parse } from '../src/parse'

describe('misc', () => {
  it('ignore props with invalid chars, only /^[a-z0-9_-:]+$/gi', async () => {
    const tree = await parse(':Alert{id="1"" }')
    expect(tree.nodes).toEqual([['alert', { id: '1' }]])
  })
})
