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
      [
        "p",
        {},
        "Default slot content"
      ]
    ]
  ]
}
```

## HTML

```html
<component>
  <p>Default slot content</p>
</component>
```

## Markdown

```md
::component
Default slot content
::
```
