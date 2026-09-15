export interface Expression {
  kind: string
  value?: unknown
  args: Expression[]
}

interface Token {
  value: string
  literal?: unknown
}

export interface Budget {
  remaining: number
  maxValueLength?: number
}

export function spend(budget: Budget, amount = 1): void {
  budget.remaining -= amount
  if (budget.remaining < 0) throw new Error('Template evaluation limit exceeded')
}

export function truthy(value: unknown): boolean {
  return Boolean(value)
}

function safeKey(key: unknown): string | number {
  if (typeof key !== 'string' && typeof key !== 'number') throw new Error('Invalid template property')
  if (['__proto__', 'prototype', 'constructor'].includes(String(key))) throw new Error('Forbidden template property')
  return key
}

export function property(value: unknown, key: unknown): unknown {
  const name = safeKey(key)
  if (value == null) return undefined
  const descriptor = Object.getOwnPropertyDescriptor(Object(value), name)
  if (!descriptor) return undefined
  if (!('value' in descriptor) || typeof descriptor.value === 'function') throw new Error('Unsafe template data')
  return descriptor.value
}

const callbacks = new Set(['filter', 'map', 'some', 'every', 'find'])
const methods = new Set([
  ...callbacks,
  'join',
  'includes',
  'slice',
  'at',
  'trim',
  'toUpperCase',
  'toLowerCase',
  'startsWith',
  'endsWith',
])
const objectMethods = new Set(['keys', 'values', 'entries', 'hasOwn'])
const precedence: Record<string, number> = {
  '??': 1,
  '||': 1,
  '&&': 2,
  '==': 3,
  '!=': 3,
  '===': 3,
  '!==': 3,
  '<': 4,
  '>': 4,
  '<=': 4,
  '>=': 4,
  '+': 5,
  '-': 5,
  '*': 6,
  '/': 6,
  '%': 6,
  '**': 7,
}

function tokenize(source: string): Token[] {
  if (source.length > 16384) throw new Error('Template expression is too long')
  const tokens: Token[] = []
  let position = 0
  while (position < source.length) {
    const char = source[position]
    if (/\s/.test(char)) {
      position++
      continue
    }
    if (char === '"' || char === "'") {
      const quote = char
      let text = ''
      position++
      while (position < source.length && source[position] !== quote) {
        const next = source[position++]
        if (next === '\n' || next === '\r') throw new SyntaxError('Newline in template string')
        if (next !== '\\') {
          text += next
          continue
        }
        const escaped = source[position++]
        if (escaped === undefined) throw new SyntaxError('Unclosed template string')
        if (escaped === 'u' || escaped === 'x') {
          const count = escaped === 'u' ? 4 : 2
          const digits = source.slice(position, position + count)
          if (digits.length !== count || !/^[\da-f]+$/i.test(digits))
            throw new SyntaxError('Invalid template string escape')
          text += String.fromCharCode(Number.parseInt(digits, 16))
          position += count
          continue
        }
        if (/\d/.test(escaped)) throw new SyntaxError('Numeric string escapes are unsupported')
        text += ({ n: '\n', r: '\r', t: '\t', b: '\b', f: '\f', v: '\v' } as Record<string, string>)[escaped] ?? escaped
      }
      if (source[position++] !== quote) throw new SyntaxError('Unclosed template string')
      tokens.push({ value: 'literal', literal: text })
      continue
    }
    const number = source.slice(position).match(/^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/)
    if (number) {
      tokens.push({ value: 'literal', literal: Number(number[0]) })
      position += number[0].length
      continue
    }
    const identifier = source.slice(position).match(/^[A-Za-z_$][A-Za-z_$0-9]*/)
    if (identifier) {
      tokens.push({ value: identifier[0] })
      position += identifier[0].length
      continue
    }
    const triple = source.slice(position, position + 3)
    const pair = source.slice(position, position + 2)
    const operator = ['===', '!=='].includes(triple)
      ? triple
      : ['==', '!=', '<=', '>=', '**', '&&', '||', '??', '=>'].includes(pair)
        ? pair
        : char
    if (operator.length === 1 && !'()+-*/%<>,.[]:{}!?'.includes(char))
      throw new SyntaxError(`Unexpected template character: ${char}`)
    tokens.push({ value: operator })
    position += operator.length
  }
  if (tokens.length > 2048) throw new Error('Too many template expression tokens')
  tokens.push({ value: 'EOF' })
  return tokens
}

