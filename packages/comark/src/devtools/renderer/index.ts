import type { DockClientScriptContext } from '@vitejs/devtools-kit/client'
import { STYLES } from './styles.ts'
import { applyTheme, createThemeToggle } from './theme.ts'
import { countNodes, renderAST, renderInfo, renderRoundtrip } from './output.ts'
import type { Theme } from './theme.ts'

interface InstanceSummary {
  id: string
  label?: string
  markdown?: string
  nodeCount: number
  updatable: boolean
}

type ComarkTree = {
  nodes: unknown[]
  frontmatter: Record<string, unknown>
  meta: Record<string, unknown>
}

const DEFAULT_MARKDOWN = `# Hello World

This is a **Comark** playground inside Vite DevTools.

- Supports *inline* formatting
- Component syntax like \`::alert\`

::alert{type="info"}
Edit this markdown to see the parsed AST in real time.
::
`

export default function setup(ctx: DockClientScriptContext) {
  let editor: HTMLTextAreaElement
  let outputEl: HTMLElement
  let statusDot: HTMLElement
  let statusText: HTMLElement
  let activeTab = 'ast'
  let parseTimer: ReturnType<typeof setTimeout> | undefined
  let lastTree: ComarkTree | null = null
  let lastRoundtrip: string | null = null
  let lastError: string | null = null
  let tabButtons: HTMLButtonElement[] = []

  // Live instance tracking
  let activeInstance: InstanceSummary | null = null
  let instanceDot: HTMLElement
  let instanceLabel: HTMLElement
  let pushBtn: HTMLButtonElement
  let pollInterval: ReturnType<typeof setInterval> | undefined

  // Theme state
  let theme: Theme = 'auto'
  let rootEl: HTMLElement

  ctx.current.events.on('dom:panel:mounted', (panel: HTMLElement) => {
    cleanup()

    // Inject styles
    const style = document.createElement('style')
    style.textContent = STYLES
    panel.appendChild(style)

    // Root container
    const root = document.createElement('div')
    root.className = 'comark-devtools'
    rootEl = root
    applyTheme(rootEl, theme)
    panel.appendChild(root)

    // --- Editor pane ---
    const editorPane = document.createElement('div')
    editorPane.className = 'comark-editor-pane'
    root.appendChild(editorPane)

    // Instance bar
    const instanceBar = document.createElement('div')
    instanceBar.className = 'comark-instance-bar'
    editorPane.appendChild(instanceBar)

    instanceDot = document.createElement('span')
    instanceDot.className = 'comark-instance-dot'
    instanceDot.dataset.connected = 'false'
    instanceBar.appendChild(instanceDot)

    instanceLabel = document.createElement('span')
    instanceLabel.className = 'comark-instance-label'
    instanceLabel.textContent = 'No instance'
    instanceBar.appendChild(instanceLabel)

    pushBtn = document.createElement('button')
    pushBtn.className = 'comark-push-btn'
    pushBtn.textContent = 'Push to app'
    pushBtn.title = 'Push edited markdown back to the live component'
    pushBtn.style.display = 'none'
    pushBtn.addEventListener('click', pushToInstance)
    instanceBar.appendChild(pushBtn)

    // Theme toggle
    const themeToggle = createThemeToggle(theme, (t) => {
      theme = t
      applyTheme(rootEl, theme)
    })
    instanceBar.appendChild(themeToggle)

    // Editor header
    const editorHeader = document.createElement('div')
    editorHeader.className = 'comark-pane-header'
    editorHeader.textContent = 'Markdown'
    editorPane.appendChild(editorHeader)

    // Editor textarea
    editor = document.createElement('textarea')
    editor.className = 'comark-editor'
    editor.placeholder = 'Type markdown here...'
    editor.value = DEFAULT_MARKDOWN
    editor.spellcheck = false
    editor.addEventListener('input', () => scheduleParse())
    editor.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault()
        const start = editor.selectionStart
        const end = editor.selectionEnd
        editor.value = editor.value.substring(0, start) + '  ' + editor.value.substring(end)
        editor.selectionStart = editor.selectionEnd = start + 2
        scheduleParse()
      }
    })
    editorPane.appendChild(editor)

    // --- Output pane ---
    const outputPane = document.createElement('div')
    outputPane.className = 'comark-output-pane'
    root.appendChild(outputPane)

    // Tabs
    const tabs = document.createElement('div')
    tabs.className = 'comark-tabs'
    outputPane.appendChild(tabs)

    const tabDefs = [
      { id: 'ast', label: 'AST' },
      { id: 'roundtrip', label: 'Roundtrip' },
      { id: 'info', label: 'Info' },
    ]

    for (const tab of tabDefs) {
      const btn = document.createElement('button')
      btn.className = 'comark-tab'
      btn.textContent = tab.label
      btn.dataset.tab = tab.id
      btn.dataset.active = String(tab.id === activeTab)
      btn.addEventListener('click', () => switchTab(tab.id))
      tabs.appendChild(btn)
      tabButtons.push(btn)
    }

    // Output area
    outputEl = document.createElement('div')
    outputEl.className = 'comark-output'
    outputPane.appendChild(outputEl)

    // Status bar
    const statusBar = document.createElement('div')
    statusBar.className = 'comark-status'
    outputPane.appendChild(statusBar)

    statusDot = document.createElement('span')
    statusDot.className = 'comark-status-dot'
    statusBar.appendChild(statusDot)

    statusText = document.createElement('span')
    statusText.textContent = 'Ready'
    statusBar.appendChild(statusText)

    // Initial parse + start polling
    parseMarkdown()
    pollInstances()
    pollInterval = setInterval(pollInstances, 1500)
  })

  ctx.current.events.on('entry:deactivated', cleanup)

  function cleanup() {
    clearInterval(pollInterval)
    pollInterval = undefined
    clearTimeout(parseTimer)
    parseTimer = undefined
    activeInstance = null
    tabButtons = []
  }

  function scheduleParse() {
    clearTimeout(parseTimer)
    parseTimer = setTimeout(parseMarkdown, 300)
  }

  async function pollInstances() {
    let instances: InstanceSummary[] = []
    try {
      const data = (await ctx.rpc.call('comark:list-instances')) as InstanceSummary[]
      instances = data || []
    } catch {
      instances = []
    }

    const current = instances[0] || null
    const prevId = activeInstance?.id

    activeInstance = current

    if (current) {
      instanceDot.dataset.connected = 'true'
      instanceLabel.textContent = current.label || current.id
      pushBtn.style.display = current.updatable ? '' : 'none'

      if (current.id !== prevId && current.markdown) {
        editor.value = current.markdown
        scheduleParse()
      }
    } else {
      instanceDot.dataset.connected = 'false'
      instanceLabel.textContent = 'No instance'
      pushBtn.style.display = 'none'
    }
  }

  async function pushToInstance() {
    if (!activeInstance) return
    try {
      await ctx.rpc.call('comark:update-instance', {
        id: activeInstance.id,
        markdown: editor.value,
      })
    } catch {
      // Silently ignore push errors
    }
  }

  async function parseMarkdown() {
    const markdown = editor.value
    statusDot.dataset.state = 'parsing'
    statusText.textContent = 'Parsing...'
    lastError = null

    try {
      const [tree, roundtrip] = await Promise.all([
        ctx.rpc.call('comark:parse', markdown) as Promise<ComarkTree>,
        ctx.rpc.call('comark:render-markdown', markdown) as Promise<string>,
      ])

      lastTree = tree
      lastRoundtrip = roundtrip
      lastError = null

      const nodeCount = countNodes(tree.nodes)
      statusDot.dataset.state = ''
      statusText.textContent = `${nodeCount} node${nodeCount !== 1 ? 's' : ''} · ${markdown.length} chars`
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err)
      statusDot.dataset.state = 'error'
      statusText.textContent = 'Parse error'
    }

    updateOutput()
  }

  function switchTab(tabId: string) {
    activeTab = tabId
    for (const btn of tabButtons) {
      btn.dataset.active = String(btn.dataset.tab === tabId)
    }
    updateOutput()
  }

  function updateOutput() {
    if (lastError) {
      outputEl.replaceChildren()
      const errEl = document.createElement('div')
      errEl.className = 'comark-error'
      errEl.textContent = lastError
      outputEl.appendChild(errEl)
      return
    }

    outputEl.replaceChildren()

    if (activeTab === 'ast' && lastTree) {
      renderAST(outputEl, lastTree)
    } else if (activeTab === 'roundtrip' && lastRoundtrip !== null) {
      renderRoundtrip(outputEl, lastRoundtrip, editor.value)
    } else if (activeTab === 'info' && lastTree) {
      renderInfo(outputEl, lastTree, editor.value.length)
    }
  }
}
