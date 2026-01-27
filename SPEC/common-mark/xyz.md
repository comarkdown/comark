---
timeout:
  parse: 5ms
  html: 5ms
  markdown: 5ms
---

## Input 

```md
# Main Title

This is a comprehensive markdown document with **multiple features** and *various* formatting options.

## Section One

Here's a paragraph with a [link to Nuxt](https://nuxt.com) and some `inline code`. You can also find **bold text** and *italic text* together.

### Subsection

> This is a blockquote with important information.
> 
> It can span multiple lines and contain **formatted text**.

#### Nested Heading

Here's an unordered list:

- First item
- Second item with **bold**
- Third item with [a link](https://example.com)
  - Nested item one
  - Nested item two

And here's an ordered list:

1. First numbered item
2. Second numbered item
3. Third numbered item
   - Nested unordered item
   - Another nested item

## Section Two

Here's an image:

![Alt text](/path/to/image.jpg "Image title")

And here's a code block:

```javascript
function hello() {
  console.log("Hello, World!");
}
```

### More Content

You can have **bold** and *italic* text, or even ***both together***.

Horizontal rule:

---

## Final Section

Here's a paragraph with `code`, **strong text**, *emphasized text*, and a [link](https://nuxt.com) all in one line.

> Blockquote with heading
> 
> #### Blockquote Heading
> 
> And a paragraph inside the blockquote.

### Lists Combined

- Item with **bold** and *italic*
- Item with `code` and [link](https://example.com)
- Item with ![image](/img.jpg "title")

1. Numbered with **formatting**
2. Numbered with `code`
3. Numbered with [link](https://nuxt.com)
```

## AST

```json
{
  "type": "minimark",
  "value": [
    [
      "h1",
      {},
      "Main Title"
    ],
    [
      "p",
      {},
      "This is a comprehensive markdown document with ",
      [
        "strong",
        {},
        "multiple features"
      ],
      " and ",
      [
        "em",
        {},
        "various"
      ],
      " formatting options."
    ],
    [
      "h2",
      {},
      "Section One"
    ],
    [
      "p",
      {},
      "Here's a paragraph with a ",
      [
        "a",
        {
          "href": "https://nuxt.com"
        },
        "link to Nuxt"
      ],
      " and some ",
      [
        "code",
        {},
        "inline code"
      ],
      ". You can also find ",
      [
        "strong",
        {},
        "bold text"
      ],
      " and ",
      [
        "em",
        {},
        "italic text"
      ],
      " together."
    ],
    [
      "h3",
      {},
      "Subsection"
    ],
    [
      "blockquote",
      {},
      [
        "p",
        {},
        "This is a blockquote with important information."
      ],
      [
        "p",
        {},
        "It can span multiple lines and contain ",
        [
          "strong",
          {},
          "formatted text"
        ],
        "."
      ]
    ],
    [
      "h4",
      {},
      "Nested Heading"
    ],
    [
      "p",
      {},
      "Here's an unordered list:"
    ],
    [
      "ul",
      {},
      [
        "li",
        {},
        "First item"
      ],
      [
        "li",
        {},
        "Second item with ",
        [
          "strong",
          {},
          "bold"
        ]
      ],
      [
        "li",
        {},
        "Third item with ",
        [
          "a",
          {
            "href": "https://example.com"
          },
          "a link"
        ],
        [
          "ul",
          {},
          [
            "li",
            {},
            "Nested item one"
          ],
          [
            "li",
            {},
            "Nested item two"
          ]
        ]
      ]
    ],
    [
      "p",
      {},
      "And here's an ordered list:"
    ],
    [
      "ol",
      {},
      [
        "li",
        {},
        "First numbered item"
      ],
      [
        "li",
        {},
        "Second numbered item"
      ],
      [
        "li",
        {},
        "Third numbered item",
        [
          "ul",
          {},
          [
            "li",
            {},
            "Nested unordered item"
          ],
          [
            "li",
            {},
            "Another nested item"
          ]
        ]
      ]
    ],
    [
      "h2",
      {},
      "Section Two"
    ],
    [
      "p",
      {},
      "Here's an image:"
    ],
    [
      "p",
      {},
      [
        "img",
        {
          "src": "/path/to/image.jpg",
          "alt": "Alt text",
          "title": "Image title"
        }
      ]
    ],
    [
      "p",
      {},
      "And here's a code block:"
    ],
    [
      "pre",
      {},
      [
        "code",
        {
          "class": "language-javascript"
        },
        "function hello() {\n  console.log(\"Hello, World!\");\n}\n"
      ]
    ],
    [
      "h3",
      {},
      "More Content"
    ],
    [
      "p",
      {},
      "You can have ",
      [
        "strong",
        {},
        "bold"
      ],
      " and ",
      [
        "em",
        {},
        "italic"
      ],
      " text, or even ",
      [
        "em",
        {},
        [
          "strong",
          {},
          "both together"
        ]
      ],
      "."
    ],
    [
      "p",
      {},
      "Horizontal rule:"
    ],
    [
      "hr",
      {}
    ],
    [
      "h2",
      {},
      "Final Section"
    ],
    [
      "p",
      {},
      "Here's a paragraph with ",
      [
        "code",
        {},
        "code"
      ],
      ", ",
      [
        "strong",
        {},
        "strong text"
      ],
      ", ",
      [
        "em",
        {},
        "emphasized text"
      ],
      ", and a ",
      [
        "a",
        {
          "href": "https://nuxt.com"
        },
        "link"
      ],
      " all in one line."
    ],
    [
      "blockquote",
      {},
      [
        "p",
        {},
        "Blockquote with heading"
      ],
      [
        "h4",
        {},
        "Blockquote Heading"
      ],
      [
        "p",
        {},
        "And a paragraph inside the blockquote."
      ]
    ],
    [
      "h3",
      {},
      "Lists Combined"
    ],
    [
      "ul",
      {},
      [
        "li",
        {},
        "Item with ",
        [
          "strong",
          {},
          "bold"
        ],
        " and ",
        [
          "em",
          {},
          "italic"
        ]
      ],
      [
        "li",
        {},
        "Item with ",
        [
          "code",
          {},
          "code"
        ],
        " and ",
        [
          "a",
          {
            "href": "https://example.com"
          },
          "link"
        ]
      ],
      [
        "li",
        {},
        "Item with ",
        [
          "img",
          {
            "src": "/img.jpg",
            "alt": "image",
            "title": "title"
          }
        ]
      ]
    ],
    [
      "ol",
      {},
      [
        "li",
        {},
        "Numbered with ",
        [
          "strong",
          {},
          "formatting"
        ]
      ],
      [
        "li",
        {},
        "Numbered with ",
        [
          "code",
          {},
          "code"
        ]
      ],
      [
        "li",
        {},
        "Numbered with ",
        [
          "a",
          {
            "href": "https://nuxt.com"
          },
          "link"
        ]
      ]
    ]
  ]
}
```

