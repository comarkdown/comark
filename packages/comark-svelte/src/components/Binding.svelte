<!--
@component
Renders a `{{ path || default }}` binding from the `binding` plugin as plain
text. Receives the resolved `value` prop (looked up against the ambient
render context via the `:value` dot-path) and a `defaultValue` fallback.

@example
```svelte
<script>
  import binding, { Binding } from '@comark/svelte/plugins/binding'
  import { Comark } from '@comark/svelte'

  const data = { user: { name: 'Ada' } }
</script>

<Comark
  markdown="Hello {{ data.user.name || guest }}!"
  plugins={[binding()]}
  components={{ Binding }}
  {data}
/>
```
-->
<script lang="ts">
  let {
    value,
    defaultValue,
  }: {
    value?: unknown
    defaultValue?: string
  } = $props()

  let rendered = $derived(
    value !== undefined && value !== null
      ? String(value)
      : (defaultValue ?? ''),
  )
</script>

{rendered}
