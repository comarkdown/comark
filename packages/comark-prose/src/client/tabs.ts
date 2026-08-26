const STORAGE_PREFIX = 'prose-tabs:'
const SYNC_EVENT = 'prose-tabs:sync'

/**
 * `<prose-tabs>` — upgrades the ARIA tablist markup emitted by the `prose` plugin.
 *
 * Wires clicks, WAI-APG keyboard navigation (arrows, Home/End, automatic activation),
 * and cross-instance group sync: instances sharing a `data-sync` key follow each other's
 * selection by tab label, persisted in `localStorage`.
 *
 * Works with streamed content: a MutationObserver rebinds when panels are appended.
 * Without this element defined, the stylesheet reveals all panels stacked.
 */
export class ProseTabsElement extends HTMLElement {
  private observer: MutationObserver | undefined
  private syncListener: ((event: Event) => void) | undefined

  connectedCallback(): void {
    this.addEventListener('click', this)
    this.addEventListener('keydown', this)

    this.observer = new MutationObserver(() => this.applyStoredSync())
    this.observer.observe(this, { childList: true, subtree: true })

    const key = this.syncKey
    if (key) {
      this.syncListener = (event: Event) => {
        const detail = (event as CustomEvent<{ key: string; label: string }>).detail
        if (detail.key === key) this.selectByLabel(detail.label)
      }
      window.addEventListener(SYNC_EVENT, this.syncListener)
    }
    this.applyStoredSync()
  }

  disconnectedCallback(): void {
    this.removeEventListener('click', this)
    this.removeEventListener('keydown', this)
    this.observer?.disconnect()
    if (this.syncListener) window.removeEventListener(SYNC_EVENT, this.syncListener)
  }

  handleEvent(event: Event): void {
    if (event.type === 'click') this.onClick(event as MouseEvent)
    else if (event.type === 'keydown') this.onKeydown(event as KeyboardEvent)
  }

  private get syncKey(): string | null {
    return this.getAttribute('data-sync')
  }

  private get tabs(): HTMLElement[] {
    return Array.from(this.querySelectorAll<HTMLElement>(':scope > [role="tablist"] > [role="tab"]'))
  }

  private onClick(event: MouseEvent): void {
    const tab = (event.target as HTMLElement | null)?.closest<HTMLElement>('[role="tab"]')
    if (!tab || !this.contains(tab)) return
    this.select(this.tabs.indexOf(tab), { store: true })
  }

  private onKeydown(event: KeyboardEvent): void {
    const tab = (event.target as HTMLElement | null)?.closest<HTMLElement>('[role="tab"]')
    if (!tab || !this.contains(tab)) return

    const tabs = this.tabs
    const current = tabs.indexOf(tab)
    let next: number
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (current + 1) % tabs.length
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (current - 1 + tabs.length) % tabs.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = tabs.length - 1
    else return

    event.preventDefault()
    this.select(next, { focus: true, store: true })
  }

  private selectByLabel(label: string): void {
    const index = this.tabs.findIndex((tab) => tab.textContent?.trim() === label)
    if (index !== -1) this.select(index)
  }

  private applyStoredSync(): void {
    const key = this.syncKey
    if (!key) return
    try {
      const stored = window.localStorage.getItem(STORAGE_PREFIX + key)
      if (stored) this.selectByLabel(stored)
    } catch {
      // Storage can be unavailable (sandboxed iframes, privacy modes) — selection still works.
    }
  }

  private select(index: number, options: { focus?: boolean; store?: boolean } = {}): void {
    const tabs = this.tabs
    const selected = tabs[index]
    if (!selected) return

    for (const tab of tabs) {
      const active = tab === selected
      tab.setAttribute('aria-selected', active ? 'true' : 'false')
      if (active) tab.removeAttribute('tabindex')
      else tab.setAttribute('tabindex', '-1')

      const panel = tab.getAttribute('aria-controls')
      const panelEl = panel ? this.querySelector<HTMLElement>(`[role="tabpanel"][id="${panel}"]`) : null
      if (panelEl) panelEl.toggleAttribute('hidden', !active)
    }

    if (options.focus) selected.focus()

    const key = this.syncKey
    if (options.store && key) {
      const label = selected.textContent?.trim() ?? ''
      try {
        window.localStorage.setItem(STORAGE_PREFIX + key, label)
      } catch {
        // Ignore storage failures — sync still works for the current page.
      }
      window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: { key, label } }))
    }
  }
}
