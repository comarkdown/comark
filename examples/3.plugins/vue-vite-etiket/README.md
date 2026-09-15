# Comark — Etiket Plugin Example

This example demonstrates the `comark/plugins/etiket` plugin.

Barcodes and QR codes are generated **at parse time** using the
[etiket](https://github.com/productdevbook/etiket) library. The resulting SVG
is injected directly into the Comark AST, so no per-framework render component
is required.

## Directives demonstrated

- `::qrcode` — standard QR code (with dot-type styling)
- `::qrcode{output="png"}` — QR code as `<img>` PNG data URI
- `::barcode{type="ean13"}` — EAN-13 barcode with human-readable text
- `::qr-wifi` — WiFi credential QR helper
- `::qr-vcard` — vCard contact QR helper

## Running

```bash
pnpm dev:etiket
```
