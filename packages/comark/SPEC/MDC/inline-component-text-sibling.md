---
timeout:
  parse: 5ms
  html: 5ms
  markdown: 5ms
---

## Input

```md
inline :component syntax
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
      "inline ",
      [
        "component",
        {}
      ],
      " syntax"
    ]
  ]
}
```

## HTML

```html
<p>
  inline <component></component> syntax
</p>
```

## Markdown

```md
inline :component syntax
```
