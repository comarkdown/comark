<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ComarkRenderer } from '@comark/vue'
import Alert from '@/components/Alert.vue'
import { getPost } from '@/lib/posts'
import { ref } from 'vue'

const route = useRoute()
const post = await getPost(route.params.slug as string)

const title = ref(post.tree.frontmatter.title as string)
const pubDate = ref(post.tree.frontmatter.pubDate as string)
const tags = ref(post.tree.frontmatter.tags as string)

if (import.meta.hot) {
  import.meta.hot.on('comark:update', (data) => {
    // This is not needed if ComarkRenderer render everything
    // But in case user renders title/description themselves
    // They can listen to the update event and update the post manually
    if (data.tree) {
      title.value = data.tree.frontmatter.title as string
      pubDate.value = data.tree.frontmatter.pubDate as string
      tags.value = data.tree.frontmatter.tags as string
    }
  })
}
</script>

<template>
  <article>
    <header class="pb-4 mb-8">
      <RouterLink
        to="/"
        class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-4 inline-block no-underline"
      >
        &larr; Back to all posts
      </RouterLink>
      <h1 class="text-3xl font-bold mb-2">
        {{ title }}
      </h1>
      <div class="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
        <time :datetime="pubDate">
          {{ new Date(pubDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}
        </time>
        <div class="flex gap-1.5">
          <UBadge
            v-for="tag in tags"
            :key="tag"
            :label="tag"
            color="neutral"
            variant="subtle"
            size="xs"
          />
        </div>
      </div>
    </header>
    <ComarkRenderer
      :tree="post.tree"
      :components="{ Alert }"
    />
  </article>
</template>
