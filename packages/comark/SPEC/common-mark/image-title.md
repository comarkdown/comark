## Input

```md
![alt](https://example.com/image.jpg "title")
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
          "src": "https://example.com/image.jpg",
          "alt": "alt",
          "title": "title"
        }
      ]
    ]
  ]
}
```

## HTML

```html
<p><img src="https://example.com/image.jpg" title="title" alt="alt" /></p>
```

## Markdown

```md
![alt](https://example.com/image.jpg "title")
```
