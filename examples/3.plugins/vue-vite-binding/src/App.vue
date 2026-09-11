<script setup lang="ts">
import { reactive, ref } from 'vue'
import { Markdown } from '@comark/vue'
import binding, { Binding, If } from '@comark/vue/plugins/binding'

const showSource = ref(false)

// Runtime data exposed to bindings via the `data.` namespace.
const data = reactive({
  user: {
    name: 'Ada',
    role: 'admin',
    age: 28,
  },
  isHappy: true,
  isFine: true,
  stats: {
    users: 1200,
    uptime: '99.9%',
  },
})

const markdown = `---
release:
  version: 2.5.1
  codename: Firefly
---

# {{ frontmatter.release.codename || Unnamed }} — v{{ frontmatter.release.version }}

Hello **{{ data.user.name || friend }}** (role: {{ data.user.role }}), welcome back!

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

## Nested conditions

::if{:value="data.isHappy"}
I am happy.
#else
:::if{:value="data.isFine"}
I am fine.
#else
I am NOT fine and NOT happy.
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
</script>

<template>
  <main class="demo">
    <header>
      <h1>Live bindings and conditional content</h1>
      <p>Change the form values to update the Markdown preview instantly.</p>
    </header>

    <div class="playground">
      <form @submit.prevent>
        <h2>Try it</h2>
        <label for="name">Name</label>
        <input
          id="name"
          v-model="data.user.name"
          type="text"
        />

        <label for="role">Role</label>
        <select
          id="role"
          v-model="data.user.role"
        >
          <option value="admin">Admin</option>
          <option value="member">Member</option>
          <option value="guest">Guest</option>
        </select>

        <label for="age">Age: {{ data.user.age }}</label>
        <input
          id="age"
          v-model.number="data.user.age"
          type="range"
          min="0"
          max="100"
        />
        <p class="hint">Try ages 17, 18, 64, and 65 to test the comparison boundaries.</p>

        <fieldset>
          <legend>Mood</legend>
          <label class="checkbox">
            <input
              v-model="data.isHappy"
              type="checkbox"
            />
            I am happy
          </label>
          <label class="checkbox">
            <input
              v-model="data.isFine"
              type="checkbox"
            />
            I am fine
          </label>
          <p class="hint">Uncheck “I am happy” to see the nested check for “I am fine”.</p>
        </fieldset>
      </form>

      <section
        class="preview"
        :aria-label="showSource ? 'Markdown source' : 'Markdown preview'"
      >
        <div
          class="view-toggle"
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

        <div
          id="markdown-preview"
          v-show="!showSource"
        >
          <Suspense>
            <Markdown
              :value="markdown"
              :plugins="[binding()]"
              :components="{ Binding, If }"
              :data="data"
            />
          </Suspense>
        </div>
        <pre
          id="markdown-source"
          v-show="showSource"
        ><code>{{ markdown }}</code></pre>
      </section>
    </div>
  </main>
</template>

<style scoped>
.demo {
  max-width: 1100px;
  margin: 2rem auto;
  padding: 0 1rem;
  font-family: system-ui, sans-serif;
  line-height: 1.6;
  color: #1e293b;
}

.playground {
  display: grid;
  grid-template-columns: minmax(220px, 280px) minmax(0, 1fr);
  align-items: start;
  gap: 2rem;
  margin: 2rem 0;
}

form,
.preview {
  padding: 1.5rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.75rem;
}

form {
  background: #f8fafc;
}

form h2 {
  margin-top: 0;
}

label {
  display: block;
  margin-top: 1rem;
  font-weight: 600;
}

input[type='text'],
input[type='range'],
select {
  box-sizing: border-box;
  width: 100%;
  font: inherit;
}

input[type='text'],
select {
  padding: 0.5rem;
  border: 1px solid #94a3b8;
  border-radius: 0.25rem;
}

fieldset {
  margin: 1.5rem 0 0;
  padding: 0;
  border: 0;
}

.checkbox {
  font-weight: 400;
  margin-top: 0.5rem;
}

.hint {
  color: #475569;
  font-size: 0.875rem;
}

.preview {
  min-width: 0;
}

.view-toggle {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.view-toggle button {
  padding: 0.4rem 0.9rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.375rem;
  background: #fff;
  color: inherit;
  font: inherit;
  cursor: pointer;
}

.view-toggle button[aria-pressed='true'] {
  background: #1e293b;
  border-color: #1e293b;
  color: #fff;
}

pre {
  overflow-x: auto;
  padding: 1rem;
  background: #f8fafc;
}

@media (max-width: 700px) {
  .playground {
    grid-template-columns: 1fr;
  }
}
</style>
