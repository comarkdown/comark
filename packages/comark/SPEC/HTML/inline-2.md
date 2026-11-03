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
}
```

## HTML

```html
<span>Hello <strong>World</strong></span>
```

## Markdown

```md
<span>Hello **World**</span>
```
