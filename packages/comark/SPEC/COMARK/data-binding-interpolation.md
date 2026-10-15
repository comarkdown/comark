## Input

```md
---
id: 7
slug: getting-started
---

::card{:title="Item {{ frontmatter.id }}" :link="/docs/{{ frontmatter.slug }}/{{ frontmatter.missing || overview }}" :note="{{ frontmatter.missing }}"}
::

::card
---
:title: Item {{ frontmatter.id }}
:to: javascript:{{ frontmatter.slug }}
---
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
        ":link": "/docs/{{ frontmatter.slug }}/{{ frontmatter.missing || overview }}",
        ":note": "{{ frontmatter.missing }}"
      }
    ],
    [
      "card",
      {
        ":title": "Item {{ frontmatter.id }}",
        ":to": "javascript:{{ frontmatter.slug }}"
      }
    ]
  ]
}
```

## HTML

```html
<card title="Item 7" link="/docs/getting-started/overview"></card>
<card title="Item 7"></card>
```

## Markdown

```md
---
id: 7
slug: getting-started
---

::card{:title="Item {{ frontmatter.id }}" :link="/docs/{{ frontmatter.slug }}/{{ frontmatter.missing || overview }}" :note="{{ frontmatter.missing }}"}
::

::card{:title="Item {{ frontmatter.id }}" :to="javascript:{{ frontmatter.slug }}"}
::
```
