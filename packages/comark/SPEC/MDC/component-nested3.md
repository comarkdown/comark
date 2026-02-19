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

  :::child
  Second Paragraph

    ::::grand-child
    Third Paragraph
    ::::
  :::
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
        "child",
        {},
        [
          "p",
          {},
          "Second Paragraph"
        ],
        [
          "grand-child",
          {},
          [
            "p",
            {},
            "Third Paragraph"
          ]
        ]
      ]
    ]
  ]
}
```

## HTML

```html
<component>
  <p>First Paragraph</p>
  <child>
    <p>Second Paragraph</p>
    <grand-child>
      <p>Third Paragraph</p>
    </grand-child>
  </child>
</component>
```

## Markdown

```md
::component
First Paragraph

  :::child
  Second Paragraph

    ::::grand-child
    Third Paragraph
    ::::
  :::
::
```
