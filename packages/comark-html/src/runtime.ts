/**
 * @comark/html progressive-enhancement runtime (~1KB, zero deps).
 *
 * Call `initComarkRuntime(root?)` once the DOM is ready. The runtime:
 * 1. Event-delegates `input` and `change` on the root element.
 * 2. Reads `data-comark-model-{prop}` attributes from the event target to
 *    discover the model path that controls that element's property.
 * 3. Writes the coerced value into the internal `createModelStore`.
 * 4. Patches all `[data-comark-bind]` text nodes that reference the same path.
 *
 * @example
 * ```html
 * <script type="module">
 *   import { initComarkRuntime } from '@comark/html/runtime'
 *   initComarkRuntime()
 * </script>
 * ```
 */

import { createModelStore } from 'comark/model'
import type { ComarkModel } from 'comark/model'
import { resolveModelElement } from 'comark/utils'

const MODEL_ATTR_PREFIX = 'data-comark-model-'
const BIND_ATTR = 'data-comark-bind'

function getCoercedValue(el: HTMLElement, prop: string): unknown {
  const tag = el.tagName.toLowerCase()
  const inputEl = el as HTMLInputElement
  const binding = resolveModelElement(tag, prop, { type: inputEl.type || 'text' })
  if (binding) return binding.coerce(inputEl)
  return inputEl.value
}

/**
 * Initialise the Comark progressive-enhancement runtime.
 *
 * @param root - Root element to scope event delegation to. Defaults to
 *   `document.body`.
 * @param model - Optional external `ComarkModel`. When omitted the runtime
 *   creates an internal uncontrolled store.
 * @returns Teardown function that removes the event listeners.
 */
export function initComarkRuntime(root?: Element | null, model?: ComarkModel): () => void {
  const target = root ?? (typeof document !== 'undefined' ? document.body : null)
  if (!target) return () => {}

  const el = target
  const store: ComarkModel = model ?? createModelStore()

  function updateBindNodes(path: string, value: unknown): void {
    const escaped = path.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
    const nodes = el.querySelectorAll(`[${BIND_ATTR}="${escaped}"]`)
    const text = value == null ? '' : String(value)
    nodes.forEach((node) => {
      node.textContent = text
    })
  }

  function handleEvent(e: Event): void {
    const targetEl = e.target as HTMLElement | null
    if (!targetEl) return

    for (const attr of Array.from(targetEl.attributes)) {
      if (!attr.name.startsWith(MODEL_ATTR_PREFIX)) continue
      const prop = attr.name.slice(MODEL_ATTR_PREFIX.length)
      const path = attr.value
      if (!path) continue

      const value = getCoercedValue(targetEl, prop)
      if (store.set(path, value)) {
        updateBindNodes(path, value)
      }
    }
  }

  el.addEventListener('input', handleEvent)
  el.addEventListener('change', handleEvent)

  return () => {
    el.removeEventListener('input', handleEvent)
    el.removeEventListener('change', handleEvent)
  }
}
