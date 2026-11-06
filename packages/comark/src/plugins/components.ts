/**
 * Components syntax plugin for Comark.
 *
 * Enables block (`::name`) and inline (`:name[content]`) component syntax,
 * plus span wrappers (`[text]` / `[text]{attrs}` when paired with attributes).
 * On by default via `registerDefaultPlugins`.
 *
 * @see https://comark.dev/syntax/components
 */

import type { ComarkParsePreState, MarkdownItPlugin } from '../types.ts'
import { defineComarkPlugin } from '../utils/helpers.ts'
import { markSourceStable, isSourceStable } from '../internal/parse/source-stable.ts'
import { createMarkdownItComponents, hasYamlProps } from '../internal/parse/components.ts'

let yaml: typeof import('../internal/parse/yaml.ts') | undefined

const markdownItComponents = createMarkdownItComponents((content) => {
  if (!yaml) {
    throw new Error(
      "Component YAML props were not loaded before tokenization. Register components() with createMarkdownParser, or use markdownItComponents from 'comark/plugins/components/markdown-it' with your own markdown-it instance."
    )
  }
  return yaml.parseYaml(content)
})

// Keep the import outside the plugin factory so TypeScript rewrites its extension.
const loadYaml = (): Promise<typeof import('../internal/parse/yaml.ts')> => import('../internal/parse/yaml.ts')

export default defineComarkPlugin(() => ({
  name: 'components',
  async prepare(state: Readonly<ComarkParsePreState>): Promise<void> {
    if (
      !yaml &&
      (hasYamlProps(state.markdown) ||
        state.options.plugins?.some((plugin) => plugin.markdownItPlugins?.some((fn) => !isSourceStable(fn))))
    ) {
      yaml = await loadYaml()
    }
  },
  markdownItPlugins: [markSourceStable(markdownItComponents as unknown as MarkdownItPlugin)],
}))
