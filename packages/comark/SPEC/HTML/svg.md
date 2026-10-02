## Input

```md
<svg viewBox="0 0 10 10"><linearGradient id="g"></linearGradient></svg>
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
        "svg",
        {
          "$": {
            "html": 1,
            "block": 0
          },
          "viewBox": "0 0 10 10"
        },
        [
          "linearGradient",
          {
            "$": {
              "html": 1,
              "block": 0
            },
            "id": "g"
          }
        ]
      ]
    ]
  ]
}
```

## HTML

```html
<p>
  <svg viewBox="0 0 10 10"><linearGradient id="g"></linearGradient></svg>
</p>
```

## Markdown

```md
<svg viewBox="0 0 10 10"><linearGradient id="g"></linearGradient></svg>
```
