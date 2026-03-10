---
timeout:
  parse: 5ms
  html: 5ms
  markdown: 5ms
---

## Input

```md
::component
Default slot content
::
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "component",
      {},
      "Default slot content"
    ]
  ]
}
```

## HTML

```html
<component>
  Default slot content
</component>
```

## Markdown

```md
::component
Default slot content
::
```
