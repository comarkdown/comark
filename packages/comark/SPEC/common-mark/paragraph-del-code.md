## Input

```md
~~`x`~~ ~~a **b** `c`~~
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "p",
      {},
      [
        "del",
        {},
        [
          "code",
          {},
          "x"
        ]
      ],
      " ",
      [
        "del",
        {},
        "a ",
        [
          "strong",
          {},
          "b"
        ],
        " ",
        [
          "code",
          {},
          "c"
        ]
      ]
    ]
  ]
}
```

## HTML

```html
<p><del><code>x</code></del> <del>a <strong>b</strong> <code>c</code></del></p>
```

## Markdown

```md
~~`x`~~ ~~a **b** `c`~~
```
