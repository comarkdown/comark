---
timeout:
  parse: 5ms
  html: 5ms
  markdown: 5ms
---

## Input

```md
::component
---
title: Hello
---
Content
::
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "component",
      {
        "title": "Hello"
      },
      "Content"
    ]
  ]
}
```

## HTML

```html
<component title="Hello">
  Content
</component>
```

## Markdown

```md
::component{title="Hello"}
Content
::
```
