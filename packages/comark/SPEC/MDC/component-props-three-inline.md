---
timeout:
  parse: 5ms
  html: 5ms
  markdown: 5ms
---

## Input

```md
::component{title="Hello" color="primary" size="lg"}
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
        "title": "Hello",
        "color": "primary",
        "size": "lg"
      },
      "Content"
    ]
  ]
}
```

## HTML

```html
<component title="Hello" color="primary" size="lg">
  Content
</component>
```

## Markdown

```md
::component{title="Hello" color="primary" size="lg"}
Content
::
```
