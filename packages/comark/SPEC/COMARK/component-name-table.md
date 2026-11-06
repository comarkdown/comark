## Input

```md
::table{src="data.csv"}
::

Some :table[x] text.
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "table",
      {
        "src": "data.csv"
      }
    ],
    [
      "p",
      {},
      "Some ",
      [
        "table",
        {},
        "x"
      ],
      " text."
    ]
  ]
}
```

## HTML

```html
<table src="data.csv"></table>
<p>
  Some 
  <table>x</table>
   text.
</p>
```

## Markdown

```md
::table{src="data.csv"}
::

Some :table[x] text.
```
