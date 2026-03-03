<script setup lang="ts">
const plugins = [
  {
    id: 'math',
    name: 'Math',
    icon: 'i-lucide-sigma',
    description: 'LaTeX math formulas with KaTeX. Inline $...$ and display $$...$$ syntax.',
    input: 'The area of a circle is $A = \\pi r^2$.\n\nEuler\'s identity:\n\n$$e^{i\\pi} + 1 = 0$$',
    package: '@comark/math',
  },
  {
    id: 'cjk',
    name: 'CJK',
    icon: 'i-lucide-languages',
    description: 'Improved line breaking and spacing between CJK and Latin characters.',
    input: '# 你好世界\n\nComark支持**中文**、_日本語_、한국어等CJK文字。\n\n混合English和中文的排版效果更好。',
    package: '@comark/cjk',
  },
  {
    id: 'highlight',
    name: 'Highlight',
    icon: 'i-lucide-code',
    description: 'Syntax highlighting for code blocks powered by Shiki.',
    input: '```typescript\ninterface User {\n  name: string\n  email: string\n}\n\nasync function getUser(id: number): Promise<User> {\n  const res = await fetch(`/api/users/${id}`)\n  return res.json()\n}\n```',
    package: 'comark',
  },
  {
    id: 'toc',
    name: 'TOC',
    icon: 'i-lucide-list',
    description: 'Auto-generate a table of contents from document headings.',
    input: '# Introduction\n\nWelcome to the docs.\n\n## Getting Started\n\nInstall the package.\n\n### Configuration\n\nSet up your config.\n\n## API Reference\n\nFull API docs.',
    package: 'comark',
  },
]

const activePlugin = ref('math')

const current = computed(() => plugins.find(p => p.id === activePlugin.value)!)
</script>

<template>
  <div>
    <div class="grid lg:grid-cols-2">
      <div class="border-b border-default p-6 lg:border-r lg:border-b-0 lg:p-8">
        <span class="section-label">Plugins</span>
        <h2 class="mt-4 text-2xl font-bold text-highlighted">
          Extensible plugins
        </h2>
        <p class="mt-3 text-base/7 text-muted">
          Extend Comark with plugins for math formulas, CJK text, syntax highlighting, and more.
        </p>

        <div class="mt-6 flex flex-wrap gap-2">
          <button
            v-for="plugin in plugins"
            :key="plugin.id"
            class="flex items-center gap-1.5 border px-3 py-1.5 text-xs font-medium transition-colors"
            :class="activePlugin === plugin.id
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-default text-muted hover:border-accented hover:text-highlighted'"
            @click="activePlugin = plugin.id"
          >
            <UIcon :name="plugin.icon" class="size-3.5" />
            {{ plugin.name }}
          </button>
        </div>

        <p class="mt-6 text-sm/6 text-muted">{{ current.description }}</p>

        <NuxtLink
          to="/plugins"
          class="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80"
        >
          Browse all plugins
          <UIcon name="i-lucide-arrow-right" class="size-4" />
        </NuxtLink>
      </div>

      <div class="bg-muted/50">
        <div class="flex items-center justify-between border-b border-default px-6 py-2.5 lg:px-8">
          <span class="font-mono text-xs text-dimmed">input.md</span>
          <span class="bg-accented/80 px-2 py-0.5 font-mono text-xs text-muted">{{ current.package }}</span>
        </div>

        <div class="grid grid-cols-2">
          <div class="border-r border-default p-6 lg:p-8">
            <div class="h-[260px] overflow-auto">
              <pre class="font-mono text-sm/7 whitespace-pre-wrap text-default">{{ current.input }}</pre>
            </div>
          </div>

          <div class="p-6 lg:p-8">
            <div class="mb-3">
              <span class="font-mono text-xs text-dimmed">rendered output</span>
            </div>
            <div class="h-[230px] overflow-auto">
              <ComarkDocs
                :key="current.id"
                class="prose prose-sm max-w-none dark:prose-invert"
                :markdown="current.input"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
