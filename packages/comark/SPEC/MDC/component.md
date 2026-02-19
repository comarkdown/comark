---
timeout:
  parse: 5ms
  html: 5ms
  markdown: 5ms
---

## Input

```md
::component
First Paragraph

Second Paragraph
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
        "First Paragraph"
      ],
      [
        "p",
        {},
        "Second Paragraph"
      ]
    ]
  ]
}
```

## HTML

```html
<component>
  <p>First Paragraph</p>
  <p>Second Paragraph</p>
</component>
```

## Markdown

```md
::component
First Paragraph

Second Paragraph
::
```
