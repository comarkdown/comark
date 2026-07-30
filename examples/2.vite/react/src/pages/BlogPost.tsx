import { useEffect, useState } from 'react'
import { MarkdownParsed } from '@comark/react'
import { getPost, type Post } from '../lib/posts'
import Alert from '../components/Alert'
import { Link } from '../router'

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function BlogPost({ slug }: { slug: string }) {
  const [post, setPost] = useState<Post | null>(null)

  useEffect(() => {
    getPost(slug).then(setPost)
  }, [slug])

  if (!post) return null

  return (
    <article>
      <header className="pb-4 mb-8 not-prose">
        <Link
          to="/"
          className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 mb-4 inline-block no-underline"
        >
          &larr; Back to all posts
        </Link>
        <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
        <div className="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
          <time dateTime={post.pubDate}>{formatDate(post.pubDate)}</time>
          <div className="flex gap-1.5">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 rounded text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </header>
      <MarkdownParsed
        value={post.tree}
        components={{ Alert }}
      />
    </article>
  )
}
