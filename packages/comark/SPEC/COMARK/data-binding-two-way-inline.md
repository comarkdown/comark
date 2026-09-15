## Input

```md
Enter name: :input{::value="data.name" type="text"}
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
      "Enter name: ",
      [
        "input",
        {
          "::value": "data.name",
          "type": "text"
        }
      ]
    ]
  ]
}
```

## HTML

```html
<p>
  Enter name: <input data-comark-model-value="data.name" type="text">
</p>
```

## Markdown

```md
Enter name: :input{::value="data.name" type="text"}
```
