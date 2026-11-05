---
options:
  autoUnwrap: false
---

## Input

```md
<div>

![](x.png)

![](y.png)

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
        "p",
        {},
        [
          "img",
          {
            "src": "x.png"
          }
        ]
      ],
      [
        "p",
        {},
        [
          "img",
          {
            "src": "y.png"
          }
        ]
      ]
    ]
  ]
}
```

## HTML

```html
<div>
  <p><img src="x.png"></p>
  <p><img src="y.png"></p>
</div>
```

## Markdown

```md
<div>
![](x.png)


![](y.png)
</div>
```
