import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

export default defineEventHandler(() => {
  const filePath = join(process.cwd(), 'docs', 'public', 'benchmarks.json')

  if (existsSync(filePath)) {
    return JSON.parse(readFileSync(filePath, 'utf-8'))
  }

  throw createError({
    statusCode: 404,
    statusMessage: 'Benchmarks data not found. run: `node scripts/bench.mjs`',
  })
})
