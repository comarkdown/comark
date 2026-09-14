import { parseMarkdown } from 'comark'
import binding, { Binding, For } from '../../src/plugins/binding'
import { MarkdownDocument } from '../../src/components/MarkdownDocument'
import { createApp, h, shallowRef, Suspense } from 'vue'

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
  const posts = shallowRef(initial)
  createApp({
    render: () =>
      h(Suspense, null, { default: () => h(MarkdownDocument, { value, components, data: { posts: posts.value } }) }),
  }).mount(container)
  Object.assign(window, {
    updatePosts: (next: typeof initial) => {
      posts.value = next
    },
  })
}
