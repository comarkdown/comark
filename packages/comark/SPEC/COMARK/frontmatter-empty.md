## Input

```md
---
---
# Content
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "hr",
      {}
    ],
    [
      "hr",
      {}
    ],
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
<hr />
<hr />
<h1 id="content">Content</h1>
```

## Markdown

```md
---

---

# Content
```
