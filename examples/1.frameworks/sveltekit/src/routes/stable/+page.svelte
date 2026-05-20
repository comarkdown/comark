<script lang="ts">
  import { ComarkRenderer } from '@comark/svelte'
  import { pascalCase } from '@comark/svelte/utils';
  import Alert from '$lib/components/comark/Alert.svelte'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  const modules = import.meta.glob('./*.svelte', {
    base: '../../lib/components/comark',
    eager: true,
  })

  const componentsManifest = (name: string) => {
    return modules[`./${pascalCase(name)}.svelte`]
  }
</script>

<div class="page-grid">
  <article class="panel">
    <ComarkRenderer
      class="prose"
      tree={data.tree}
      components={{ alert: Alert }}
      {componentsManifest}
    />
  </article>

  <aside class="panel aside">
    <p class="eyebrow">Stable SSR</p>
    <p class="lead">
      This route parses on the server and renders an AST with synchronous component
      resolution. Use it when you do not want Svelte's experimental async support.
    </p>
    <ul class="status-list">
      <li><code>parse()</code> runs in <code>+page.server.ts</code>.</li>
      <li><code>ComarkRenderer</code> receives a serialized AST.</li>
      <li>The manifest uses <code>eager: true</code> for synchronous SSR rendering.</li>
    </ul>
  </aside>
</div>
