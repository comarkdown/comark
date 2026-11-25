import { Component } from '@angular/core'
import type { NodeTransform } from 'comark'
import emoji from 'comark/plugins/emoji'
import { defineMarkdownComponent, defineMarkdownDocumentComponent } from '../../../src/define.ts'

@Component({
  selector: 'app-config-alert',
  standalone: true,
  template: '<b class="config-alert"><ng-content /></b>',
})
export class ConfigAlert {}

@Component({
  selector: 'app-instance-alert',
  standalone: true,
  template: '<b class="instance-alert"><ng-content /></b>',
})
export class InstanceAlert {}

export const ConfiguredMarkdown = defineMarkdownComponent({
  plugins: [emoji()],
  components: { alert: ConfigAlert },
  class: 'factory-class',
})

const documentTransform: NodeTransform = ({ tag }) => (tag === 'p' ? { tag: 'section' } : undefined)

export const ConfiguredMarkdownDocument = defineMarkdownDocumentComponent({
  components: { alert: ConfigAlert },
  class: 'factory-document-class',
  transformNode: documentTransform,
})
