import type { Readable } from 'node:stream'
import type { MDCStreamOptions, MDCStreamState } from '../types'
import { readonly, ref, shallowRef } from 'vue'
import { parseStreamIncremental, parseStreamIncrementalWithMarkdownIt } from '../../stream'

/**
 * Vue composable for handling incremental MDC stream parsing
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useMDCStream } from 'mdc-syntax/vue'
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
 *     <MDCRenderer v-if="state.body" :body="state.body" />
 *     <div v-if="!state.isComplete">Loading...</div>
 *   </div>
 * </template>
 * ```
 */
export function useMDCStream(options?: MDCStreamOptions) {
  const state = shallowRef<MDCStreamState>({
    body: { type: 'root', children: [] },
    data: {},
    isComplete: false,
  })

  const isStreaming = ref(false)

  /**
   * Start streaming and parsing MDC content
   * @param stream - Node.js Readable or Web ReadableStream
   * @param useMarkdownIt - Use markdown-it parser instead of unified/remark
   */
  async function startStream(
    stream: Readable | ReadableStream<Uint8Array>,
    useMarkdownIt = false,
  ) {
    isStreaming.value = true

    try {
      const parser = useMarkdownIt
        ? parseStreamIncrementalWithMarkdownIt
        : parseStreamIncremental

      for await (const result of parser(stream)) {
        // Update state with each chunk
        state.value = {
          body: result.body,
          data: result.data,
          isComplete: result.isComplete,
          excerpt: result.excerpt,
          toc: result.toc,
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
      body: { type: 'root', children: [] },
      data: {},
      isComplete: false,
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
