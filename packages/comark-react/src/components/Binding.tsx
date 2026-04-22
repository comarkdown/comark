import type React from 'react'

export interface BindingProps {
  /**
   * Resolved value for the binding, injected by the Comark renderer after
   * looking up the `:value` dot-path against the ambient render context.
   */
  value?: unknown
  /**
   * Fallback rendered when `value` is `undefined` or `null`.
   */
  defaultValue?: string
}

/**
 * Renders a `{{ path || default }}` binding as plain text.
 *
 * Pair with the `binding` plugin and wire via `components={{ binding: Binding }}`.
 */
export function Binding({ value, defaultValue }: BindingProps): React.ReactNode {
  if (value !== undefined && value !== null) return String(value)
  return defaultValue ?? ''
}
