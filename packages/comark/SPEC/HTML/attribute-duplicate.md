## Input

```md
<img alt="first" alt="second">
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "img",
      {
        "$": {
          "html": 1,
          "block": 1
        },
        "alt": "first"
      }
    ]
  ]
}
```

## HTML

```html
<img alt="first">
```

## Markdown

```md
<img alt="first">
```
