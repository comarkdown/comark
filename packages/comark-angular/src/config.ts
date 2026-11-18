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
