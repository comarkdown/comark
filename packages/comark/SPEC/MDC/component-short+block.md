---
timeout:
  parse: 5ms
  html: 5ms
  markdown: 5ms
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
<no-sugar-syntax></no-sugar-syntax>
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
::no-sugar-syntax
::

::component
#first
First Paragraph

#second
Second Paragraph
::
```
