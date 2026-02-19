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

이것은 한국어 텍스트입니다. **굵은 글씨** 와 *기울임 글씨* 도 올바르게 표시됩니다。

### 목록 예

- 첫 번째 항목
- 두 번째 항목
- 세 번째 항목

## Mixed Languages

Hello 世界！こんにちは 안녕하세요！

CJK文字とLatin文字를 함께 사용할 수 있습니다。

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
      :options="{ plugins: [cjkPlugin()] }"
    />
  </Suspense>
</template>
