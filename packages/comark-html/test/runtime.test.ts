// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHtml } from '../src/index'
import { initComarkRuntime } from '../src/runtime'

describe('initComarkRuntime', () => {
  let root: HTMLElement
  let teardown: (() => void) | undefined

  beforeEach(() => {
    root = document.createElement('div')
    document.body.appendChild(root)
  })

  afterEach(() => {
    teardown?.()
    root.remove()
  })

  it('updates [data-comark-bind] text nodes on input event', async () => {
    // SSR markers are emitted by resolveAttributes in non-parseJson mode
    root.innerHTML = [
      '<input data-comark-model-value="data.name" value="Alice" />',
      '<span data-comark-bind="data.name">Alice</span>',
    ].join('')

    teardown = initComarkRuntime(root)

    const input = root.querySelector('input') as HTMLInputElement
    input.value = 'Bob'
    input.dispatchEvent(new Event('input', { bubbles: true }))

    expect(root.querySelector('span')?.textContent).toBe('Bob')
  })

  it('updates on change event', async () => {
    root.innerHTML = [
      '<input type="checkbox" data-comark-model-checked="data.done" />',
      '<span data-comark-bind="data.done"></span>',
    ].join('')

    teardown = initComarkRuntime(root)

    const input = root.querySelector('input') as HTMLInputElement
    input.checked = true
    input.dispatchEvent(new Event('change', { bubbles: true }))

    expect(root.querySelector('span')?.textContent).toBe('true')
  })

  it('updates [data-comark-bind] for number input', async () => {
    root.innerHTML = [
      '<input type="number" data-comark-model-value="data.count" value="0" />',
      '<span data-comark-bind="data.count">0</span>',
    ].join('')

    teardown = initComarkRuntime(root)

    const input = root.querySelector('input') as HTMLInputElement
    input.value = '42'
    input.dispatchEvent(new Event('input', { bubbles: true }))

    expect(root.querySelector('span')?.textContent).toBe('42')
  })

  it('cleans up listeners on teardown', async () => {
    root.innerHTML = [
      '<input data-comark-model-value="data.x" value="initial" />',
      '<span data-comark-bind="data.x">initial</span>',
    ].join('')

    teardown = initComarkRuntime(root)
    teardown()
    teardown = undefined

    const input = root.querySelector('input') as HTMLInputElement
    input.value = 'changed'
    input.dispatchEvent(new Event('input', { bubbles: true }))

    // Should NOT have updated since teardown was called
    expect(root.querySelector('span')?.textContent).toBe('initial')
  })

  it('handles no root gracefully', () => {
    const result = initComarkRuntime(null)
    expect(typeof result).toBe('function')
    result()
  })
})

describe('HTML SSR markers', () => {
  it('emits data-comark-model-value marker for ::value bindings', async () => {
    const html = await renderHtml(':input{::value="data.name" type="text"}', {
      data: { name: 'initial' },
    })
    expect(html).toContain('data-comark-model-value="data.name"')
    expect(html).toContain('value="initial"')
  })

  it('markers are inert without the runtime (no JS side effects)', async () => {
    const html = await renderHtml(':input{::value="data.count" type="number"}', {
      data: { count: 5 },
    })
    // Markers present
    expect(html).toContain('data-comark-model-value="data.count"')
    // No runtime-only attributes
    expect(html).not.toContain('oninput')
    expect(html).not.toContain('onchange')
  })
})
