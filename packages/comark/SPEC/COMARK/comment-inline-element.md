## Input

```md
Hello <mark><!-- note --></mark> world
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
      "Hello ",
      [
        "mark",
        {
          "$": {
            "html": 1,
            "block": 0
          }
        },
        [
          null,
          {},
          " note "
        ]
      ],
      " world"
    ]
  ]
}
```

## HTML

```html
<p>
  Hello <mark><!-- note --></mark> world
</p>
```

## Markdown

```md
Hello <mark><!-- note --></mark> world
```
