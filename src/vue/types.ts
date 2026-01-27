import type { MinimarkTree } from 'minimark'

export interface MDCStreamState {
  body: MinimarkTree
  data: any
  isComplete: boolean
  excerpt?: MinimarkTree
  toc?: any
  error?: Error
}

export interface MDCRendererProps {
  body: MinimarkTree
  components?: Record<string, any>
  componentsManifest?: (name: string) => Promise<any>
}

export interface MDCStreamOptions {
  onChunk?: (chunk: string) => void
  onComplete?: (result: { body: MinimarkTree, data: any, toc?: any }) => void
  onError?: (error: Error) => void
}
