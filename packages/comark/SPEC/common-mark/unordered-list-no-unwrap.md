---
options:
  autoUnwrap: false
---

## Input

```md
- para1
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "ul",
      {},
      [
        "li",
        {},
        [
          "p",
          {},
          "para1"
        ]
      ]
    ]
  ]
}
```

## HTML

```html
<ul>
  <li>
    <p>para1</p>
  </li>
</ul>
```

## Markdown

```md
- para1
```
