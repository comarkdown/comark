---
title: Next.js
description: A blog example using Comark with Next.js App Router and React Server Components.
navigation.icon: i-simple-icons:nextdotjs
category: Frameworks
path: /examples/frameworks/nextjs
---

::code-tree{defaultValue="app/blog/[slug]/page.tsx" expandAll}

```tsx [app/blog/[slug]/page.tsx]
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
        <Link href="/">&larr; Back to all posts</Link>
        <h1>{post.title}</h1>
      </header>
      <ComarkRenderer tree={post.tree} className="prose" components={{ Alert }} />
    </article>
  )
}
```

```tsx [app/page.tsx]
import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'

export default async function HomePage() {
  const posts = await getAllPosts()

  return (
    <>
      <h1>Comark Blog</h1>
      <ul>
        {posts.map(post => (
          <li key={post.slug}>
            <Link href={`/blog/${post.slug}`}>
              <h2>{post.title}</h2>
              <p>{post.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
```

```ts [lib/posts.ts]
import fs from 'node:fs'
import path from 'node:path'
import { parse } from 'comark'
import type { ComarkTree } from 'comark/ast'
import highlight from 'comark/plugins/highlight'

const postsDir = path.join(process.cwd(), 'content/posts')

export async function getPost(slug: string) {
  const content = fs.readFileSync(
    path.join(postsDir, `${slug}.md`),
    'utf-8',
  )
  const tree = await parse(content, {
    plugins: [highlight()],
  })
  const fm = tree.frontmatter
  return { slug, title: fm.title, tree, /* ... */ }
}
```

```tsx [components/Alert.tsx]
import type { ReactNode } from 'react'

const styles = {
  info: 'bg-blue-50 border-blue-400 text-blue-900 dark:bg-blue-950/50 dark:border-blue-500/50 dark:text-blue-200',
  warning: 'bg-amber-50 border-amber-400 text-amber-900 dark:bg-amber-950/50 dark:border-amber-500/50 dark:text-amber-200',
  success: 'bg-emerald-50 border-emerald-400 text-emerald-900 dark:bg-emerald-950/50 dark:border-emerald-500/50 dark:text-emerald-200',
  danger: 'bg-red-50 border-red-400 text-red-900 dark:bg-red-950/50 dark:border-red-500/50 dark:text-red-200',
}

export default function Alert({ type = 'info', children }: { type?: 'info' | 'warning' | 'success' | 'danger', children?: ReactNode }) {
  return (
    <div
      className={`my-4 rounded-lg border-l-4 px-4 py-3 text-sm leading-relaxed ${styles[type]}`}
      role="alert"
    >
      {children}
    </div>
  )
}
```

```mdc [content/posts/hello-world.md]
---
title: Hello World
description: Getting started with Comark and Next.js.
pubDate: 2025-12-01
tags: [comark, nextjs]
---

Welcome to this blog powered by **Comark** and Next.js!

::alert{type="info"}
This alert is rendered using a custom Comark component.
::
```

```ts [next.config.ts]
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
}

export default nextConfig
```

```json [package.json]
{
  "name": "comark-nextjs",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "comark": "workspace:*",
    "next": "^15.3.3",
    "react": "^19.2.4",
    "react-dom": "^19.2.4"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.2.0",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "tailwindcss": "^4.2.0",
    "typescript": "^5.9.3"
  }
}
```

```js [postcss.config.mjs]
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}

export default config
```

```json [tsconfig.json]
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

::

This example demonstrates how to use Comark with Next.js App Router and React Server Components. Blog posts are stored as `.md` files with frontmatter, parsed using `parse()` from comark, and rendered using `ComarkRenderer` from `comark/react` with custom components like `Alert`.

## How it works

- **File-based content** — Posts are plain `.md` files in `content/posts/` with YAML frontmatter for metadata (title, description, pubDate, tags).
- **Comark parsing** — `lib/posts.ts` reads markdown files and uses `parse()` to build the AST and extract frontmatter — replacing the usual `gray-matter` + `remark` + `rehype` pipeline.
- **Static generation** — `generateStaticParams` pre-renders all blog posts at build time via `output: 'export'`.
- **React rendering** — `ComarkRenderer` from `comark/react` renders the AST using React Server Components, including custom ones like `Alert`. No client-side JavaScript is shipped for content rendering.
