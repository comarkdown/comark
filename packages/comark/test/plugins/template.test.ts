import { describe, expect, it } from 'vitest'
import { compileExpression, evaluate } from '../../src/internal/template/expression'
import { createMarkdownParser, parseMarkdown } from '../../src/parse'
import { renderMarkdown } from '../../src/render'
import template, { resolveTemplates } from '../../src/plugins/template'
import binding from '../../src/plugins/binding'

describe('template documents', () => {
  it('restores outer loop aliases and does not leak locals', async () => {
    const document = await parseMarkdown(
      "{% for item in groups %}{{ item.length }}({% for item in item %}{{ item }}{% endfor %}){{ item.length }}{% endfor %}{{ item || 'outside' }}",
      { plugins: [template()] }
    )
    const output = resolveTemplates(document, { groups: [['a', 'b']] })
    expect((output.nodes[0] as unknown[]).slice(2).join('')).toBe('2(ab)2outside')
  })

  it('rejects conflicting interpolation plugins in either order', async () => {
    for (const plugins of [
      [template(), binding()],
      [binding(), template()],
    ]) {
      await expect(parseMarkdown('{{ name }}', { plugins })).rejects.toThrow('cannot be combined')
    }
  })
  it('round trips nested block and inline templates', async () => {
    const source =
      '{% for user in users %}\n\n{% if user.active %}\n\nHi **{{ user.name }}**\n\n{% else %}\n\nGuest\n\n{% endif %}\n\n{% endfor %}\n\nStatus: {% if active %}yes{% else %}no{% endif %}'
    const document = await parseMarkdown(source, { plugins: [template()] })
    const serialized = await renderMarkdown(document)
    const reparsed = await parseMarkdown(serialized, { plugins: [template()] })
    const data = { users: [{ name: 'Ada', active: true }], active: false }
    expect(resolveTemplates(reparsed, data).nodes).toEqual(resolveTemplates(document, data).nodes)
  })

  it('resolves loop variables in component props and keeps parent props in scope', async () => {
    const document = await parseMarkdown(
      '{% for user in users %}\n::card{:user="user"}\n{{ props.user.name }}\n::\n{% endfor %}',
      { plugins: [template()] }
    )
    const output = resolveTemplates(document, { users: [{ name: 'Ada' }] })
    expect(output.nodes).toEqual([['card', { user: { name: 'Ada' } }, 'Ada']])
  })

  it('keeps incomplete streamed branches inactive and renders once closed', async () => {
    const parse = createMarkdownParser({ plugins: [template()] })
    const source = '{% if active %}\nYes\n{% else %}\nNo\n{% endif %}'
    for (let length = 1; length <= source.length; length++) {
      const document = await parse(source.slice(0, length), { streaming: true })
      expect(() => resolveTemplates(document, { active: true })).not.toThrow()
    }
    expect(
      JSON.stringify(resolveTemplates(await parse(source, { streaming: true }), { active: true }).nodes)
    ).toContain('Yes')
  })

  it('enforces resource limits and rejects unsafe data', async () => {
    const document = await parseMarkdown('{% for item in items %}{{ item }}{% endfor %}', { plugins: [template()] })
    expect(() => resolveTemplates(document, { items: [1, 2] }, { maxIterations: 1 })).toThrow('iteration limit')
    expect(() => resolveTemplates(document, { items: ['large'] }, { maxOutputLength: 1 })).toThrow('output limit')
    expect(() => resolveTemplates(document, {}, { maxSteps: NaN })).toThrow('positive safe integers')
    expect(() => resolveTemplates(document, { items: [1, 2, 3, 4, 5] }, { maxSteps: 30 })).toThrow('evaluation limit')
    expect(() =>
      resolveTemplates(document, {
        get items() {
          throw new Error('executed')
        },
      })
    ).toThrow('Unsafe template data')
  })
  it('selects nested blocks and repeats filtered loops with local scopes', async () => {
    const document = await parseMarkdown(
      `{% for user in users.filter(user => user.active) %}
### {{ loop.index }}. {{ user.name }}
{% if user.admin %}
Admin
{% elif user.member %}
Member
{% else %}
Guest
{% endif %}
{% else %}
Empty
{% endfor %}`,
      { plugins: [template()] }
    )
    const output = resolveTemplates(document, {
      users: [
        { name: 'Ada', active: true, admin: true },
        { name: 'Bob', active: false },
        { name: 'Cal', active: true, member: true },
      ],
    })
    expect(JSON.stringify(output.nodes)).toContain('Ada')
    expect(JSON.stringify(output.nodes)).toContain('Member')
    expect(JSON.stringify(output.nodes)).not.toContain('Bob')
    expect(JSON.stringify(resolveTemplates(document, { users: [] }).nodes)).toContain('Empty')
    expect(document.meta.comarkTemplate).toBe(true)
  })

  it('handles inline conditionals, literal code, comments and trimmed expressions', async () => {
    const document = await parseMarkdown(
      'Hi {% if active %}**{{ name }}**{% else %}guest{% endif %}! {# hidden #}\n\n`{{ name }}`\n\n```jinja\n{% if x %}\n```\n\nA {{- name -}} B',
      { plugins: [template()] }
    )
    const output = JSON.stringify(resolveTemplates(document, { active: true, name: 'Ada' }).nodes)
    expect(output).toContain('strong')
    expect(output).not.toContain('guest')
    expect(output).not.toContain('hidden')
    expect(output).toContain('{{ name }}')
    expect(output).toContain('{% if x %}')
    expect(output).toContain('"A","Ada","B"')
  })

  it('rejects invalid nesting and incompatible plugins', async () => {
    for (const source of [
      '{% else %}',
      '{% if true %}\nmissing',
      '{% for x in xs %}\n{% endif %}',
      '{% if true %}\n{% else %}\n{% elif false %}\n{% endif %}',
    ]) {
      await expect(parseMarkdown(source, { plugins: [template()] })).rejects.toThrow()
    }
  })
})

