import type { DockClientScriptContext } from '@vitejs/devtools-kit/client'
import type { ComarkInstanceSummary, ComarkTree, ViewState, Theme } from '../types.ts'
import { STYLES } from './styles.ts'
import { applyTheme, createThemeToggle } from './theme.ts'
import { renderAST, highlightMarkdown } from './output.ts'
import { createTabBar, createTabRight, createEditor, createLoadingState, createEmptyState } from './dom.ts'

const TAB_DEFS = [
  { id: 'markdown', label: 'Markdown' },
  { id: 'ast', label: 'AST' },
] as const

const POLL_INTERVAL_MS = 1500
const PARSE_DEBOUNCE_MS = 300

/**
 * Manages the Comark devtools panel lifecycle, state, and DOM.
 *
 * Handles tab switching, instance polling, markdown editing with
 * live parsing via RPC, and AST visualization.
 */
export class DevtoolsPanel {
  private ctx: DockClientScriptContext

  // DOM refs
  private rootEl!: HTMLElement
  private contentEl!: HTMLElement
  private editor!: HTMLTextAreaElement
  private editorHighlight!: HTMLPreElement
  private editorWrap!: HTMLDivElement
  private instanceDot!: HTMLElement
  private instanceLabel!: HTMLElement
  private loadingEl!: HTMLDivElement
  private emptyState!: HTMLDivElement
  private tabButtons: HTMLButtonElement[] = []

  // State
  private activeTab = 'markdown'
  private parseTimer: ReturnType<typeof setTimeout> | undefined
  private lastTree: ComarkTree | null = null
  private lastHighlightHtml: string | null = null
  private lastError: string | null = null
  private activeInstance: ComarkInstanceSummary | null = null
  private initialLoading = true
  private pollInterval: ReturnType<typeof setInterval> | undefined
  private theme: Theme = 'auto'
  private currentView: ViewState | null = null
  private astOutputEl: HTMLElement | null = null

  constructor(ctx: DockClientScriptContext) {
    this.ctx = ctx
    ctx.current.events.on('dom:panel:mounted', (panel: HTMLElement) => this.mount(panel))
    ctx.current.events.on('entry:deactivated', () => this.cleanup())
  }

  private mount(panel: HTMLElement): void {
    this.cleanup()

    // Inject styles
    const style = document.createElement('style')
    style.textContent = STYLES
    panel.appendChild(style)

    // Root container
    const root = document.createElement('div')
    root.className = 'comark-devtools'
    this.rootEl = root
    applyTheme(this.rootEl, this.theme)
    panel.appendChild(root)

    // Tab bar
    const { tabs, tabButtons } = createTabBar([...TAB_DEFS], this.activeTab, (id) => this.switchTab(id))
    this.tabButtons = tabButtons
    root.appendChild(tabs)

    // Tab bar right section: instance status + theme toggle
    const tabRight = createTabRight()
    this.instanceDot = tabRight.dot
    this.instanceLabel = tabRight.label

    const themeToggle = createThemeToggle(this.theme, (t) => {
      this.theme = t
      applyTheme(this.rootEl, this.theme)
    })
    tabRight.container.appendChild(themeToggle)
    tabs.appendChild(tabRight.container)

    // Content area
    this.contentEl = document.createElement('div')
    this.contentEl.className = 'comark-content'
    root.appendChild(this.contentEl)

    // Editor
    const editorResult = createEditor(
      () => {
        this.syncHighlight()
        this.scheduleParse()
      },
      (scrollTop, scrollLeft) => {
        this.editorHighlight.scrollTop = scrollTop
        this.editorHighlight.scrollLeft = scrollLeft
      }
    )
    this.editorWrap = editorResult.wrap
    this.editor = editorResult.textarea
    this.editorHighlight = editorResult.highlight
    this.syncHighlight()

    // Loading & empty states
    this.loadingEl = createLoadingState()
    this.emptyState = createEmptyState()

    // Initial render + polling
    this.updateView()
    this.pollInstances()
    this.pollInterval = setInterval(() => this.pollInstances(), POLL_INTERVAL_MS)
  }

