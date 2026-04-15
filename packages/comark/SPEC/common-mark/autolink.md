## Input

```md
Visit it on <https://nuxt.com>
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
      "Visit it on ",
      [
        "a",
        {
          "href": "https://nuxt.com"
        },
        "https://nuxt.com"
      ]
    ]
  ]
}
```

## HTML

```html
<p>Visit it on <a href="https://nuxt.com">https://nuxt.com</a></p>
```

## Markdown

```md
Visit it on <https://nuxt.com>
```
