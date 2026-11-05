## Input

```md
a <b data={`x ${1}`} on={{ k: { v: 1 } }} d>y</b>
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "p",
      {},
      "a ",
      [
        "b",
        {
          "$": {
            "html": 1,
            "block": 0
          },
          "data": "{`x ${1}`}",
          "on": "{{ k: { v: 1 } }}",
          "d": true
        },
        "y"
      ]
    ]
  ]
}
```

## HTML

```html
<p>
  a <b data="{`x ${1}`}" on="{{ k: { v: 1 } }}" d>y</b>
</p>
```

## Markdown

```md
a <b data="{`x ${1}`}" on="{{ k: { v: 1 } }}" d>y</b>
```
