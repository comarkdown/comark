## Input

```md
<span>Hello **World**</span>
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
        "span",
        {
          "$": {
            "html": 1,
            "block": 0
          }
        },
        "Hello ",
        [
          "strong",
          {},
          "World"
        ]
      ]
    ]
  ]
}
```

## HTML

```html
<p><span>Hello <strong>World</strong></span></p>
```

## Markdown

```md
<span>Hello **World**</span>
```
