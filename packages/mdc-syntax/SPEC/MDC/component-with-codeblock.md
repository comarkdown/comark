---
timeout:
  parse: 5ms
  html: 5ms
  markdown: 5ms
---

## Input

```md
::code-group
  ```mdc [content/index.md]
  ---
  title: The Mountains Website
  description: A website about the most iconic mountains in the world.
  ---

  ::my-vue-hero-component{orientation="horizontal"}
  #title
  Welcome to the Mountains Website.
  #description
  This is a description of the Mountains Website.
  ::

  This is a paragraph with **bold** and _italic_ text.
  ```
::
```

## AST

```json
{
  "type": "minimark",
  "value": [
    [
      "code-group",
      {},
      [
        "pre",
        {
          "filename": "content/index.md",
          "language": "mdc"
        },
        [
          "code",
          {
            "class": "language-mdc"
          },
          "---\ntitle: The Mountains Website\ndescription: A website about the most iconic mountains in the world.\n---\n\n::my-vue-hero-component{orientation=\"horizontal\"}\n#title\nWelcome to the Mountains Website.\n#description\nThis is a description of the Mountains Website.\n::\n\nThis is a paragraph with **bold** and _italic_ text."
        ]
      ]
    ]
  ]
}
```

## HTML

```html
<code-group>
  <pre filename="content/index.md" language="mdc"><code class="language-mdc">---
  title: The Mountains Website
  description: A website about the most iconic mountains in the world.
  ---

  ::my-vue-hero-component{orientation="horizontal"}
  #title
  Welcome to the Mountains Website.
  #description
  This is a description of the Mountains Website.
  ::

  This is a paragraph with **bold** and _italic_ text.</code></pre>
</code-group>
```

## Markdown

```md
::code-group
```mdc [content/index.md]
---
title: The Mountains Website
description: A website about the most iconic mountains in the world.
---

::my-vue-hero-component{orientation="horizontal"}
#title
Welcome to the Mountains Website.
#description
This is a description of the Mountains Website.
::

This is a paragraph with **bold** and _italic_ text.
```
::
```
