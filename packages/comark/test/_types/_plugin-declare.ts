/**
 * Compile-only — NOT a runtime test (no .test.ts suffix).
 * Verifies the plugin's declared contribution is enforced inside post().
 *
 * Run: `pnpm verify` from the repo root. The @ts-expect-error
 * directives must all be active.
 */
import { defineComarkPlugin } from '../../src/utils/helpers.ts'
import type { Toc } from '../../src/plugins/toc.ts'
import type { ComarkNode } from '../../src/types.ts'

// 1. Wrong value type — must error.
defineComarkPlugin<{}, { toc: Toc }>(() => ({
  name: 'wrong-value-type',
  post(state) {
    // @ts-expect-error — `123` is not assignable to `Toc`.
    state.tree.meta.toc = 123
  },
}))

// 2. Undeclared key — must error (strict surface).
defineComarkPlugin<{}, { toc: Toc }>(() => ({
  name: 'undeclared-key',
  post(state) {
    // @ts-expect-error — `summary` is not in the declared contribution.
    state.tree.meta.summary = []
  },
}))

// 3. Correct value type — must compile clean.
defineComarkPlugin<{}, { toc: Toc }>(() => ({
  name: 'correct-write',
  post(state) {
    state.tree.meta.toc = { title: '', depth: 1, searchDepth: 1, links: [] }
  },
}))

// 4. Multi-key contribution — both writes allowed, mismatches caught.
defineComarkPlugin<{}, { title?: string; description?: string }>(() => ({
  name: 'multi-key',
  post(state) {
    state.tree.meta.title = 'ok'
    state.tree.meta.description = undefined
    // @ts-expect-error — number not assignable to string.
    state.tree.meta.title = 42
  },
}))

// 5. Unannotated plugin — writable surface stays permissive (back-compat).
defineComarkPlugin<{}>(() => ({
  name: 'unannotated',
  post(state) {
    state.tree.meta.anything = 'works'
    state.tree.meta.alsoThis = { nested: 1 }
  },
}))

// 6. Frontmatter contribution gets the same treatment.
defineComarkPlugin<{}, {}, { author: string }>(() => ({
  name: 'frontmatter-author',
  post(state) {
    state.tree.frontmatter.author = 'Ada'
    // @ts-expect-error — number not assignable to string.
    state.tree.frontmatter.author = 1
    // @ts-expect-error — undeclared frontmatter key.
    state.tree.frontmatter.year = 1815
  },
}))

// 7. ComarkNode[] vs other shapes for `summary`.
defineComarkPlugin<{}, { summary: ComarkNode[] }>(() => ({
  name: 'summary-shape',
  post(state) {
    state.tree.meta.summary = []
    state.tree.meta.summary = [['p', {}, 'hi']]
    // @ts-expect-error — string is not ComarkNode[].
    state.tree.meta.summary = 'just text'
  },
}))
