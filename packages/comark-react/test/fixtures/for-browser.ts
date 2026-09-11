import { parseMarkdown } from 'comark'
import binding, { Binding, For } from '../../src/plugins/binding'
import { MarkdownDocument } from '../../src/components/MarkdownDocument'
import React from 'react'
import { createRoot } from 'react-dom/client'

export async function mount(): Promise<void> {
  const value = await parseMarkdown(
    '::for{:each="data.posts" item="post" key="id"}\n:input{:aria-label="props.post.title"}\n\n{{ props.post.title }}\n#empty\nNo posts\n::',
    { plugins: [binding()] }
  )
  const components = { Binding, For }
  const container = document.createElement('div')
  document.body.append(container)
  const initial = [
    { id: 'a', title: 'Alpha' },
    { id: 'b', title: 'Beta' },
  ]
  const root = createRoot(container)
  const updatePosts = (posts: typeof initial): void => {
    root.render(React.createElement(MarkdownDocument, { value, components, data: { posts } }))
  }
  updatePosts(initial)
  Object.assign(window, { updatePosts })
}
