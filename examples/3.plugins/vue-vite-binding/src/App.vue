<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { Markdown } from '@comark/vue'
import binding, { Binding, For, If } from '@comark/vue/plugins/binding'
import rangi from '@comark/vue/plugins/rangi'
import { github } from 'rangi/themes'

const showSource = ref(false)
const sourcePlugins = [rangi({ theme: github })]
const previewPlugins = [binding()]

// Runtime data exposed to bindings via the `data.` namespace.
const initialData = {
  user: {
    name: 'Ada',
    role: 'admin',
    age: 28,
  },
  posts: [
    { id: 1, title: 'Hello Comark', description: 'Markdown that responds to your data.', published: true },
    {
      id: 2,
      title: 'A work in progress',
      description: 'Try editing, reordering, or removing these posts.',
      published: false,
    },
  ],
  isHappy: true,
  isFine: true,
  stats: {
    users: 1200,
    uptime: '99.9%',
  },
}
const data = reactive(structuredClone(initialData))
const mood = computed(() => (data.isHappy ? 'Happy' : data.isFine ? 'Fine' : 'Not happy or fine'))

let nextPostId = 3
function addPost(): void {
  const id = nextPostId++
  data.posts.push({ id, title: `Post ${id}`, description: 'Write a description…', published: true })
}

function resetData(): void {
  Object.assign(data, structuredClone(initialData))
}

const markdown = `---
release:
  version: 2.5.1
  codename: Firefly
---

# {{ frontmatter.release.codename || Unnamed }} — v{{ frontmatter.release.version }}

Hello **{{ data.user.name || friend }}** (role: {{ data.user.role }}), welcome back!

## Posts

::for{:each="data.posts" item="post" index="position" key="id"}
### {{ props.post.title }}

{{ props.post.description }}

Post index: {{ props.position }}

:::if{:value="props.post.published"}
Published
#else
Draft
:::
#empty
No posts published yet.
::

## Role comparison

::if{:value="data.user.role" eq="admin"}
You have access to the admin tools.
#else
You are browsing as a {{ data.user.role }}.
::

## Age range

Your age is **{{ data.user.age }}**.

::if{:value="data.user.age" :gte="18" :lt="65" as="section"}
You are eligible for the 18–64 age group.
#else
You are outside the 18–64 age group.
::

::if{:value="data.user.age" :eq="100" as="div"}
[You are a centenarian 🎉]{style="color: teal;font-weight: bold;"}
::

## Nested conditions

::if{:value="data.isHappy"}
I am happy 😊
#else
:::if{:value="data.isFine"}
I am fine 🙂
#else
I am NOT fine and NOT happy 😩
:::
::

## Platform stats

| Metric | Value                            |
| ------ | -------------------------------- |
| Users  | {{ data.stats.users }}           |
| Uptime | {{ data.stats.uptime }}          |
| Plan   | {{ data.plan \\|\\| community }}     |

## Components see their own props

::card{title="Component props"}
Inside the card the binding below pulls the card's title via \`props\`:

{{ props.title }}
::
`

const sourceMarkdown = `~~~~mdc
${markdown}
~~~~`
</script>

