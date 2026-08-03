import { defineCommand, runMain } from 'citty'
import { readFile } from 'node:fs/promises'
import { parseMarkdown } from 'comark'

const main = defineCommand({
  meta: {
    name: 'citty',
    version: '1.0.0',
    description: 'CLI prompts with Comark, Clack and Citty',
  },
  async setup() {
    const md = await readFile('cli.md', 'utf-8')
    const tree = await parseMarkdown(md)
    console.log(tree)
  },
})

runMain(main)
