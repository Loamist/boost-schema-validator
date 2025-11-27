// Validation types
export interface ValidationError {
  type: 'required' | 'type' | 'enum' | 'pattern' | 'format' | 'constraint' | 'other'
  field: string
  message: string
  expected?: unknown
  actual_value?: unknown
  allowed_values?: string[]
  pattern?: string
  constraint?: string
  value?: unknown
}

export interface ValidationResult {
  valid: boolean
  schema_valid: boolean
  business_rules_valid: boolean
  errors: ValidationError[]
  errors_by_type?: Record<string, ValidationError[]>
  message: string
}

// Schema types
export interface EntitySchema {
  $schema?: string
  $id?: string
  title?: string
  type?: string
  properties?: Record<string, SchemaProperty>
  required?: string[]
}

export interface SchemaProperty {
  type?: string | string[]
  description?: string
  enum?: string[]
  pattern?: string
  format?: string
  minimum?: number
  maximum?: number
  minLength?: number
  maxLength?: number
  items?: SchemaProperty
  properties?: Record<string, SchemaProperty>
  $ref?: string
}

export interface FullSchema {
  schema: EntitySchema
  rules?: Record<string, unknown>
  boost_metadata?: {
    entity?: {
      name?: string
      primaryKey?: string
      area?: string
      relationships?: unknown[]
    }
  }
}

// Example types
export interface EntityExample {
  name: string
  filename: string
  data: Record<string, unknown>
}

// Dictionary types
export interface DictionaryField {
  type: string
  required: boolean
  description: string
  examples: string
}

export interface EntityDictionary {
  overview: string
  fields: Record<string, DictionaryField>
  error?: string
}

// Field analysis types
export interface ParsedField {
  name: string
  path: string
  displayName: string
  value: unknown
  type: string
  displayValue: string
  importance: number
  isValid: boolean
  errors: string[]
}

export interface FieldStats {
  total: number
  valid: number
  errors: number
}
