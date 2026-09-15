## Input

```md
::form{::value="data.contact"}
  :input{::value="data.name" name="name" type="text"}
  :input{::value="data.email" name="email" type="email"}
::
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "form",
      {
        "::value": "data.contact"
      },
      [
        "input",
        {
          "::value": "data.name",
          "name": "name",
          "type": "text"
        }
      ],
      [
        "input",
        {
          "::value": "data.email",
          "name": "email",
          "type": "email"
        }
      ]
    ]
  ]
}
```

## HTML

```html
<form data-comark-model-value="data.contact">
  <input data-comark-model-value="data.name" name="name" type="text">
  <input data-comark-model-value="data.email" name="email" type="email">
</form>
```

## Markdown

```md
::form{::value="data.contact"}
  :::input{::value="data.name" name="name" type="text"}
  :::

  :::input{::value="data.email" name="email" type="email"}
  :::
::
```
