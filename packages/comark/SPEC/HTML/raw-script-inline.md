## Input

```md
a <script>**x**</script> after
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
      "a ",
      [
        "script",
        {
          "$": {
            "html": 1,
            "block": 0
          }
        },
        "**x**"
      ],
      " after"
    ]
  ]
}
```

## HTML

```html
<p>
  a <script>**x**</script> after
</p>
```

## Markdown

```md
a <script>**x**</script> after
```
