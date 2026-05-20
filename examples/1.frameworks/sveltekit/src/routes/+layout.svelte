<script lang="ts">
  import '../app.css'
</script>

<svelte:head>
  <title>Comark SvelteKit</title>
  <meta
    name="description"
    content="SvelteKit example for Comark with lazy components and SSR."
  />
</svelte:head>

<header class="site-header">
  <nav class="shell site-nav" aria-label="Main navigation">
    <a class="brand" href="/">Comark SvelteKit</a>
    <div class="nav-links">
      <a href="/">Lazy SSR</a>
      <a href="/stable">Stable SSR</a>
    </div>
  </nav>
</header>

<main class="shell page">
  <slot />
</main>
