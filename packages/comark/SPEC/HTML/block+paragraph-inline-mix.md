---
options:
  autoUnwrap: false
---

## Input

```md
<div>

hello ![](x.png) a  
b :badge[x] <my-el>y</my-el> <br> end

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
        "hello ",
        [
          "img",
          {
            "src": "x.png"
          }
        ],
        " a",
        [
          "br",
          {}
        ],
        "b ",
        [
          "badge",
          {},
          "x"
        ],
        " ",
        [
          "my-el",
          {
            "$": {
              "html": 1,
              "block": 0
            }
          },
          "y"
        ],
        " ",
        [
          "br",
          {
            "$": {
              "html": 1,
              "block": 0
            }
          }
        ],
        " end"
      ]
    ]
  ]
}
```

## HTML

```html
<div>
  <p>
    hello <img src="x.png"> a<br>b <badge>x</badge> <my-el>y</my-el> <br> end
  </p>
</div>
```

## Markdown

```md
<div>
hello ![](x.png) a  
b :badge[x] <my-el>y</my-el> <br> end
</div>
```
