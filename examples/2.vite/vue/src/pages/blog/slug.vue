<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ComarkRenderer } from '@comark/vue'
import Alert from '@/components/Alert.vue'
import { getPost } from '@/lib/posts'

const route = useRoute()
const post = await getPost(route.params.slug as string)
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
        {{ post.title }}
      </h1>
      <div class="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
        <time :datetime="post.pubDate">
          {{ new Date(post.pubDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}
        </time>
        <div class="flex gap-1.5">
          <UBadge
            v-for="tag in post.tags"
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
