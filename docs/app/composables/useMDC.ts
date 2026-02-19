import type { ComarkTree } from 'comark/ast'
import { readonly, ref, shallowRef } from 'vue'
import { parse } from 'comark'
import type { ParseOptions } from 'comark'

export interface MDCState {
  tree: ComarkTree | null
  isLoading: boolean
  error?: Error
}

export interface MDCOptions extends ParseOptions {
  onComplete?: (result: ComarkTree) => void
  onError?: (error: Error) => void
}

/**
 * Vue composable for parsing Comark content
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useMDC } from '@/composables/useMDC'
 *
 * const { state, parseContent } = useMDC()
 *
 * async function loadContent() {
 *   await parseContent('# Hello World')
 * }
 * </script>
 *
 * <template>
 *   <div>
 *     <ComarkAst v-if="state.tree" :body="state.tree" />
 *     <div v-if="state.isLoading">Loading...</div>
 *     <div v-if="state.error">Error: {{ state.error.message }}</div>
 *   </div>
 * </template>
 * ```
 */
export function useMDC(options?: MDCOptions) {
  const state = shallowRef<MDCState>({
    tree: null,
    isLoading: false,
  })

  const isLoading = ref(false)

  /**
   * Parse Comark content from a string
   * @param content - The markdown/Comark content to parse
   */
  async function parseContent(content: string) {
    state.value = {
      ...state.value,
      isLoading: true,
      error: undefined,
    }
    isLoading.value = true

    try {
      const result = await parse(content, options)

      state.value = {
        tree: result,
        isLoading: false,
      }

      if (options?.onComplete) {
        options.onComplete(result)
      }

      return result
    }
    catch (error) {
      state.value = {
        ...state.value,
        error: error as Error,
        isLoading: false,
      }

      if (options?.onError) {
        options.onError(error as Error)
      }

      throw error
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * Reset the state
   */
  function reset() {
    state.value = {
      tree: null,
      isLoading: false,
    }
    isLoading.value = false
  }

  return {
    state: readonly(state),
    isLoading: readonly(isLoading),
    parseContent,
    reset,
  }
}
