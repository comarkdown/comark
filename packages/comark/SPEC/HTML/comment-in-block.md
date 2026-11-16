## Input

```md
<div>
  <!-- x -->
  text
</div>
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "div",
      {
        "$": {
          "html": 1,
          "block": 1
        }
      },
      [
        null,
        {},
        " x "
      ],
      "text"
    ]
  ]
}
```

## HTML

```html
<div>
  <!-- x -->text
</div>
```

## Markdown

```md
<div>
<!-- x -->text
</div>
```
