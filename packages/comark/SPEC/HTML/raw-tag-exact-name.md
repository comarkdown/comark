## Input

```md
a <script-x>**x**</script-x> </script> after
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
        "script-x",
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
  a <script-x><strong>x</strong></script-x>  after
</p>
```

## Markdown

```md
a <script-x>**x**</script-x>  after
```
