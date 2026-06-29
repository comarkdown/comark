import { useEffect, useState } from 'react'
import { getAllPosts, type PostMeta } from '../lib/posts'
import { Link } from '../router'

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function Home() {
  const [posts, setPosts] = useState<PostMeta[]>([])

  useEffect(() => {
    getAllPosts().then(setPosts)
  }, [])

  return (
    <div className="not-prose">
      <h1 className="text-3xl font-bold mb-2">Comark Blog</h1>
      <p className="text-neutral-500 dark:text-neutral-400 mb-8">
        A blog built with{' '}
        <a
          href="https://react.dev"
          className="underline"
        >
          React
        </a>{' '}
        and{' '}
        <a
          href="https://comark.dev"
          className="underline"
        >
          Comark
        </a>{' '}
        rendering.
      </p>
      {posts.length === 0 && <p className="text-neutral-400">Loading posts...</p>}
      <ul className="space-y-6 list-none p-0">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              to={`/post/${post.slug}`}
              className="group block rounded-lg border border-neutral-200 dark:border-neutral-800 p-5 transition hover:border-neutral-400 dark:hover:border-neutral-600 no-underline"
            >
              <h2 className="text-xl font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-1">
                {post.title}
              </h2>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-2">{post.description}</p>
              <div className="flex items-center gap-3 text-xs text-neutral-400 dark:text-neutral-500">
                <time dateTime={post.pubDate}>{formatDate(post.pubDate)}</time>
                <div className="flex gap-1.5">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
