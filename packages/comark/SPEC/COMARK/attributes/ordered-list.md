## Input

```md
1. List item {attr="value"}
2. List item {attr2="value2"}
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "ol",
      {},
      [
        "li",
        {
          "attr": "value"
        },
        "List item"
      ],
      [
        "li",
        {
          "attr2": "value2"
        },
        "List item"
      ]
    ]
  ]
}
```

## HTML

```html
<ol>
  <li attr="value">List item</li>
  <li attr2="value2">List item</li>
</ol>
```

## Markdown

```md
1. List item {attr="value"}
2. List item {attr2="value2"}
```
