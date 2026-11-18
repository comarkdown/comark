## Input

```md
::box
- item

  ~~~js
  x
    ~~~
::

::box
- a
  - b

    ```js
    x
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
        "ul",
        {},
        [
          "li",
          {},
          ["p", {}, "item"],
          ["pre", { "language": "js" }, ["code", { "class": "language-js" }, "x"]]
        ]
      ]
    ],
    [
      "box",
      {},
      [
        "ul",
        {},
        [
          "li",
          {},
          ["p", {}, "a"],
          [
            "ul",
            {},
            [
              "li",
              {},
              ["p", {}, "b"],
              ["pre", { "language": "js" }, ["code", { "class": "language-js" }, "x"]]
            ]
          ]
        ]
      ]
    ],
    ["p", {}, "After"]
  ]
}
```

## HTML

```html
<box>
  <ul>
    <li>
      <p>item</p>
      <pre data-language="js"><code class="language-js">x</code></pre>
    </li>
  </ul>
</box>
<box>
  <ul>
    <li>
      <p>a</p>
      <ul>
        <li>
          <p>b</p>
          <pre data-language="js"><code class="language-js">x</code></pre>
        </li>
      </ul>
    </li>
  </ul>
</box>
<p>After</p>
```

## Markdown

```md
::box
- item
  ```js
  x
  ```
::

::box
- a
  - b
    ```js
    x
    ```
::

After
```
