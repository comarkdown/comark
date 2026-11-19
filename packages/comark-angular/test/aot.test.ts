import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { describe, expect, it } from 'vitest'

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const ngc = join(packageRoot, 'node_modules', '.bin', 'ngc')

function compile(project: string): { status: number; output: string } {
  try {
    const output = execFileSync(ngc, ['-p', join(packageRoot, 'test', 'fixtures', 'aot', project)], {
      cwd: packageRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    return { status: 0, output }
  } catch (error) {
    const failure = error as { status?: number; stdout?: string; stderr?: string }
    return {
      status: failure.status ?? 1,
      output: `${failure.stdout ?? ''}${failure.stderr ?? ''}`,
    }
  }
}

describe('Angular AOT compilation', () => {
  it('compiles a consumer that imports the static components and registers providers', () => {
    const { status, output } = compile('tsconfig.json')

    expect(output).toBe('')
    expect(status).toBe(0)
  })

  it('rejects a factory-created component class in imports', () => {
    const { status, output } = compile('tsconfig.factory.json')

    expect(status).not.toBe(0)
    expect(output).toContain('NG1010')
  })
})
