import { describe, expect, it, vi } from 'vitest'
import type { ComarkPlugin } from '../../src/types'
import { createSerializedMarkdownParser } from '../../src/parse'
import { createSerializedTask } from '../../src/utils/helpers'

describe('createSerializedTask', () => {
  it('runs tasks one at a time and preserves results', async () => {
    let active = 0
    let maxActive = 0
    const { promise: gate, resolve: release } = Promise.withResolvers<void>()

    const run = createSerializedTask(async (label: string) => {
      active++
      maxActive = Math.max(maxActive, active)
      if (label === 'slow') await gate
      active--
      return label
    })

    const first = run('slow')
    const second = run('fast')
    release()

    await expect(first).resolves.toBe('slow')
    await expect(second).resolves.toBe('fast')
    expect(maxActive).toBe(1)
  })

  it('propagates rejections without breaking the queue', async () => {
    const run = createSerializedTask(async (shouldFail: boolean) => {
      if (shouldFail) throw new Error('boom')
      return 'ok'
    })

    await expect(run(true)).rejects.toThrow('boom')
    await expect(run(false)).resolves.toBe('ok')
  })
})

describe('createSerializedMarkdownParser', () => {
  it('propagates plugin errors and keeps the queue usable', async () => {
    let shouldFail = true
    const failPlugin: ComarkPlugin = {
      name: 'maybe-fail',
      async pre() {
        if (shouldFail) throw new Error('Plugin failed')
      },
    }
    const parse = createSerializedMarkdownParser({
      plugins: [failPlugin],
    })

    await expect(parse('hello')).rejects.toThrow('Plugin failed')
    shouldFail = false
    await expect(parse('# ok')).resolves.toMatchObject({
      nodes: [['h1', expect.any(Object), 'ok']],
    })
  })

  it('serializes overlapping stream updates', async () => {
    const order: string[] = []
    const { promise: gate, resolve: release } = Promise.withResolvers<void>()
    const orderPlugin: ComarkPlugin = {
      name: 'order',
      async pre(state) {
        order.push(`start:${state.markdown}`)
        if (state.markdown === 'Slow') await gate
        order.push(`end:${state.markdown}`)
      },
    }
    const parse = createSerializedMarkdownParser({
      plugins: [orderPlugin],
    })

    const first = parse('Slow', { streaming: true })
    const second = parse('Fast', { streaming: true })
    // Second must not start until first finishes.
    await vi.waitFor(() => expect(order).toEqual(['start:Slow']))
    release()
    await first
    await second
    expect(order).toEqual(['start:Slow', 'end:Slow', 'start:Fast', 'end:Fast'])
  })
})
