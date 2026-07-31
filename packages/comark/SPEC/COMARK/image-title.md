## Input

```md
![alt](https://example.com/image.jpg "title"){attr="value"}

![alt](img.png "A title"){.rounded-asymmetric width="200"}
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
          "title": "title",
          "attr": "value"
        }
      ]
    ],
    [
      "p",
      {},
      [
        "img",
        {
          "src": "img.png",
          "alt": "alt",
          "title": "A title",
          "class": "rounded-asymmetric",
          "width":"200"
        }
      ]
    ]
  ]
}
```

## HTML

```html
<p><img src="https://example.com/image.jpg" title="title" alt="alt" attr="value" /></p>
<p><img src="img.png" title="A title" alt="alt" class="rounded-asymmetric" width="200" /></p>
```

## Markdown

```md
![alt](https://example.com/image.jpg "title"){attr="value"}

![alt](img.png "A title"){.rounded-asymmetric width="200"}
```
