---
title: CJK text support
description: Example showing how to use Comark with Chinese, Japanese, and Korean text in Vue 3 and Vite.
icon: i-lucide-languages
category: Plugins
---

::code-tree{defaultValue="src/App.vue" expandAll}

```ts [src/main.ts]
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
```

```vue [src/App.vue]
<script setup lang="ts">
import { Comark } from 'comark/vue'
import cjkPlugin from '@comark/cjk'

const markdown = `
# CJK Text Support

## Chinese (中文)

这是一段中文文本。**加粗文本** 和 *斜体文本* 都能正确显示。

### 列表示例

- 第一项
- 第二项
- 第三项

## Japanese (日本語)

これは日本語のテキストです。**太字テキスト** と *斜体テキスト* も正しく表示されます。

### リスト例

1. 最初の項目
2. 二番目の項目
3. 三番目の項目

## Korean (한국어)

이것은 한국어 텍스트입니다. **굵은 글씨** 와 *기울임 글씨* 도 올바르게 표시됩니다.

### 목록 예

- 첫 번째 항목
- 두 번째 항목
- 세 번째 항목

## Mixed Languages

Hello 世界！こんにちは 안녕하세요！

CJK文字とLatin文字를 함께 사용할 수 있습니다.

インラインコード：\`日本語のコード\`

## Blockquote

> 这是一段引用文本。
> 来自某位名人。

## Table

| 名称 | 描述 |
|------|------|
| 项目A | 这是项目A的描述 |
| 项目B | これはプロジェクトBです |
| 항목C | 이것은 항목C입니다 |
`
</script>

<template>
  <Suspense>
    <Comark
      :markdown="markdown"
      :options="{ plugins: [cjkPlugin] }"
    />
  </Suspense>
</template>
```

```ts [vite.config.ts]
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
})
```

```json [package.json]
{
  "name": "comark-vue-cjk-example",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@comark/cjk": "latest",
    "comark": "latest",
    "vue": "^3.5.27"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^6.0.4",
    "typescript": "^5.9.3",
    "vite": "^7.3.1",
    "vue-tsc": "^3.2.4"
  }
}
```

```html [index.html]
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Comark + CJK - Vue Example</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

```json [tsconfig.json]
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*.ts", "src/**/*.vue"]
}
```

::

## Features

This example demonstrates how to use Comark with CJK (Chinese, Japanese, Korean) text in Vue 3:

- **CJK Plugin**: Optimized text handling for Chinese, Japanese, and Korean languages
- **Proper Line Breaking**: Handles line breaks in CJK text without adding unwanted spaces
- **Mixed Content**: Works seamlessly with mixed CJK and Latin text
- **All Markdown Features**: Full support for headings, lists, code, tables, and more in CJK

## Usage

1. Import the CJK plugin:
   ```ts
   import cjkPlugin from '@comark/cjk'
   ```

2. Pass the plugin to Comark options:
   ```vue
   <Comark :options="{ plugins: [cjkPlugin] }" />
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
