## Input

```md
---
title: My Title
description: My Description
---
# Content
```

## AST

```json
{
  "frontmatter": {
    "title": "My Title",
    "description": "My Description"
  },
  "meta": {},
  "nodes": [
    [
      "h1",
      {
        "id": "content"
      },
      "Content"
    ]
  ]
}
```

## HTML

```html
<h1 id="content">Content</h1>
```

## Markdown

```md
---
title: My Title
description: My Description
---

# Content
```
