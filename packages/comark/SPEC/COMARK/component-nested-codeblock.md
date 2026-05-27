## Input

```md
::component
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
}
```

## HTML

```html
<component>
  <pre language="mdc"><code class="language-mdc">::alert
  hello
  ::</code></pre>
</component>
```

## Markdown

```md
::component
```mdc
::alert
hello
::
```
::
```
