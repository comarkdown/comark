import { createElement, type ReactNode } from 'react'
import { resolveIfWrapper, shouldRenderIf, type IfProps } from 'comark/plugins/binding'

export interface IfComponentProps extends IfProps {
  children?: ReactNode
}

/** Render children when the resolved condition or comparisons pass. */
export function If({ children, ...props }: IfComponentProps): ReactNode {
  if (!shouldRenderIf(props)) return null

  const wrapper = resolveIfWrapper(props.as)
  return wrapper ? createElement(wrapper, null, children) : children
}
