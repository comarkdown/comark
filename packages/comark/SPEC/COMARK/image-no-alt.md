## Input

```md
![](/my/cool/path)
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
        "img",
        {
          "src": "/my/cool/path"
        }
      ]
    ]
  ]
}
```

## HTML

```html
<p><img src="/my/cool/path" /></p>
```

## Markdown

```md
![](/my/cool/path)
```
