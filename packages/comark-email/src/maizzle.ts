/**
 * Lazy Maizzle compilation wrapper (Node-first).
 *
 * `@maizzle/framework` is loaded on first call. This keeps the light assembly
 * path (`assembleEmailHtml`, `renderEmailBody`) tree-shakeable and loads
 * without requiring a Node.js environment.
 */

type MaizzleRenderFn = (html: string, config: Record<string, unknown>) => Promise<{ html: string }>

let _render: MaizzleRenderFn | undefined

const loadMaizzle = async (): Promise<MaizzleRenderFn> => {
  if (_render) return _render
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mod = (await import('@maizzle/framework')) as any
    _render = mod.render as MaizzleRenderFn
    return _render
  } catch {
    throw new Error('[@comark/email] @maizzle/framework is required. Install it: pnpm add @maizzle/framework')
  }
}

/**
 * Compile an assembled email HTML string with Maizzle.
 *
 * Inlines Tailwind CSS utilities, purges unused styles, and applies all
 * Maizzle transformers (juice inlining, HTML crush, etc.) to produce
 * production-ready email HTML.
 *
 * Errors are collected into the returned `errors` array instead of thrown so
 * callers always receive HTML (the un-inlined fallback on failure).
 *
 * @param html - The assembled HTML document (output of `assembleEmailHtml`).
 * @param config - Maizzle render config (output of `frontmatterToMaizzleConfig` + extras).
 */
export const compileEmail = async (
  html: string,
  config: Record<string, unknown>
): Promise<{ html: string; errors: unknown[] }> => {
  const render = await loadMaizzle()
  const errors: unknown[] = []
  try {
    const result = await render(html, config)
    return { html: result.html, errors }
  } catch (err) {
    errors.push(err)
    return { html, errors }
  }
}