function identifier(name: string): boolean {
  return (
    /^[A-Za-z_$][\w$]*$/.test(name) &&
    ![
      'EOF',
      'true',
      'false',
      'null',
      'undefined',
      'if',
      'else',
      'return',
      'new',
      'this',
      'function',
      'delete',
      'typeof',
      'void',
      'instanceof',
      'in',
      'await',
      'class',
    ].includes(name)
  )
}

class Parser {
  private tokens: Token[]
  private position = 0
  private depth = 0

  constructor(source: string) {
    this.tokens = tokenize(source)
  }
  peek(): string {
    return this.tokens[this.position]?.value ?? 'EOF'
  }
  take(): Token {
    const token = this.tokens[this.position++]
    if (!token) throw new SyntaxError('Unexpected end of template expression')
    return token
  }
  accept(value: string): boolean {
    if (this.peek() !== value) return false
    this.take()
    return true
  }
  expect(value: string): void {
    if (!this.accept(value)) throw new SyntaxError(`Expected ${value}, got ${this.peek()}`)
  }

  expression(minimum = 0): Expression {
    if (++this.depth > 64) throw new Error('Template expression nesting limit exceeded')
    let left = this.primary()
    while (Object.hasOwn(precedence, this.peek()) && precedence[this.peek()] >= minimum) {
      const operator = this.take().value
      if (operator === '**' && left.kind === 'unary') throw new SyntaxError('Parenthesize unary expressions before **')
      const right = this.expression(precedence[operator] + (operator === '**' ? 0 : 1))
      const mixed = (child: Expression): boolean =>
        child.kind === 'binary' &&
        (operator === '??'
          ? ['&&', '||'].includes(String(child.value))
          : ['&&', '||'].includes(operator) && child.value === '??')
      if (mixed(left) || mixed(right)) throw new SyntaxError('Parenthesize mixed ?? and logical operators')
      left = { kind: 'binary', value: operator, args: [left, right] }
    }
    if (minimum === 0 && this.accept('?')) {
      const consequent = this.expression()
      this.expect(':')
      left = { kind: 'conditional', args: [left, consequent, this.expression()] }
    }
    this.depth--
    return left
  }

  primary(): Expression {
    const token = this.take()
    let result: Expression
    if (['!', '+', '-'].includes(token.value)) {
      return { kind: 'unary', value: token.value, args: [this.expression(8)] }
    }
    if (Object.hasOwn(token, 'literal')) result = { kind: 'literal', value: token.literal, args: [] }
    else if (token.value === '(') {
      result = { kind: 'group', args: [this.expression()] }
      this.expect(')')
    } else if (token.value === '[') result = { kind: 'list', args: this.arguments(']') }
    else if (token.value === '{') {
      const entries: Expression[] = []
      while (!this.accept('}')) {
        const key = this.take()
        if (!Object.hasOwn(key, 'literal') && !identifier(key.value))
          throw new SyntaxError('Expected object literal key')
        const name = Object.hasOwn(key, 'literal') ? key.literal : key.value
        safeKey(name)
        entries.push({ kind: 'literal', value: name, args: [] })
        this.expect(':')
        entries.push(this.expression())
        if (this.peek() !== '}') this.expect(',')
      }
      result = { kind: 'mapping', args: entries }
    } else if (['true', 'false', 'null', 'undefined'].includes(token.value)) {
      result = {
        kind: 'literal',
        value: token.value === 'undefined' ? undefined : token.value === 'null' ? null : token.value === 'true',
        args: [],
      }
    } else if (identifier(token.value)) result = { kind: 'name', value: token.value, args: [] }
    else throw new SyntaxError(`Unexpected template token: ${token.value}`)

    while (true) {
      if (this.accept('.')) {
        const key = this.take().value
        if (!/^[A-Za-z_$][\w$]*$/.test(key)) throw new SyntaxError('Expected property name')
        safeKey(key)
        result = { kind: 'property', args: [result, { kind: 'literal', value: key, args: [] }] }
      } else if (this.accept('[')) {
        result = { kind: 'property', args: [result, this.expression()] }
        this.expect(']')
      } else if (this.accept('(')) {
        if (result.kind !== 'property' || result.args[1].kind !== 'literal')
          throw new SyntaxError('Only allowlisted method calls are supported')
        const receiver = result.args[0]
        const method = String(result.args[1].value)
        const namespace = receiver.kind === 'name' ? receiver.value : undefined
        if (namespace === 'Object' || namespace === 'Array') {
          if (!(namespace === 'Object' ? objectMethods.has(method) : method === 'isArray'))
            throw new SyntaxError(`Unsupported ${namespace} method: ${method}`)
          result = { kind: 'static', value: `${namespace}.${method}`, args: this.arguments(')') }
        } else {
          if (!methods.has(method)) throw new SyntaxError(`Unsupported template method: ${method}`)
          if (callbacks.has(method)) {
            const callback = this.callback()
            this.expect(')')
            result = { kind: 'method', value: method, args: [receiver, callback] }
          } else result = { kind: 'method', value: method, args: [receiver, ...this.arguments(')')] }
        }
      } else break
    }
    return result
  }

