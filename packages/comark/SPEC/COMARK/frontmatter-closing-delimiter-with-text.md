## Input

```md
---
title: a
--- x
---

Body
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "p",
      {},
      "Body"
    ]
  ]
}
```

## HTML

```html
<p>Body</p>
```

## Markdown

```md
Body
```
