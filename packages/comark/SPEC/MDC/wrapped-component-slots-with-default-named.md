---
timeout:
  parse: 5ms
  html: 5ms
  markdown: 5ms
options:
  autoUnwrap: false
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
        [
          "p",
          {},
          "First Paragraph"
        ]
      ],
      [
        "template",
        {
          "name": "default"
        },
        [
          "p",
          {},
          "Second Paragraph"
        ]
      ]
    ]
  ]
}
```

## HTML

```html
<component>
  <template name="first">
    <p>First Paragraph</p>
  </template>
  <template name="default">
    <p>Second Paragraph</p>
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
