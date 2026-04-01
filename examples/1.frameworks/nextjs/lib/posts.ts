import fs from 'node:fs'
import path from 'node:path'
import { parse } from 'comark'
import type { ComarkTree } from 'comark'
import highlight from '@comark/react/plugins/highlight'

export interface PostMeta {
  slug: string
  title: string
  description: string
  pubDate: Date
  tags: string[]
}

export interface Post extends PostMeta {
  tree: ComarkTree
}

const postsDir = path.join(process.cwd(), 'content/posts')

function getMarkdownFiles(): { slug: string, content: string }[] {
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'))
  return files.map(file => ({
    slug: file.replace(/\.md$/, ''),
    content: fs.readFileSync(path.join(postsDir, file), 'utf-8'),
  }))
}

export async function getAllPosts(): Promise<PostMeta[]> {
  const files = getMarkdownFiles()
  const posts: PostMeta[] = []

  for (const { slug, content } of files) {
    const tree = await parse(content)
    const fm = tree.frontmatter as Record<string, unknown>
    posts.push({
      slug,
      title: fm.title as string,
      description: fm.description as string,
      pubDate: new Date(fm.pubDate as string),
      tags: (fm.tags as string[]) || [],
    })
  }

  return posts.sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf())
}

export async function getPost(slug: string): Promise<Post> {
  const filePath = path.join(postsDir, `${slug}.md`)
  const content = fs.readFileSync(filePath, 'utf-8')

  const tree = await parse(content, {
    plugins: [
      highlight(),
    ],
  })

  const fm = tree.frontmatter as Record<string, unknown>

  return {
    slug,
    title: fm.title as string,
    description: fm.description as string,
    pubDate: new Date(fm.pubDate as string),
    tags: (fm.tags as string[]) || [],
    tree,
  }
}
