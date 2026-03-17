<script setup lang="ts">
const { data: posts } = await useFetch('/api/posts')

useSeoMeta({
  title: 'Comark Blog',
  description: 'A blog built with Nuxt UI and Comark.',
})
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold mb-2">
      Comark Blog
    </h1>
    <p class="text-gray-500 dark:text-gray-400 mb-8">
      A blog built with
      <a
        href="https://nuxt.com"
        class="underline"
      >Nuxt</a>
      and
      <a
        href="https://comark.dev"
        class="underline"
      >Comark</a>
      rendering.
    </p>
    <ul class="space-y-6">
      <li
        v-for="post in posts"
        :key="post.slug"
      >
        <NuxtLink
          :to="`/blog/${post.slug}`"
          class="group block rounded-lg border border-gray-200 dark:border-gray-800 p-5 transition hover:border-gray-400 dark:hover:border-gray-600 no-underline"
        >
          <h2 class="text-xl font-semibold group-hover:text-primary mb-1">
            {{ post.title }}
          </h2>
          <p class="text-gray-500 dark:text-gray-400 text-sm mb-2">
            {{ post.description }}
          </p>
          <div class="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
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
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
