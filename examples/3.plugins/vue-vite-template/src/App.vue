<script setup lang="ts">
import { computed, defineComponent, h, ref, shallowRef, watch } from 'vue'
import { parseMarkdown, type MarkdownDocument as Document } from 'comark'
import { MarkdownDocument } from '@comark/vue'
import template, { resolveTemplates } from '@comark/vue/plugins/template'

interface Example {
  name: string
  source: string
  data: Record<string, unknown>
}

const components = {
  ProjectPanel: defineComponent({
    props: { project: { type: Object, required: true } },
    setup(_props, { slots }) {
      return () => h('section', slots.default?.())
    },
  }),
}

const examples: Example[] = [
  {
    name: 'Conditions & ternaries',
    source: `# Workspace access

Hello **{{ user.name || 'Guest' }}**.

{% if user.role === 'admin' %}
## Administrator
You can manage members and workspace settings.
{% elif user.role === 'member' %}
## Member
Your team workspace is ready.
{% else %}
## Guest
Request an invitation to join the workspace.
{% endif %}

Status: **{{ online ? 'Online' : 'Offline' }}**

{% if user.age !== undefined && user.age >= 18 && user.age < 65 %}
Standard membership applies.
{% else %}
Contact your workspace administrator.
{% endif %}`,
    data: { user: { name: 'Ada', role: 'admin', age: 28 }, online: true },
  },
  {
    name: 'Nested & filtered loops',
    source: `# Team directory

{% for team in teams %}
## {{ team.name }}

{% for user in team.users.filter(user => user.active) %}
### {{ loop.index }}. {{ user.name }}
{% if user.role === 'lead' %}
**Team lead**
{% elif user.role === 'engineer' %}
Engineering
{% else %}
Contributor
{% endif %}
{{ loop.last ? 'Last active member' : 'More members below' }}
{% else %}
No active members.
{% endfor %}

{% else %}
No teams yet.
{% endfor %}`,
    data: {
      teams: [
        {
          name: 'Platform',
          users: [
            { name: 'Ada', active: true, role: 'lead' },
            { name: 'Lin', active: true, role: 'engineer' },
            { name: 'Sam', active: false, role: 'contributor' },
          ],
        },
        { name: 'Research', users: [] },
      ],
    },
  },
  {
    name: 'Object methods & map',
    source: `# Release checklist

{% for key, value in Object.entries(release) %}
**{{ key.toUpperCase() }}:** {{ value }}
{% endfor %}

## Milestones
{% for number in [1, 2, 3] %}
Milestone **{{ number }}**
{% endfor %}

## Reviewers
{{ reviewers.map(name => name.toUpperCase()).join(', ') }}

{{ note || 'No release note yet.' }}

{# This comment is not rendered. #}

Literal syntax: \`{{ untouched }}\``,
    data: { release: { version: '0.8.0', channel: 'Preview' }, reviewers: ['Ada', 'Lin'] },
  },
  {
    name: 'Component props & frontmatter',
    source: `---
title: Project updates
---
# {{ frontmatter.title }}

{% for project in projects %}
::project-panel{:project="project"}
## {{ project.name }}

{% if props.project.shipped %}
**Released**
{% else %}
In progress
{% endif %}

Owner: {{ props.project.owner }}
::
{% else %}
No projects yet.
{% endfor %}`,
    data: {
      projects: [
        { name: 'Parser', owner: 'Ada', shipped: true },
        { name: 'Documentation', owner: 'Lin', shipped: false },
      ],
    },
  },
]

const selected = ref(0)
const source = ref(examples[0].source)
const dataSource = ref(JSON.stringify(examples[0].data, null, 2))
const document = shallowRef<Document>()
const parseError = ref('')
const parsing = ref(false)
const view = ref<'preview' | 'document'>('preview')

function reset(): void {
  const example = examples[selected.value]
  source.value = example.source
  dataSource.value = JSON.stringify(example.data, null, 2)
}

watch(selected, reset)
watch(
  source,
  async (value, _previous, onCleanup) => {
    let cancelled = false
    onCleanup(() => {
      cancelled = true
    })
    parsing.value = true
    parseError.value = ''
    try {
      const parsed = await parseMarkdown(value, { plugins: [template()], autoClose: false })
      if (cancelled) return
      document.value = parsed
    } catch (error) {
      if (cancelled) return
      document.value = undefined
      parseError.value = error instanceof Error ? error.message : String(error)
    } finally {
      if (!cancelled) parsing.value = false
    }
  },
  { immediate: true }
)

const result = computed(() => {
  try {
    const data: unknown = JSON.parse(dataSource.value)
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return { error: 'Runtime data must be a JSON object.', document: undefined }
    }
    if (!document.value || parsing.value || parseError.value) return { error: '', document: undefined }
    return { error: '', document: resolveTemplates(document.value, data as Record<string, unknown>) }
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error), document: undefined }
  }
})

