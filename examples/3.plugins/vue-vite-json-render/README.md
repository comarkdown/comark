# JSON Render in Vue and Vite

This example expands `json-render` and `yaml-render` fenced code blocks into Vue component trees using `@comark/vue/plugins/json-render` and Nuxt UI.

## Features

- **Spec expansion**: parses `json-render` and `yaml-render` fences into Comark element nodes before rendering.
- **Root-and-elements format**: resolves named element maps starting from a `root` key and wires `children` arrays by key.
- **Single-element shorthand**: accepts a single `{ type, props }` object when a full tree map is unnecessary.
- **YAML syntax**: accepts the same component specs written in YAML inside `yaml-render` fences.

## Usage

1. Import the `json-render` plugin:
   ```ts
   import jsonRender from '@comark/vue/plugins/json-render'
   ```

2. Pass the plugin and your UI components to `<Markdown>`:
   ```vue
   <Markdown
     :value="content"
     :plugins="[jsonRender()]"
     :components="components"
   />
   ```

3. Write `json-render` or `yaml-render` code blocks in Markdown:
   ````markdown
   ```json-render
   {
     "type": "Text",
     "props": { "content": "Hello" }
   }
   ```

   ```yaml-render
   type: Text
   props:
     content: Hello
   ```
   ````

## Run locally

From the monorepo root:

```bash
pnpm dev:json-render
```

## Learn more

- [JSON Render plugin documentation](https://comark.dev/plugins/built-in/json-render)
- [JSON Render specification](https://json-render.dev/)
- [Comark documentation](https://comark.dev)
