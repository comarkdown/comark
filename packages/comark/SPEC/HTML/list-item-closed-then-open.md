## Input

```md
- <div>a</div><div>b
- c
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
          "div",
          {
            "$": {
              "html": 1,
              "block": 0
            }
          },
          "a"
        ],
        [
          "div",
          {
            "$": {
              "html": 1,
              "block": 0
            }
          },
          "b"
        ]
      ],
      [
        "li",
        {},
        "c"
      ]
    ]
  ]
}
```

## HTML

```html
<ul>
  <li>
    <div>a</div>
    <div>b</div>
  </li>
  <li>c</li>
</ul>
```

## Markdown

```md
- <div>a</div>
  <div>b</div>
- c
```