const error = computed(() => parseError.value || result.value.error)
const serialized = computed(() => JSON.stringify(result.value.document, null, 2))
</script>

<template>
  <div class="playground">
    <header class="masthead">
      <a
        class="brand"
        href="https://comark.dev"
        aria-label="Comark documentation"
        >comark<span class="brand-dot">.</span></a
      >
      <h1>Template playground</h1>
      <a
        class="docs-link"
        href="https://comark.dev"
        >Documentation</a
      >
    </header>

    <div class="toolbar">
      <div class="preset">
        <label for="example">Example</label>
        <select
          id="example"
          v-model="selected"
        >
          <option
            v-for="(example, index) in examples"
            :key="example.name"
            :value="index"
          >
            {{ example.name }}
          </option>
        </select>
      </div>
      <button
        class="reset"
        type="button"
        @click="reset"
      >
        Reset example
      </button>
      <span
        class="status"
        :class="{ invalid: error }"
        role="status"
        >{{ parsing ? 'Parsing' : error ? 'Invalid input' : 'Ready' }}</span
      >
    </div>

    <main class="workspace">
      <div class="editors">
        <section class="editor source-editor">
          <div class="section-heading"><label for="source">Template</label><span>Markdown</span></div>
          <textarea
            id="source"
            v-model="source"
            spellcheck="false"
            aria-label="Template source"
          />
        </section>
        <section class="editor data-editor">
          <div class="section-heading"><label for="data">Runtime data</label><span>JSON</span></div>
          <textarea
            id="data"
            v-model="dataSource"
            spellcheck="false"
            aria-label="Runtime data"
          />
        </section>
      </div>

      <section
        class="output"
        aria-label="Template output"
      >
        <div class="output-heading">
          <div
            class="tabs"
            role="tablist"
            aria-label="Output view"
          >
            <button
              id="preview-tab"
              type="button"
              role="tab"
              :aria-selected="view === 'preview'"
              aria-controls="output-panel"
              @click="view = 'preview'"
            >
              Preview
            </button>
            <button
              id="document-tab"
              type="button"
              role="tab"
              :aria-selected="view === 'document'"
              aria-controls="output-panel"
              @click="view = 'document'"
            >
              Resolved document
            </button>
          </div>
          <span class="node-count">{{ result.document?.nodes.length ?? 0 }} root nodes</span>
        </div>
        <div
          id="output-panel"
          class="output-body"
          role="tabpanel"
          :aria-labelledby="view === 'preview' ? 'preview-tab' : 'document-tab'"
        >
          <div
            v-if="error"
            class="error"
            role="alert"
          >
            <strong>Cannot render template</strong>
            <pre>{{ error }}</pre>
          </div>
          <p
            v-else-if="parsing"
            class="empty-state"
          >
            Parsing...
          </p>
          <pre
            v-else-if="view === 'document'"
            class="ast"
            >{{ serialized }}</pre>
          <Suspense v-else-if="result.document?.nodes.length">
            <MarkdownDocument
              :value="result.document"
              :components="components"
            />
            <template #fallback><p class="empty-state">Rendering...</p></template>
          </Suspense>
          <p
            v-else
            class="empty-state"
          >
            No output.
          </p>
        </div>
      </section>
    </main>
    <footer><span>comark / plugins / template</span><span>Dependency-free</span></footer>
  </div>
</template>

