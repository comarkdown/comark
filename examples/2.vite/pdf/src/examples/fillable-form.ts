import {
  Checkbox as JasyCheckbox,
  Column,
  Dropdown as JasyDropdown,
  ListBox as JasyListBox,
  PushButton as JasyPushButton,
  RadioGroup as JasyRadioGroup,
  SignatureField as JasySignatureField,
  Text,
  TextField as JasyTextField,
} from '@jasy/pdf'
import type { ElementNode } from 'comark'
import type { JasyComponentFn } from '@comark/pdf'

const muted = '#6b7280'
const boxed = { border: '#aab3c2', background: '#fbfcfe' } as const

const num = (value: unknown, fallback: number): number => {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

const labelOf = (attrs: ElementNode[1]): string => String(attrs.label ?? '')

const withLabel = (label: string, control: unknown) =>
  label
    ? Column({ gap: 4 }, [Text(label, { size: 8, color: muted }), control as never])
    : (control as never)

const parseOptions = (raw: unknown): Array<string | { value: string; label: string }> => {
  const text = String(raw ?? '').trim()
  if (!text) return []
  return text.split('|').map((part) => {
    const sep = part.indexOf(':')
    if (sep === -1) return part.trim()
    return {
      value: part.slice(0, sep).trim(),
      label: part.slice(sep + 1).trim(),
    }
  })
}

/** Attrs → jasy TextField. Label/copy stay in markdown. */
export const TextField: JasyComponentFn = ([, attrs]) =>
  withLabel(
    labelOf(attrs),
    JasyTextField({
      name: String(attrs.name ?? 'field'),
      width: num(attrs.width, 334),
      height: num(attrs.height, attrs.multiline ? 56 : 22),
      multiline: attrs.multiline === true || attrs.multiline === 'true',
      maxLength: attrs.maxLength !== undefined ? num(attrs.maxLength, 500) : undefined,
      ...boxed,
    }),
  )

export const Dropdown: JasyComponentFn = ([, attrs]) =>
  withLabel(
    labelOf(attrs),
    JasyDropdown(
      {
        name: String(attrs.name ?? 'dropdown'),
        width: num(attrs.width, 110),
        height: num(attrs.height, 22),
        fontSize: 10,
        ...boxed,
      },
      parseOptions(attrs.options).map((o) => (typeof o === 'string' ? o : o.value)),
    ),
  )

export const RadioGroup: JasyComponentFn = ([, attrs]) =>
  Column({ gap: 6 }, [
    ...(labelOf(attrs) ? [Text(labelOf(attrs), { size: 8, color: muted })] : []),
    JasyRadioGroup(
      { name: String(attrs.name ?? 'plan'), gap: 6, labelSize: 10 },
      parseOptions(attrs.options).map((o) =>
        typeof o === 'string' ? { value: o, label: o } : o,
      ),
    ),
  ])

export const ListBox: JasyComponentFn = ([, attrs]) =>
  withLabel(
    labelOf(attrs),
    JasyListBox(
      {
        name: String(attrs.name ?? 'list'),
        width: num(attrs.width, 150),
        height: num(attrs.height, 60),
        fontSize: 10,
        ...boxed,
      },
      parseOptions(attrs.options).map((o) => (typeof o === 'string' ? o : o.label || o.value)),
    ),
  )

export const Checkbox: JasyComponentFn = ([, attrs]) =>
  JasyCheckbox({
    name: String(attrs.name ?? 'checkbox'),
    label: labelOf(attrs) || undefined,
    labelSize: 10,
  })

export const SignatureField: JasyComponentFn = ([, attrs]) =>
  withLabel(
    labelOf(attrs),
    JasySignatureField({
      name: String(attrs.name ?? 'signature'),
      width: num(attrs.width, 210),
      height: num(attrs.height, 46),
      ...boxed,
    }),
  )

export const PushButton: JasyComponentFn = ([, attrs]) =>
  JasyPushButton({
    name: String(attrs.name ?? 'button'),
    label: labelOf(attrs) || 'Button',
    action: (String(attrs.action ?? 'reset') as 'reset'),
    width: num(attrs.width, 92),
    height: num(attrs.height, 26),
  })

/**
 * Fillable form — headings and copy are markdown; only AcroForm widgets are thin bridges
 * (markdown has no native text-field / checkbox syntax).
 */
export const fillableFormMarkdown = `---
title: Fillable form
pdf:
  format: A4
  margin: 18mm
  gap: 14
  fontSize: 10
  color: "#0a2348"
---

# Membership application

Fill this in on screen — no printer involved.

---

::text-field{name="fullName" label="Full name" width="334"}
::

::text-field{name="born" label="Date of birth" width="334"}
::

::text-field{name="email" label="Email" width="334"}
::

::dropdown{name="country" label="Country" width="334" options="DE|AT|CH"}
::

::text-field{name="notes" label="Anything we should know?" width="334" height="56" multiline="true" maxLength="500"}
::

::radio-group{name="plan" label="Membership" options="basic:Basic - 4 EUR a month|pro:Pro - 9 EUR a month|team:Team - 29 EUR a month"}
::

::list-box{name="topics" label="Interests" width="334" height="60" options="Invoicing|Reports|Typography|Accessibility"}
::

::checkbox{name="agree" label="I have read the statutes"}
::

::checkbox{name="newsletter" label="Send me the monthly letter"}
::

---

::signature-field{name="signature" label="Signature" width="334" height="46"}
::

::push-button{name="clear" label="Reset form" action="reset"}
::

---

**And it reads them back**

\`@jasy/pdf/edit\` opens a form somebody else made, reports its fields, fills them from a plain object and can flatten the result.
`
