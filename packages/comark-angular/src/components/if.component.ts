import type { NodeRenderContext, NodeRenderGroup } from 'comark'
import { resolveIfWrapper, selectIfBranch, shouldRenderIf } from 'comark/plugins/binding'
import { Component, ChangeDetectionStrategy } from '@angular/core'

/** Marker component for Angular's structural `::if` renderer. */
@Component({
  selector: 'comark-if',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
})
export class If {
  static __comarkRender({ props, children, renderData }: NodeRenderContext): NodeRenderGroup[] {
    const branch = selectIfBranch(children, shouldRenderIf(props))
    if (!branch) return []
    return [
      {
        key: 'branch',
        children: branch,
        renderData: Object.keys(props).length ? { ...renderData, props } : renderData,
        wrapper: resolveIfWrapper(props.as),
      },
    ]
  }
}
