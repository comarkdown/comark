## Input

```md
::box
```js
a
 ```
```js
b
  ```
```js
c
   ```
  :::inner
  ```js
  d
     ```
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
        "pre",
        {
          "language": "js"
        },
        [
          "code",
          {
            "class": "language-js"
          },
          "a"
        ]
      ],
      [
        "pre",
        {
          "language": "js"
        },
        [
          "code",
          {
            "class": "language-js"
          },
          "b"
        ]
      ],
      [
        "pre",
        {
          "language": "js"
        },
        [
          "code",
          {
            "class": "language-js"
          },
          "c"
        ]
      ],
      [
        "inner",
        {},
        [
          "pre",
          {
            "language": "js"
          },
          [
            "code",
            {
              "class": "language-js"
            },
            "d"
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
<box>
  <pre data-language="js"><code class="language-js">a</code></pre>
  <pre data-language="js"><code class="language-js">b</code></pre>
  <pre data-language="js"><code class="language-js">c</code></pre>
  <inner>
    <pre data-language="js"><code class="language-js">d</code></pre>
  </inner>
</box>
<p>After</p>
```

## Markdown

```md
::box
```js
a
```

```js
b
```

```js
c
```

  :::inner
  ```js
  d
  ```
  :::
::

After
```

## Markdown HTML

```md
<box>

```js
a
```

```js
b
```

```js
c
```

<inner>

```js
d
```

</inner>

</box>

After
```
