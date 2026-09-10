import { renderHtml } from '@comark/html'
import binding, { Binding, If } from '@comark/html/plugins/binding'

const markdown = `
# Hello

::if{:condition="data.test" as="div"}
Shown when data.test is truthy.
::

::if{:value="data.user.name"}
Shown when the name is truthy.
::

::if{:value="data.age" :gte="18" :lt="65"}
Shown when age is at least 18 and below 65.
::

::if{:value="data.user.role" neq="guest"}
Shown when the role is defined and not "guest".
::

::if{:value="data.enabled" :eq="false"}
Shown when enabled is exactly false.
::

::if{:condition="data.test" :value="data.score" :gte="80"}
Shown when test is truthy and score is at least 80.
::

::if{:value="data.isHappy"}
I am happy.
#else
:::if{:value="data.isFine"}
I am fine.
#else
I am NOT fine and NOT happy.
:::
::
`

const html = await renderHtml(markdown, {
  plugins: [binding()],
  components: {
    Binding,
    If,
  },
  data: {
    test: true,
    isHappy: false,
    isFine: true,
  },
})

console.log(html)
