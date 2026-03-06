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
:no-sugar-syntax

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
      "no-sugar-syntax",
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
<no-sugar-syntax></no-sugar-syntax>
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
::no-sugar-syntax
::

::component
#first
First Paragraph

#second
Second Paragraph
::
```
