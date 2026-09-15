---
title: Etiket barcodes & QR codes
description: Plugin for generating barcodes and QR codes in Comark documents using the etiket library.
seo:
  title: Etiket Barcodes & QR Codes Plugin
navigation:
  icon: i-lucide-qr-code
links:
  - label: Parse API
    icon: i-lucide-file-code
    to: /reference/parse
    color: neutral
    variant: soft
  - label: Plugins
    icon: i-lucide-plug
    to: /plugins
    color: neutral
    variant: soft
---

The `comark/plugins/etiket` plugin turns barcode and QR code directive nodes into inline SVG (or PNG / SVG data URI) **at parse time** using the [`etiket`](https://github.com/productdevbook/etiket) library. Because generation happens in the `post()` AST hook the output is renderer-agnostic — no per-framework component is needed.

::note
[`etiket`](https://www.npmjs.com/package/etiket) is a peer dependency. Install it alongside Comark: `npm install etiket`
::

## Usage

```typescript
import { parseMarkdown } from 'comark'
import etiket from 'comark/plugins/etiket'

const result = await parseMarkdown(content, {
  plugins: [etiket()]
})
```

With a Vue renderer (no special component required — SVG is injected into the AST):

```vue [Vue]
<script setup lang="ts">
import { Markdown } from '@comark/vue'
import etiket from '@comark/vue/plugins/etiket'
</script>

<template>
  <Suspense>
    <Markdown :plugins="[etiket()]">
      {{ markdown }}
    </Markdown>
  </Suspense>
</template>
```

## Feature coverage

Status of etiket library features in this Comark plugin:

| Feature | Status | Notes |
|---------|--------|-------|
| QR Code (`::qrcode`) | Implemented | Styling opts (`dot-type`, `ec-level`, gradients, corners, logo) via attrs |
| Micro QR (`::microqr`) | Implemented | |
| rMQR (`::rmqr`) | Implemented | |
| 1D barcodes (`::barcode`) | Implemented | All `type=` values etiket supports (EAN, Code 128, GS1-128, …) |
| Postal (`::postal`) | Implemented | RM4SCC, KIX, AusPost, Japan Post, IMb, … |
| Data Matrix (`::datamatrix`) | Implemented | |
| GS1 DataMatrix (`::gs1datamatrix`) | Implemented | |
| PDF417 (`::pdf417`) | Implemented | |
| MicroPDF417 (`::micropdf417`) | Implemented | |
| Aztec (`::aztec`) | Implemented | |
| MaxiCode (`::maxicode`) | Implemented | |
| DotCode (`::dotcode`) | Implemented | Experimental in etiket |
| Han Xin (`::hanxin`) | Implemented | Experimental in etiket |
| Codablock F (`::codablockf`) | Implemented | |
| Code 16K (`::code16k`) | Implemented | |
| JAB Code (`::jabcode`) | Partial | SVG only — no PNG in etiket |
| QR helpers (`::qr-wifi`, `::qr-email`, `::qr-sms`, `::qr-geo`, `::qr-url`, `::qr-phone`, `::qr-vcard`, `::qr-mecard`, `::qr-event`) | Implemented | Payload built from attrs |
| Swiss QR (`::swiss-qr`) | Implemented | Nested fields via JSON attrs / YAML block props |
| GS1 Digital Link (`::gs1-digital-link`) | Implemented | Nested fields via JSON attrs / YAML block props |
| Batch sheets (`::barcode-sheet`, `::qr-sheet`) | Implemented | Values from child lines or `values=` JSON |
| Output `svg` (inline) | Implemented | Default; keeps `currentColor` theming |
| Output `img` (SVG data URI) | Implemented | |
| Output `png` (PNG data URI) | Partial | All formats except `jabcode` |
| Soft validation | Implemented | `validateBarcode` / `validateQRInput` — warn, still generate |
| Frontmatter / plugin defaults | Implemented | `etiket:` frontmatter + factory `etiket` opts |
| Option coercion (kebab → camel, JSON attrs) | Implemented | |
| `qrcodeTerminal` / `output=terminal` | Not implemented | Use etiket directly outside Comark |
| Escape hatch `::etiket{fn=…}` | Not implemented | Use named directives only |
| `barcodes()` array helper (no sheet) | Not implemented | Use multiple directives or `::barcode-sheet` |
| Raw encoders (`encode*`, `render*SVG`, `render*PNG`) | Not implemented | Library-only; not directive-mappable |
| HIBC / ISBT 128 helpers | Not implemented | Build payload with etiket, then `::barcode` |
| etiket CLI | Not implemented | Out of scope for a markdown plugin |

## Directives

### QR Codes

```md
::qrcode{value="https://comark.dev" dot-type="dots" ec-level="H"}
::
```

Supported 2D symbologies: `qrcode`, `microqr`, `rmqr`, `datamatrix`, `gs1datamatrix`, `pdf417`, `micropdf417`, `aztec`, `maxicode`, `dotcode`, `hanxin`, `codablockf`, `code16k`, `jabcode`.

### Barcodes

```md
::barcode{value="4006381333931" type="ean13" show-text="true"}
::
```

The `type=` attribute selects the 1D symbology (e.g. `ean13`, `code128`, `upc-a`, etc.). See the [etiket docs](https://etiket.productdevbook.com) for all supported types.

### Postal codes

```md
::postal{value="SN34RD1A" type="rm4scc"}
::
```

### QR helper directives

Helper directives build the QR payload from named attributes.

| Directive | Required attrs | Example |
|-----------|---------------|---------|
| `::qr-wifi` | `ssid`, `password` | `::qr-wifi{ssid="Net" password="pass"}` |
| `::qr-email` | `address` | `::qr-email{address="hi@example.com"}` |
| `::qr-sms` | `phone` | `::qr-sms{phone="+1234567890" message="Hello"}` |
| `::qr-geo` | `lat`, `lng` | `::qr-geo{lat="48.8584" lng="2.2945"}` |
| `::qr-url` | `url` | `::qr-url{url="https://example.com"}` |
| `::qr-phone` | `phone` | `::qr-phone{phone="+1234567890"}` |
| `::qr-vcard` | contact fields | `::qr-vcard{first-name="Ada" last-name="Lovelace" email="ada@example.com"}` |
| `::qr-mecard` | contact fields | `::qr-mecard{name="Ada Lovelace" phone="+1234567890"}` |
| `::qr-event` | `title`, `start`, `end` | `::qr-event{title="Meeting" start="20250101T090000Z" end="20250101T100000Z"}` |
| `::swiss-qr` | structured fields | see [Swiss QR Bill](https://etiket.productdevbook.com) |
| `::gs1-digital-link` | structured fields | see [GS1 Digital Link](https://etiket.productdevbook.com) |

### Batch sheet directives

```md
::barcode-sheet{type="ean13"}
4006381333931
9780141036144
::

::qr-sheet
https://comark.dev
https://example.com
::
```

Values can also be provided as a JSON array via the `values=` attr:

```md
::barcode-sheet{type="code128" values='["SKU-001","SKU-002","SKU-003"]'}
::
```

## Value sources

- `value=` attribute: `::qrcode{value="https://example.com"}`
- Inline content: `:qrcode[https://example.com]`
- Block body (text children):
  ```md
  ::qrcode
  https://example.com
  ::
  ```

## Option coercion

Attribute names are automatically converted from kebab-case to camelCase:

| Markdown attr | etiket option |
|---|---|
| `dot-type="dots"` | `{ dotType: 'dots' }` |
| `ec-level="H"` | `{ ecLevel: 'H' }` |
| `show-text="true"` | `{ showText: true }` |
| `bar-width="2"` | `{ barWidth: 2 }` |
| `color='{"type":"linear",...}'` | `{ color: { type: 'linear', ... } }` |

## Output modes

Control the generated node type with the `output=` attr or a frontmatter default:

| Mode | Generated node | Notes |
|---|---|---|
| `svg` (default) | inline `<svg>` | Supports CSS `currentColor` theming |
| `img` | `<img src="data:image/svg+xml;…">` | Portable single element |
| `png` | `<img src="data:image/png;base64,…">` | Not available for `jabcode` |

## Frontmatter defaults

Set global defaults in the document frontmatter under the `etiket` key. Per-directive attrs always win over frontmatter defaults.

```markdown
---
etiket:
  output: svg
  ecLevel: H
  color: currentColor
  qrcode:           # per-tag overrides
    dotType: rounded
---

::qrcode{value="https://example.com"}
::
```

## Plugin options

Pass defaults via the plugin factory — frontmatter values override these:

```typescript
import etiket from 'comark/plugins/etiket'

const plugins = [
  etiket({
    etiket: {
      output: 'svg',
      ecLevel: 'H',
    },
  }),
]
```

## Validation

The plugin performs soft validation where possible (`validateBarcode`, `validateQRInput`). Invalid inputs emit a `console.warn` but generation is still attempted. Generation errors produce a `<pre class="etiket etiket-error">` fallback node instead of throwing.

## Binding limitation

Attributes with a `:key` prefix that are runtime binding expressions (e.g. `:value="user.profileUrl"`) cannot be resolved at parse time. Those directive nodes are left unchanged in the AST.
