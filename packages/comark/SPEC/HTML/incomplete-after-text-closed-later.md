## Input

```md
text <x-card>

**a**

</x-card>
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    "text ",
    [
      "x-card",
      {
        "$": {
          "html": 1,
          "block": 1
        }
      },
      [
        "strong",
        {},
        "a"
      ]
    ]
  ]
}
```

## HTML

```html
text <x-card>
  <strong>a</strong>
</x-card>
```

## Markdown

```md
text <x-card>
**a**
</x-card>
```
