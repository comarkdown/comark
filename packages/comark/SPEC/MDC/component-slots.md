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

#second
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
          "name": "second"
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
  <template name="second">
    Second Paragraph
  </template>
</component>
```

## Markdown

```md
::component
#first
First Paragraph

#second
Second Paragraph
::
```
