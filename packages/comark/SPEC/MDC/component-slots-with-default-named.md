---
timeout:
  parse: 5ms
  html: 5ms
  markdown: 5ms
---

## Input

```md
::component
#first
First Paragraph

#default
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
        "template",
        {
          "name": "first"
        },
        "First Paragraph"
      ],
      [
        "template",
        {
          "name": "default"
        },
        "Second Paragraph"
      ]
    ]
  ]
}
```

## HTML

```html
<component>
  <template name="first">
    First Paragraph
  </template>
  <template name="default">
    Second Paragraph
  </template>
</component>
```

## Markdown

```md
::component
#first
First Paragraph

#default
Second Paragraph
::
```
