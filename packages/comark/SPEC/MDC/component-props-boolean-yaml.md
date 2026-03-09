---
timeout:
  parse: 5ms
  html: 5ms
  markdown: 5ms
options:
  maxInlineAttributes: 0
---

## Input

```md
::my-component{:block reverse :square="false" :disabled="true"}
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
        ":reverse": "true",
        ":square": "false",
        ":disabled": "true"
      },
      "My button"
    ]
  ]
}
```

## HTML

```html
<my-component block reverse square="false" disabled>
  My button
</my-component>
```

## Markdown

```md
::my-component
---
block: true
reverse: true
square: false
disabled: true
---
My button
::
```
