---
timeout:
  parse: 10000ms
  html: 5ms
  markdown: 5ms
options:
  highlight:
    themes:
      light: 'min-light'
    transformers:
      - 'twoslash'
---

## Input

```md
```ts twoslash
const message = "Hello from twoslash"
//    ^?
```
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "pre",
      {
        "language": "ts",
        "meta": "twoslash",
        "class": "shiki shiki-themes min-light twoslash lsp dark:min-light",
        "tabindex": "0"
      },
      [
        "code",
        {
          "class": "language-ts"
        },
        [
          "span",
          {
            "class": "line"
          },
          [
            "span",
            {
              "style": "color:#D32F2F"
            },
            "const"
          ],
          [
            "span",
            {
              "style": "color:#1976D2"
            },
            " "
          ],
          [
            "span",
            {
              "style": "color:#1976D2"
            },
            [
              "span",
              {
                "class": "twoslash-hover twoslash-query-persisted"
              },
              [
                "span",
                {
                  "class": "twoslash-popup-container"
                },
                [
                  "div",
                  {
                    "class": "twoslash-popup-arrow"
                  }
                ],
                [
                  "code",
                  {
                    "class": "twoslash-popup-code"
                  },
                  [
                    "span",
                    {
                      "style": "color:#D32F2F"
                    },
                    "const"
                  ],
                  [
                    "span",
                    {
                      "style": "color:#1976D2"
                    },
                    " message"
                  ],
                  [
                    "span",
                    {
                      "style": "color:#D32F2F"
                    },
                    ":"
                  ],
                  [
                    "span",
                    {
                      "style": "color:#22863A"
                    },
                    " \"Hello from twoslash\""
                  ]
                ]
              ],
              "message"
            ]
          ],
          [
            "span",
            {
              "style": "color:#D32F2F"
            },
            " ="
          ],
          [
            "span",
            {
              "style": "color:#22863A"
            },
            " \"Hello from twoslash\""
          ]
        ],
        [
          "span",
          {
            "class": "line"
          }
        ]
      ]
    ]
  ]
}
```

## HTML

```html
<pre language="ts" meta="twoslash" class="shiki shiki-themes min-light twoslash lsp dark:min-light" tabindex="0"><code class="language-ts"><span class="line"><span style="color:#D32F2F">const</span><span style="color:#1976D2"> </span><span style="color:#1976D2"><span class="twoslash-hover twoslash-query-persisted"><span class="twoslash-popup-container"><div class="twoslash-popup-arrow"></div>
<code class="twoslash-popup-code"><span style="color:#D32F2F">const</span><span style="color:#1976D2"> message</span><span style="color:#D32F2F">:</span><span style="color:#22863A"> "Hello from twoslash"</span></code></span>message</span></span><span style="color:#D32F2F"> =</span><span style="color:#22863A"> "Hello from twoslash"</span></span><span class="line"></span></code></pre>
```

## Markdown

```md
```ts twoslash
const const message: "Hello from twoslash"message = "Hello from twoslash"
```
```