<style>
:root {
  font-family: 'Geist', sans-serif;
  color: #22272a;
  background: #f5f6f7;
  font-synthesis: none;
  letter-spacing: 0;
  --border: #dce1e3;
  --muted: #626d72;
  --accent: #087f72;
}
* {
  box-sizing: border-box;
}
body {
  margin: 0;
}
button,
select,
textarea {
  font: inherit;
}
button,
select {
  cursor: pointer;
}
button:focus-visible,
select:focus-visible,
a:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}
.playground {
  max-width: 1720px;
  margin: auto;
}
.masthead {
  display: flex;
  gap: 28px;
  align-items: center;
  min-height: 88px;
  padding: 20px 32px;
  border-bottom: 1px solid var(--border);
}
.brand {
  font-size: 28px;
  font-weight: 700;
  color: inherit;
  text-decoration: none;
}
.brand-dot {
  color: var(--accent);
}
.masthead h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}
.docs-link {
  margin-left: auto;
  font-size: 13px;
  color: var(--muted);
}
.toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 32px;
}
.preset {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.preset label {
  font-size: 12px;
  font-weight: 600;
}
select {
  max-width: 100%;
  min-height: 36px;
  border: 1px solid var(--border);
  padding: 6px 30px 6px 12px;
  border-radius: 4px;
  color: inherit;
  background: white;
  font-size: 13px;
}
.reset {
  background: none;
  border: 0;
  padding: 8px 0;
  color: var(--muted);
  font-size: 13px;
  text-decoration: underline;
  text-underline-offset: 4px;
}
.status {
  margin-left: auto;
  font-size: 12px;
  color: var(--accent);
  white-space: nowrap;
}
.status::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-right: 8px;
  background: currentColor;
  border-radius: 50%;
}
.status.invalid {
  color: #b33845;
}
.workspace {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  background: white;
}
.editors {
  min-width: 0;
  border-right: 1px solid var(--border);
}
.editor {
  display: flex;
  flex-direction: column;
}
.section-heading,
.output-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 48px;
  padding: 0 24px;
  border-bottom: 1px solid var(--border);
}
.section-heading label {
  font-size: 13px;
  font-weight: 600;
}
.section-heading span,
.node-count {
  font-family: 'Geist Mono', monospace;
  font-size: 11px;
  color: var(--muted);
}
.source-editor textarea {
  height: 410px;
}
.data-editor {
  border-top: 1px solid var(--border);
}
.data-editor textarea {
  height: 260px;
  background: #f7faf9;
}
textarea {
  display: block;
  width: 100%;
  resize: vertical;
  min-height: 180px;
  border: 0;
  border-radius: 0;
  outline: none;
  padding: 20px 24px;
  color: #27313a;
  background: #fcfcfd;
  font-family: 'Geist Mono', monospace;
  font-size: 12px;
  line-height: 1.8;
  tab-size: 2;
}
textarea:focus {
  box-shadow: inset 3px 0 var(--accent);
}
.output {
  min-width: 0;
}
.output-heading {
  padding-top: 0;
  padding-bottom: 0;
}
.tabs {
  display: flex;
  gap: 20px;
  align-self: stretch;
}
.tabs button {
  background: none;
  color: var(--muted);
  border: 0;
  border-bottom: 2px solid transparent;
  padding: 0;
  font-size: 13px;
}
.tabs button[aria-selected='true'] {
  color: var(--accent);
  border-bottom-color: var(--accent);
}
.output-body {
  padding: 28px 32px;
  overflow-wrap: anywhere;
}
.comark-content {
  line-height: 1.75;
  font-size: 14px;
}
.comark-content h1 {
  font-size: 28px;
  line-height: 1.25;
  margin: 0 0 24px;
}
.comark-content h2 {
  font-size: 20px;
  line-height: 1.4;
  margin: 28px 0 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border);
}
.comark-content h3 {
  font-size: 16px;
  margin: 20px 0 8px;
}
.comark-content p {
  margin: 12px 0;
}
.comark-content strong {
  font-weight: 600;
}
.comark-content code {
  font-family: 'Geist Mono', monospace;
  font-size: 12px;
  background: #eff3f2;
  padding: 2px 5px;
  border-radius: 3px;
}
.error {
  border-left: 3px solid #b33845;
  background: #fff3f4;
  padding: 16px;
  color: #922936;
  font-size: 13px;
}
.error pre,
.ast {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font-family: 'Geist Mono', monospace;
  font-size: 12px;
  line-height: 1.7;
}
.error pre {
  margin-bottom: 0;
}
.ast {
  margin: 0;
}
.empty-state {
  color: var(--muted);
  font-size: 14px;
}
footer {
  display: flex;
  justify-content: space-between;
  padding: 16px 32px;
  color: var(--muted);
  font-family: 'Geist Mono', monospace;
  font-size: 10px;
}
@media (max-width: 760px) {
  .masthead {
    padding: 18px 16px;
    gap: 16px;
    flex-wrap: wrap;
  }
  .masthead h1 {
    font-size: 16px;
  }
  .docs-link {
    font-size: 12px;
  }
  .toolbar {
    padding: 14px 16px;
    flex-wrap: wrap;
    gap: 12px;
  }
  .preset {
    flex: 1 1 100%;
  }
  .preset select {
    flex: 1;
    min-width: 0;
  }
  .workspace {
    grid-template-columns: minmax(0, 1fr);
  }
  .editors {
    border-right: 0;
    border-bottom: 1px solid var(--border);
  }
  .source-editor textarea {
    height: 310px;
  }
  .data-editor textarea {
    height: 220px;
  }
  .section-heading,
  .output-heading {
    padding-left: 16px;
    padding-right: 16px;
  }
  .section-heading span {
    font-size: 10px;
  }
  .tabs {
    gap: 16px;
  }
  .node-count {
    font-size: 10px;
  }
  .output-body {
    padding: 24px 16px;
    min-height: 280px;
  }
  footer {
    padding: 16px;
    gap: 12px;
  }
}
</style>
