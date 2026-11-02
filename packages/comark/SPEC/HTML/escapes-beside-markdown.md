## Input

```md
<div>\*x\* **b** [l](/u)</div>
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
      "*x* ",
      [
        "strong",
        {},
        "b"
      ],
      " ",
      [
        "a",
        {
          "href": "/u"
        },
        "l"
      ]
    ]
  ]
}
```

## HTML

```html
<div>
  *x* <strong>b</strong> <a href="/u">l</a>
</div>
```

## Markdown

```md
<div>
&#42;x&#42; **b** [l](/u)
</div>
```
