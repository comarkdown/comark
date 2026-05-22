## Input

```md
A paragraph [span] {attr="value"}

A paragraph [span]{attr="value"}
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "p",
      {
        "attr": "value"
      },
      "A paragraph ",
      ["span", {}, "span"]
    ],
    [
      "p",
      {},
      "A paragraph ",
      ["span", { "attr": "value" }, "span"]
    ]
  ]
}
```

## HTML

```html
<p attr="value">A paragraph <span>span</span></p>
<p>A paragraph <span attr="value">span</span></p>
```

## Markdown

```md
A paragraph [span] {attr="value"}

A paragraph [span]{attr="value"}
```
