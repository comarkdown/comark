import fs from 'node:fs'
import path from 'node:path'
import { parseMarkdown } from 'comark'

export default defineEventHandler(async () => {
  const postsDir = path.join(process.cwd(), 'content/posts')
  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith('.md'))

  const posts = []

  for (const file of files) {
    const slug = file.replace(/\.md$/, '')
    const content = fs.readFileSync(path.join(postsDir, file), 'utf-8')
    const tree = await parseMarkdown(content)
    const fm = tree.frontmatter as Record<string, unknown>

    posts.push({
      slug,
      title: fm.title as string,
      description: fm.description as string,
      pubDate: fm.pubDate as string,
      tags: (fm.tags as string[]) || [],
    })
  }

  return posts.sort((a, b) => new Date(b.pubDate).valueOf() - new Date(a.pubDate).valueOf())
})
