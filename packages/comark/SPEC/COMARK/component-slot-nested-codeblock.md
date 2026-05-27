## Input

```md
::component
#code
```mdc
::alert
hello
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
      "component",
      {},
      [
        "template",
        {
          "name": "code"
        },
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
            "::alert\nhello\n::"
          ]
        ]
      ]
    ]
  ]
}
```

## HTML

```html
<component>
  <template name="code">
    <pre language="mdc"><code class="language-mdc">::alert
    hello
    ::</code></pre>
  </template>
</component>
```

## Markdown

```md
::component
#code
```mdc
::alert
hello
::
```
::
```
