## Input

```md
before <pre>**x** &lt; y</pre> after
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
      "before ",
      [
        "pre",
        {
          "$": {
            "html": 1,
            "block": 0
          }
        },
        "**x** < y"
      ],
      " after"
    ]
  ]
}
```

## HTML

```html
<p>before <pre>**x** &lt; y</pre> after</p>
```

## Markdown

```md
before <pre>**x** &lt; y</pre> after
```
