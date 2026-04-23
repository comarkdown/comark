import { parse } from '@comark/vue/parse'
import highlight from '@comark/vue/plugins/highlight'
import type { ComarkTree } from '@comark/vue'

const rawFiles = import.meta.glob('../../content/posts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

export interface PostMeta {
  slug: string
  title: string
  description: string
  pubDate: string
  tags: string[]
}

export interface Post extends PostMeta {
  tree: ComarkTree
}

function slugFromPath(path: string): string {
  return path.split('/').pop()!.replace(/\.md$/, '')
}

export async function getAllPosts(): Promise<PostMeta[]> {
  const posts: PostMeta[] = []

  for (const [path, content] of Object.entries(rawFiles)) {
    const slug = slugFromPath(path)
    const tree = await parse(content)
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
}

export async function getPost(slug: string): Promise<Post> {
  const entry = Object.entries(rawFiles).find(([path]) => slugFromPath(path) === slug)
  if (!entry) throw new Error(`Post not found: ${slug}`)

  const [, content] = entry
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
}
