## Input

```md
<pre><style>a &lt; b</style></pre>
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
        "style",
        {
          "$": {
            "html": 1,
            "block": 0
          }
        },
        "a &lt; b"
      ]
    ]
  ]
}
```

## HTML

```html
<pre><style>a &lt; b</style></pre>
```

## Markdown

```md
<pre><style>a &lt; b</style></pre>
```
