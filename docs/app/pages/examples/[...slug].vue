<script setup lang="ts">
import { joinURL } from 'ufo'
import { kebabCase } from 'scule'

definePageMeta({
  layout: 'docs',
})

const appConfig = useAppConfig()
const route = useRoute()

const { data: page } = await useAsyncData(kebabCase(route.path), () =>
  queryCollection('examples').path(`${route.path}`).first(),
)
if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Example not found',
    message: `${route.path} does not exist`,
    fatal: true,
  })
}

const { data: surround } = await useAsyncData(`${kebabCase(route.path)}-surround`, async () => {
  const data = await queryCollectionItemSurroundings('examples', `${route.path}`, {
    fields: ['description'],
  }).where('category', '=', page.value?.category)

  return data?.map((item) => {
    if (!item) return null
    return { ...item, path: item.path }
  })
})

const exampleName = computed(() => {
  if (page.value?.stem) {
    return page.value.stem.replace(/^\/?examples\//, '').replace(/readme$/i, '')
  }
  return route.path.replace(/^\/examples\//, '')
})

const breadcrumb = computed(() => [
  { label: 'Examples', icon: 'i-lucide-folder-code', to: '/examples' },
  { label: page.value?.title || exampleName.value },
])

const site = useSiteConfig()
const path = computed(() => route.path.replace(/\/$/, ''))
prerenderRoutes([joinURL('/raw', `${path.value}.md`)])
useHead({
  link: [
    {
      rel: 'alternate',
      href: joinURL(site.url, 'raw', `${path.value}.md`),
      type: 'text/markdown',
    },
  ],
})
const title = `${page.value?.title || exampleName.value} Example`
const description = page.value?.description
useSeoMeta({
  title,
  description,
})
defineOgImage('Docs', {
  headline: 'Examples',
  title,
  description,
})
</script>

<template>
  <UPage v-if="page">
    <UPageHeader
      :title="page.title"
      :description="page.description"
      :ui="{
        wrapper: 'flex-row items-center flex-wrap justify-between',
      }"
    >
      <template #headline>
        <UBreadcrumb :items="breadcrumb" />
      </template>
      <template #links>
        <UButton
          icon="i-simple-icons-github"
          label="Source"
          color="neutral"
          variant="soft"
          size="sm"
          :to="`https://github.com/${appConfig.docs?.github}/tree/${appConfig.docs?.branch || 'main'}/examples/${exampleName}`"
          target="_blank"
        />
        <UButton
          v-if="page.demo"
          trailing-icon="i-lucide-arrow-up-right"
          label="Open demo"
          color="neutral"
          variant="soft"
          size="sm"
          :to="page.demo"
          target="_blank"
        />
        <UButton
          v-else
          icon="i-simple-icons-stackblitz"
          label="Open in StackBlitz"
          color="neutral"
          variant="soft"
          size="sm"
          :to="`https://stackblitz.com/fork/github/${appConfig.docs?.github}/tree/${appConfig.docs?.branch || 'main'}/examples/${exampleName}`"
          target="_blank"
        />
      </template>
    </UPageHeader>

    <UPageBody
      prose
      class="wrap-break-word"
    >
      <ContentRenderer
        v-if="page.body"
        :value="page"
      />

      <div class="space-y-6">
        <USeparator type="dashed" />
        <div class="mb-4">
          <UPageLinks
            class="inline-block"
            :links="[
              {
                icon: 'i-lucide-pencil',
                label: 'Edit this page',
                to: `https://github.com/${appConfig.docs?.github}/edit/${appConfig.docs?.branch || 'main'}/examples/${exampleName}/README.md`,
                target: '_blank',
              },
            ]"
          />
        </div>
        <UContentSurround
          v-if="surround?.length"
          class="mb-4"
          :surround="surround"
        />
      </div>
    </UPageBody>
  </UPage>
</template>
