// @vitest-environment happy-dom
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { register } from '../src/client/index'

const TABS_HTML = (id: string, sync = '') => `
<prose-tabs class="prose-tabs"${sync ? ` data-sync="${sync}"` : ''}>
  <div role="tablist" class="prose-tabs-list">
    <button type="button" role="tab" id="${id}-t0" class="prose-tab" aria-controls="${id}-p0" aria-selected="true">npm</button>
    <button type="button" role="tab" id="${id}-t1" class="prose-tab" aria-controls="${id}-p1" aria-selected="false" tabindex="-1">pnpm</button>
  </div>
  <section role="tabpanel" id="${id}-p0" class="prose-tab-panel" aria-labelledby="${id}-t0"><p>npm install</p></section>
  <section role="tabpanel" id="${id}-p1" class="prose-tab-panel" aria-labelledby="${id}-t1" hidden><p>pnpm add</p></section>
</prose-tabs>`

const COPY_HTML = `
<figure class="prose-pre">
  <prose-copy class="prose-copy"><button type="button" class="prose-copy-button" aria-label="Copy code"></button></prose-copy>
  <pre><code>const a = 1</code></pre>
</figure>`

function tabsOf(root: Element): HTMLElement[] {
  return Array.from(root.querySelectorAll('[role="tab"]'))
}

beforeAll(() => {
  register()
  // Node's experimental `localStorage` global keeps happy-dom from installing its own —
  // provide a memory-backed stand-in so persistence is testable.
  const store = new Map<string, string>()
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, value),
      removeItem: (key: string) => void store.delete(key),
      clear: () => store.clear(),
    },
  })
})

beforeEach(() => {
  document.body.innerHTML = ''
  window.localStorage.clear()
})

describe('register', () => {
  it('defines both elements and is idempotent', () => {
    expect(customElements.get('prose-tabs')).toBeDefined()
    expect(customElements.get('prose-copy')).toBeDefined()
    expect(() => register()).not.toThrow()
  })
})

describe('<prose-tabs>', () => {
  it('switches panels on click', () => {
    document.body.innerHTML = TABS_HTML('a')
    const root = document.querySelector('prose-tabs')!
    const [first, second] = tabsOf(root)

    second!.click()
    expect(second!.getAttribute('aria-selected')).toBe('true')
    expect(second!.hasAttribute('tabindex')).toBe(false)
    expect(first!.getAttribute('aria-selected')).toBe('false')
    expect(first!.getAttribute('tabindex')).toBe('-1')
    expect(root.querySelector('#a-p1')!.hasAttribute('hidden')).toBe(false)
    expect(root.querySelector('#a-p0')!.hasAttribute('hidden')).toBe(true)
  })

  it('supports arrow keys, Home and End with automatic activation', () => {
    document.body.innerHTML = TABS_HTML('a')
    const root = document.querySelector('prose-tabs')!
    const [first, second] = tabsOf(root)

    first!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    expect(second!.getAttribute('aria-selected')).toBe('true')

    second!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    expect(first!.getAttribute('aria-selected')).toBe('true') // wraps around

    first!.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }))
    expect(second!.getAttribute('aria-selected')).toBe('true')

    second!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }))
    expect(first!.getAttribute('aria-selected')).toBe('true')
  })

  it('syncs selection across instances sharing a data-sync key', () => {
    document.body.innerHTML = TABS_HTML('a', 'pkg') + TABS_HTML('b', 'pkg') + TABS_HTML('c')
    const [groupA, groupB, groupC] = Array.from(document.querySelectorAll('prose-tabs'))

    tabsOf(groupA!)[1]!.click()
    expect(tabsOf(groupB!)[1]!.getAttribute('aria-selected')).toBe('true')
    expect(tabsOf(groupC!)[1]!.getAttribute('aria-selected')).toBe('false')
    expect(window.localStorage.getItem('prose-tabs:pkg')).toBe('pnpm')
  })

  it('applies the stored selection on connect', async () => {
    window.localStorage.setItem('prose-tabs:pkg', 'pnpm')
    document.body.innerHTML = TABS_HTML('a', 'pkg')
    // connectedCallback can fire before children are parsed; the MutationObserver
    // re-applies the stored selection asynchronously.
    await new Promise((resolve) => setTimeout(resolve))
    const tabs = tabsOf(document.querySelector('prose-tabs')!)
    expect(tabs[1]!.getAttribute('aria-selected')).toBe('true')
  })
})

describe('<prose-copy>', () => {
  it('copies the code text and flips data-copied', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })

    document.body.innerHTML = COPY_HTML
    const copy = document.querySelector('prose-copy')!
    copy.querySelector('button')!.click()

    expect(writeText).toHaveBeenCalledWith('const a = 1')
    await Promise.resolve()
    expect(copy.hasAttribute('data-copied')).toBe(true)
    expect(copy.querySelector('[role="status"]')!.textContent).toBe('Copied')
  })
})