const expression = (source: string, data: Record<string, unknown> = {}): unknown =>
  evaluate(compileExpression(source), data, { remaining: 10000 })

describe('template expressions', () => {
  it.each([
    ["' AbC '.trim().toLowerCase()", 'abc'],
    ["'abc'.startsWith('b', 1)", true],
    ["'abc'.endsWith('b', 2)", true],
    ["'abc'.includes('b')", true],
    ["'abc'.slice(1, -1)", 'b'],
    ["'abc'.at(-1)", 'c'],
    ['[1, 2, 3].slice(1).join()', '2,3'],
    ['[1, 2].includes(1, 1)', false],
    ['[1].map((value, index, array) => value + index + array.length).join()', '2'],
    ['[].every(value => false)', true],
    ['[].some(value => true)', false],
    ['[].find(value => true)', undefined],
    ["'\\u0041\\x42'", 'AB'],
    ['literal', 'value'],
    ['true ? false ? 1 : 2 : 3', 2],
    ['(null ?? false) || true', true],
    ['null == undefined', true],
    ['[1] == 1', false],
  ])('evaluates %s', (source, expected) => {
    expect(expression(String(source), { literal: 'value' })).toEqual(expected)
  })

  it('uses JavaScript operators, truthiness and lazy conditional expressions', () => {
    expect(expression("active ? 'yes' : 'no'", { active: true })).toBe('yes')
    expect(expression("active ? 'yes' : waiting ? 'maybe' : 'no'", { waiting: true })).toBe('maybe')
    expect(expression('false && missing.map(value => value)')).toBe(false)
    expect(expression('true || missing.map(value => value)')).toBe(true)
    expect(expression('!![] && !!{} && 2 + 3 * 4 === 14')).toBe(true)
    expect(expression("0 || 'fallback'")).toBe('fallback')
    expect(expression("0 ?? 'fallback'")).toBe(0)
    expect(expression('2 ** 3 ** 2')).toBe(512)
    expect(expression('-5 % 2')).toBe(-1)
    expect(expression('1 / 0')).toBe(Infinity)
    expect(expression("'2' === 2")).toBe(false)
    expect(expression("'2' == 2")).toBe(true)
  })

  it('supports dot methods, missing paths and Object helpers', () => {
    expect(expression('users[0].name.trim().toUpperCase()', { users: [{ name: ' Ada ' }] })).toBe('ADA')
    expect(expression("missing.name || 'Guest'")).toBe('Guest')
    expect(expression('missing === undefined')).toBe(true)
    expect(expression("roles.includes('admin')", { roles: ['admin'] })).toBe(true)
    expect(expression("['a', 'b'].join(', ')")).toBe('a, b')
    expect(expression('[10, 20][-1]')).toBeUndefined()
    expect(expression('[10, 20].at(-1)')).toBe(20)
    expect(expression('age > 1 && age < 65', { age: 30 })).toBe(true)
    expect(expression("Object.entries({name: 'Ada'})")).toEqual([['name', 'Ada']])
    expect(expression('Object.keys({first: 1})')).toEqual(['first'])
    expect(expression('Object.values({first: 1})')).toEqual([1])
    expect(expression("Object.hasOwn({first: null}, 'first')")).toBe(true)
    expect(expression('Array.isArray([])')).toBe(true)
  })

  it('chains array callbacks with lexical scopes, indexes and object results', () => {
    const data = {
      users: [
        { name: 'Ada', active: true },
        { name: 'Bob', active: false },
      ],
      prefix: 'Hi ',
    }
    expect(
      expression("users.filter(user => user.active).map((user, index) => prefix + user.name + index).join(', ')", data)
    ).toBe('Hi Ada0')
    expect(expression('users.map(user => ({name: user.name}))', data)).toEqual([{ name: 'Ada' }, { name: 'Bob' }])
    expect(expression('[[1, 2], [3]].map(item => item.map(item => item * 2))')).toEqual([[2, 4], [6]])
    expect(expression('[1, 2].some(item => item === 1 || missing.map(value => value))')).toBe(true)
    expect(expression('[1, 2].every(item => item === 0 && missing.map(value => value))')).toBe(false)
    expect(expression('users.find(user => user.active).name', data)).toBe('Ada')
    expect(() => evaluate(compileExpression('[1, 2, 3].map(item => item * 2)'), {}, { remaining: 4 })).toThrow(
      'evaluation limit'
    )
    expect(() => evaluate(compileExpression("'large' + 'text'"), {}, { remaining: 100, maxValueLength: 5 })).toThrow(
      'intermediate value limit'
    )
    expect(() =>
      evaluate(compileExpression("[1, 2, 3].join('abc')"), {}, { remaining: 100, maxValueLength: 5 })
    ).toThrow('intermediate value limit')
    expect(expression('[null, undefined, 1].join()')).toBe(',,1')
  })

  it('rejects old Jinja expressions, arbitrary calls, mutation and unsafe properties', () => {
    for (const source of [
      'true and false',
      'not true',
      "name | default('Guest')",
      "'yes' if true else 'no'",
      'user is defined',
      'user.items()',
      'range(3)',
      'user.name()',
      'user.constructor',
      "user['__proto__']",
      'users.push(1)',
      'users.map(user => { return user })',
      'users.map(user => user = 1)',
      'users.map(callback)',
      'Object.assign({}, user)',
      'globalThis.process.exit()',
      'true ?? false || true',
      '-2 ** 2',
    ]) {
      expect(() => expression(source, { user: {} })).toThrow()
    }
    expect(() =>
      expression('user.name', {
        user: {
          get name() {
            throw new Error('getter executed')
          },
        },
      })
    ).toThrow('Unsafe template data')
  })
})
