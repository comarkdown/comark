import type { NodeTransform, ElementNode, DirectiveNode } from '@vue/compiler-core'
import { extendViteConfig } from '@nuxt/kit'
import type { Resolver } from '@nuxt/kit'

export const registerComarkSlotTransformer = (resolver: Resolver) => {
  extendViteConfig((config) => {
    console.log(config)
    const compilerOptions = (config as any).vue.template.compilerOptions
    compilerOptions.nodeTransforms = [
      <NodeTransform> function viteComarkSlot(node: ElementNode, context) {
        const isVueSlotWithUnwrap = node.tag === 'slot' && node.props.find(p => p.name === 'comark-unwrap' || p.name === 'unwrap' || p.name === 'ComarkUnwrap' || (p.name === 'bind' && (p as DirectiveNode).rawName === ':comark-unwrap'))
        const isComarkSlot = node.tag === 'ComarkSlot'
console.log(isVueSlotWithUnwrap, isComarkSlot, node.props)
        if (isVueSlotWithUnwrap || isComarkSlot) {
          const transform = context.ssr
            ? context.nodeTransforms.find(nt => nt.name === 'ssrTransformSlotOutlet')
            : context.nodeTransforms.find(nt => nt.name === 'transformSlotOutlet')

          return () => {
            node.tag = 'slot'
            node.type = 1
            node.tagType = 2

            transform?.(node, context)

            const codegen = context.ssr ? (node as any).ssrCodegenNode : node.codegenNode
            codegen.callee = context.ssr ? '_ssrRenderComarkSlot' : '_renderComarkSlot'

            const importExp = context.ssr ? '{ ssrRenderSlot as _ssrRenderComarkSlot }' : '{ renderSlot as _renderComarkSlot }'
            if (!context.imports.some(i => String(i.exp) === importExp)) {
              context.imports.push({
                exp: importExp,
                path: resolver.resolve(`./runtime/utils/${context.ssr ? 'ssrSlot' : 'slot'}`),
              })
            }
          }
        }

        if (context.nodeTransforms[0]?.name !== 'viteComarkSlot') {
          const index = context.nodeTransforms.findIndex(f => f.name === 'viteComarkSlot')
          if (index !== -1) {
            const nt = context.nodeTransforms.splice(index, 1)
            context.nodeTransforms.unshift(nt[0]!)
          }
        }
      },
    ]
  })
}