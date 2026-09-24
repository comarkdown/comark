## Input

```md
Paint [swatch]{.bg-[#000]} and [box]{.text-[1.5rem]} and [el]{.w-[calc(100%-1rem)]}

Theme [label]{.bg-[#000].text-[14px] #my-id}
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "p",
      {},
      "Paint ",
      [
        "span",
        {
          "class": "bg-[#000]"
        },
        "swatch"
      ],
      " and ",
      [
        "span",
        {
          "class": "text-[1.5rem]"
        },
        "box"
      ],
      " and ",
      [
        "span",
        {
          "class": "w-[calc(100%-1rem)]"
        },
        "el"
      ]
    ],
    [
      "p",
      {},
      "Theme ",
      [
        "span",
        {
          "class": "bg-[#000] text-[14px]",
          "id": "my-id"
        },
        "label"
      ]
    ]
  ]
}
```

## HTML

```html
<p>Paint <span class="bg-[#000]">swatch</span> and <span class="text-[1.5rem]">box</span> and <span class="w-[calc(100%-1rem)]">el</span></p>
<p>Theme <span class="bg-[#000] text-[14px]" id="my-id">label</span></p>
```

## Markdown

```md
Paint [swatch]{.bg-[#000]} and [box]{.text-[1.5rem]} and [el]{.w-[calc(100%-1rem)]}

Theme [label]{.bg-[#000].text-[14px] #my-id}
```
