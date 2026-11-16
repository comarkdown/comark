## Input

```md
<p>
one
<p>
two
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
        "$": {
          "html": 1,
          "block": 0
        }
      },
      "one"
    ],
    [
      "p",
      {
        "$": {
          "html": 1,
          "block": 0
        }
      },
      "two"
    ]
  ]
}
```

## HTML

```html
<p>one</p>
<p>two</p>
```

## Markdown

```md
<p>one</p>

<p>two</p>
```
