## Input

```md
---
id: 7
slug: getting-started
---

::card{:title="Item {{ frontmatter.id }}" :link="/docs/{{ frontmatter.slug }}"}
::
```

## AST

```json
{
  "frontmatter": {
    "id": 7,
    "slug": "getting-started"
  },
  "meta": {},
  "nodes": [
    [
      "card",
      {
        ":title": "Item {{ frontmatter.id }}",
        ":link": "/docs/{{ frontmatter.slug }}"
      }
    ]
  ]
}
```

## HTML

```html
<card title="Item {{ frontmatter.id }}" link="/docs/{{ frontmatter.slug }}"></card>
```

## Markdown

```md
---
id: 7
slug: getting-started
---

::card{:title="Item {{ frontmatter.id }}" :link="/docs/{{ frontmatter.slug }}"}
::
```