<template>
  <div class="vbg-shell">
    <a
      class="vbg-custom-skip-link"
      href="#playground"
      >Skip to playground</a
    >
    <header class="vbg-custom-masthead">
      <a
        class="vbg-custom-brand"
        href="https://comark.dev"
        aria-label="Comark home"
        >Comark</a
      >
      <span class="vbg-meta">Examples / Binding</span>
      <a
        class="vbg-custom-docs"
        href="https://comark.dev/plugins/built-in/binding"
      >
        Documentation <span aria-hidden="true">↗</span>
      </a>
    </header>

    <main
      id="playground"
      class="vbg-custom-main"
      tabindex="-1"
    >
      <div class="vbg-custom-intro">
        <h1 class="vbg-title">Make Markdown respond to data.</h1>
        <p class="vbg-lede">Change an input. Follow the result. Explore the source.</p>
      </div>

      <div class="vbg-custom-workbench">
        <form
          class="vbg-custom-inputs"
          @submit.prevent
        >
          <div class="vbg-custom-input-heading">
            <h2 class="vbg-heading-20">Inputs</h2>
            <button
              type="button"
              class="vbg-custom-reset"
              @click="resetData"
            >
              Reset
            </button>
          </div>
          <p class="vbg-custom-input-description">Values passed to Markdown as <code>data</code>.</p>

          <div class="vbg-custom-fields">
            <div class="vbg-field">
              <label
                class="vbg-label"
                for="name"
                >Name</label
              >
              <input
                id="name"
                v-model="data.user.name"
                name="name"
                type="text"
                autocomplete="off"
                spellcheck="false"
              />
            </div>
            <div class="vbg-field">
              <label
                class="vbg-label"
                for="role"
                >Role</label
              >
              <select
                id="role"
                v-model="data.user.role"
                name="role"
              >
                <option value="admin">Admin</option>
                <option value="member">Member</option>
                <option value="guest">Guest</option>
              </select>
            </div>

            <div class="vbg-field">
              <div class="vbg-custom-age-label">
                <label
                  class="vbg-label"
                  for="age"
                  >Age</label
                >
                <output
                  for="age"
                  class="vbg-custom-age-value"
                  aria-live="off"
                  >{{ data.user.age }} <span>years</span></output
                >
              </div>
              <input
                id="age"
                v-model.number="data.user.age"
                name="age"
                type="range"
                min="0"
                max="100"
                aria-describedby="age-help"
              />
              <div
                class="vbg-range-ends"
                aria-hidden="true"
              >
                <span>0</span><span>100</span>
              </div>
              <p
                id="age-help"
                class="vbg-helper"
              >
                Try 17, 18, 64, or 65 to cross an age boundary. There’s a message at 100, too.
              </p>
            </div>
          </div>

          <fieldset class="vbg-custom-mood">
            <legend class="vbg-label">Mood</legend>
            <label class="vbg-custom-checkbox">
              <input
                v-model="data.isHappy"
                type="checkbox"
                name="happy"
              />
              <span>I am happy</span>
            </label>
            <label class="vbg-custom-checkbox">
              <input
                v-model="data.isFine"
                type="checkbox"
                name="fine"
                aria-describedby="mood-help"
              />
              <span>I am fine</span>
            </label>
            <p
              id="mood-help"
              class="vbg-helper"
            >
              Uncheck “I am happy” to explore the nested <code>#else</code> branch.
            </p>
          </fieldset>
          <fieldset class="vbg-custom-posts">
            <legend class="vbg-label">Posts</legend>
            <p class="vbg-helper">Edit a post, reverse the order, or clear the list to see <code>#empty</code>.</p>
            <div
              v-for="(post, index) in data.posts"
              :key="post.id"
              class="vbg-custom-post"
            >
              <label
                class="vbg-label"
                :for="`post-title-${post.id}`"
                >Post {{ index + 1 }} title</label
              >
              <input
                :id="`post-title-${post.id}`"
                v-model="post.title"
                type="text"
              />
              <label
                class="vbg-label"
                :for="`post-description-${post.id}`"
                >Description</label
              >
              <textarea
                :id="`post-description-${post.id}`"
                v-model="post.description"
                rows="2"
              />
              <label class="vbg-custom-checkbox"
                ><input
                  v-model="post.published"
                  type="checkbox"
                />
                Published</label
              >
              <button
                type="button"
                class="vbg-button vbg-button-secondary"
                :aria-label="`Remove post ${index + 1}`"
                @click="data.posts.splice(index, 1)"
              >
                Remove
              </button>
            </div>
            <div class="vbg-custom-post-actions">
              <button
                type="button"
                class="vbg-button vbg-button-secondary"
                @click="addPost"
              >
                Add post
              </button>
              <button
                type="button"
                class="vbg-button vbg-button-secondary"
                :disabled="data.posts.length < 2"
                @click="data.posts.reverse()"
              >
                Reverse order
              </button>
              <button
                type="button"
                class="vbg-button vbg-button-secondary"
                :disabled="!data.posts.length"
                @click="data.posts.splice(0)"
              >
                Clear posts
              </button>
            </div>
          </fieldset>
          <p class="vbg-custom-input-note">Changes appear immediately.<br />No submit button needed.</p>
        </form>

        <section
          class="vbg-custom-output"
          :aria-label="showSource ? 'Markdown source' : 'Markdown preview'"
        >
          <div class="vbg-custom-toolbar">
            <div
              class="vbg-custom-view-toggle"
              role="group"
              aria-label="Markdown view"
            >
              <button
                type="button"
                :aria-pressed="!showSource"
                aria-controls="markdown-preview"
                @click="showSource = false"
              >
                Preview
              </button>
              <button
                type="button"
                :aria-pressed="showSource"
                aria-controls="markdown-source"
                @click="showSource = true"
              >
                Source
              </button>
            </div>
            <span class="vbg-custom-format">{{ showSource ? 'Comark · Rangi' : 'Rendered Markdown' }}</span>
          </div>

          <div
            id="markdown-preview"
            v-show="!showSource"
            class="vbg-custom-document"
          >
            <Suspense>
              <Markdown
                :value="markdown"
                :plugins="previewPlugins"
                :components="{ Binding, For, If, h1: 'h2', h2: 'h3' }"
                :data="data"
              />
              <template #fallback><p class="vbg-caption">Rendering Markdown…</p></template>
            </Suspense>
          </div>
          <div
            id="markdown-source"
            v-show="showSource"
            class="vbg-custom-source"
          >
            <Suspense>
              <Markdown
                :value="sourceMarkdown"
                :plugins="sourcePlugins"
              />
              <template #fallback><p class="vbg-caption">Highlighting source…</p></template>
            </Suspense>
          </div>

          <div
            class="vbg-custom-status"
            role="status"
            aria-label="Current data"
            aria-live="polite"
            aria-atomic="true"
          >
            <span>Current data</span>
            <span>{{ data.user.role }} · {{ data.user.age }} years · {{ mood }} · {{ data.posts.length }} posts</span>
          </div>
        </section>
      </div>
    </main>

    <footer class="vbg-custom-footer">
      <p>One document. Different possibilities.</p>
      <a href="https://comark.dev/syntax/components#data-binding"
        >Explore data binding <span aria-hidden="true">↗</span></a
      >
    </footer>
  </div>
