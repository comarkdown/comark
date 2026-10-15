## Input

```md
::accordion
  :::accordion-item
---
icon: check
label: Question one?
---
content
  :::
::
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "accordion",
      {},
      [
        "accordion-item",
        {
          "icon": "check",
          "label": "Question one?"
        },
        "content"
      ]
    ]
  ]
}
```

## HTML

```html
<accordion>
  <accordion-item icon="check" label="Question one?">
    content
  </accordion-item>
</accordion>
```

## Markdown

```md
::accordion
  :::accordion-item{icon="check" label="Question one?"}
  content
  :::
::
```
