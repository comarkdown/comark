<script lang="ts">
  import { MarkdownDocument } from '@comark/svelte'
  import { getPost, type Post } from '../lib/posts'
  import Alert from '../components/Alert.svelte'

  let { slug }: { slug: string } = $props()

  let post = $state<Post | null>(null)
  $effect(() => {
    getPost(slug).then((p) => (post = p))
  })

  function formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }
</script>

{#if post}
  <article>
    <header class="pb-4 mb-8 not-prose">
      <a
        href="#/"
        class="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 mb-4 inline-block no-underline"
      >
        &larr; Back to all posts
      </a>
      <h1 class="text-3xl font-bold mb-2">{post.title}</h1>
      <div class="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
        <time datetime={post.pubDate}>{formatDate(post.pubDate)}</time>
        <div class="flex gap-1.5">
          {#each post.tags as tag (tag)}
            <span class="px-1.5 py-0.5 rounded text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
              {tag}
            </span>
          {/each}
        </div>
      </div>
    </header>
    <MarkdownDocument value={post.tree} components={{ Alert }} />
  </article>
{/if}
