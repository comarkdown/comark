---
timeout:
  parse: 5ms
  html: 5ms
  markdown: 5ms
options:
  autoUnwrap: true
---

## Input

```md
::page-section
  :::page-section
  #tagline
  {{ $doc.snippet.tagline }}

  #title
  {{ $doc.snippet.title }}

  #description
  {{ $doc.snippet.description }}

    ::::button{:to="$doc.snippet.link" appearance="primary"}
    Button Text
    ::::

    ::::button{:to="$doc.snippet.link" appearance="primary"}
    Button Text
    ::::

    ::::button
    ---
    :data-testid: $doc.snippet.description
    external: true
    :to: $doc.snippet.link
    appearance: primary
    ---
    Button Text
    ::::
  :::
::
```

## AST

```json
{
  "type": "comark",
  "value": [
    [
      "page-section",
      {},
      [
        "page-section",
        {},
        [
          "template",
          {
            "name": "tagline"
          },
          "{{ $doc.snippet.tagline }}"
        ],
        [
          "template",
          {
            "name": "title"
          },
          "{{ $doc.snippet.title }}"
        ],
        [
          "template",
          {
            "name": "description"
          },
          [
            "p",
            {},
            "{{ $doc.snippet.description }}"
          ],
          [
            "button",
            {
              ":to": "$doc.snippet.link",
              "appearance": "primary"
            },
            "Button Text"
          ],
          [
            "button",
            {
              ":to": "$doc.snippet.link",
              "appearance": "primary"
            },
            "Button Text"
          ],
          [
            "button",
            {
              ":data-testid": "$doc.snippet.description",
              "external": "true",
              ":to": "$doc.snippet.link",
              "appearance": "primary"
            },
            "Button Text"
          ]
        ]
      ]
    ]
  ]
}
```

## HTML

```html
<page-section>
  <page-section>
    <template name="tagline">
      {{ $doc.snippet.tagline }}
    </template>
    <template name="title">
      {{ $doc.snippet.title }}
    </template>
    <template name="description">
      <p>{{ $doc.snippet.description }}</p>
      <button to="$doc.snippet.link" appearance="primary">
        Button Text
      </button>
      <button to="$doc.snippet.link" appearance="primary">
        Button Text
      </button>
      <button data-testid="$doc.snippet.description" external="true" to="$doc.snippet.link" appearance="primary">
        Button Text
      </button>
    </template>
  </page-section>
</page-section>
```

## Markdown

```md
::page-section
  :::page-section
  #tagline
  {{ $doc.snippet.tagline }}

  #title
  {{ $doc.snippet.title }}

  #description
  {{ $doc.snippet.description }}

    ::::button{:to="$doc.snippet.link" appearance="primary"}
    Button Text
    ::::

    ::::button{:to="$doc.snippet.link" appearance="primary"}
    Button Text
    ::::

    ::::button
    ---
    :data-testid: $doc.snippet.description
    external: true
    :to: $doc.snippet.link
    appearance: primary
    ---
    Button Text
    ::::
  :::
::
```
