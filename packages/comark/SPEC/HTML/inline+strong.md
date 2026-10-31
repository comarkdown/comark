## Input

```md
**bold <i>x</i> end** and [a <b>link</b>](/u)
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
      [
        "strong",
        {},
        "bold ",
        [
          "i",
          {
            "$": {
              "html": 1,
              "block": 0
            }
          },
          "x"
        ],
        " end"
      ],
      " and ",
      [
        "a",
        {
          "href": "/u"
        },
        "a ",
        [
          "b",
          {
            "$": {
              "html": 1,
              "block": 0
            }
          },
          "link"
        ]
      ]
    ]
  ]
}
```

## HTML

```html
<p><strong>bold <i>x</i> end</strong> and <a href="/u">a <b>link</b></a></p>
```

## Markdown

```md
**bold <i>x</i> end** and [a <b>link</b>](/u)
```
