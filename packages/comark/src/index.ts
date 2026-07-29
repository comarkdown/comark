// Re-export auto-close utilities
export { autoCloseMarkdown } from './internal/parse/auto-close/index.ts'

// Re-export parse utilities
export { applyAutoUnwrap } from './internal/parse/auto-unwrap.ts'
export * from './parse.ts'

// Re-export the ambient renderer context for live updates
export { createComarkContext, subscribeComarkDocument } from './context.ts'
export type { ComarkContext, ComarkDocument, ComarkDocumentSubscription, ComarkPatch } from './context.ts'

// Re-export types
export type * from './types'
