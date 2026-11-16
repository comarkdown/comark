## Input

```md
<div>

<p>a <b>x

<p>b

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
        {
          "$": {
            "html": 1,
            "block": 1
          }
        },
        "a ",
        [
          "b",
          {
            "$": {
              "html": 1,
              "block": 1
            }
          },
          "x"
        ]
      ],
      [
        "p",
        {
          "$": {
            "html": 1,
            "block": 1
          }
        },
        "b"
      ]
    ]
  ]
}
```

## HTML

```html
<div>
  <p>
    a <b>x</b>
  </p>
  <p>b</p>
</div>
```

## Markdown

```md
<div>
<p>
a <b>x</b>
</p>
<p>b</p>
</div>
```
