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

::box
- - -
    ~~~
      ~~~
::

::box
- - item
    ~~~
    x
      ~~~
::

::box
    :::inner
      ~~~
          ~~~
::

::box
- - item
      ~~~
      x
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
    ["box", {}, ["hr", {}], ["pre", {}, ["code", {}, "~~~\n  ~~~"]]],
    ["box", {}, ["ul", {}, ["li", {}, ["ul", {}, ["li", {}, ["p", {}, "item"], ["pre", {}, ["code", {}, "x"]]]]]]],
    ["box", {}, ["pre", {}, ["code", {}, ":::inner\n  ~~~\n      ~~~"]]],
    ["box", {}, ["ul", {}, ["li", {}, ["ul", {}, ["li", {}, ["p", {}, "item"], ["pre", {}, ["code", {}, "x"]]]]]]],
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
<box>
  <hr>
  <pre><code>~~~
    ~~~</code></pre>
</box>
<box>
  <ul>
    <li>
      <ul>
        <li>
          <p>item</p>
          <pre><code>x</code></pre>
        </li>
      </ul>
    </li>
  </ul>
</box>
<box>
  <pre><code>:::inner
    ~~~
        ~~~</code></pre>
</box>
<box>
  <ul>
    <li>
      <ul>
        <li>
          <p>item</p>
          <pre><code>x</code></pre>
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

::box
---

```
~~~
  ~~~
```
::

::box
- - item
    ```
    x
    ```
::

::box
```
:::inner
  ~~~
      ~~~
```
::

::box
- - item
    ```
    x
    ```
::

After
```

## Markdown HTML

```md
<box>

```
- item
  ~~~
```

</box>

<box>

- item
  ```js
  x
  ```

</box>

<box>

---

```
~~~
  ~~~
```

</box>

<box>

- - item
    ```
    x
    ```

</box>

<box>

```
:::inner
  ~~~
      ~~~
```

</box>

<box>

- - item
    ```
    x
    ```

</box>

After
```
