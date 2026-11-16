## Input

```md
<pre>
  const x = 1
  **not**
  <b>b</b>
</pre>

after
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "pre",
      {
        "$": {
          "html": 1,
          "block": 1
        }
      },
      "\n  const x = 1\n  **not**\n  ",
      [
        "b",
        {
          "$": {
            "html": 1,
            "block": 0
          }
        },
        "b"
      ],
      "\n"
    ],
    [
      "p",
      {},
      "after"
    ]
  ]
}
```

## HTML

```html
<pre>
  const x = 1
  **not**
  <b>b</b>
</pre>
<p>after</p>
```

## Markdown

```md
<pre>
  const x = 1
  **not**
  <b>b</b>
</pre>

after
```
