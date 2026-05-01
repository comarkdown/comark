## Input

```md
````mdc
::code-preview
`inline code`

#code
```mdc
`inline code`
```
::
````
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
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
        "::code-preview\n`inline code`\n\n#code\n```mdc\n`inline code`\n```\n::"
      ]
    ]
  ]
}
```

## HTML

```html
<pre language="mdc"><code class="language-mdc">::code-preview
`inline code`

#code
```mdc
`inline code`
```
::</code></pre>
```

## Markdown

```md
~~~mdc
::code-preview
`inline code`

#code
```mdc
`inline code`
```
::
~~~
```
