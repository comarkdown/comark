export const templateCases = [
  {
    source: '{% for index in [0, 1, 2] %}{{ index }}{% endfor %}',
    data: {},
    expected: '012',
  },
  {
    source: '{% if user.admin %}Admin{% elif user.member %}Member{% else %}Guest{% endif %}',
    data: { user: { member: true } },
    expected: 'Member',
  },
  {
    source: "{{ online ? 'Online' : 'Offline' }}",
    data: { online: false },
    expected: 'Offline',
  },
  {
    source:
      '{% for user in users.filter(user => user.active) %}{{ loop.index }}:{{ user.name }};{% else %}Empty{% endfor %}',
    data: {
      users: [
        { name: 'Ada', active: true },
        { name: 'Bob', active: false },
        { name: 'Cal', active: true },
      ],
    },
    expected: '1:Ada;2:Cal;',
  },
  {
    source: '{% for user in users.filter(user => user.active) %}{{ user.name }}{% else %}Empty{% endfor %}',
    data: { users: [{ name: 'Bob', active: false }] },
    expected: 'Empty',
  },
  {
    source:
      '{% for group in groups %}\n{% for item in group.items %}\n{% if item.visible %}\n{{ group.name }}:{{ item.name }}\n{% endif %}\n{% endfor %}\n{% endfor %}',
    data: {
      groups: [
        {
          name: 'A',
          items: [
            { name: 'one', visible: true },
            { name: 'hidden', visible: false },
          ],
        },
        { name: 'B', items: [{ name: 'two', visible: true }] },
      ],
    },
    expected: 'A:one B:two',
  },
  {
    source: '{% for key, value in Object.entries(settings) %}{{ key }}={{ value }};{% endfor %}',
    data: { settings: { first: 1, second: 2 } },
    expected: 'first=1;second=2;',
  },
  {
    source:
      "{{ users.filter(user => user.active).map((user, index) => index + ':' + user.name.toUpperCase()).join(';') }}",
    data: {
      users: [
        { name: 'Ada', active: true },
        { name: 'Bob', active: false },
        { name: 'Cal', active: true },
      ],
    },
    expected: '0:ADA;1:CAL',
  },
  {
    source:
      "{{ count ?? 10 }} {{ name || 'Guest' }} {{ active && roles.includes('admin') ? 'Admin' : 'Member' }} {{ !![] }}",
    data: { count: 0, name: '', active: true, roles: ['admin'] },
    expected: '0 Guest Admin true',
  },
  {
    source: "{{ Object.keys(settings).join(',') }} {{ Object.values(settings).map(value => value * 2).join(',') }}",
    data: { settings: { first: 1, second: 2 } },
    expected: 'first,second 2,4',
  },
]

export function visibleTemplateText(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\/p>/g, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}
