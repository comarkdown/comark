/**
 * Read and write YAML frontmatter without the parser or renderer.
 *
 * @example
 * ```typescript
 * import { parseFrontmatter, renderFrontmatter } from 'comark/frontmatter'
 *
 * const { content, data } = parseFrontmatter('---\ntitle: Hi\n---\n\n# Hello')
 * // data → { title: 'Hi' }, content → '\n\n# Hello'
 *
 * renderFrontmatter({ title: 'Hi' }, '# Hello')
 * // → '---\ntitle: Hi\n---\n\n# Hello'
 * ```
 */
export { parseFrontmatter } from './internal/parse/frontmatter.ts'
export { renderFrontmatter } from './internal/stringify/frontmatter.ts'
