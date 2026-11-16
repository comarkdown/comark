## Input

```md
before <pre>
line
  indented</pre> after
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
        "\nline\n  indented"
      ],
      " after"
    ]
  ]
}
```

## HTML

```html
<p>before <pre>
line
  indented</pre> after</p>
```

## Markdown

```md
before <pre>
line
  indented</pre> after
```
