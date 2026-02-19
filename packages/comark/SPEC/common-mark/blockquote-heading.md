---
timeout:
  parse: 5ms
  html: 5ms
  markdown: 5ms
---

## Input

```md
> #### The quarterly results look great!
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "blockquote",
      {},
      [
        "h4",
        {
          "id": "the-quarterly-results-look-great"
        },
        "The quarterly results look great!"
      ]
    ]
  ]
}
```

## HTML

```html
<blockquote>
  <h4 id="the-quarterly-results-look-great">The quarterly results look great!</h4>
</blockquote>
```

## Markdown

```md
> #### The quarterly results look great!
```
