## Input

```md
---
site:
  name: My Blog
---

::alert{:title="frontmatter.site.name" type="info"}
Hello
::
```

## AST

```json
{
  "frontmatter": {
    "site": {
      "name": "My Blog"
    }
  },
  "meta": {},
  "nodes": [
    [
      "alert",
      {
        ":title": "frontmatter.site.name",
        "type": "info"
      },
      "Hello"
    ]
  ]
}
```

## HTML

```html
<alert title="My Blog" type="info">
  Hello
</alert>
```

## Markdown

```md
---
site:
  name: My Blog
---

::alert{:title="frontmatter.site.name" type="info"}
Hello
::
```
