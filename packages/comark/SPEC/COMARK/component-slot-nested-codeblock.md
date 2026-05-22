## Input

```md
::code-preview
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
      "code-preview",
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
<code-preview>
  <template name="code">
    <pre language="mdc"><code class="language-mdc">::alert
    hello
    ::</code></pre>
  </template>
</code-preview>
```

## Markdown

```md
::code-preview
#code
```mdc
::alert
hello
::
```
::
```
