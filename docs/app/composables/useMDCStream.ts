import type { Readable } from 'node:stream'
import type { ComarkTree } from 'comark/ast'
import { readonly, ref, shallowRef } from 'vue'
import { parseStreamIncremental } from 'comark/stream'

export interface MDCStreamState {
  body: ComarkTree
  data: any
  isComplete: boolean
  excerpt?: ComarkTree
  toc?: any
  content: string
  error?: Error
}

export interface MDCStreamOptions {
  onChunk?: (chunk: string) => void
  onComplete?: (result: { body: ComarkTree, data: any, toc?: any }) => void
  onError?: (error: Error) => void
}

/**
 * Vue composable for handling incremental Comark stream parsing
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useMDCStream } from '@/composables/useMDCStream'
 *
 * const { state, startStream, reset } = useMDCStream()
 *
 * async function loadContent() {
 *   const response = await fetch('/content.md')
 *   await startStream(response.body!)
 * }
 * </script>
 *
 * <template>
 *   <div>
 *     <Comark v-if="state.body" :markdown="state.content" />
 *     <div v-if="!state.isComplete">Loading...</div>
 *   </div>
 * </template>
 * ```
 */
export function useMDCStream(options?: MDCStreamOptions) {
  const state = shallowRef<MDCStreamState>({
    body: { type: 'comark', value: [] },
    data: {},
    isComplete: false,
    content: '',
  })

  const isStreaming = ref(false)

  /**
   * Start streaming and parsing Comark content
   * @param stream - Node.js Readable or Web ReadableStream
   */
  async function startStream(stream: Readable | ReadableStream<Uint8Array>) {
    isStreaming.value = true

    try {
      const parser = parseStreamIncremental

      for await (const result of parser(stream)) {
        // Update state with each chunk
        state.value = {
          body: result.body,
          data: result.data,
          isComplete: result.isComplete,
          excerpt: result.excerpt,
          toc: result.toc,
          content: result.content,
        }

        // Call chunk callback if provided
        if (!result.isComplete && options?.onChunk) {
          options.onChunk(result.chunk)
        }

        // Call complete callback if finished
        if (result.isComplete && options?.onComplete) {
          options.onComplete({
            body: result.body,
            data: result.data,
            toc: result.toc,
          })
        }
      }
    }
    catch (error) {
      console.error(error)
      state.value = {
        ...state.value,
        error: error as Error,
        isComplete: true,
      }

      if (options?.onError) {
        options.onError(error as Error)
      }
    }
    finally {
      isStreaming.value = false
    }
  }

  /**
   * Reset the stream state
   */
  function reset() {
    state.value = {
      body: { type: 'comark', value: [] },
      data: {},
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
