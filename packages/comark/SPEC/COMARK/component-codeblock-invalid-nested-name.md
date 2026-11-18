## Input

```md
::box
  :::inner
::123
  ~~~js
  x
    ~~~
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
      "box",
      {},
      [
        "inner",
        {},
        ["p", {}, "::123"],
        ["pre", { "language": "js" }, ["code", { "class": "language-js" }, "x"]]
      ]
    ],
    ["p", {}, "After"]
  ]
}
```

## HTML

```html
<box>
  <inner>
    <p>::123</p>
    <pre data-language="js"><code class="language-js">x</code></pre>
  </inner>
</box>
<p>After</p>
```

## Markdown

```md
::box
  :::inner
  \::123

  ```js
  x
  ```
  :::
::

After
```
