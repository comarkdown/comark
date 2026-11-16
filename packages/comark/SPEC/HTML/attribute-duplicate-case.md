## Input

```md
<a href=x HREF=y title>t</a>
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "a",
      {
        "$": {
          "html": 1,
          "block": 0
        },
        "href": "x",
        "title": true
      },
      "t"
    ]
  ]
}
```

## HTML

```html
<a href="x" title>t</a>
```

## Markdown

```md
<a href="x" title>t</a>
```
