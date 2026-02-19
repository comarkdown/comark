import type { ComarkTree } from 'comark/ast'
import { readonly, ref, shallowRef } from 'vue'
import { parse, autoCloseMarkdown } from 'comark'
import comarkHighlight from 'comark/plugins/highlight'
import type { ParseOptions } from 'comark'

export interface MDCStreamState {
  tree: ComarkTree
  isComplete: boolean
  content: string
  error?: Error
}

export interface MDCStreamOptions extends ParseOptions {
  onChunk?: (chunk: string) => void
  onComplete?: (result: ComarkTree) => void
  onError?: (error: Error) => void
}

const plugins = [comarkHighlight()]

/**
 * Vue composable for streaming Comark content parsing
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useMDCStream } from '@/composables/useMDCStream'
 *
 * const { state, startStream, isStreaming } = useMDCStream({
 *   onChunk: (chunk) => console.log('Received chunk:', chunk)
 * })
 *
 * async function loadStream() {
 *   const response = await fetch('/api/markdown')
 *   await startStream(response.body)
 * }
 * </script>
 *
 * <template>
 *   <div>
 *     <ComarkAst v-if="state.tree" :body="state.tree" :streaming="!state.isComplete" />
 *     <div v-if="isStreaming">Streaming...</div>
 *   </div>
 * </template>
 * ```
 */
export function useMDCStream(options?: MDCStreamOptions) {
  options = {
    ...options,
    plugins,
  }
  const state = shallowRef<MDCStreamState>({
    tree: { nodes: [], frontmatter: {}, meta: {} },
    isComplete: false,
    content: '',
  })

  const isStreaming = ref(false)

  /**
   * Start streaming Comark content from a ReadableStream
   * @param stream - The ReadableStream to read from
   */
  async function startStream(stream: ReadableStream<Uint8Array>) {
    state.value = {
      tree: { nodes: [], frontmatter: {}, meta: {} },
      isComplete: false,
      content: '',
      error: undefined,
    }
    isStreaming.value = true

    let accumulatedContent = ''

    try {
      const reader = stream.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          break
        }

        const chunk = decoder.decode(value, { stream: true })
        accumulatedContent += chunk

        // Parse the accumulated content with auto-close for incomplete syntax
        const closedContent = autoCloseMarkdown(accumulatedContent)
        try {
          const result = await parse(closedContent, { ...options, autoClose: false })

          state.value = {
            tree: result,
            isComplete: false,
            content: accumulatedContent,
          }

          if (options?.onChunk) {
            options.onChunk(chunk)
          }
        }
        catch {
          // Ignore errors
        }
      }

      // Final parse without auto-close
      const finalResult = await parse(accumulatedContent, options)

      state.value = {
        tree: finalResult,
        isComplete: true,
        content: accumulatedContent,
      }

      if (options?.onComplete) {
        options.onComplete(finalResult)
      }
    }
    catch (error) {
      state.value = {
        ...state.value,
        error: error as Error,
      }

      if (options?.onError) {
        options.onError(error as Error)
      }

      throw error
    }
    finally {
      isStreaming.value = false
    }
  }

  /**
   * Reset the state
   */
  function reset() {
    state.value = {
      tree: { nodes: [], frontmatter: {}, meta: {} },
      isComplete: false,
      content: '',
    }
    isStreaming.value = false
  }

  return {
    state: readonly(state),
    isStreaming: readonly(isStreaming),
    startStream,
    reset,
  }
}
