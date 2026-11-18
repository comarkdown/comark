## Input

```md
::code-preview
`inline code`

#code
```mdc
`inline code`
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
      "code-preview",
      {},
      [
        "code",
        {},
        "inline code"
      ],
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
            "`inline code`"
          ]
        ]
      ]
    ]
  ]
}
```

## HTML

```html
<code-preview>
  <code>inline code</code>
  <template name="code">
    <pre data-language="mdc"><code class="language-mdc">`inline code`</code></pre>
  </template>
</code-preview>
```

## Markdown

```md
::code-preview
`inline code`

#code
~~~mdc
`inline code`
~~~
::
```
