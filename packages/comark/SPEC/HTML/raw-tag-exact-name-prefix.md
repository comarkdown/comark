## Input

```md
a <prelude>**x**</prelude> </pre> after
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
      "a ",
      [
        "prelude",
        {
          "$": {
            "html": 1,
            "block": 0
          }
        },
        [
          "strong",
          {},
          "x"
        ]
      ],
      "  after"
    ]
  ]
}
```

## HTML

```html
<p>
  a <prelude><strong>x</strong></prelude>  after
</p>
```

## Markdown

```md
a <prelude>**x**</prelude>  after
```
