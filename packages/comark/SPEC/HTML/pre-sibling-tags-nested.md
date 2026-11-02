## Input

```md
<pre><span><b>a</b><i>b</i></span><b>c</b></pre>
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "pre",
      {
        "$": {
          "html": 1,
          "block": 1
        }
      },
      [
        "span",
        {
          "$": {
            "html": 1,
            "block": 0
          }
        },
        [
          "b",
          {
            "$": {
              "html": 1,
              "block": 0
            }
          },
          "a"
        ],
        [
          "i",
          {
            "$": {
              "html": 1,
              "block": 0
            }
          },
          "b"
        ]
      ],
      [
        "b",
        {
          "$": {
            "html": 1,
            "block": 0
          }
        },
        "c"
      ]
    ]
  ]
}
```

## HTML

```html
<pre><span><b>a</b><i>b</i></span><b>c</b></pre>
```

## Markdown

```md
<pre><span><b>a</b><i>b</i></span><b>c</b></pre>
```
