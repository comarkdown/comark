## Input

```md
<section><p class="c">Check</p></section>
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "section",
      {
        "$": {
          "html": 1,
          "block": 1
        }
      },
      [
        "p",
        {
          "$": {
            "html": 1,
            "block": 0
          },
          "class": "c"
        },
        "Check"
      ]
    ]
  ]
}
```

## HTML

```html
<section>
  <p class="c">Check</p>
</section>
```

## Markdown

```md
<section>
<p class="c">Check</p>
</section>
```
