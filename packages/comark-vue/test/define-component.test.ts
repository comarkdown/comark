import { describe, expect, it } from 'vitest'
import { createSSRApp, defineComponent, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { parse } from 'comark'
import emoji from 'comark/plugins/emoji'
import { defineComarkComponent, defineComarkRendererComponent } from '../src/index'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function renderComponent(component: any, props: Record<string, any> = {}) {
  const app = createSSRApp({
    setup() {
      return () => h(component, props)
    },
  })
  return renderToString(app as any)
}

function makeAlert(className: string) {
  return defineComponent({
    name: `Alert_${className}`,
    setup(_props, { slots }) {
      return () => h('div', { class: className }, slots.default?.())
    },
  })
}

const AlertBase = makeAlert('alert-base')
const AlertChild = makeAlert('alert-child')
const AlertProp = makeAlert('alert-prop')

const CardBase = makeAlert('card-base')

// ---------------------------------------------------------------------------
// defineComarkComponent
// ---------------------------------------------------------------------------

describe('defineComarkComponent — component inheritance via extends', () => {
  it('child inherits parent components when none of its own are defined', async () => {
    const Base = defineComarkComponent({ name: 'Base', components: { alert: AlertBase } })
    const Child = defineComarkComponent({ name: 'Child', extends: Base })

    const html = await renderComponent(Child, { markdown: '::alert\nhello\n::' })

    expect(html).toContain('alert-base')
  })

  it('child components override the same tag from parent', async () => {
    const Base = defineComarkComponent({ name: 'Base', components: { alert: AlertBase } })
    const Child = defineComarkComponent({ name: 'Child', extends: Base, components: { alert: AlertChild } })

    const html = await renderComponent(Child, { markdown: '::alert\nhello\n::' })

    expect(html).toContain('alert-child')
    expect(html).not.toContain('alert-base')
  })

  it('child keeps parent components that it does not override', async () => {
    const Base = defineComarkComponent({ name: 'Base', components: { alert: AlertBase, card: CardBase } })
    const Child = defineComarkComponent({ name: 'Child', extends: Base, components: { alert: AlertChild } })

    const html = await renderComponent(Child, { markdown: '::alert\nA\n::\n\n::card\nB\n::' })

    expect(html).toContain('alert-child')
    expect(html).toContain('card-base')
  })

  it('prop-level components override child and parent config', async () => {
    const Base = defineComarkComponent({ name: 'Base', components: { alert: AlertBase } })
    const Child = defineComarkComponent({ name: 'Child', extends: Base, components: { alert: AlertChild } })

    const html = await renderComponent(Child, {
      markdown: '::alert\nhello\n::',
      components: { alert: AlertProp },
    })

    expect(html).toContain('alert-prop')
    expect(html).not.toContain('alert-child')
    expect(html).not.toContain('alert-base')
  })
})

describe('defineComarkComponent — plugin inheritance via extends', () => {
  it('child inherits parent plugins', async () => {
    const Base = defineComarkComponent({ name: 'Base', plugins: [emoji()] })
    const Child = defineComarkComponent({ name: 'Child', extends: Base })

    const html = await renderComponent(Child, { markdown: ':smile:' })

    expect(html).toContain('😄')
  })

  it('parent and child plugins both run', async () => {
    const Base = defineComarkComponent({ name: 'Base', plugins: [emoji()] })
    // Child adds its own emoji instance (idempotent — both emojis in the source resolve)
    const Child = defineComarkComponent({ name: 'Child', extends: Base })

    const html = await renderComponent(Child, { markdown: ':smile: :heart:' })

    expect(html).toContain('😄')
    expect(html).toContain('❤️')
  })

  it('prop plugins are appended after config plugins', async () => {
    const Base = defineComarkComponent({ name: 'Base', plugins: [emoji()] })
    const Child = defineComarkComponent({ name: 'Child', extends: Base })

    // Extra emoji() via prop — should not break anything
    const html = await renderComponent(Child, {
      markdown: ':smile:',
      plugins: [emoji()],
    })

    expect(html).toContain('😄')
  })

  it('multi-level extends stacks plugins correctly', async () => {
    const Base = defineComarkComponent({ name: 'Base', plugins: [emoji()] })
    const Middle = defineComarkComponent({ name: 'Middle', extends: Base })
    const Child = defineComarkComponent({ name: 'Child', extends: Middle })

    const html = await renderComponent(Child, { markdown: ':smile: :heart:' })

    expect(html).toContain('😄')
    expect(html).toContain('❤️')
  })
})

// ---------------------------------------------------------------------------
// defineComarkComponent — class
// ---------------------------------------------------------------------------

describe('defineComarkComponent — class via config', () => {
  it('applies config class to wrapper div', async () => {
    const Custom = defineComarkComponent({ name: 'WithClass', class: 'prose dark' })
    const html = await renderComponent(Custom, { markdown: 'hello' })
    expect(html).toContain('prose dark')
    expect(html).toContain('comark-content')
  })

  it('prop class works without config class', async () => {
    const Custom = defineComarkComponent({ name: 'NoConfigClass' })
    const html = await renderComponent(Custom, { markdown: 'hello' })
    expect(html).toContain('comark-content')
  })

  it('inherited component preserves parent class', async () => {
    const Base = defineComarkComponent({ name: 'Base', class: 'base-class' })
    const Child = defineComarkComponent({ name: 'Child', extends: Base, class: 'child-class' })
    const html = await renderComponent(Child, { markdown: 'hello' })
    expect(html).toContain('base-class')
    expect(html).toContain('child-class')
  })
})

// ---------------------------------------------------------------------------
// defineComarkRendererComponent
// ---------------------------------------------------------------------------

describe('defineComarkRendererComponent — component inheritance via extends', () => {
  it('renders with config components', async () => {
    const Renderer = defineComarkRendererComponent({
      name: 'TestRenderer',
      components: { alert: AlertBase },
    })
    const tree = await parse('::alert\nhello\n::')
    const html = await renderComponent(Renderer, { tree })

    expect(html).toContain('alert-base')
  })

  it('child inherits parent components when none of its own are defined', async () => {
    const Base = defineComarkRendererComponent({ name: 'BaseRenderer', components: { alert: AlertBase } })
    const Child = defineComarkRendererComponent({ name: 'ChildRenderer', extends: Base })

    const tree = await parse('::alert\nhello\n::')
    const html = await renderComponent(Child, { tree })

    expect(html).toContain('alert-base')
  })

  it('child components override the same tag from parent', async () => {
    const Base = defineComarkRendererComponent({ name: 'BaseRenderer', components: { alert: AlertBase } })
    const Child = defineComarkRendererComponent({
      name: 'ChildRenderer',
      extends: Base,
      components: { alert: AlertChild },
    })

    const tree = await parse('::alert\nhello\n::')
    const html = await renderComponent(Child, { tree })

    expect(html).toContain('alert-child')
    expect(html).not.toContain('alert-base')
  })

  it('child keeps parent components that it does not override', async () => {
    const Base = defineComarkRendererComponent({
      name: 'BaseRenderer',
      components: { alert: AlertBase, card: CardBase },
    })
    const Child = defineComarkRendererComponent({
      name: 'ChildRenderer',
      extends: Base,
      components: { alert: AlertChild },
    })

    const tree = await parse('::alert\nA\n::\n\n::card\nB\n::')
    const html = await renderComponent(Child, { tree })

    expect(html).toContain('alert-child')
    expect(html).toContain('card-base')
  })

  it('prop-level components override child and parent config', async () => {
    const Base = defineComarkRendererComponent({ name: 'BaseRenderer', components: { alert: AlertBase } })
    const Child = defineComarkRendererComponent({
      name: 'ChildRenderer',
      extends: Base,
      components: { alert: AlertChild },
    })

    const tree = await parse('::alert\nhello\n::')
    const html = await renderComponent(Child, { tree, components: { alert: AlertProp } })

    expect(html).toContain('alert-prop')
    expect(html).not.toContain('alert-child')
    expect(html).not.toContain('alert-base')
  })

  it('multi-level extends stacks component maps correctly', async () => {
    const Base = defineComarkRendererComponent({
      name: 'BaseRenderer',
      components: { alert: AlertBase, card: CardBase },
    })
    const Middle = defineComarkRendererComponent({
      name: 'MiddleRenderer',
      extends: Base,
      components: { alert: AlertChild },
    })
    const Child = defineComarkRendererComponent({ name: 'ChildRenderer', extends: Middle })

    const tree = await parse('::alert\nA\n::\n\n::card\nB\n::')
    const html = await renderComponent(Child, { tree })

    // alert overridden in Middle, card still from Base
    expect(html).toContain('alert-child')
    expect(html).toContain('card-base')
  })
})

// ---------------------------------------------------------------------------
// defineComarkRendererComponent — class
// ---------------------------------------------------------------------------

describe('defineComarkRendererComponent — class via config', () => {
  it('applies config class to wrapper div', async () => {
    const Renderer = defineComarkRendererComponent({ name: 'WithClass', class: 'prose dark' })
    const tree = await parse('hello')
    const html = await renderComponent(Renderer, { tree })
    expect(html).toContain('prose dark')
    expect(html).toContain('comark-content')
  })

  it('prop class works without config class', async () => {
    const Renderer = defineComarkRendererComponent({ name: 'NoConfigClass' })
    const tree = await parse('hello')
    const html = await renderComponent(Renderer, { tree })
    expect(html).toContain('comark-content')
  })

  it('inherited renderer preserves parent class', async () => {
    const Base = defineComarkRendererComponent({ name: 'BaseRenderer', class: 'base-class' })
    const Child = defineComarkRendererComponent({ name: 'ChildRenderer', extends: Base, class: 'child-class' })
    const tree = await parse('hello')
    const html = await renderComponent(Child, { tree })
    expect(html).toContain('base-class')
    expect(html).toContain('child-class')
  })
})
