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
