## Input

```md
---
title: [
---

# Hi
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "h1",
      {
        "id": "hi"
      },
      "Hi"
    ]
  ]
}
```

## HTML

```html
<h1 id="hi">Hi</h1>
```

## Markdown

```md
# Hi
```
