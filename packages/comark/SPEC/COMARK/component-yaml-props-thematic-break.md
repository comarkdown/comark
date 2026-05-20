## Input

```md
::card
Above

---

Middle text

---

Below
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
      ["p", {}, "Above"],
      ["hr", {}],
      ["p", {}, "Middle text"],
      ["hr", {}],
      ["p", {}, "Below"]
    ]
  ]
}
```

## HTML

```html
<card>
  <p>Above</p>
  <hr />
  <p>Middle text</p>
  <hr />
  <p>Below</p>
</card>
```

## Markdown

```md
::card
Above

---

Middle text

---

Below
::
```
