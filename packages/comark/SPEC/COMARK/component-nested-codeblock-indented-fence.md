## Input

```md
::code-preview
  :::tabs
    ::::tabs-item{label="Code"}
    ```mdc
    ::a
        ```js
        x
        ```
    ::
    ```
    ::::
  :::
::

After
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
              "::a\n    ```js\n    x\n    ```\n::"
            ]
          ]
        ]
      ]
    ],
    [
      "p",
      {},
      "After"
    ]
  ]
}
```

## HTML

```html
<code-preview>
  <tabs>
    <tabs-item label="Code">
      <pre data-language="mdc"><code class="language-mdc">::a
          ```js
          x
          ```
      ::</code></pre>
    </tabs-item>
  </tabs>
</code-preview>
<p>After</p>
```

## Markdown

```md
::code-preview
  :::tabs
    ::::tabs-item{label="Code"}
    ```mdc
    ::a
        ```js
        x
        ```
    ::
    ```
    ::::
  :::
::

After
```

## Markdown HTML

```md
<code-preview>

<tabs>

<tabs-item label="Code">

```mdc
::a
    ```js
    x
    ```
::
```

</tabs-item>

</tabs>

</code-preview>

After
```
