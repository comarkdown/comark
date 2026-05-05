import type { AiMode } from '~/constants'

interface UseAiStreamOptions {
  onStart: () => void
  onChunk: (markdown: string) => Promise<void>
  onError: (previousMarkdown: string) => void
  onFinish: () => Promise<void>
  autoScroll: boolean
}

export function useAiStream(
  markdown: Ref<string | undefined>,
  options: UseAiStreamOptions,
) {
  const isGenerating = ref(false)
  const previewBottom = ref<HTMLElement | null>(null)
  const markdownEditor = ref<{ scrollToBottom: () => void } | null>(null)

  function scrollToBottom() {
    nextTick(() => {
      previewBottom.value?.scrollIntoView({ behavior: 'instant' })
      markdownEditor.value?.scrollToBottom()
    })
  }

  async function generate(prompt: string, mode: AiMode, structure: string) {
    isGenerating.value = true
    const previousMarkdown = markdown.value ?? ''
    markdown.value = ''
    options.onStart()

    try {
      const response = await fetch('/api/generate-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, mode, structure }),
      })

      if (!response.ok) throw new Error('Generation failed')

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        markdown.value = (markdown.value ?? '') + decoder.decode(value, { stream: true })
        await options.onChunk(markdown.value)
        if (options.autoScroll) scrollToBottom()
      }
    } catch {
      options.onError(previousMarkdown)
    } finally {
      isGenerating.value = false
      await options.onFinish()
      if (options.autoScroll) scrollToBottom()
    }
  }

  return { isGenerating, previewBottom, markdownEditor, scrollToBottom, generate }
}
