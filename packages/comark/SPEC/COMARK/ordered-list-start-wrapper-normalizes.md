## Input

```md
::ol{start="3"}
1. apple
2. banana
::
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "ol",
      {
        "start": "3"
      },
      [
        "li",
        {},
        "apple"
      ],
      [
        "li",
        {},
        "banana"
      ]
    ]
  ]
}
```

## HTML

```html
<ol start="3">
  <li>apple</li>
  <li>banana</li>
</ol>
```

## Markdown

```md
3. apple
4. banana
```
