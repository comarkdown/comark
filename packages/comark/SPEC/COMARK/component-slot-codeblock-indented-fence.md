## Input

```md
::component
#code
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
            "::a\n    ```js\n    x\n    ```\n::"
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
<component>
  <template name="code">
    <pre data-language="mdc"><code class="language-mdc">::a
        ```js
        x
        ```
    ::</code></pre>
  </template>
</component>
<p>After</p>
```

## Markdown

```md
::component
#code
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
<component>

<template name="code">

```mdc
::a
    ```js
    x
    ```
::
```

</template>

</component>

After
```
