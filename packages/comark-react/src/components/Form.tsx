import type React from 'react'

interface FormProps {
  /** Current aggregated form value — supplied by the renderer from the model. */
  value?: Record<string, unknown>
  /** @internal Comark renderer writes back via this when the form submits. */
  onUpdateValue?: (aggregate: Record<string, unknown>) => void
  children?: React.ReactNode
}

/**
 * `::form` aggregate component.
 *
 * Wraps its children in a `<form>` element.  On submit, collects native
 * `FormData` from the form and writes the aggregated field values to the
 * model path bound to `::value` via the auto-generated `onUpdateValue`
 * handler that the Comark renderer emits.
 *
 * @example
 * ```md
 * ::form{::value="data.contact"}
 *   :input{::value="data.name" name="name" type="text"}
 *   :input{::value="data.email" name="email" type="email"}
 *   :button{type="submit"} Submit ::
 * ::
 * ```
 */
export function Form({ onUpdateValue, children }: FormProps): React.ReactNode {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const aggregate = Object.fromEntries(fd.entries()) as Record<string, unknown>
    onUpdateValue?.(aggregate)
  }

  return <form onSubmit={handleSubmit}>{children}</form>
}
