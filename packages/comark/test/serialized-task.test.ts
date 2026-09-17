import { describe, it, expect } from 'vitest'
import { createSerializedTask } from '../src/utils/helpers.ts'

describe('createSerializedTask', () => {
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
