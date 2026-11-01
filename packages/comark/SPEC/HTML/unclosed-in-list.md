## Input

```md
- **a** <b>c
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
</ul>
```

## Markdown

```md
- **a** <b>c</b>
```
