## Input

```md
<p>a<table><tr><td><p>b</td></tr></table>
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "p",
      {
        "$": {
          "html": 1,
          "block": 1
        }
      },
      "a",
      [
        "table",
        {
          "$": {
            "html": 1,
            "block": 0
          }
        },
        [
          "tr",
          {
            "$": {
              "html": 1,
              "block": 0
            }
          },
          [
            "td",
            {
              "$": {
                "html": 1,
                "block": 0
              }
            },
            [
              "p",
              {
                "$": {
                  "html": 1,
                  "block": 0
                }
              },
              "b"
            ]
          ]
        ]
      ]
    ]
  ]
}
```

## HTML

```html
<p>
  a
  <table><tr><td><p>b</p></td></tr></table>
</p>
```

## Markdown

```md
<p>
a
<table><tr><td><p>b</p></td></tr></table>
</p>
```
