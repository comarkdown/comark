## Input

```md
GET /apps/<id>

Next paragraph.
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
      "GET /apps/",
      [
        "id",
        {
          "$": {
            "html": 1,
            "block": 0
          }
        }
      ]
    ],
    [
      "p",
      {},
      "Next paragraph."
    ]
  ]
}
```

## HTML

```html
<p>
  GET /apps/<id></id>
</p>
<p>Next paragraph.</p>
```

## Markdown

```md
GET /apps/<id></id>

Next paragraph.
```
