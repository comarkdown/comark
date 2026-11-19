import { InjectionToken } from '@angular/core'
import type { Type } from '@angular/core'
import type { NodeTransform, ParserOptions } from 'comark'

export interface MarkdownConfig {
  /** Parser options, excluding plugins. */
  options?: Omit<ParserOptions, 'plugins'>
  /** Parser plugins. */
  plugins?: ParserOptions['plugins']
  /** Pre-configured component mappings. */
  components?: Record<string, Type<any>>
  /** Node transforms that run before the instance's own `transformNode`. */
  transformNode?: NodeTransform | readonly NodeTransform[]
  /** Additional CSS class for the wrapper. */
  class?: string
}

export interface MarkdownDocumentConfig {
  /** Pre-configured component mappings. */
  components?: Record<string, Type<any>>
  /** Node transforms that run before the instance's own `transformNode`. */
  transformNode?: NodeTransform | readonly NodeTransform[]
  /** Additional CSS class for the wrapper. */
  class?: string
}

export const MARKDOWN_CONFIG = new InjectionToken<MarkdownConfig>('comark.MARKDOWN_CONFIG')
export const MARKDOWN_DOCUMENT_CONFIG = new InjectionToken<MarkdownDocumentConfig>('comark.MARKDOWN_DOCUMENT_CONFIG')

type ConfigPlugin = NonNullable<ParserOptions['plugins']>[number]

/** Keep the first plugin per name in each list, then let instance plugins replace config plugins. */
export function mergeConfigPlugins(
  configPlugins: ParserOptions['plugins'],
  instancePlugins: ParserOptions['plugins']
): ConfigPlugin[] {
  const plugins = new Map<string, ConfigPlugin>()

  for (const list of [configPlugins, instancePlugins]) {
    const seen = new Set<string>()
    for (const plugin of list ?? []) {
      if (seen.has(plugin.name)) continue
      seen.add(plugin.name)
      plugins.delete(plugin.name)
      plugins.set(plugin.name, plugin)
    }
  }

  return [...plugins.values()]
}
