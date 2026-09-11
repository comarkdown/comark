export const forCases = [
  {
    name: 'does not evaluate loops in inactive branches',
    markdown:
      '::if{:value="data.show"}\n:::for{:each="data.invalid"}\nHidden\n:::\n#else\nVisible\n::\n\n::for{:each="data.items"}\n{{ props.item }}\n#empty\n:::for{:each="data.invalid"}\nHidden\n:::\n::',
    data: { show: false, invalid: 'not an array', items: ['Present'] },
    expected: ['Visible', 'Present'],
    absent: ['Hidden'],
  },
  {
    name: 'items through headings and attributed wrappers',
    markdown:
      '::for{:each="data.posts" item="post" index="i" key="id"}\n### {{ props.post.title }}\n\n[{{ props.i }}: {{ props.post.description }}]{class="description"}\n#empty\nNo posts published yet.\n::',
    data: {
      posts: [
        { id: 1, title: 'First', description: 'Hello' },
        { id: 2, title: 'Second', description: 'World' },
      ],
    },
    expected: ['First', '0: Hello', 'Second', '1: World'],
    absent: ['No posts published yet.'],
  },
  ...[[], null, undefined].map((posts) => ({
    name: `empty collection ${String(posts)}`,
    markdown: '::for{:each="data.posts" item="post"}\n{{ props.post.title }}\n#empty\nNo posts published yet.\n::',
    data: { posts },
    expected: ['No posts published yet.'],
    absent: ['<for', '<template'],
  })),
  {
    name: 'nested iteration, conditional, outer scope and no sibling leakage',
    markdown:
      '::for{:each="data.posts" item="post"}\n:::for{:each="props.post.tags" item="tag"}\n::::if{:value="props.tag" neq="hidden"}\n{{ props.post.title }}: {{ props.tag }}\n::::\n:::\n::\n\nAfter: {{ props.post.title || outside }}',
    data: { posts: [{ title: 'First', tags: ['visible', 'hidden'] }] },
    expected: ['First: visible', 'After: outside'],
    absent: ['First: hidden'],
  },
  {
    name: 'explicit default slot and primitive values',
    markdown: '::for{:each="data.items"}\n#default\nItem: {{ props.item }}\n#empty\nEmpty\n::',
    data: { items: [0, false, 'hello'] },
    expected: ['Item: 0', 'Item: false', 'Item: hello'],
    absent: ['Empty'],
  },
]
