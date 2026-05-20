<script lang="ts">
  import { ComarkAsync } from '@comark/svelte/async'
  import type { PageData } from './$types'
  import { pascalCase } from '@comark/svelte/utils';

  let { data }: { data: PageData } = $props()

  const modules = import.meta.glob('../lib/components/comark/*.svelte')

  const componentsManifest = (name: string) => {
    return modules[`../lib/components/comark/${pascalCase(name)}.svelte`]?.()
  }

  function errorMessage(error: unknown) {
    return error instanceof Error ? error.message : String(error)
  }
</script>

<div class="page-grid">
  <article class="panel">
    <svelte:boundary>
      <ComarkAsync
        class="prose"
        markdown={data.markdown}
        {componentsManifest}
      />
      {#snippet failed(error)}
        <p class="boundary-state">Failed to render Comark: {errorMessage(error)}</p>
      {/snippet}
    </svelte:boundary>
  </article>

  <aside class="panel aside">
    <p class="eyebrow">What this proves</p>
    <p class="lead">
      This route keeps <code>LazyCard.svelte</code> behind a dynamic import and
      still renders it into the SvelteKit SSR HTML.
    </p>
    <ul class="status-list">
      <li><code>ComarkAsync</code> parses markdown during SSR.</li>
      <li><code>componentsManifest</code> returns a non-eager dynamic import.</li>
      <li><code>&lt;svelte:boundary&gt;</code> handles async errors without replacing SSR HTML.</li>
    </ul>
  </aside>
</div>
