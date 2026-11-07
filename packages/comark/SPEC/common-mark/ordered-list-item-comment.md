## Input

```md
2. Override the new default in your `nuxt.config.ts`:

   <!-- @case-police-ignore tsConfig -->

   ```ts
   export default defineNuxtConfig({})
   ```
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "ol",
      {
        "start": "2"
      },
      [
        "li",
        {},
        [
          "p",
          {},
          "Override the new default in your ",
          [
            "code",
            {},
            "nuxt.config.ts"
          ],
          ":"
        ],
        [
          null,
          {},
          " @case-police-ignore tsConfig "
        ],
        [
          "pre",
          {
            "language": "ts"
          },
          [
            "code",
            {
              "class": "language-ts"
            },
            "export default defineNuxtConfig({})"
          ]
        ]
      ]
    ]
  ]
}
```

## HTML

```html
<ol start="2">
  <li>
    <p>Override the new default in your <code>nuxt.config.ts</code>:</p>
    <!-- @case-police-ignore tsConfig -->

    <pre data-language="ts"><code class="language-ts">export default defineNuxtConfig({})</code></pre>
  </li>
</ol>
```

## Markdown

```md
2. Override the new default in your `nuxt.config.ts`:

   <!-- @case-police-ignore tsConfig -->
   ```ts
   export default defineNuxtConfig({})
   ```
```
