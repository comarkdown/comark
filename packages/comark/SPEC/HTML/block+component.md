---
timeout:
  parse: 5ms
  html: 5ms
  markdown: 5ms
---

## Input

```md
<Hello>
::component
Default Slot
::
</Hello>
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "hello",
      {
        "$": { "html": 1, "block": 1 }
      },
      [
        "component",
        {},
        "Default Slot"
      ]
    ]
  ]
}
```

## HTML

```html
<hello>
  <component>
    Default Slot
  </component>
</hello>
```

## Markdown

```md
<hello>
  ::component
  Default Slot
  ::
</hello>
```
