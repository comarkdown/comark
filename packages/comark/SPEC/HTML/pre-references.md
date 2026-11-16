## Input

```md
<pre><code>a &lt;b&gt;c&lt;/b&gt; &amp;amp; &lt;!-- x --&gt;</code></pre>
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
        "a <b>c</b> &amp; <!-- x -->"
      ]
    ]
  ]
}
```

## HTML

```html
<pre><code>a &lt;b&gt;c&lt;/b&gt; &amp;amp; &lt;!-- x --&gt;</code></pre>
```

## Markdown

```md
<pre><code>a &lt;b>c&lt;/b> &amp;amp; &lt;!-- x --></code></pre>
```
