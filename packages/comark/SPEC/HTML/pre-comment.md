## Input

```md
<pre><!--hi--> a &lt; b</pre>
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
        "hi"
      ],
      " a < b"
    ]
  ]
}
```

## HTML

```html
<pre><!--hi--> a &lt; b</pre>
```

## Markdown

```md
<pre><!--hi--> a &lt; b</pre>
```
