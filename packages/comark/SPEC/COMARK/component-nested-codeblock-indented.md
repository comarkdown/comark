## Input

```md
::tabs
  :::tabs-item{label="Code"}
  ```mdc
    ::accordion
    ::
  ```
  :::
::
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "tabs",
      {},
      [
        "tabs-item",
        {
          "label": "Code"
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
            "  ::accordion\n  ::"
          ]
        ]
      ]
    ]
  ]
}
```

## HTML

```html
<tabs>
  <tabs-item label="Code">
    <pre language="mdc"><code class="language-mdc">  ::accordion
      ::</code></pre>
  </tabs-item>
</tabs>
```

## Markdown

```md
::tabs
  :::tabs-item{label="Code"}
  ```mdc
    ::accordion
    ::
  ```
  :::
::
```