  callback(): Expression {
    const names: string[] = []
    if (this.accept('(')) {
      do {
        names.push(this.take().value)
      } while (this.accept(','))
      this.expect(')')
    } else names.push(this.take().value)
    if (
      names.length > 3 ||
      new Set(names).size !== names.length ||
      names.some(
        (name) => !identifier(name) || ['Object', 'Array', '__proto__', 'constructor', 'prototype'].includes(name)
      )
    )
      throw new SyntaxError('Invalid template callback parameters')
    this.expect('=>')
    if (this.peek() === '{') throw new SyntaxError('Callback bodies must be expressions; parenthesize object literals')
    return { kind: 'callback', value: names, args: [this.expression()] }
  }

  arguments(end: string): Expression[] {
    const args: Expression[] = []
    while (!this.accept(end)) {
      args.push(this.expression())
      if (this.peek() !== end) this.expect(',')
    }
    return args
  }
}

export function compileExpression(source: string): Expression {
  const parser = new Parser(source)
  const expression = parser.expression()
  parser.expect('EOF')
  return expression
}

export function compileIterable(source: string): { iterable: Expression } {
  return { iterable: compileExpression(source) }
}

function bounded(value: unknown, budget: Budget): unknown {
  if (typeof value === 'string' || Array.isArray(value)) {
    if (value.length > (budget.maxValueLength ?? 1000000)) throw new Error('Template intermediate value limit exceeded')
  }
  return value
}

function primitive(value: unknown): string | number | boolean | null | undefined {
  if (value !== null && !['string', 'number', 'boolean', 'undefined'].includes(typeof value))
    throw new Error('Template coercion requires primitive values')
  return value as string | number | boolean | null | undefined
}

function callMethod(method: string, receiver: unknown, args: unknown[], budget: Budget): unknown {
  bounded(receiver, budget)
  spend(budget, typeof receiver === 'string' || Array.isArray(receiver) ? receiver.length : 1)
  const [first, second] = args
  const numeric = (value: unknown): number | undefined => (value === undefined ? undefined : Number(primitive(value)))
  if (Array.isArray(receiver)) {
    switch (method) {
      case 'join': {
        const separator = first === undefined ? ',' : String(primitive(first))
        let length = Math.max(0, receiver.length - 1) * separator.length
        const limit = budget.maxValueLength ?? 1000000
        if (length > limit) throw new Error('Template intermediate value limit exceeded')
        const values: string[] = []
        for (let index = 0; index < receiver.length; index++) {
          const value = primitive(property(receiver, index))
          const text = value == null ? '' : String(value)
          length += text.length
          if (length > limit) throw new Error('Template intermediate value limit exceeded')
          values.push(text)
        }
        return values.join(separator)
      }
      case 'includes':
        return receiver.includes(first, numeric(second))
      case 'slice':
        return bounded(receiver.slice(numeric(first), numeric(second)), budget)
      case 'at':
        return receiver.at(numeric(first) ?? 0)
    }
  }
  if (typeof receiver === 'string') {
    const text = (): string => String(primitive(first))
    switch (method) {
      case 'trim':
        return receiver.trim()
      case 'toUpperCase':
        return bounded(receiver.toUpperCase(), budget)
      case 'toLowerCase':
        return receiver.toLowerCase()
      case 'includes':
        return receiver.includes(text(), numeric(second))
      case 'startsWith':
        return receiver.startsWith(text(), numeric(second))
      case 'endsWith':
        return receiver.endsWith(text(), numeric(second))
      case 'slice':
        return receiver.slice(numeric(first), numeric(second))
      case 'at':
        return receiver.at(numeric(first) ?? 0)
    }
  }
  throw new Error(`Unsupported receiver for template method ${method}`)
}

