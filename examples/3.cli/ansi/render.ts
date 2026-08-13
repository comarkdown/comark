import { readFile } from 'node:fs/promises'
import { writeAnsi } from '@comark/ansi'
import shiki from '@comark/ansi/plugins/shiki'
import math, { Math } from '@comark/ansi/plugins/math'

const md = await readFile('source.md', 'utf-8')
await writeAnsi(md, {
  plugins: [shiki(), math()],
  components: { Math },
})
