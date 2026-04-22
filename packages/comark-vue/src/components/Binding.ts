import { Text, computed, defineComponent, h } from 'vue'

export const Binding = defineComponent({
  name: 'Binding',
  props: {
    value: {
      type: [String, Number, Boolean, Object, Array],
      default: undefined,
    },
    defaultValue: {
      type: String,
      default: undefined,
    },
  },
  setup(props) {
    const rendered = computed(() => {
      if (props.value !== undefined && props.value !== null) {
        return typeof props.value === 'object' ? JSON.stringify(props.value) : String(props.value)
      }

      return props.defaultValue ?? ''
    })

    return () => h(Text, rendered.value)
  },
})
