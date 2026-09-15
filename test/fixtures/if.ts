export const nestedIfMarkdown = `::if{:value="data.isHappy"}
I am happy.
#else
:::if{:value="data.isFine"}
I am fine.
#else
I am NOT fine and NOT happy.
:::
::`

export const nestedIfCases = [
  { data: { isHappy: true, isFine: true }, expected: 'I am happy.' },
  { data: { isHappy: true, isFine: false }, expected: 'I am happy.' },
  { data: { isHappy: false, isFine: true }, expected: 'I am fine.' },
  { data: { isHappy: false, isFine: false }, expected: 'I am NOT fine and NOT happy.' },
]
