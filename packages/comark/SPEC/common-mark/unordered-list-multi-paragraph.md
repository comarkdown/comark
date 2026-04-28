## Input

```md
- para1

  para2
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
        {},
        [
          "p",
          {},
          "para1"
        ],
        [
          "p",
          {},
          "para2"
        ]
      ]
    ]
  ]
}
```

## HTML

```html
<ul>
  <li>
    <p>para1</p>
    <p>para2</p>
  </li>
</ul>
```

## Markdown

```md
- para1

  para2
```
