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

// Keep this snappy — navigation mounts a new renderer and the bridge pushes
// over HMR immediately, but the panel only learns about it via poll.
const POLL_INTERVAL_MS = 250
// Debounce only user typing in the editor, not instance switches.
const PARSE_DEBOUNCE_MS = 300
const HIGHLIGHT_DEBOUNCE_MS = 16

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
  private highlightTimer: ReturnType<typeof setTimeout> | undefined
  private lastTree: ComarkTree | null = null
  private lastHighlightHtml: string | null = null
  private lastError: string | null = null
  private activeInstance: ComarkInstanceSummary | null = null
  private parseGeneration = 0
  private highlightGeneration = 0
  private initialLoading = true
  private pollInterval: ReturnType<typeof setInterval> | undefined
  private theme: Theme = 'dark'
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
        this.scheduleHighlight()
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
    clearTimeout(this.highlightTimer)
    this.highlightTimer = undefined
    this.activeInstance = null
    this.initialLoading = true
    this.tabButtons = []
    this.currentView = null
  }

  private scheduleParse(): void {
    clearTimeout(this.parseTimer)
    this.parseTimer = setTimeout(() => this.parseMarkdown(), PARSE_DEBOUNCE_MS)
  }

  private scheduleHighlight(delay = HIGHLIGHT_DEBOUNCE_MS): void {
    clearTimeout(this.highlightTimer)
    this.highlightTimer = setTimeout(() => this.refreshHighlight(), delay)
  }

  private syncHighlight(): void {
    if (this.lastHighlightHtml) {
      this.editorHighlight.innerHTML = this.lastHighlightHtml + '\n'
    } else {
      this.editorHighlight.innerHTML = highlightMarkdown(this.editor.value) + '\n'
    }
  }

  /** Fetch Shiki highlighting independently of instance updates */
  private async refreshHighlight(): Promise<void> {
    const markdown = this.editor.value
    const gen = ++this.highlightGeneration
    try {
      const html = (await this.ctx.rpc.call('comark:highlight', markdown)) as string | null
      if (gen !== this.highlightGeneration) return
      this.lastHighlightHtml = html
    } catch {
      if (gen !== this.highlightGeneration) return
      this.lastHighlightHtml = null
    }
    this.syncHighlight()
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
    const prevMarkdown = this.activeInstance?.markdown

    this.activeInstance = current

    if (current) {
      this.instanceDot.dataset.connected = 'true'
      this.instanceLabel.textContent = current.label || current.id

      const switched = current.id !== prevId
      const markdownArrived = !!current.markdown && current.markdown !== prevMarkdown

      // Apply source + AST immediately on switch / when reverse-render catches up.
      // Do NOT go through scheduleParse here — that re-pushes to the app and adds
      // a 300ms debounce that only makes sense for user edits.
      if ((switched || markdownArrived) && current.markdown != null) {
        this.editor.value = current.markdown
        if (current.tree) {
          this.lastTree = current.tree
          this.lastError = null
        }
        // Cheap regex fallback first so the editor isn't blank while Shiki RPC runs.
        this.lastHighlightHtml = null
        this.syncHighlight()
        this.scheduleHighlight(0)
      } else if (switched && current.tree) {
        this.lastTree = current.tree
        this.lastError = null
      }
    } else {
      this.instanceDot.dataset.connected = 'false'
      this.instanceLabel.textContent = ''
      if (prevId) {
        // Left a page with no Comark docs — clear stale editor state.
        this.editor.value = ''
        this.lastTree = null
        this.lastHighlightHtml = null
        this.lastError = null
        this.syncHighlight()
      }
    }

    this.updateView()
  }

  private async parseMarkdown(): Promise<void> {
    if (!this.activeInstance) return

    const markdown = this.editor.value
    const gen = ++this.parseGeneration

    this.lastError = null

    try {
      const tree = await this.ctx.rpc.call('comark:update-instance', this.activeInstance.id, {
        markdown,
        tree: this.lastTree,
      })

      if (gen !== this.parseGeneration) return

      this.lastTree = tree as ComarkTree
      this.lastError = null
    } catch (err) {
      if (gen !== this.parseGeneration) return
      this.lastError = err instanceof Error ? err.message : String(err)
    }

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
