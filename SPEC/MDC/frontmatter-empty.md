---
timeout:
  parse: 5ms
  html: 5ms
  markdown: 5ms
---

## Input

```md
---
---
# Content
```

## AST

```json
{
  "type": "minimark",
  "value": [
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
      {},
      "Content"
    ]
  ]
}
```

## HTML

```html
<hr />
<hr />
<h1>Content</h1>
```

## Markdown

```md
---

---

# Content
```
