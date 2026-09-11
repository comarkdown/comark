import { defineComponent, h } from 'vue'
import { resolveIfWrapper, shouldRenderIf, type IfProps } from 'comark/plugins/binding'

/** Render the default or else slot according to the resolved props. */
export const If = defineComponent({
  name: 'If',
  inheritAttrs: false,
  setup(_props, { attrs, slots }) {
    return () => {
      const props = attrs as IfProps
      const matches = shouldRenderIf(props)
      if (!matches && !slots.else) return null
      const children = (matches ? slots.default : slots.else)?.()
      const wrapper = resolveIfWrapper(props.as)
      return wrapper ? h(wrapper, null, children) : children
    }
  },
})
