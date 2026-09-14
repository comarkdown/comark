import {
  Box,
  Checkbox,
  Column,
  Divider,
  Dropdown,
  ListBox,
  PushButton,
  RadioGroup,
  Row,
  SignatureField,
  Spacer,
  Text,
  TextField,
} from '@jasy/pdf'
import type { JasyComponentFn } from '@comark/pdf'

const ink = '#0a2348'
const muted = '#6b7280'
const hair = '#dfe4ee'
const boxed = { border: '#aab3c2', background: '#fbfcfe' } as const

const field = (label: string, control: unknown) =>
  Column({ gap: 4 }, [Text(label, { size: 8, color: muted }), control as never])

/** AcroForm membership application adapted from https://jasy.dev/showroom */
export const FillableForm: JasyComponentFn = () =>
  Column({ gap: 16 }, [
    Row({ align: 'center' }, [
      Column({ gap: 2 }, [
        Text('Membership application', { size: 20, bold: true, color: ink }),
        Text('Fill this in on screen - no printer involved', { size: 9, color: muted }),
      ]),
      Spacer(),
      Text('F-2026-11', { size: 9, color: muted }),
    ]),

    Divider({ color: hair }),

    Row({ gap: 14 }, [
      field('Full name', TextField({ name: 'fullName', width: 210, height: 22, ...boxed })),
      field('Date of birth', TextField({ name: 'born', width: 110, height: 22, ...boxed })),
    ]),

    Row({ gap: 14 }, [
      field('Email', TextField({ name: 'email', width: 210, height: 22, ...boxed })),
      field(
        'Country',
        Dropdown({ name: 'country', width: 110, height: 22, fontSize: 10, ...boxed }, [
          'DE',
          'AT',
          'CH',
        ]),
      ),
    ]),

    field(
      'Anything we should know?',
      TextField({
        name: 'notes',
        width: 334,
        height: 56,
        multiline: true,
        maxLength: 500,
        ...boxed,
      }),
    ),

    Row({ gap: 28, align: 'start' }, [
      Column({ gap: 6 }, [
        Text('Membership', { size: 8, color: muted }),
        RadioGroup({ name: 'plan', gap: 6, labelSize: 10 }, [
          { value: 'basic', label: 'Basic - 4 EUR a month' },
          { value: 'pro', label: 'Pro - 9 EUR a month' },
          { value: 'team', label: 'Team - 29 EUR a month' },
        ]),
      ]),
      Column({ gap: 6 }, [
        Text('Interests', { size: 8, color: muted }),
        ListBox({ name: 'topics', width: 150, height: 60, fontSize: 10, ...boxed }, [
          'Invoicing',
          'Reports',
          'Typography',
          'Accessibility',
        ]),
      ]),
    ]),

    Checkbox({ name: 'agree', label: 'I have read the statutes', labelSize: 10 }),
    Checkbox({ name: 'newsletter', label: 'Send me the monthly letter', labelSize: 10 }),

    Divider({ color: hair }),

    Row({ gap: 20, align: 'end' }, [
      field('Signature', SignatureField({ name: 'signature', width: 210, height: 46, ...boxed })),
      Spacer(),
      PushButton({ name: 'clear', label: 'Reset form', action: 'reset', width: 92, height: 26 }),
    ]),

    Spacer(),

    Box({ bg: '#f4f6f9', radius: 8, padding: 14 }, [
      Column({ gap: 5 }, [
        Text('And it reads them back', { size: 11, bold: true, color: ink }),
        Text(
          '@jasy/pdf/edit opens a form somebody else made, reports its fields, fills them from a ' +
            'plain object and can flatten the result. The save is an incremental update, so the ' +
            'original file stays a literal prefix of the new one - nothing is rewritten behind ' +
            'your back.',
          { size: 9, color: muted, lineHeight: 1.45 },
        ),
      ]),
    ]),
  ])

export const fillableFormMarkdown = `---
title: Fillable form
pdf:
  format: A4
  margin: 18mm
  gap: 16
  fontSize: 10
  color: "#0a2348"
---

::fillable-form
::
`
