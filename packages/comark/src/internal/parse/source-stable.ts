import type { MarkdownExitPlugin, MarkdownItPlugin } from '../../types.ts'

const sourceStablePlugins = new WeakSet<MarkdownExitPlugin | MarkdownItPlugin>()

/** Only rules known not to introduce YAML component props can skip eager preparation. */
export function markSourceStable<T extends MarkdownExitPlugin | MarkdownItPlugin>(plugin: T): T {
  sourceStablePlugins.add(plugin)
  return plugin
}

export function isSourceStable(plugin: MarkdownExitPlugin | MarkdownItPlugin): boolean {
  return sourceStablePlugins.has(plugin)
}
