import { defineComponent, h } from 'vue'
import { resolveIfWrapper, shouldRenderIf, type IfProps } from 'comark/plugins/binding'

/** Render the default slot when the resolved condition or comparisons pass. */
export const If = defineComponent({
  name: 'If',
  inheritAttrs: false,
  setup(_props, { attrs, slots }) {
    return () => {
      const props = attrs as IfProps
      if (!shouldRenderIf(props)) return null

      const children = slots.default?.()
      const wrapper = resolveIfWrapper(props.as)
      return wrapper ? h(wrapper, null, children) : children
    }
  },
})
