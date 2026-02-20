---
timeout:
  parse: 5ms
  html: 5ms
  markdown: 5ms
---

## Input

```md
:shorthand-block

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
      "shorthand-block",
      {}
    ],
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
          "name": "second"
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
<shorthand-block></shorthand-block>
<component>
  <template name="first">
    <p>First Paragraph</p>
  </template>
  <template name="second">
    <p>Second Paragraph</p>
  </template>
</component>
```

## Markdown

```md
:shorthand-block

::component
#first
First Paragraph

#second
Second Paragraph
::
```
