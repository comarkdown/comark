## Input

```md
::box
#code
  ~~~
#notASlot
  ~~~
#other
text
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
      ["template", { "name": "code" }, ["pre", {}, ["code", {}, "#notASlot"]]],
      ["template", { "name": "other" }, "text"]
    ],
    ["p", {}, "After"]
  ]
}
```

## HTML

```html
<box>
  <template name="code">
    <pre><code>#notASlot</code></pre>
  </template>
  <template name="other">
    text
  </template>
</box>
<p>After</p>
```

## Markdown

```md
::box
#code
```
#notASlot
```

#other
text
::

After
```
