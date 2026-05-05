import type { AiMode } from '~/constants'

interface UseAiStreamOptions {
  onStart: () => void
  onChunk: (markdown: string) => Promise<void>
  onError: (previousMarkdown: string) => void
  onFinish: () => Promise<void>
}

export function useAiStream(
  markdown: Ref<string | undefined>,
  options: UseAiStreamOptions,
) {
  const isGenerating = ref(false)

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
      }
    } catch {
      options.onError(previousMarkdown)
    } finally {
      isGenerating.value = false
      await options.onFinish()
    }
  }

  return { isGenerating, generate }
}