## HTML

```html
<h1>Main Title</h1>
<p>This is a comprehensive markdown document with <strong>multiple features</strong> and <em>various</em> formatting options.</p>
<h2>Section One</h2>
<p>Here's a paragraph with a <a href="https://nuxt.com">link to Nuxt</a> and some <code>inline code</code>. You can also find <strong>bold text</strong> and <em>italic text</em> together.</p>
<h3>Subsection</h3>
<blockquote>
  <p>This is a blockquote with important information.</p>
  <p>It can span multiple lines and contain <strong>formatted text</strong>.</p>
</blockquote>
<h4>Nested Heading</h4>
<p>Here's an unordered list:</p>
<ul>
  <li>First item</li>
  <li>Second item with <strong>bold</strong></li>
  <li>
    Third item with <a href="https://example.com">a link</a>
    <ul>
      <li>Nested item one</li>
      <li>Nested item two</li>
    </ul>
  </li>
</ul>
<p>And here's an ordered list:</p>
<ol>
  <li>First numbered item</li>
  <li>Second numbered item</li>
  <li>
    Third numbered item
    <ul>
      <li>Nested unordered item</li>
      <li>Another nested item</li>
    </ul>
  </li>
</ol>
<h2>Section Two</h2>
<p>Here's an image:</p>
<p><img src="/path/to/image.jpg" alt="Alt text" title="Image title" /></p>
<p>And here's a code block:</p>
<pre><code class="language-javascript">function hello() {
  console.log("Hello, World!");
}
</code></pre>
<h3>More Content</h3>
<p>You can have <strong>bold</strong> and <em>italic</em> text, or even <em><strong>both together</strong></em>.</p>
<p>Horizontal rule:</p>
<hr />
<h2>Final Section</h2>
<p>Here's a paragraph with <code>code</code>, <strong>strong text</strong>, <em>emphasized text</em>, and a <a href="https://nuxt.com">link</a> all in one line.</p>
<blockquote>
  <p>Blockquote with heading</p>
  <h4>Blockquote Heading</h4>
  <p>And a paragraph inside the blockquote.</p>
</blockquote>
<h3>Lists Combined</h3>
<ul>
  <li>Item with <strong>bold</strong> and <em>italic</em></li>
  <li>Item with <code>code</code> and <a href="https://example.com">link</a></li>
  <li>Item with <img src="/img.jpg" alt="image" title="title" /></li>
</ul>
<ol>
  <li>Numbered with <strong>formatting</strong></li>
  <li>Numbered with <code>code</code></li>
  <li>Numbered with <a href="https://nuxt.com">link</a></li>
</ol>
```

## Markdown

```md
# Main Title

This is a comprehensive markdown document with **multiple features** and *various* formatting options.

## Section One

Here's a paragraph with a [link to Nuxt](https://nuxt.com) and some `inline code`. You can also find **bold text** and *italic text* together.

### Subsection

> This is a blockquote with important information.
> 
> It can span multiple lines and contain **formatted text**.

#### Nested Heading

Here's an unordered list:

- First item
- Second item with **bold**
- Third item with [a link](https://example.com)
  - Nested item one
  - Nested item two

And here's an ordered list:

1. First numbered item
2. Second numbered item
3. Third numbered item
  - Nested unordered item
  - Another nested item

## Section Two

Here's an image:

![Alt text](/path/to/image.jpg "Image title")

And here's a code block:

```javascript
function hello() {
  console.log("Hello, World!");
}
```

### More Content

You can have **bold** and *italic* text, or even ***both together***.

Horizontal rule:

---

## Final Section

Here's a paragraph with `code`, **strong text**, *emphasized text*, and a [link](https://nuxt.com) all in one line.

> Blockquote with heading
> 
> #### Blockquote Heading
> 
> And a paragraph inside the blockquote.

### Lists Combined

- Item with **bold** and *italic*
- Item with `code` and [link](https://example.com)
- Item with ![image](/img.jpg "title")

1. Numbered with **formatting**
2. Numbered with `code`
3. Numbered with [link](https://nuxt.com)
```
