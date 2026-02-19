---
timeout:
  parse: 5ms
  html: 5ms
  markdown: 5ms
---

## Input

```md
:::component
:::
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "component",
      {}
    ]
  ]
}
```

## HTML

```html
<component></component>
```

## Markdown

```md
:component
```
