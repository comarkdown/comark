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
          "src": "/my/cool/path",
          "alt": ""
        }
      ]
    ]
  ]
}
```

## HTML

```html
<p><img src="/my/cool/path" alt=""></p>
```

## Markdown

```md
![](/my/cool/path)
```
