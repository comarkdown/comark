## Input

```md
> text <x-card>
>
> **a**
>
> </x-card>

last
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
      "text ",
      [
        "x-card",
        {
          "$": {
            "html": 1,
            "block": 0
          }
        },
        [
          "strong",
          {},
          "a"
        ]
      ]
    ],
    [
      "p",
      {},
      "last"
    ]
  ]
}
```

## HTML

```html
<blockquote>
  text <x-card><strong>a</strong></x-card>
</blockquote>
<p>last</p>
```

## Markdown

```md
> text <x-card>**a**</x-card>

last
```
