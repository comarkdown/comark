## Input

```md
- Item with quote:

  > This is a blockquote
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "ul",
      {},
      [
        "li",
        {},
        "Item with quote:",
        [
          "blockquote",
          {},
          "This is a blockquote"
        ]
      ]
    ]
  ]
}
```

## HTML

```html
<ul>
  <li>
    Item with quote:
    <blockquote>
      This is a blockquote
    </blockquote>
  </li>
</ul>
```

## Markdown

```md
- Item with quote:
  > This is a blockquote
```