export function evaluate(expression: Expression, scope: Record<string, unknown>, budget: Budget): unknown {
  spend(budget)
  const run = (child: Expression): unknown => evaluate(child, scope, budget)
  const [first, second, third] = expression.args
  if (expression.kind === 'literal') return bounded(expression.value, budget)
  if (expression.kind === 'group') return run(first)
  if (expression.kind === 'name') return property(scope, expression.value)
  if (expression.kind === 'list') return bounded(expression.args.map(run), budget)
  if (expression.kind === 'mapping') {
    const mapping = Object.create(null) as Record<string, unknown>
    for (let index = 0; index < expression.args.length; index += 2)
      mapping[String(safeKey(run(expression.args[index])))] = run(expression.args[index + 1])
    return mapping
  }
  if (expression.kind === 'property') {
    const receiver = run(first)
    return receiver == null ? undefined : property(receiver, run(second))
  }
  if (expression.kind === 'conditional') return run(truthy(run(first)) ? second : third)
  if (expression.kind === 'unary') {
    const value = run(first)
    if (expression.value === '!') return !value
    return expression.value === '-' ? -Number(primitive(value)) : Number(primitive(value))
  }
  if (expression.kind === 'static') {
    const args = expression.args.map(run)
    if (expression.value === 'Array.isArray') return Array.isArray(args[0])
    if (args[0] == null) throw new Error('Object methods require a non-null value')
    if (expression.value === 'Object.hasOwn') return Object.hasOwn(Object(args[0]), safeKey(args[1]))
    const keys = Object.keys(Object(args[0]))
    spend(budget, keys.length)
    if (expression.value === 'Object.keys') return bounded(keys, budget)
    return bounded(
      keys.map((key) =>
        expression.value === 'Object.entries' ? [key, property(args[0], key)] : property(args[0], key)
      ),
      budget
    )
  }
  if (expression.kind === 'method') {
    const receiver = bounded(run(first), budget)
    const method = String(expression.value)
    if (!callbacks.has(method)) return callMethod(method, receiver, expression.args.slice(1).map(run), budget)
    if (!Array.isArray(receiver)) throw new Error(`${method} requires an array`)
    const names = second.value as string[]
    const result: unknown[] = []
    for (let index = 0; index < receiver.length; index++) {
      spend(budget, Object.keys(scope).length + 1)
      if (method !== 'find' && !Object.hasOwn(receiver, index)) continue
      const locals = Object.assign(Object.create(null), scope) as Record<string, unknown>
      const value = property(receiver, index)
      const parameters = [value, index, receiver]
      names.forEach((name, parameter) => {
        locals[name] = parameters[parameter]
      })
      const mapped = evaluate(second.args[0], locals, budget)
      if (method === 'some' && mapped) return true
      if (method === 'every' && !mapped) return false
      if (method === 'find' && mapped) return value
      if (method === 'map') result[index] = mapped
      if (method === 'filter' && mapped) result.push(value)
      bounded(result, budget)
    }
    if (method === 'some') return false
    if (method === 'every') return true
    if (method === 'find') return undefined
    if (method === 'map') result.length = receiver.length
    return bounded(result, budget)
  }
  if (expression.kind !== 'binary') throw new Error('Invalid template expression')
  const left = run(first)
  if (expression.value === '&&') return left ? run(second) : left
  if (expression.value === '||') return left ? left : run(second)
  if (expression.value === '??') return left == null ? run(second) : left
  const right = run(second)
  if (expression.value === '===') return left === right
  if (expression.value === '!==') return left !== right
  if (expression.value === '==' || expression.value === '!=') {
    const equals =
      left === right ||
      (left == null && right == null) ||
      (typeof left !== 'object' && typeof right !== 'object' && primitive(left) == primitive(right))
    return expression.value === '==' ? equals : !equals
  }
  const leftValue = primitive(left)
  const rightValue = primitive(right)
  switch (expression.value) {
    case '+':
      return bounded(
        typeof leftValue === 'string' || typeof rightValue === 'string'
          ? String(leftValue) + String(rightValue)
          : Number(leftValue) + Number(rightValue),
        budget
      )
    case '-':
      return Number(leftValue) - Number(rightValue)
    case '*':
      return Number(leftValue) * Number(rightValue)
    case '/':
      return Number(leftValue) / Number(rightValue)
    case '%':
      return Number(leftValue) % Number(rightValue)
    case '**':
      return Number(leftValue) ** Number(rightValue)
  }
  const compareLeft = typeof leftValue === 'string' && typeof rightValue === 'string' ? leftValue : Number(leftValue)
  const compareRight = typeof leftValue === 'string' && typeof rightValue === 'string' ? rightValue : Number(rightValue)
  switch (expression.value) {
    case '<':
      return compareLeft < compareRight
    case '>':
      return compareLeft > compareRight
    case '<=':
      return compareLeft <= compareRight
    case '>=':
      return compareLeft >= compareRight
    default:
      throw new Error('Unsupported template operator')
  }
}
