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
  "type": "comark",
  "value": [
    [
      "h1",
      {
        "id": "content"
      },
      "Content"
    ]
  ]
}
```

## HTML

```html
<h1 id="content">Content</h1>
```

## Markdown

```md
# Content
```