</template>

<style scoped>
.vbg-custom-skip-link {
  position: absolute;
  top: var(--vbg-space-4);
  left: var(--vbg-space-4);
  z-index: 1;
  padding: var(--vbg-space-3);
  background: var(--vbg-surface-primary);
  color: var(--vbg-text-primary);
  transform: translateY(-200%);
}
.vbg-custom-skip-link:focus {
  transform: translateY(0);
  outline: 2px solid var(--vbg-focus);
  outline-offset: 3px;
}
.vbg-custom-masthead {
  display: flex;
  align-items: baseline;
  gap: var(--vbg-space-6);
  padding-block: var(--vbg-space-4);
}
.vbg-custom-brand {
  color: var(--vbg-text-primary);
  text-decoration: none;
  font-size: var(--vbg-type-section);
  font-weight: var(--vbg-weight-semibold);
  letter-spacing: -0.04em;
}
.vbg-custom-docs {
  margin-left: auto;
  color: var(--vbg-text-secondary);
  font-size: var(--vbg-type-label);
  text-decoration: none;
}
.vbg-custom-docs:hover,
.vbg-custom-footer a:hover {
  color: var(--vbg-text-primary);
  text-decoration: underline;
  text-underline-offset: 0.2em;
}
.vbg-custom-main {
  padding-top: var(--vbg-space-4);
}
.vbg-custom-intro {
  display: grid;
  gap: var(--vbg-space-3);
  margin-bottom: var(--vbg-space-8);
}
.vbg-custom-intro > * {
  margin: 0;
}
.vbg-custom-workbench {
  display: grid;
  grid-template-columns: minmax(260px, 300px) minmax(0, 1fr);
  border: 1px solid var(--vbg-border-default);
  border-radius: var(--vbg-radius);
  align-items: start;
}
.vbg-custom-inputs {
  padding: var(--vbg-space-6);
  min-width: 0;
}
.vbg-custom-input-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--vbg-space-4);
}
.vbg-custom-input-heading h2 {
  margin: 0;
}
.vbg-custom-reset {
  border: 0;
  padding: var(--vbg-space-2);
  color: var(--vbg-text-secondary);
  background: transparent;
  font: inherit;
  font-size: var(--vbg-type-label);
  cursor: pointer;
  border-radius: var(--vbg-radius-small);
}
.vbg-custom-reset:hover {
  background: var(--vbg-surface-secondary);
  color: var(--vbg-text-primary);
}
.vbg-custom-input-description {
  margin: var(--vbg-space-2) 0 var(--vbg-space-8);
  font-size: var(--vbg-type-label);
  line-height: var(--vbg-leading-body);
  color: var(--vbg-text-secondary);
}
.vbg-custom-fields {
  display: grid;
  gap: var(--vbg-space-6);
}
.vbg-custom-age-label {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: var(--vbg-space-3);
}
.vbg-custom-age-value {
  font-size: var(--vbg-type-label);
  font-variant-numeric: tabular-nums;
  font-weight: var(--vbg-weight-medium);
}
.vbg-custom-age-value span {
  color: var(--vbg-text-secondary);
  font-weight: var(--vbg-weight-regular);
}
.vbg-custom-mood {
  padding: 0;
  margin: var(--vbg-space-8) 0 0;
  border: 0;
  min-width: 0;
}
.vbg-custom-checkbox {
  display: flex;
  gap: var(--vbg-space-3);
  align-items: center;
  min-height: 44px;
  font-size: var(--vbg-type-body);
  cursor: pointer;
}
.vbg-custom-checkbox input {
  width: 16px;
  height: 16px;
  margin: 0;
  accent-color: var(--vbg-text-primary);
}
.vbg-custom-input-note {
  margin: var(--vbg-space-8) 0 0;
  color: var(--vbg-text-secondary);
  font-size: var(--vbg-type-label);
  line-height: var(--vbg-leading-body);
}
.vbg-custom-output {
  min-width: 0;
  border-left: 1px solid var(--vbg-border-default);
}
.vbg-custom-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--vbg-space-3);
  padding: var(--vbg-space-3) var(--vbg-space-6);
  border-bottom: 1px solid var(--vbg-border-subtle);
}
.vbg-custom-view-toggle {
  display: flex;
  gap: var(--vbg-space-1);
}
.vbg-custom-view-toggle button {
  font: inherit;
  font-size: var(--vbg-type-label);
  font-weight: var(--vbg-weight-medium);
  padding: var(--vbg-space-2) var(--vbg-space-3);
  min-height: 40px;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: var(--vbg-radius-small);
  background: transparent;
  color: var(--vbg-text-secondary);
}
.vbg-custom-view-toggle button:hover {
  color: var(--vbg-text-primary);
}
.vbg-custom-view-toggle button[aria-pressed='true'] {
  color: var(--vbg-text-primary);
  background: var(--vbg-surface-secondary);
  border-color: var(--vbg-border-default);
}
.vbg-custom-format {
  font-size: var(--vbg-type-label);
  color: var(--vbg-text-secondary);
}
.vbg-custom-document {
  padding: var(--vbg-space-8);
  font-size: var(--vbg-type-body);
  line-height: var(--vbg-leading-body);
}
.vbg-custom-document :deep(h2) {
  margin: 0 0 var(--vbg-space-4);
  font-size: var(--vbg-type-section);
  line-height: var(--vbg-leading-section);
  font-weight: var(--vbg-weight-heading);
  letter-spacing: -0.025em;
}
.vbg-custom-document :deep(h3) {
  margin: var(--vbg-space-8) 0 var(--vbg-space-3);
  font-size: var(--vbg-type-subsection);
  line-height: var(--vbg-leading-subsection);
  font-weight: var(--vbg-weight-heading);
}
.vbg-custom-document :deep(p) {
  margin: 0 0 var(--vbg-space-3);
}
.vbg-custom-document :deep(table) {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--vbg-type-label);
}
.vbg-custom-document :deep(th),
.vbg-custom-document :deep(td) {
  padding: var(--vbg-space-3) 0;
  text-align: left;
  vertical-align: baseline;
  border-bottom: 1px solid var(--vbg-border-subtle);
}
.vbg-custom-document :deep(th) {
  font-weight: var(--vbg-weight-medium);
  color: var(--vbg-text-secondary);
}
.vbg-custom-document :deep(td:last-child),
.vbg-custom-document :deep(th:last-child) {
  text-align: right;
}
.vbg-custom-document :deep(strong) {
  font-weight: var(--vbg-weight-semibold);
}
.vbg-custom-document :deep(code),
.vbg-custom-inputs code {
  font-family: 'Geist Mono', monospace;
  font-size: 0.9em;
}
.vbg-custom-source {
  padding: var(--vbg-space-6) 0;
  background: var(--vbg-surface-secondary);
}
.vbg-custom-source :deep(pre) {
  overflow-x: auto;
  margin: 0;
  padding: var(--vbg-space-2) var(--vbg-space-8);
  font-family: 'Geist Mono', monospace;
  font-size: var(--vbg-type-label);
  line-height: var(--vbg-leading-body);
  tab-size: 2;
  border: 0;
  border-radius: 0;
  background: transparent;
}
.vbg-custom-source :deep(pre code) {
  padding: 0;
  border: 0;
  background: transparent;
}
.vbg-custom-status {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--vbg-space-2);
  padding: var(--vbg-space-3) var(--vbg-space-6);
  border-top: 1px solid var(--vbg-border-subtle);
  color: var(--vbg-text-secondary);
  font-size: var(--vbg-type-label);
  font-variant-numeric: tabular-nums;
}
.vbg-custom-footer {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--vbg-space-4);
  padding-block: var(--vbg-space-8);
  color: var(--vbg-text-secondary);
  font-size: var(--vbg-type-label);
}
.vbg-custom-footer p {
  margin: 0;
}
.vbg-custom-footer a {
  color: inherit;
  text-decoration: none;
}
.vbg-custom-masthead a:focus-visible,
.vbg-custom-footer a:focus-visible,
.vbg-custom-inputs :focus-visible,
.vbg-custom-view-toggle button:focus-visible {
  outline: 2px solid var(--vbg-focus);
  outline-offset: 3px;
}
@media (prefers-color-scheme: dark) {
  .vbg-custom-source :deep(span[style*='--shiki-dark']) {
    color: var(--shiki-dark) !important;
  }
}
@media (max-width: 760px) {
  .vbg-custom-workbench {
    grid-template-columns: 1fr;
  }
  .vbg-custom-inputs {
    padding: var(--vbg-space-6);
  }
  .vbg-custom-output {
    border-left: 0;
    border-top: 1px solid var(--vbg-border-default);
  }
  .vbg-custom-fields {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .vbg-custom-fields > :last-child {
    grid-column: 1 / -1;
  }
  .vbg-custom-masthead {
    gap: var(--vbg-space-4);
    flex-wrap: wrap;
  }
  .vbg-custom-document {
    padding: var(--vbg-space-6);
  }
}
@media (max-width: 420px) {
  .vbg-custom-masthead {
    padding-block: var(--vbg-space-6);
  }
  .vbg-custom-main {
    padding-top: var(--vbg-space-4);
  }
  .vbg-custom-format {
    display: none;
  }
}
</style>

<style scoped>
.vbg-custom-posts {
  border: 0;
  padding: 0;
  margin: 24px 0 0;
  min-width: 0;
}
.vbg-custom-post {
  display: grid;
  gap: 8px;
  border-bottom: 1px solid var(--vbg-border);
  padding: 16px 0;
}
.vbg-custom-post-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}
</style>
