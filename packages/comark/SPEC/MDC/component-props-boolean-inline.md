---
timeout:
  parse: 5ms
  html: 5ms
  markdown: 5ms
---

## Input

```md
::my-component{:block :square="false" :disabled="true"}
My button
::
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "my-component",
      {
        ":block": "true",
        ":disabled": "true",
        ":square": "false"
      },
      "My button"
    ]
  ]
}
```

## HTML

```html
<my-component block square="false" disabled>
  My button
</my-component>
```

## Markdown

```md
::my-component{block :square="false" disabled}
My button
::
```
