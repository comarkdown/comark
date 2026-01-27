---
timeout:
  parse: 5ms
  html: 5ms
  markdown: 5ms
---

## Input

```md
---
title: My Title
description: My Description
---
# Content
```

## AST

```json
{
  "type": "minimark",
  "value": [
    [
      "h1",
      {},
      "Content"
    ]
  ]
}
```

## HTML

```html
<h1>Content</h1>
```

## Markdown

```md
# Content
```
