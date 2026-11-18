## Input

```md
::box
    - item
      ~~~
::

::box
-	item

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
    ["box", {}, ["pre", {}, ["code", {}, "- item\n  ~~~"]]],
    [
      "box",
      {},
      [
        "ul",
        {},
        ["li", {}, ["p", {}, "item"], ["pre", { "language": "js" }, ["code", { "class": "language-js" }, "x"]]]
      ]
    ],
    ["p", {}, "After"]
  ]
}
```

## HTML

```html
<box>
  <pre><code>- item
    ~~~</code></pre>
</box>
<box>
  <ul>
    <li>
      <p>item</p>
      <pre data-language="js"><code class="language-js">x</code></pre>
    </li>
  </ul>
</box>
<p>After</p>
```

## Markdown

```md
::box
```
- item
  ~~~
```
::

::box
- item
  ```js
  x
  ```
::

After
```
