## Input

```md
- a list item {attr="value"}
- another list item {attr2="value2"}
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "ul",
      {},
      [
        "li",
        {
          "attr": "value"
        },
        "a list item"
      ],
      [
        "li",
        {
          "attr2": "value2"
        },
        "another list item"
      ]
    ]
  ]
}
```

## HTML

```html
<ul>
  <li attr="value">a list item</li>
  <li attr2="value2">another list item</li>
</ul>
```

## Markdown

```md
- a list item {attr="value"}
- another list item {attr2="value2"}
```
