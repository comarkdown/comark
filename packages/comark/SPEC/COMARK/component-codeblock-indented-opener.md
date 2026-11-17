## Input

```md
::box
  ```md
  - item
    ```js
    x
    ```
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
          "language": "md"
        },
        [
          "code",
          {
            "class": "language-md"
          },
          "- item\n  ```js\n  x\n  ```"
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
  <pre data-language="md"><code class="language-md">- item
    ```js
    x
    ```</code></pre>
</box>
<p>After</p>
```

## Markdown

```md
::box
~~~md
- item
  ```js
  x
  ```
~~~
::

After
```
