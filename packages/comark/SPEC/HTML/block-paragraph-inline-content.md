---
options:
  autoUnwrap: false
---

## Input

```md
<div>

![](x.png)

a\
b

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
        "a",
        [
          "br",
          {}
        ],
        "b"
      ]
    ]
  ]
}
```

## HTML

```html
<div>
  <p><img src="x.png"></p>
  <p>a<br>b</p>
</div>
```

## Markdown

```md
<div>
![](x.png)


a  
b
</div>
```
