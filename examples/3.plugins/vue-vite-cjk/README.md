---
title: CJK Language Support
navigation.title: CJK languages
description: Example showing how to use Comark with Chinese, Japanese, and Korean text in Vue and Vite.
navigation.icon: i-lucide-languages
category: Plugins
path: /examples/plugins/vue-vite-cjk
---

::code-explorer
---
org: comarkdown
repo: comark
path: examples/3.plugins/vue-vite-cjk
defaultValue: src/App.vue
---
::

## Features

This example demonstrates how to use Comark with CJK (Chinese, Japanese, Korean) text in Vue:

- **CJK Plugin**: Optimized text handling for Chinese, Japanese, and Korean languages
- **Proper Line Breaking**: Handles line breaks in CJK text without adding unwanted spaces
- **Mixed Content**: Works seamlessly with mixed CJK and Latin text
- **All Markdown Features**: Full support for headings, lists, code, tables, and more in CJK

## Usage

1. Import the CJK plugin:
   ```ts
   import cjk from '@comark/cjk'
   ```

2. Pass the plugin to Comark:
   ```vue
   <Comark :plugins="[cjk()]" />
   ```

3. Write markdown in any CJK language:
   ```markdown
   # 中文标题

   这是一段中文文本。

   ## 日本語の見出し

   これは日本語のテキストです。

   ### 한국어 제목

   이것은 한국어 텍스트입니다.
   ```

## Why Use the CJK Plugin?

Without the CJK plugin, markdown parsers often add unwanted spaces between lines of CJK text, which breaks proper text flow. The CJK plugin handles this correctly:

**Without CJK plugin:**
```
这是第一行
这是第二行
→ Renders as: "这是第一行 这是第二行" (unwanted space)
```

**With CJK plugin:**
```
这是第一行
这是第二行
→ Renders as: "这是第一行这是第二行" (correct)
```

## Language-Specific Features

### Chinese (中文)
- Simplified and Traditional Chinese support
- Proper punctuation handling (，。！？)
- Chinese-specific typography

### Japanese (日本語)
- Hiragana, Katakana, and Kanji support
- Proper handling of Japanese punctuation (、。！？)
- Mixed script support (かな + 漢字 + ローマ字)

### Korean (한국어)
- Hangul character support
- Korean punctuation handling
- Proper spacing rules for Korean text

## Tips for CJK Content

1. **Font Selection**: Use system fonts or web fonts that support CJK characters
2. **Line Height**: Increase line-height (1.7-2.0) for better readability
3. **Font Size**: Consider slightly larger font sizes for CJK text
4. **Mixed Content**: The plugin handles transitions between CJK and Latin text automatically
