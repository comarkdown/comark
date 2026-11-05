---
options:
  autoUnwrap: false
---

## Input

```md
<div>

<my-el>y</my-el>

<img src="a">

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
        "my-el",
        {
          "$": {
            "html": 1,
            "block": 0
          }
        },
        "y"
      ],
      [
        "img",
        {
          "$": {
            "html": 1,
            "block": 0
          },
          "src": "a"
        }
      ]
    ]
  ]
}
```

## HTML

```html
<div>
  <my-el>y</my-el>
  <img src="a">
</div>
```

## Markdown

```md
<div>
<my-el>y</my-el>
<img src="a">
</div>
```
