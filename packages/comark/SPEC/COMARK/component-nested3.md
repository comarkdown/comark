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
          "Third Paragraph"
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
      Third Paragraph
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
