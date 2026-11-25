import { describe, expect, it, vi } from 'vitest'
import { codeToTokens } from 'shiki/core'
import { createMarkdownParser } from '../../src/index'
import highlight from '../../src/plugins/highlight'
import type { ElementNode } from '../../src/types'

vi.mock('shiki/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('shiki/core')>()
  return { ...actual, codeToTokens: vi.fn(actual.codeToTokens) }
})

describe('shiki while streaming', () => {
  it('tokenizes an unchanged fence once while later content streams, without sharing output nodes', async () => {
    const parse = createMarkdownParser({ plugins: [highlight()] })
    const source = (tail: string) => `\`\`\`ts\nconst a = 1\n\`\`\`\n\n${tail}`
    const before = vi.mocked(codeToTokens).mock.calls.length
    const first = await parse(source('a'), { streaming: true })
    expect(vi.mocked(codeToTokens).mock.calls.length).toBe(before + 1)
    // A later plugin or the caller editing the output must not leak into the next update.
    ;(first.nodes[0] as ElementNode)[1].class = 'edited'
    const second = await parse(source('ab'), { streaming: true })

    expect(vi.mocked(codeToTokens).mock.calls.length).toBe(before + 1)
    expect((second.nodes[0] as ElementNode)[1].class).toMatch(/^shiki /)
    expect(second.nodes[0]).not.toBe(first.nodes[0])
  })
})
