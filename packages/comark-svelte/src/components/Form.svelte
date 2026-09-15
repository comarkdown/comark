<!--
@component
`::form` aggregate component.

Wraps its children in a `<form>` element.  On submit, collects native
`FormData` from the form and writes the aggregated field values to the
model path bound to `::value` via the auto-generated `onUpdateValue`
handler that the Comark renderer emits.
-->
<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    value,
    onUpdateValue,
    children,
  }: {
    value?: Record<string, unknown>
    onUpdateValue?: (aggregate: Record<string, unknown>) => void
    children?: Snippet
  } = $props()

  function handleSubmit(e: SubmitEvent): void {
    e.preventDefault()
    const fd = new FormData(e.currentTarget as HTMLFormElement)
    const aggregate = Object.fromEntries(fd.entries()) as Record<string, unknown>
    onUpdateValue?.(aggregate)
  }
</script>

<form onsubmit={handleSubmit}>
  {@render children?.()}
</form>
