export interface ParseOptions {
  /**
   * Whether to automatically unwrap single paragraphs in container components.
   * When enabled, if a container component (alert, card, callout, note, warning, tip, info)
   * has only a single paragraph child, the paragraph wrapper is removed and its children
   * become direct children of the container. This creates cleaner HTML output.
   *
   * @default true
   * @example
   * // With autoUnwrap: true (default)
   * // <alert><strong>Text</strong></alert>
   *
   * // With autoUnwrap: false
   * // <alert><p><strong>Text</strong></p></alert>
   */
  autoUnwrap?: boolean
}
