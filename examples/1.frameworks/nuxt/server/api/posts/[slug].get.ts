import fs from 'node:fs'
import path from 'node:path'
import { parse } from 'comark'
import highlight from 'comark/plugins/highlight'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const filePath = path.join(process.cwd(), 'content/posts', `${slug}.md`)

  if (!fs.existsSync(filePath)) {
    throw createError({ statusCode: 404, message: 'Post not found' })
  }

  const content = fs.readFileSync(filePath, 'utf-8')
  const tree = await parse(content, {
    plugins: [highlight()],
  })

  const fm = tree.frontmatter as Record<string, unknown>

  return {
    slug,
    title: fm.title as string,
    description: fm.description as string,
    pubDate: fm.pubDate as string,
    tags: (fm.tags as string[]) || [],
    tree,
  }
})
