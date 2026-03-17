<script setup lang="ts">
const route = useRoute()
const { data: post } = await useFetch(`/api/posts/${route.params.slug}`)

useSeoMeta({
  title: () => post.value?.title,
  description: () => post.value?.description,
})
</script>

<template>
  <article v-if="post">
    <header class="pb-4 mb-8">
      <NuxtLink
        to="/"
        class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-4 inline-block no-underline"
      >
        &larr; Back to all posts
      </NuxtLink>
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
    <ComarkRenderer :tree="post.tree" />
  </article>
</template>
