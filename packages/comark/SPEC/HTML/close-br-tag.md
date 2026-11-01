## Input

```md
a</br>b
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
      "a",
      [
        "br",
        {
          "$": {
            "html": 1,
            "block": 0
          }
        }
      ],
      "b"
    ]
  ]
}
```

## HTML

```html
<p>a<br>b</p>
```

## Markdown

```md
a<br>b
```
