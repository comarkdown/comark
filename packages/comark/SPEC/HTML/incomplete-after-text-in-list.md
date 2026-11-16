## Input

```md
- **a** <b>c
- d
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
          "strong",
          {},
          "a"
        ],
        " ",
        [
          "b",
          {
            "$": {
              "html": 1,
              "block": 0
            }
          },
          "c"
        ]
      ],
      [
        "li",
        {},
        "d"
      ]
    ]
  ]
}
```

## HTML

```html
<ul>
  <li>
    <strong>a</strong> <b>c</b>
  </li>
  <li>d</li>
</ul>
```

## Markdown

```md
- **a** <b>c</b>
- d
```
