## Input

```md
<pre><script>a &lt; b</script></pre>
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
        "script",
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
<pre><script>a &lt; b</script></pre>
```

## Markdown

```md
<pre><script>a &lt; b</script></pre>
```
