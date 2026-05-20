## Input

```md
::card
#description
Line one

---

Middle line

---

Line three
::
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "card",
      {},
      [
        "template",
        { "name": "description" },
        ["p", {}, "Line one"],
        ["hr", {}],
        ["p", {}, "Middle line"],
        ["hr", {}],
        ["p", {}, "Line three"]
      ]
    ]
  ]
}
```

## HTML

```html
<card>
  <template name="description">
    <p>Line one</p>
    <hr />
    <p>Middle line</p>
    <hr />
    <p>Line three</p>
  </template>
</card>
```

## Markdown

```md
::card
#description
Line one

---

Middle line

---

Line three
::
```
