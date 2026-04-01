## Input

```md
::steps
### Step 1

![Image](https://example.com/image.jpg)

### Step 2

Text content
::
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "steps",
      {},
      [
        "h3",
        {
          "id": "step-1"
        },
        "Step 1"
      ],
      [
        "p",
        {},
        [
          "img",
          {
            "src": "https://example.com/image.jpg",
            "alt": "Image"
          }
        ]
      ],
      [
        "h3",
        {
          "id": "step-2"
        },
        "Step 2"
      ],
      [
        "p",
        {},
        "Text content"
      ]
    ]
  ]
}
```

## HTML

```html
<steps>
  <h3 id="step-1">Step 1</h3>
  <p><img src="https://example.com/image.jpg" alt="Image" /></p>
  <h3 id="step-2">Step 2</h3>
  <p>Text content</p>
</steps>
```

## Markdown

```md
::steps
### Step 1

![Image](https://example.com/image.jpg)

### Step 2

Text content
::
```
