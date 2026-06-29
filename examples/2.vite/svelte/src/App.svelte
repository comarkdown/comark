<script lang="ts">
  import { route } from './lib/route.svelte'
  import Home from './pages/Home.svelte'
  import BlogPost from './pages/BlogPost.svelte'
  import Syntax from './pages/Syntax.svelte'
  import Live from './pages/Live.svelte'

  let path = $derived(route.path)
  let slug = $derived(path.startsWith('/post/') ? path.slice('/post/'.length) : null)

  const navLink =
    'text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 no-underline'
</script>

<div class="min-h-screen flex flex-col">
  <header class="border-b border-neutral-200 dark:border-neutral-800">
    <nav class="max-w-2xl mx-auto px-6 py-4 flex items-center gap-6">
      <a href="#/" class="text-lg font-semibold text-neutral-900 dark:text-white no-underline">Comark Blog</a>
      <a href="#/syntax" class={navLink}>Syntax</a>
      <a href="#/live" class={navLink}>Live</a>
    </nav>
  </header>

  <main class="max-w-2xl mx-auto px-6 py-8 flex-1 w-full prose">
    {#if path === '/'}
      <Home />
    {:else if path === '/syntax'}
      <Syntax />
    {:else if path === '/live'}
      <Live />
    {:else if slug}
      <BlogPost {slug} />
    {:else}
      <p>Not found</p>
    {/if}
  </main>

  <footer class="border-t border-neutral-200 dark:border-neutral-800 text-center text-sm text-neutral-500 dark:text-neutral-400 py-6">
    Built with
    <a href="https://svelte.dev" class="text-neutral-700 dark:text-neutral-300 underline">Svelte</a>
    +
    <a href="https://comark.dev" class="text-neutral-700 dark:text-neutral-300 underline">Comark</a>
  </footer>
</div>
