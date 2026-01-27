---
timeout:
  parse: 5ms
  html: 5ms
  markdown: 5ms
---

## Input 

```md
![The San Juan Mountains are beautiful](/assets/images/san-juan-mountains.jpg "San Juan Mountains")
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
        "img",
        {
          "src": "/assets/images/san-juan-mountains.jpg",
          "alt": "The San Juan Mountains are beautiful",
          "title": "San Juan Mountains"
        }
      ]
    ]
  ]
}
```

## HTML

```html
<p><img src="/assets/images/san-juan-mountains.jpg" alt="The San Juan Mountains are beautiful" title="San Juan Mountains" /></p>
```

## Markdown

```md
![The San Juan Mountains are beautiful](/assets/images/san-juan-mountains.jpg "San Juan Mountains")
```

