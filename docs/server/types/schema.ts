import type { JSONSchema7 } from 'json-schema'

export interface ComponentSlot {
  name: string
  description: string
}

/** A single component entry from the Comark component registry (server/assets/components/schema.json). Each entry is a JSON Schema object extended with x- fields for MDC-specific metadata. */
export interface ComponentSchema extends JSONSchema7 {
  /** Lowercase kebab-case tag used in MDC syntax, e.g. "code-explorer" */
  'x-tag': string
  /** Named and default slots exposed by the component */
  'x-slots': ComponentSlot[]
  /** Realistic MDC usage example */
  'x-example': string
}

export interface ComponentRegistry {
  proseComponents: ComponentSchema[]
  playgroundComponents: ComponentSchema[]
  generatedAt: string
}
