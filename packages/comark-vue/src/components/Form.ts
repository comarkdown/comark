import { defineComponent, h, ref } from 'vue'

/**
 * `::form` aggregate component.
 *
 * Wraps its children in a `<form>` element.  On submit, collects native
 * `FormData` from the form and writes the aggregated field values to the
 * model path bound to `::value` via the auto-generated `onUpdate:value`
 * handler that the Comark renderer emits.
 *
 * @example
 * ```md
 * ::form{::value="data.contact"}
 *   :input{::value="data.name" name="name" type="text"}
 *   :input{::value="data.email" name="email" type="email"}
 *   :button{type="submit"} Submit ::
 * ::
 * ```
 */
export const Form = defineComponent({
  name: 'Form',
  props: {
    /** Current aggregated form value — supplied by the renderer from the model. */
    value: {
      type: Object,
      default: undefined,
    },
    /** @internal Comark renderer writes back via this when the form submits. */
    'onUpdate:value': {
      type: Function,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    const formRef = ref<HTMLFormElement | null>(null)

    return () =>
      h(
        'form',
        {
          ref: formRef,
          onSubmit: (e: Event) => {
            e.preventDefault()
            const formEl = formRef.value ?? (e.currentTarget as HTMLFormElement)
            const fd = new FormData(formEl)
            const aggregate = Object.fromEntries(fd.entries()) as Record<string, unknown>
            props['onUpdate:value']?.(aggregate)
          },
        },
        slots.default?.()
      )
  },
})
