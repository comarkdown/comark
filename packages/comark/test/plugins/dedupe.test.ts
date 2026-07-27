import { describe, expect, it } from 'vitest'
import { defineComarkPlugin, parse } from 'comark'

describe('duplicate plugins', () => {
  it('ignores duplicate plugins by name', async () => {
    let callCount = 0
    const counter = defineComarkPlugin(() => ({
      name: 'test-counter',
      post(state) {
        callCount++
        state.tree.meta.count = callCount
      },
    }))

    const tree = await parse('# Hello', {
      plugins: [counter(), counter()],
    })

    expect(callCount).toBe(1)
    expect(tree.meta.count).toBe(1)
  })

  it('keeps the first plugin when duplicates are provided', async () => {
    const valuePlugin = defineComarkPlugin<{ value: number }, { value: number }>((opts) => ({
      name: 'test-value',
      post(state) {
        state.tree.meta.value = opts?.value
      },
    }))

    const tree = await parse('# Hello', {
      plugins: [valuePlugin({ value: 1 }), valuePlugin({ value: 2 })],
    })

    expect(tree.meta.value).toBe(1)
  })
})
