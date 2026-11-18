## Input

```md
::box
    ```
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
    ["box", {}, ["pre", {}, ["code", {}, "```\nx\n```"]]],
    ["p", {}, "After"]
  ]
}
```

## HTML

```html
<box>
  <pre><code>```
  x
  ```</code></pre>
</box>
<p>After</p>
```

## Markdown

```md
::box
~~~
```
x
```
~~~
::

After
```
