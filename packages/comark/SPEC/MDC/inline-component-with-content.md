---
timeout:
  parse: 5ms
  html: 5ms
  markdown: 5ms
---

## Input

```md
:inline[Syntax]
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "inline",
      {},
      "Syntax"
    ]
  ]
}
```

## HTML

```html
<inline>
  Syntax
</inline>
```

## Markdown

```md
::inline
Syntax
::
```