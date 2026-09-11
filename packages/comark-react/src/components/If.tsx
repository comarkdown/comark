import { createElement, type ReactNode } from 'react'
import { resolveIfWrapper, shouldRenderIf, type IfProps } from 'comark/plugins/binding'

export interface IfComponentProps extends IfProps {
  children?: ReactNode
  slotElse?: ReactNode
}

/** Render the default or else slot according to the resolved props. */
export function If({ children, slotElse, ...props }: IfComponentProps): ReactNode {
  const matches = shouldRenderIf(props)
  if (!matches && slotElse === undefined) return null
  const branch = matches ? children : slotElse

  const wrapper = resolveIfWrapper(props.as)
  return wrapper ? createElement(wrapper, null, branch) : branch
}
