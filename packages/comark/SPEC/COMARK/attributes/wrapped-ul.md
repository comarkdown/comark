## Input

```md
::ul{attr="value"}
- item 1
- item 2
::
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "ul",
      {
        "attr": "value"
      },
      [
        "li",
        {},
        "item 1"
      ],
      [
        "li",
        {},
        "item 2"
      ]
    ]
  ]
}
```

## HTML

```html
<ul attr="value">
  <li>item 1</li>
  <li>item 2</li>
</ul>
```

## Markdown

```md
::ul{attr="value"}
- item 1
- item 2
::
```
