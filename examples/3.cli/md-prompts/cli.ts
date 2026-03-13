import { defineCommand, runMain } from 'citty'
import { readFile } from 'node:fs/promises'
import { parse } from 'comark'

const main = defineCommand({
  meta: {
    name: 'citty',
    version: '1.0.0',
    description: 'CLI prompts with Comark, Clack and Citty',
  },
  async setup() {
    const md = await readFile('cli.md', 'utf-8')
    const tree = await parse(md)
    console.log(tree)
  },
})

runMain(main)
