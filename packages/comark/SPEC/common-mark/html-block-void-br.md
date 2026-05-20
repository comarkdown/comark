## Input

```md
<br>

# After br
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "br",
      {
        "$": {
          "html": 1,
          "block": 1
        }
      }
    ],
    [
      "h1",
      {
        "id": "after-br"
      },
      "After br"
    ]
  ]
}
```

## HTML

```html
<br />
<h1 id="after-br">After br</h1>
```

## Markdown

```md
<br />

# After br
```
