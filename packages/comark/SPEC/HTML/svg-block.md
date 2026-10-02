## Input

```md
<svg viewBox="0 0 10 10">
  <linearGradient id="g"></linearGradient>
</svg>
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "svg",
      {
        "$": {
          "html": 1,
          "block": 1
        },
        "viewBox": "0 0 10 10"
      },
      [
        "linearGradient",
        {
          "$": {
            "html": 1,
            "block": 1
          },
          "id": "g"
        }
      ]
    ]
  ]
}
```

## HTML

```html
<svg viewBox="0 0 10 10">
  <linearGradient id="g"></linearGradient>
</svg>
```

## Markdown

```md
<svg viewBox="0 0 10 10">
<linearGradient id="g"></linearGradient>
</svg>
```
