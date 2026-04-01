## Input

```md
---
title: Test Post
author: John Doe
date: 2024-01-01
tags:
  - test
  - markdown
---
Content here
```

## AST

```json
{
  "frontmatter": {
    "title": "Test Post",
    "author": "John Doe",
    "date": "2024-01-01",
    "tags": [
      "test",
      "markdown"
    ]
  },
  "meta": {},
  "nodes": [
    [
      "p",
      {},
      "Content here"
    ]
  ]
}
```

## HTML

```html
<p>Content here</p>
```

## Markdown

```md
---
title: Test Post
author: John Doe
date: '2024-01-01'
tags:
  - test
  - markdown
---

Content here
```
