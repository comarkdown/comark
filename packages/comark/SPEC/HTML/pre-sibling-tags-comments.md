## Input

```md
<pre><!--a--><b>x</b><!--b--></pre>
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
        null,
        {},
        "a"
      ],
      [
        "b",
        {
          "$": {
            "html": 1,
            "block": 0
          }
        },
        "x"
      ],
      [
        null,
        {},
        "b"
      ]
    ]
  ]
}
```

## HTML

```html
<pre><!--a--><b>x</b><!--b--></pre>
```

## Markdown

```md
<pre><!--a--><b>x</b><!--b--></pre>
```
