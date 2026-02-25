---
title: Astro
description: A blog example using Comark with Astro content collections and React components.
icon: i-simple-icons:astro
category: Astro
---

::code-tree{defaultValue="src/pages/posts/[...id].astro" expandAll}

```astro [src/pages/posts/[...id].astro]
---
import { getCollection } from 'astro:content'
import { parse } from 'comark'
import Layout from '../../layouts/Layout.astro'
import { ComarkRenderer } from 'comark/react'
import highlight from 'comark/plugins/highlight'
import Alert from '../../components/Alert'

export async function getStaticPaths() {
  const posts = await getCollection('posts')
  return posts.map((post) => ({
    params: { id: post.id },
    props: { post },
  }))
}

const { post } = Astro.props
const tree = await parse(post.body!, {
  plugins: [
    highlight({
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      }
    }),
  ],
})
---

<Layout title={post.data.title} description={post.data.description}>
  <article>
    <header class="pb-4 mb-8">
      <a href="/">&larr; Back to all posts</a>
      <h1>{post.data.title}</h1>
    </header>
    <ComarkRenderer tree={tree} className="prose" components={{ Alert }} />
  </article>
</Layout>
```

```astro [src/pages/index.astro]
---
import { getCollection } from 'astro:content'
import Layout from '../layouts/Layout.astro'

const posts = (await getCollection('posts')).sort(
  (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
)
---

<Layout title="Comark Blog">
  <h1>Comark Blog</h1>
  <ul>
    {posts.map((post) => (
      <li>
        <a href={`/posts/${post.id}/`}>
          <h2>{post.data.title}</h2>
          <p>{post.data.description}</p>
        </a>
      </li>
    ))}
  </ul>
</Layout>
```

```ts [src/content.config.ts]
import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

const posts = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/posts',
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
  }),
})

export const collections = { posts }
```

```tsx [src/components/Alert.tsx]
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

```mdc [src/content/posts/hello-world.md]
---
title: Hello World
description: Getting started with Comark and Astro content collections.
pubDate: 2025-12-01
tags: [comark, astro]
---

Welcome to this blog powered by **Comark** and Astro content collections!

::alert{type="info"}
This alert is rendered using a custom Comark component.
::
```

```ts [astro.config.mjs]
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
})
```

```json [package.json]
{
  "name": "comark-astro",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    "@astrojs/react": "^4.4.0",
    "@tailwindcss/vite": "^4.2.0",
    "astro": "^5.7.0",
    "comark": "workspace:*",
    "react": "^19.2.4",
    "react-dom": "^19.2.4"
  },
  "devDependencies": {
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "typescript": "^5.9.3"
  }
}
```

```json [tsconfig.json]
{
  "extends": "astro/tsconfigs/strict"
}
```

::

This example demonstrates how to use Comark with Astro content collections and React components. Blog posts are stored as `.md` files with Zod-validated frontmatter, loaded via the `glob()` loader, and rendered using `ComarkRenderer` from `comark/react` with custom components like `Alert`.

## How it works

- **Content collections** — Posts are defined with `glob()` loader and a Zod schema for type-safe frontmatter (title, description, pubDate, tags).
- **Comark parsing** — In the blog post page, `parse()` converts the raw Markdown body into a Comark AST.
- **React rendering** — `ComarkRenderer` from `comark/react` renders the AST using React components, including custom ones like `Alert`. Thanks to Astro's React integration, these are server-rendered with zero client-side JavaScript.
