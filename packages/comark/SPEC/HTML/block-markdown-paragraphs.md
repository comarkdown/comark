## Input

```md
<div class="a">

First Paragraph

Second **bold**

</div>
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "div",
      {
        "$": {
          "html": 1,
          "block": 1
        },
        "class": "a"
      },
      [
        "p",
        {},
        "First Paragraph"
      ],
      [
        "p",
        {},
        "Second ",
        [
          "strong",
          {},
          "bold"
        ]
      ]
    ]
  ]
}
```

## HTML

```html
<div class="a">
  <p>First Paragraph</p>
  <p>Second <strong>bold</strong></p>
</div>
```

## Markdown

```md
<div class="a">

First Paragraph

Second **bold**

</div>
```
