## Input

```md
::box
```mdc
::a
    ```js
    x
    ```
::
```
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
      "box",
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
          "::a\n    ```js\n    x\n    ```\n::"
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
<box>
  <pre data-language="mdc"><code class="language-mdc">::a
      ```js
      x
      ```
  ::</code></pre>
</box>
<p>After</p>
```

## Markdown

```md
::box
```mdc
::a
    ```js
    x
    ```
::
```
::

After
```

## Markdown HTML

```md
<box>

```mdc
::a
    ```js
    x
    ```
::
```

</box>

After
```
