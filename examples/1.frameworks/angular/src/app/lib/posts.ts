import { parseMarkdown, type MarkdownDocument } from 'comark'
import shiki from 'comark/plugins/shiki'

const slugs = ['hello-world', 'comark-syntax', 'angular-integration']

export interface PostMeta {
  slug: string
  title: string
  description: string
  pubDate: string
  tags: string[]
}

export interface Post extends PostMeta {
  tree: MarkdownDocument
}

interface Frontmatter {
  title?: unknown
  description?: unknown
  pubDate?: unknown
  tags?: unknown
}

function text(value: unknown): string {
  return value == null ? '' : String(value)
}

async function readPost(slug: string): Promise<string> {
  const url = new URL(`posts/${slug}.md`, document.baseURI)
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Post not found: ${slug}`)
  return response.text()
}

function metadata(slug: string, frontmatter: Frontmatter): PostMeta {
  return {
    slug,
    title: text(frontmatter.title),
    description: text(frontmatter.description),
    pubDate: text(frontmatter.pubDate),
    tags: Array.isArray(frontmatter.tags) ? frontmatter.tags.map(text) : [],
  }
}

export async function getAllPosts(): Promise<PostMeta[]> {
  const posts = await Promise.all(
    slugs.map(async (slug) => {
      const tree = await parseMarkdown(await readPost(slug))
      return metadata(slug, tree.frontmatter as Frontmatter)
    })
  )
  return posts.sort((a, b) => new Date(b.pubDate).valueOf() - new Date(a.pubDate).valueOf())
}

export async function getPost(slug: string): Promise<Post> {
  if (!slugs.includes(slug)) throw new Error(`Post not found: ${slug}`)

  const tree = await parseMarkdown(await readPost(slug), { plugins: [shiki()] })
  return { ...metadata(slug, tree.frontmatter as Frontmatter), tree }
}
