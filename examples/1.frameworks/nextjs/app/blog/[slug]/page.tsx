import type { Metadata } from 'next'
import Link from 'next/link'
import { ComarkRenderer } from 'comark/react/components/ComarkRenderer'
import { getAllPosts, getPost } from '@/lib/posts'
import Alert from '@/components/Alert'

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map(post => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  return {
    title: post.title,
    description: post.description,
  }
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)

  return (
    <article>
      <header className="pb-4 mb-8">
        <Link
          href="/"
          className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 mb-4 inline-block"
        >
          &larr; Back to all posts
        </Link>
        <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
        <div className="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
          <time dateTime={post.pubDate.toISOString()}>
            {post.pubDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </time>
          <div className="flex gap-1.5">
            {post.tags.map(tag => (
              <span key={tag} className="bg-neutral-200 dark:bg-neutral-800 px-2 py-0.5 rounded-full text-xs">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </header>
      <ComarkRenderer tree={post.tree} className="prose" components={{ Alert }} />
    </article>
  )
}
