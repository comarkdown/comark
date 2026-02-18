---
timeout:
  parse: 5ms
  html: 5ms
  markdown: 5ms
---

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
  "type": "comark",
  "value": [
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
Content here
```
