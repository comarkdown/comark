import type { Ref } from 'vue'
import { useResizeObserver } from '@vueuse/core'

/**
 * Renders a fixed-size card scaled to fit its container, and exports it as a 2x PNG.
 * Bind `viewport` to the sized wrapper and `card` to the element to capture.
 */
export function useImageExport(options: {
  width: number
  height: number
  viewport: Ref<HTMLElement | null>
  card: Ref<HTMLElement | null>
  fileName: () => string
}) {
  const { width, height, viewport, card } = options
  const scale = ref(1)
  const busy = ref(false)
  const toast = useToast()

  useResizeObserver(viewport, ([entry]) => {
    if (entry) scale.value = Math.min(1, entry.contentRect.width / width)
  })

  async function capture(): Promise<Blob | null> {
    if (!card.value) return null
    const { domToBlob } = await import('modern-screenshot')
    await document.fonts?.ready
    return domToBlob(card.value, {
      width,
      height,
      scale: 2,
      type: 'image/png',
      // The card is scaled through its wrapper; reset any inherited transform on the clone.
      style: { transform: 'none', margin: '0' },
    })
  }

  async function run(action: (blob: Blob) => Promise<void> | void, success: string) {
    if (busy.value) return
    busy.value = true
    try {
      const blob = await capture()
      if (!blob) throw new Error('Nothing to capture')
      await action(blob)
      toast.add({ title: success, icon: 'i-lucide-check', color: 'success' })
    } catch (error) {
      toast.add({
        title: 'Could not export the image',
        description: error instanceof Error ? error.message : String(error),
        icon: 'i-lucide-circle-alert',
        color: 'error',
      })
    } finally {
      busy.value = false
    }
  }

  function download() {
    const name = options.fileName()
    return run((blob) => {
      const href = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = href
      link.download = name
      link.click()
      URL.revokeObjectURL(href)
    }, `Downloaded ${name}`)
  }

  function copy() {
    return run(async (blob) => {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
    }, 'Image copied to clipboard')
  }

  return { scale, busy, download, copy }
}
