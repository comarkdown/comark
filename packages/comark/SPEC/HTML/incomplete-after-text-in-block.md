---
options:
  autoUnwrap: false
---

## Input

```md
<div>

Hello <b>x

more

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
        "Hello ",
        [
          "b",
          {
            "$": {
              "html": 1,
              "block": 0
            }
          },
          "x"
        ]
      ],
      [
        "p",
        {},
        "more"
      ]
    ]
  ]
}
```

## HTML

```html
<div>
  <p>
    Hello <b>x</b>
  </p>
  <p>more</p>
</div>
```

## Markdown

```md
<div>
Hello <b>x</b>


more
</div>
```
