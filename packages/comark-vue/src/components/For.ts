import { defineComponent, type PropType, type VNodeChild } from 'vue'

/** Structural component whose children are evaluated only when rendered. */
export const For = Object.assign(
  defineComponent({
    name: 'For',
    inheritAttrs: false,
    props: { __render: { type: Function as PropType<() => VNodeChild>, required: true } },
    setup(props) {
      return () => props.__render()
    },
  }),
  { __comarkFor: true }
)
