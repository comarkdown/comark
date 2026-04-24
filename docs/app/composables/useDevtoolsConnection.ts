import { useIntervalFn } from '@vueuse/core'
import type { Ref } from 'vue'
import type { ComarkInstanceSummary } from 'comark/devtools'

export function useDevtoolsConnection(markdown: Ref<string>) {
  const isDevtoolsConnected = useState<boolean>('devtools-connected', () => false)
  const rpc = shallowRef<any>(null)
  const liveInstances = ref<ComarkInstanceSummary[]>([])
  const selectedInstanceId = ref<string | null>(null)

  // Poll for live instances every 2s — starts paused, resumed on connect
  const { resume: startPolling } = useIntervalFn(refreshInstances, 2000, {
    immediate: false,
  })

  function selectInstance(instance: ComarkInstanceSummary) {
    selectedInstanceId.value = instance.id
    if (instance.markdown != null) {
      markdown.value = instance.markdown
    }
  }

  async function refreshInstances() {
    if (!rpc.value) return
    try {
      const instances = await rpc.value.call('comark:list-instances')
      liveInstances.value = instances || []

      // Auto-select if none selected or if current selection no longer exists
      const currentStillExists = liveInstances.value.some(i => i.id === selectedInstanceId.value)
      if ((!selectedInstanceId.value || !currentStillExists) && liveInstances.value.length > 0) {
        selectInstance(liveInstances.value[0]!)
      }
    }
    catch (err) {
      console.warn('[comark:playground] refreshInstances error:', err)
    }
  }

  async function pushToInstance() {
    if (!rpc.value || !selectedInstanceId.value) return
    try {
      await rpc.value.call('comark:update-instance', {
        id: selectedInstanceId.value,
        markdown: markdown.value,
      })
    }
    catch {
      // Update failed
    }
  }

  onMounted(async () => {
    const descriptor = parseDescriptor()
    if (!descriptor) return

    try {
      const { getDevToolsRpcClient } = await import('@vitejs/devtools-kit/client')
      const client = await getDevToolsRpcClient({
        connectionMeta: descriptor as any,
        authToken: descriptor.authToken,
      })
      rpc.value = client
      isDevtoolsConnected.value = true

      await refreshInstances()
      startPolling()
    }
    catch (err) {
      console.warn('[comark:playground] Devtools connection failed:', err)
    }
  })

  return {
    isDevtoolsConnected: readonly(isDevtoolsConnected),
    liveInstances: readonly(liveInstances),
    selectedInstanceId: readonly(selectedInstanceId),
    selectInstance,
    pushToInstance,
  }
}

/**
 * Parse the Vite DevTools remote connection descriptor from the URL hash.
 * The devtools appends `#vite-devtools-kit-connection=<base64url>` to the iframe URL.
 */
function parseDescriptor(): { v: number, backend: string, websocket: string, authToken: string, origin: string } | null {
  if (typeof location === 'undefined') return null

  const hash = location.hash
  if (!hash) return null

  const raw = hash.startsWith('#') ? hash.slice(1) : hash
  for (const part of raw.split('&')) {
    const [k, v = ''] = part.split('=')
    if (k === 'vite-devtools-kit-connection') {
      try {
        // Base64url decode
        const encoded = decodeURIComponent(v)
        const padded = encoded.replace(/-/g, '+').replace(/_/g, '/') + '=='.slice(0, (4 - (encoded.length % 4)) % 4)
        const binary = atob(padded)
        const bytes = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
        const json = new TextDecoder().decode(bytes)
        return JSON.parse(json)
      }
      catch {
        return null
      }
    }
  }
  return null
}
