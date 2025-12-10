/**
 * FieldParser - Parses JSON objects into field definitions for table display
 */
import { getFieldType, formatFieldValue, getValueClass, getDisplayName } from './fieldFormatting'
import { getFieldImportance } from './fieldImportance'

export interface ParsedField {
  name: string
  path: string
  displayName: string
  value: unknown
  type: string
  displayValue: string
  valueClass: string
  importance: number
}

export interface FieldStats {
  total: number
  valid: number
  errors: number
}

/**
 * Parse a JSON object into an array of field definitions
 */
export function parseJsonFields(
  obj: Record<string, unknown>,
  prefix = '',
  fields: ParsedField[] = []
): ParsedField[] {
  for (const [key, value] of Object.entries(obj)) {
    const fieldPath = prefix ? `${prefix}.${key}` : key

    // Skip @context nested properties - treat @context as a single field
    if (key === '@context' && typeof value === 'object') {
      const field: ParsedField = {
        name: key,
        path: fieldPath,
        displayName: getDisplayName(key, fieldPath),
        value: value,
        type: getFieldType(value),
        displayValue: formatFieldValue(value, key),
        valueClass: getValueClass(value),
        importance: getFieldImportance(key, prefix)
      }
      fields.push(field)
      continue // Skip recursive parsing for @context
    }

    const field: ParsedField = {
      name: key,
      path: fieldPath,
      displayName: getDisplayName(key, fieldPath),
      value: value,
      type: getFieldType(value),
      displayValue: formatFieldValue(value, key),
      valueClass: getValueClass(value),
      importance: getFieldImportance(key, prefix)
    }

    fields.push(field)

    // Recursively parse nested objects (but not arrays for simplicity)
    // Skip @context and other JSON-LD metadata fields
    if (value && typeof value === 'object' && !Array.isArray(value) && key !== '@context') {
      parseJsonFields(value as Record<string, unknown>, fieldPath, fields)
    }
  }

  // Sort fields by importance (higher numbers first), then by display name
  return fields.sort((a, b) => {
    if (a.importance !== b.importance) {
      return b.importance - a.importance // Higher importance first
    }
    return a.displayName.localeCompare(b.displayName) // Alphabetical for same importance
  })
}

/**
 * Get field statistics from parsed fields
 */
export function getFieldStats(fields: ParsedField[], errorMap: Record<string, string[]> = {}): FieldStats {
  let errorCount = 0
  let validCount = 0

  fields.forEach(field => {
    const hasError = errorMap[field.path] && errorMap[field.path].length > 0
    if (hasError) {
      errorCount++
    } else {
      validCount++
    }
  })

  return {
    total: fields.length,
    valid: validCount,
    errors: errorCount
  }
}
