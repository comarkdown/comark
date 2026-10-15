## Input

```md
An icon: <svg viewBox="0 0 10 10"><linearGradient id="g"></linearGradient></svg>
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
      "An icon: ",
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
  An icon: <svg viewBox="0 0 10 10"><linearGradient id="g"></linearGradient></svg>
</p>
```

## Markdown

```md
An icon: <svg viewBox="0 0 10 10"><linearGradient id="g"></linearGradient></svg>
```
