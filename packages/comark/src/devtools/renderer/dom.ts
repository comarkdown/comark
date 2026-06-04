/** DOM element factories for the Comark devtools panel */

/** Create the tab bar with buttons for each tab definition */
export function createTabBar(
  tabDefs: { id: string; label: string }[],
  activeTab: string,
  onSwitch: (tabId: string) => void
): { tabs: HTMLDivElement; tabButtons: HTMLButtonElement[] } {
  const tabs = document.createElement('div')
  tabs.className = 'comark-tabs'

  const tabButtons: HTMLButtonElement[] = []

  for (const tab of tabDefs) {
    const btn = document.createElement('button')
    btn.className = 'comark-tab'
    btn.textContent = tab.label
    btn.dataset.tab = tab.id
    btn.dataset.active = String(tab.id === activeTab)
    btn.addEventListener('click', () => onSwitch(tab.id))
    tabs.appendChild(btn)
    tabButtons.push(btn)
  }

  return { tabs, tabButtons }
}

/** Create the right-aligned section of the tab bar (instance dot + label) */
export function createTabRight(): {
  container: HTMLDivElement
  dot: HTMLElement
  label: HTMLElement
} {
  const container = document.createElement('div')
  container.className = 'comark-tab-right'

  const dot = document.createElement('span')
  dot.className = 'comark-instance-dot'
  dot.dataset.connected = 'false'
  container.appendChild(dot)

  const label = document.createElement('span')
  label.className = 'comark-instance-label'
  label.textContent = ''
  container.appendChild(label)

  return { container, dot, label }
}

/** Create the markdown editor with a transparent textarea overlaying a syntax-highlighted `<pre>` */
export function createEditor(
  onInput: () => void,
  onScroll: (scrollTop: number, scrollLeft: number) => void
): { wrap: HTMLDivElement; textarea: HTMLTextAreaElement; highlight: HTMLPreElement } {
  const wrap = document.createElement('div')
  wrap.className = 'comark-editor-wrap'

  const highlight = document.createElement('pre')
  highlight.className = 'comark-editor-highlight'
  highlight.setAttribute('aria-hidden', 'true')
  wrap.appendChild(highlight)

  const textarea = document.createElement('textarea')
  textarea.className = 'comark-editor'
  textarea.placeholder = 'Type markdown here...'
  textarea.value = ''
  textarea.spellcheck = false
  textarea.addEventListener('input', onInput)
  textarea.addEventListener('scroll', () => {
    onScroll(textarea.scrollTop, textarea.scrollLeft)
  })
  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      textarea.value = textarea.value.substring(0, start) + '  ' + textarea.value.substring(end)
      textarea.selectionStart = textarea.selectionEnd = start + 2
      onInput()
    }
  })
  wrap.appendChild(textarea)

  return { wrap, textarea, highlight }
}

/** Create the "Connecting to Comark…" loading spinner element */
export function createLoadingState(): HTMLDivElement {
  const el = document.createElement('div')
  el.className = 'comark-loading-state'
  el.innerHTML = [
    '<div class="comark-loading-spinner"></div>',
    '<p class="comark-loading-text">Connecting to Comark…</p>',
  ].join('')
  return el
}

/** Create the empty-state placeholder shown when no `<Comark>` instance is detected */
export function createEmptyState(): HTMLDivElement {
  const el = document.createElement('div')
  el.className = 'comark-empty-state'
  el.innerHTML = [
    '<div class="comark-empty-icon">',
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 212 212" width="48" height="48">',
    '<path stroke="currentColor" stroke-width="8" fill="none" d="M200.4 52.5v110H10.4v-110h190z"/>',
    '<path fill="currentColor" d="M129.4 94.8V75.5h19.9v19.3h-19.9zm0 44.7v-19.2h19.9v19.2h-19.9zm30.1-44.7V75.5h19.9v19.3h-19.9zm0 44.7v-19.2h19.9v19.2h-19.9zM31.4 141.5v-68h20l20 25 20-25h20v68h-20V102.5l-20 25-20-25v39z"/>',
    '</svg>',
    '</div>',
    '<p class="comark-empty-title">No <code>&lt;Comark&gt;</code> detected on the current page.</p>',
  ].join('')
  return el
}
