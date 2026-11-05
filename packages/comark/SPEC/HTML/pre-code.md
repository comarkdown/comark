## Input

```md
<pre><code>x &lt; y</code></pre>
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
        "code",
        {
          "$": {
            "html": 1,
            "block": 0
          }
        },
        "x < y"
      ]
    ]
  ]
}
```

## HTML

```html
<pre><code>x &lt; y</code></pre>
```

## Markdown

```md
<pre><code>x &lt; y</code></pre>
```
