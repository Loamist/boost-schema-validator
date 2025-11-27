/**
 * Error Mapping Utilities
 * Extracts field names from validation error messages and maps them to fields
 */
import { ValidationError } from '../types'

/**
 * Extract field name from validation error (handles both string and object formats)
 */
export function extractFieldFromError(error: ValidationError | string): string | null {
  // Handle object format
  if (typeof error === 'object' && error !== null) {
    // New format has a 'field' property
    if (error.field) {
      return error.field
    }
    // Fallback to extracting from message
    if (error.message) {
      return extractFieldFromMessage(error.message)
    }
    return null
  }

  // Handle legacy string format
  if (typeof error === 'string') {
    return extractFieldFromMessage(error)
  }

  return null
}

/**
 * Extract field name from error message string
 */
function extractFieldFromMessage(errorMessage: string): string | null {
  // Try to extract field names from common error patterns
  const patterns = [
    /property '([^']+)'/i,
    /field '([^']+)'/i,
    /Required field '([^']+)'/i,
    /'([^']+)' is missing/i,
    /\$\.([a-zA-Z_][a-zA-Z0-9_]*)/,
    /property "([^"]+)"/i,
    /Missing required field:\s+'([^']+)'/i
  ]

  for (const pattern of patterns) {
    const match = errorMessage.match(pattern)
    if (match) return match[1]
  }

  return null
}

/**
 * Create a map of field paths to their validation errors
 */
export function createErrorMap(errors: (ValidationError | string)[]): Record<string, string[]> {
  const errorMap: Record<string, string[]> = {}

  errors.forEach(error => {
    const fieldPath = extractFieldFromError(error)
    if (fieldPath) {
      if (!errorMap[fieldPath]) errorMap[fieldPath] = []
      // Store the display message (for backward compatibility)
      const displayMessage = typeof error === 'object' ? error.message : error
      errorMap[fieldPath].push(displayMessage)
    }
  })

  return errorMap
}
