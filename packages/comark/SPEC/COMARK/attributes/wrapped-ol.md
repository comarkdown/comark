## Input

```md
::ol{attr="value"}
1. item 1
2. item 2
::
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "ol",
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
<ol attr="value">
  <li>item 1</li>
  <li>item 2</li>
</ol>
```

## Markdown

```md
::ol{attr="value"}
1. item 1
2. item 2
::
```
