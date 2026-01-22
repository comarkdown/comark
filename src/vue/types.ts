import type { MDCRoot } from '../types/tree'

export interface MDCStreamState {
  body: MDCRoot
  data: any
  isComplete: boolean
  excerpt?: MDCRoot
  toc?: any
  error?: Error
}

export interface MDCRendererProps {
  body: MDCRoot
  components?: Record<string, any>
  componentsManifest?: (name: string) => Promise<any>
}

export interface MDCStreamOptions {
  onChunk?: (chunk: string) => void
  onComplete?: (result: { body: MDCRoot, data: any, toc?: any }) => void
  onError?: (error: Error) => void
}
