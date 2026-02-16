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
  "type": "comark",
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
