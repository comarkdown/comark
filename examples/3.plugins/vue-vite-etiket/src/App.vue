<script setup lang="ts">
import { Markdown } from '@comark/vue'
import etiket from '@comark/vue/plugins/etiket'

const markdown = `
# Etiket Barcode & QR Plugin

Codes are generated at parse time — no runtime component needed.

## QR Code (styled with dot-type)

::qrcode{value="https://comark.dev" dot-type="dots" ec-level="H"}
::

## QR Code as PNG img

::qrcode{value="https://github.com/comarkdown/comark" output="png"}
::

## EAN-13 Barcode

::barcode{value="4006381333931" type="ean13" show-text="true"}
::

## WiFi QR Helper

::qr-wifi{ssid="GuestNetwork" password="Welcome123"}
::

## vCard QR Helper

::qr-vcard{first-name="Ada" last-name="Lovelace" email="ada@example.com" url="https://en.wikipedia.org/wiki/Ada_Lovelace"}
::
`
</script>

<template>
  <Suspense>
    <Markdown :plugins="[etiket()]">
      {{ markdown }}
    </Markdown>
  </Suspense>
</template>
