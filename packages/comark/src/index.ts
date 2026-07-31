// Re-export auto-close utilities
export { autoCloseMarkdown } from './internal/parse/auto-close/index.ts'

// Re-export parse utilities
export { applyAutoUnwrap } from './internal/parse/auto-unwrap.ts'

// Re-export parse utilities
export * from './parse.ts'

// Re-export the ambient renderer context for live updates
export { createComarkContext } from './context.ts'
export type { ComarkContext, ComarkDocument, ComarkPatch } from './context.ts'

// Re-export types
export type * from './types'
