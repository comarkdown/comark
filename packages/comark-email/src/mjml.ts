/**
 * Lazy MJML compilation wrapper (Node-first).
 *
 * `mjml` is loaded on first call. This keeps the light transformer path
 * (`documentToMjmlJson`, `serializeMjml`) tree-shakeable.
 */

import type { MjmlCompileError, MjmlCompileOptions, MjmlNode } from './types.ts'

type Mjml2HtmlFn = (
  input: string | object,
  options?: Record<string, unknown>
) => Promise<{
  html: string
  errors: Array<{ line?: number; message?: string; tagName?: string; formattedMessage?: string }>
}>

let _mjml2html: Mjml2HtmlFn | undefined

const loadMjml = async (): Promise<Mjml2HtmlFn> => {
  if (_mjml2html) return _mjml2html
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mod = (await import('mjml')) as any
    // Handle CJS interop: module may expose the function as default or as the module itself.
    _mjml2html = (mod.default ?? mod) as Mjml2HtmlFn
    return _mjml2html
  } catch {
    throw new Error('[@comark/email] mjml is required. Install it: pnpm add mjml')
  }
}

/**
 * Compile an MJML JSON tree or XML string to email HTML using the MJML compiler.
 *
 * Returns `{ html, errors }`. On compilation error MJML still returns partial HTML;
 * errors are collected rather than thrown so callers always receive usable output.
 *
 * @param input - MJML JSON tree (`MjmlNode`) or XML string.
 * @param options - Options forwarded to `mjml2html`.
 */
export const compileMjml = async (
  input: MjmlNode | string,
  options?: MjmlCompileOptions
): Promise<{ html: string; errors: MjmlCompileError[] }> => {
  const mjml2html = await loadMjml()
  const errors: MjmlCompileError[] = []
  try {
    const result = await mjml2html(input, {
      validationLevel: 'soft',
      ignoreIncludes: true,
      ...options,
    })
    for (const e of result.errors ?? []) {
      errors.push({
        line: e.line,
        message: e.message ?? String(e),
        tagName: e.tagName,
        formattedMessage: e.formattedMessage,
      })
    }
    return { html: result.html ?? '', errors }
  } catch (err) {
    errors.push({ message: err instanceof Error ? err.message : String(err) })
    return { html: '', errors }
  }
}
