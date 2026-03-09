---
timeout:
  parse: 5ms
  html: 5ms
  markdown: 5ms
---

## Input

```md
> This is a simple blockquote
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "blockquote",
      {},
      "This is a simple blockquote"
    ]
  ]
}
```

## HTML

```html
<blockquote>
  This is a simple blockquote
</blockquote>
```

## Markdown

```md
> This is a simple blockquote
```