  private cleanup(): void {
    clearInterval(this.pollInterval)
    this.pollInterval = undefined
    clearTimeout(this.parseTimer)
    this.parseTimer = undefined
    this.activeInstance = null
    this.initialLoading = true
    this.tabButtons = []
    this.currentView = null
  }

  private scheduleParse(): void {
    clearTimeout(this.parseTimer)
    this.parseTimer = setTimeout(() => this.parseMarkdown(), PARSE_DEBOUNCE_MS)
  }

  private syncHighlight(): void {
    if (this.lastHighlightHtml) {
      this.editorHighlight.innerHTML = this.lastHighlightHtml + '\n'
    } else {
      this.editorHighlight.innerHTML = highlightMarkdown(this.editor.value) + '\n'
    }
  }

  private async pollInstances(): Promise<void> {
    let instances: ComarkInstanceSummary[] = []
    try {
      const data = (await this.ctx.rpc.call('comark:list-instances')) as ComarkInstanceSummary[]
      instances = data || []
    } catch {
      instances = []
    }

    this.initialLoading = false

    const current = instances[0] || null
    const prevId = this.activeInstance?.id

    this.activeInstance = current

    if (current) {
      this.instanceDot.dataset.connected = 'true'
      this.instanceLabel.textContent = current.label || current.id

      if (current.id !== prevId && current.markdown) {
        this.editor.value = current.markdown
        this.syncHighlight()
        this.scheduleParse()
      }
    } else {
      this.instanceDot.dataset.connected = 'false'
      this.instanceLabel.textContent = ''
    }

    this.updateView()
  }

  private async parseMarkdown(): Promise<void> {
    this.lastError = null

    try {
      const [tree, highlightHtml] = await Promise.all([
        this.ctx.rpc.call('comark:parse', this.editor.value) as Promise<ComarkTree>,
        this.ctx.rpc.call('comark:highlight', this.editor.value) as Promise<string | null>,
      ])
      this.lastTree = tree
      this.lastHighlightHtml = highlightHtml
      this.lastError = null
    } catch (err) {
      this.lastError = err instanceof Error ? err.message : String(err)
    }

    this.syncHighlight()
    this.updateView()
  }

  private switchTab(tabId: string): void {
    this.activeTab = tabId
    this.currentView = null // Force rebuild on tab switch
    for (const btn of this.tabButtons) {
      btn.dataset.active = String(btn.dataset.tab === tabId)
    }
    this.updateView()
  }

  private resolveDesiredView(): ViewState {
    if (this.initialLoading) return 'loading'
    if (!this.activeInstance) return 'empty'
    if (this.activeTab === 'markdown') return 'markdown'
    if (this.lastError) return 'ast-error'
    return 'ast'
  }

  private updateView(): void {
    if (!this.contentEl) return

    const desired = this.resolveDesiredView()

    // Only rebuild DOM when the view type changes
    if (desired !== this.currentView) {
      this.contentEl.replaceChildren()
      this.currentView = desired
      this.astOutputEl = null

      if (desired === 'loading') {
        this.contentEl.appendChild(this.loadingEl)
      } else if (desired === 'empty') {
        this.contentEl.appendChild(this.emptyState)
      } else if (desired === 'markdown') {
        this.contentEl.appendChild(this.editorWrap)
      } else if (desired === 'ast-error') {
        const errEl = document.createElement('div')
        errEl.className = 'comark-error'
        errEl.textContent = this.lastError!
        this.contentEl.appendChild(errEl)
      } else if (desired === 'ast' && this.lastTree) {
        this.astOutputEl = document.createElement('div')
        this.astOutputEl.className = 'comark-output'
        renderAST(this.astOutputEl, this.lastTree)
        this.contentEl.appendChild(this.astOutputEl)
      }
    } else {
      // Same view — update content in place
      if (desired === 'ast-error') {
        const errEl = this.contentEl.querySelector('.comark-error')
        if (errEl) errEl.textContent = this.lastError!
      } else if (desired === 'ast' && this.lastTree && this.astOutputEl) {
        this.astOutputEl.replaceChildren()
        renderAST(this.astOutputEl, this.lastTree)
      }
    }
  }
}
