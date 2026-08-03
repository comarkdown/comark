---
timeout:
  parse: 5ms
  html: 5ms
  markdown: 5ms
options:
  maxInlineAttributes: 5
---

## Input

```md
::my-component{block reverse square="false" disabled="true" count="5"}
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
        "count": "5",
        "disabled": "true",
        "square": "false"
      },
      "My button"
    ]
  ]
}
```

## HTML

```html
<my-component block reverse square="false" disabled count="5">
  My button
</my-component>
```

## Markdown

```md
::my-component{block reverse square="false" disabled="true" count="5"}
My button
::
```
