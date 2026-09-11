import type { ReactNode } from 'react'

/** Structural component whose children are evaluated only when rendered. */
export const For = Object.assign(({ __render }: { __render: () => ReactNode }): ReactNode => __render(), {
  __comarkFor: true,
})
