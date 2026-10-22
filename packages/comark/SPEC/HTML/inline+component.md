## Input

```md
::component
Note <b>bold</b> end
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
      {},
      "Note ",
      [
        "b",
        {
          "$": {
            "html": 1,
            "block": 0
          }
        },
        "bold"
      ],
      " end"
    ]
  ]
}
```

## HTML

```html
<component>
  Note <b>bold</b> end
</component>
```

## Markdown

```md
::component
Note <b>bold</b> end
::
```
