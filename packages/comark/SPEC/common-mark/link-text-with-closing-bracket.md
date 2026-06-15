## Input

```md
[dsd\]dsd](/test)
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
      [
        "a",
        {
          "href": "/test"
        },
        "dsd]dsd"
      ]
    ]
  ]
}
```

## HTML

```html
<p><a href="/test">dsd]dsd</a></p>
```

## Markdown

```md
[dsd\]dsd](/test)
```
