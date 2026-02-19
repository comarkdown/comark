---
timeout:
  parse: 5ms
  html: 5ms
  markdown: 5ms
---

## Input

```md
This is a simple paragraph
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
      "This is a simple paragraph"
    ]
  ]
}
```

## HTML

```html
<p>This is a simple paragraph</p>
```

## Markdown

```md
This is a simple paragraph
```
