---
timeout:
  parse: 5ms
  html: 5ms
  markdown: 5ms
---

## Input 

```md
[![An old rock in the desert](/assets/images/shiprock.jpg "Shiprock, New Mexico by Beau Rogers")](/link)
```

## AST

```json
{
  "type": "minimark",
  "value": [
    [
      "p",
      {},
      [
        "a",
        {
          "href": "/link"
        },
        [
          "img",
          {
            "src": "/assets/images/shiprock.jpg",
            "alt": "An old rock in the desert",
            "title": "Shiprock, New Mexico by Beau Rogers"
          }
        ]
      ]
    ]
  ]
}
```

## HTML

```html
<p><a href="/link"><img src="/assets/images/shiprock.jpg" alt="An old rock in the desert" title="Shiprock, New Mexico by Beau Rogers" /></a></p>
```

## Markdown

```md
[![An old rock in the desert](/assets/images/shiprock.jpg "Shiprock, New Mexico by Beau Rogers")](/link)
```

