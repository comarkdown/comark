import { describe, expect, it, vi } from 'vitest'
import { createMarkdownParser } from '../src/parse'

const load = vi.hoisted(() => ({ fail: true }))
vi.mock('linkify-it', async (importOriginal) => {
  if (load.fail) {
    load.fail = false
    throw new Error('Failed to fetch dynamically imported module')
  }
  return importOriginal()
})

describe('linkify-it load failure', () => {
  it('retries the import on the next parse', async () => {
    const parse = createMarkdownParser()

    await expect(parse('https://comark.dev')).rejects.toThrow()
    const doc = await parse('https://comark.dev')

    expect(doc.nodes).toEqual([['p', {}, ['a', { href: 'https://comark.dev' }, 'https://comark.dev']]])
  })
})
