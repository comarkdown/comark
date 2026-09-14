declare module 'pagedjs' {
  export class Previewer {
    preview(content: unknown, stylesheets: string[], target: Element): Promise<{ total: number }>
  }
  export class Chunker {}
  export class Polisher {}
}
