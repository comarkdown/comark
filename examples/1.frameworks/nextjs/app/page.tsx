import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'

export default async function HomePage() {
  const posts = await getAllPosts()

  return (
    <>
      <h1 className="text-3xl font-bold mb-2">Comark Blog</h1>
      <p className="text-neutral-500 dark:text-neutral-400 mb-8">
        A blog built with{' '}
        <a
          href="https://nextjs.org"
          className="underline"
        >
          Next.js
        </a>
        {' and '}
        <a
          href="https://comark.dev"
          className="underline"
        >
          Comark
        </a>
        {' rendering.'}
      </p>
      <ul className="space-y-6">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="group block rounded-lg border border-neutral-200 dark:border-neutral-800 p-5 transition hover:border-neutral-400 dark:hover:border-neutral-600"
            >
              <h2 className="text-xl font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-1">
                {post.title}
              </h2>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-2">{post.description}</p>
              <div className="flex items-center gap-3 text-xs text-neutral-400 dark:text-neutral-500">
                <time dateTime={post.pubDate.toISOString()}>
                  {post.pubDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </time>
                <div className="flex gap-1.5">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-neutral-200 dark:bg-neutral-800 px-2 py-0.5 rounded-full"
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
    </>
  )
}
