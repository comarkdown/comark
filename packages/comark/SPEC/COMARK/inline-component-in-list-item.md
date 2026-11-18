## Input

```md
- Press :kbd{value="meta"} then :badge[New]{color="green"} appears
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
        "Press ",
        [
          "kbd",
          {
            "value": "meta"
          }
        ],
        " then ",
        [
          "badge",
          {
            "color": "green"
          },
          "New"
        ],
        " appears"
      ]
    ]
  ]
}
```

## HTML

```html
<ul>
  <li>
    Press <kbd value="meta"></kbd> then <badge color="green">
      New
    </badge> appears
  </li>
</ul>
```

## Markdown

```md
- Press :kbd{value="meta"} then :badge[New]{color="green"} appears
```

## Markdown HTML

```md
- Press <kbd value="meta"></kbd> then <badge color="green">New</badge> appears
```
