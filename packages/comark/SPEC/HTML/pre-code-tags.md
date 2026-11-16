## Input

```md
<pre><code class="language-js">x &lt; y &amp; <span>z</span></code></pre>
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
          },
          "class": "language-js"
        },
        "x < y & ",
        [
          "span",
          {
            "$": {
              "html": 1,
              "block": 0
            }
          },
          "z"
        ]
      ]
    ]
  ]
}
```

## HTML

```html
<pre><code class="language-js">x &lt; y & <span>z</span></code></pre>
```

## Markdown

```md
<pre><code class="language-js">x &lt; y &amp; <span>z</span></code></pre>
```
