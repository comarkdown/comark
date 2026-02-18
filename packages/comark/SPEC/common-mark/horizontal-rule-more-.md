---
timeout:
  parse: 5ms
  html: 5ms
  markdown: 5ms
---

## Input

```md
Paragraph

------------------
```

## AST

```json
{
  "type": "comark",
  "value": [
    [
      "p",
      {},
      "Paragraph"
    ],
    [
      "hr",
      {}
    ]
  ]
}
```

## HTML

```html
<p>Paragraph</p>
<hr />
```

## Markdown

```md
Paragraph

---
```
