## Input

```md
<p><img src="/foo.png" alt="x"></p>
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "p",
      {
        "$": { "html": 1, "block": 1 }
      },
      [
        "img",
        {
          "$": { "html": 1, "block": 1 },
          "src": "/foo.png",
          "alt": "x"
        }
      ]
    ]
  ]
}
```

## HTML

```html
<p><img src="/foo.png" alt="x" /></p>
```

## Markdown

```md
<p><img src="/foo.png" alt="x" /></p>
```
