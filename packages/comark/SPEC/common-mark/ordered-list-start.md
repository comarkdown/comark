## Input

```md
5. First item
6. Second item
7. Third item
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
        "start": "5"
      },
      [
        "li",
        {},
        "First item"
      ],
      [
        "li",
        {},
        "Second item"
      ],
      [
        "li",
        {},
        "Third item"
      ]
    ]
  ]
}
```

## HTML

```html
<ol start="5">
  <li>First item</li>
  <li>Second item</li>
  <li>Third item</li>
</ol>
```

## Markdown

```md
5. First item
6. Second item
7. Third item
```
