import type { ComarkSpan, ComarkSpanOptions, ComarkTracer } from '../types.ts'

/** No-op span used by {@link noopTracer}. */
const noopSpan: ComarkSpan = { end: () => {} }

/** No-op recorder used when no `tracer` option is provided — zero overhead. */
export const noopTracer: ComarkTracer = {
  startSpan: () => noopSpan,
  startActiveSpan: (
    _name: string,
    optionsOrFn: ComarkSpanOptions | ((span: ComarkSpan) => unknown),
    fn?: (span: ComarkSpan) => unknown
  ) => {
    const run = typeof optionsOrFn === 'function' ? optionsOrFn : fn!
    return run(noopSpan)
  },
}

/**
 * Run `fn` inside an active span on `tracer`; always ends the span (incl. async).
 */
export function withSpan<T>(tracer: ComarkTracer, name: string, fn: () => T, options?: ComarkSpanOptions): T {
  return tracer.startActiveSpan(name, options ?? {}, (span) => {
    try {
      const result = fn()
      if (result instanceof Promise) {
        return result.finally(() => span.end()) as T
      }
      span.end()
      return result
    } catch (error) {
      span.end()
      throw error
    }
  })
}
