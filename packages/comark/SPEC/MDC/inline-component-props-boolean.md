---
timeout:
  parse: 5ms
  html: 5ms
  markdown: 5ms
---

## Input

```md
:component{reverse :square="false" :disabled="true"}
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "component",
      {
        ":reverse": "true",
        ":disabled": "true",
        ":square": "false"
      }
    ]
  ]
}
```

## HTML

```html
<component reverse square="false" disabled></component>
```

## Markdown

```md
::component{reverse :square="false" disabled}
::
```
