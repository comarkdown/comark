import { defineSitemapEventHandler } from '#imports'
import type { SitemapUrlInput } from '#sitemap/types'
import { queryCollection } from '@nuxt/content/server'

export default defineSitemapEventHandler(async (event) => {
  const docs = await queryCollection(event, 'docs').select('path').all()

  return docs.map((doc): SitemapUrlInput => ({ loc: doc.path }))
})
