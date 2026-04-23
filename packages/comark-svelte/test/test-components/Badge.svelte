<script lang="ts">
  let {
    label = '',
    count = 0,
    config,
  }: {
    label?: string
    count?: number
    config?: Record<string, unknown>
  } = $props()
</script>

<span class="badge" data-count={count} data-config={config ? JSON.stringify(config) : undefined}>
  {label}
</span>
