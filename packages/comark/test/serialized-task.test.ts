import { describe, it, expect } from 'vitest'
import { createSerializedTask } from '../src/utils/helpers.ts'

const tick = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

describe('createSerializedTask', () => {
  it('runs calls strictly one at a time', async () => {
    const order: string[] = []
    const task = createSerializedTask(async (name: string, delay: number) => {
      await tick(delay)
      order.push(name)
      return name
    })

    const slow = task('slow', 20)
    const fast = task('fast', 0)

    await Promise.all([slow, fast])

    expect(order).toEqual(['slow', 'fast'])
  })

  it('rejects the caller instead of resolving null', async () => {
    const task = createSerializedTask(async () => {
      throw new Error('boom')
    })

    await expect(task()).rejects.toThrow('boom')
  })

  it('keeps running after a rejection', async () => {
    let calls = 0
    const task = createSerializedTask(async () => {
      calls++
      if (calls === 1) throw new Error('boom')
      return calls
    })

    await expect(task()).rejects.toThrow('boom')
    await expect(task()).resolves.toBe(2)
  })
})
