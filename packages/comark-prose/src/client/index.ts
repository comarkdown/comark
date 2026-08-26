import { ProseCopyElement } from './copy.ts'
import { ProseTabsElement } from './tabs.ts'

export { ProseCopyElement, ProseTabsElement }

export interface RegisterOptions {
  /** Register `<prose-tabs>`. @default true */
  tabs?: boolean
  /** Register `<prose-copy>`. @default true */
  copy?: boolean
}

/**
 * Registers the `@comark/prose` custom elements. Safe to call multiple times and on the
 * server (no-op without `customElements`).
 *
 * @example
 * ```ts
 * import { register } from '@comark/prose/client'
 * register()
 * // or as a side-effect entry:
 * // import '@comark/prose/client/register'
 * ```
 */
export function register(options: RegisterOptions = {}): void {
  if (typeof customElements === 'undefined') return
  if (options.tabs !== false && !customElements.get('prose-tabs')) {
    customElements.define('prose-tabs', ProseTabsElement)
  }
  if (options.copy !== false && !customElements.get('prose-copy')) {
    customElements.define('prose-copy', ProseCopyElement)
  }
}
