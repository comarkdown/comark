## Input

```md
::component
First Paragraph

  :::child
  Second Paragraph
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
  <child>
    Second Paragraph
  </child>
</component>
```

## Markdown

```md
::component
First Paragraph

  :::child
  Second Paragraph
  :::
::
```
