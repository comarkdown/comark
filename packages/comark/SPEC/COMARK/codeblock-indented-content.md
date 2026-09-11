## Input

```md
::card
```mdc
  ::accordion
  ::
```
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
        "pre",
        {
          "language": "mdc"
        },
        [
          "code",
          {
            "class": "language-mdc"
          },
          "  ::accordion\n  ::"
        ]
      ]
    ]
  ]
}
```

## HTML

```html
<card>
  <pre language="mdc"><code class="language-mdc">  ::accordion
    ::</code></pre>
</card>
```

## Markdown

```md
::card
```mdc
  ::accordion
  ::
```
::
```
