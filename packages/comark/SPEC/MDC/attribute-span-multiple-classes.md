---
timeout:
  parse: 5ms
  html: 5ms
  markdown: 5ms
---

## Input

```md
Welcome to [site]{.bg-gradient-to-r.from-primary-600.to-purple-600.bg-clip-text.text-transparent}
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
      "Welcome to ",
      [
        "span",
        {
          "class": "bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent"
        },
        "site"
      ]
    ]
  ]
}
```

## HTML

```html
<p>Welcome to <span class="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">site</span></p>
```

## Markdown

```md
Welcome to [site]{.bg-gradient-to-r.from-primary-600.to-purple-600.bg-clip-text.text-transparent}
```
