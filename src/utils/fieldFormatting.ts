/**
 * Field Formatting Utilities
 * Handles formatting and display of field values and types
 */
import { formatBoostField } from './boostFormatting'

/**
 * Get the display type of a field value
 */
export function getFieldType(value: unknown): string {
  if (value === null) return 'null'
  if (Array.isArray(value)) return `array[${value.length}]`
  if (typeof value === 'object') return 'object'
  if (typeof value === 'string') {
    if (value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) return 'datetime'
    if (value.match(/^[A-Z]+-[A-Z0-9-]+$/)) return 'id'
    return 'string'
  }
  return typeof value
}

/**
 * Format a field value for display in the table
 */
export function formatFieldValue(value: unknown, fieldName = ''): string {
  // Use BOOST-specific formatting for better user experience
  return formatBoostField(value, fieldName)
}

/**
 * Get CSS class for value styling based on type
 */
export function getValueClass(value: unknown): string {
  const type = typeof value
  if (value === null) return 'null'
  if (Array.isArray(value) || (type === 'object' && value !== null)) return 'complex'
  return type // 'string', 'number', 'boolean'
}

/**
 * Get a user-friendly display name for a field
 */
export function getDisplayName(fieldName: string, fieldPath: string): string {
  // If it's a top-level field, just use the name
  if (!fieldPath.includes('.')) {
    return fieldName
  }

  // For nested fields, show the path with proper formatting
  const pathParts = fieldPath.split('.')

  // Special handling for common nested patterns
  if (pathParts.length === 2) {
    const parent = pathParts[0]
    const child = pathParts[1]

    // Make nested field names more readable
    const parentMap: Record<string, string> = {
      'physicalArrangement': 'Physical',
      'alternativeFateMetrics': 'Fate',
      'carbonImpact': 'Carbon',
      'secondaryIdentifiers': 'Secondary'
    }

    const shortParent = parentMap[parent] || parent
    return `${shortParent}.${child}`
  }

  // For deeper nesting, show the full path but abbreviated
  if (pathParts.length > 2) {
    const lastTwo = pathParts.slice(-2)
    return `...${lastTwo[0]}.${lastTwo[1]}`
  }

  return fieldPath
}

/**
 * Escape HTML to prevent XSS (React-safe version)
 */
export function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }
  return text.replace(/[&<>"']/g, char => htmlEntities[char] || char)
}
