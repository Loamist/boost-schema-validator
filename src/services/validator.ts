import Ajv, { ErrorObject } from 'ajv'
import addFormats from 'ajv-formats'
import { ValidationResult, ValidationError } from '../types'
import { loadEntitySchema } from './schemaLoader'

// Initialize Ajv with all errors mode
const ajv = new Ajv({
  allErrors: true,
  verbose: true,
  strict: false
})

// Add format validators (date, uri, email, etc.)
addFormats(ajv)

/**
 * Convert Ajv error to our ValidationError format
 */
function formatAjvError(error: ErrorObject): ValidationError {
  const fieldPath = error.instancePath
    ? error.instancePath.replace(/^\//, '').replace(/\//g, '.')
    : 'root'

  switch (error.keyword) {
    case 'required': {
      const missingProp = error.params.missingProperty as string
      return {
        type: 'required',
        field: missingProp,
        message: fieldPath === 'root'
          ? `Missing required field: '${missingProp}'`
          : `Missing required field: '${missingProp}' in ${fieldPath}`
      }
    }

    case 'additionalProperties': {
      const additionalProp = error.params.additionalProperty as string
      return {
        type: 'additionalProperty',
        field: additionalProp,
        message: `Field '${additionalProp}' is not defined in schema`
      }
    }

    case 'type': {
      const expectedType = error.params.type as string
      return {
        type: 'type',
        field: fieldPath,
        message: `Field '${fieldPath}': expected type ${expectedType}`,
        expected: expectedType,
        actual_value: error.data
      }
    }

    case 'enum': {
      const allowedValues = error.params.allowedValues as string[]
      return {
        type: 'enum',
        field: fieldPath,
        message: `Field '${fieldPath}': value must be one of: ${allowedValues.map(v => `'${v}'`).join(', ')}`,
        allowed_values: allowedValues,
        actual_value: error.data
      }
    }

    case 'pattern': {
      const pattern = error.params.pattern as string
      return {
        type: 'pattern',
        field: fieldPath,
        message: `Field '${fieldPath}': value does not match required pattern '${pattern}'`,
        pattern,
        actual_value: error.data
      }
    }

    case 'format': {
      const format = error.params.format as string
      return {
        type: 'format',
        field: fieldPath,
        message: `Field '${fieldPath}': must be a valid ${format}`,
        expected: format,
        actual_value: error.data
      }
    }

    case 'minLength':
    case 'maxLength':
    case 'minimum':
    case 'maximum': {
      const limit = error.params.limit as number
      let message: string

      if (error.keyword === 'minLength') {
        message = `Field '${fieldPath}': must be at least ${limit} characters long`
      } else if (error.keyword === 'maxLength') {
        message = `Field '${fieldPath}': must be at most ${limit} characters long`
      } else if (error.keyword === 'minimum') {
        message = `Field '${fieldPath}': value must be at least ${limit}`
      } else {
        message = `Field '${fieldPath}': value must be at most ${limit}`
      }

      return {
        type: 'constraint',
        field: fieldPath,
        message,
        constraint: error.keyword,
        value: limit
      }
    }

    default:
      return {
        type: 'other',
        field: fieldPath !== 'root' ? fieldPath : '',
        message: fieldPath === 'root'
          ? error.message || 'Validation error'
          : `Field '${fieldPath}': ${error.message || 'Validation error'}`
      }
  }
}

/**
 * Group errors by type
 */
function groupErrorsByType(errors: ValidationError[]): Record<string, ValidationError[]> {
  const groups: Record<string, ValidationError[]> = {
    required: [],
    format: [],
    pattern: [],
    enum: [],
    type: [],
    constraint: [],
    additionalProperty: [],
    other: []
  }

  for (const error of errors) {
    const type = error.type in groups ? error.type : 'other'
    groups[type].push(error)
  }

  return groups
}

/**
 * Consolidate additionalProperty errors into a single error
 */
function consolidateAdditionalPropertyErrors(errors: ValidationError[]): ValidationError[] {
  const additionalPropErrors = errors.filter(e => e.type === 'additionalProperty')
  const otherErrors = errors.filter(e => e.type !== 'additionalProperty')

  if (additionalPropErrors.length === 0) {
    return errors
  }

  // Consolidate into single error with all field names
  const fieldNames = additionalPropErrors.map(e => e.field)
  const consolidatedError: ValidationError = {
    type: 'additionalProperty',
    field: fieldNames.join(', '),
    message: `${fieldNames.length} field${fieldNames.length > 1 ? 's' : ''} not defined in schema: ${fieldNames.join(', ')}`
  }

  return [...otherErrors, consolidatedError]
}

/**
 * Validate entity data against its schema
 */
export async function validateEntity(
  entityName: string,
  data: Record<string, unknown>
): Promise<ValidationResult> {
  try {
    // Load the schema
    const fullSchema = await loadEntitySchema(entityName)
    const schema = fullSchema.schema || fullSchema

    // Compile and validate
    const validate = ajv.compile(schema)
    const valid = validate(data)

    if (valid) {
      return {
        valid: true,
        schema_valid: true,
        business_rules_valid: true,
        errors: [],
        errors_by_type: {},
        message: 'Validation successful'
      }
    }

    // Format errors and consolidate additionalProperty errors
    const rawErrors = (validate.errors || []).map(formatAjvError)
    const errors = consolidateAdditionalPropertyErrors(rawErrors)
    const errors_by_type = groupErrorsByType(errors)

    return {
      valid: false,
      schema_valid: false,
      business_rules_valid: false,
      errors,
      errors_by_type,
      message: 'Schema validation failed'
    }
  } catch (error) {
    return {
      valid: false,
      schema_valid: false,
      business_rules_valid: false,
      errors: [{
        type: 'other',
        field: '',
        message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }],
      message: 'Validation error'
    }
  }
}
