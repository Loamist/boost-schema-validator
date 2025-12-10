/**
 * FieldTable Component
 * Renders the field analysis table with error highlighting and dictionary integration
 */
import { useState, useMemo } from 'react'
import { ValidationResult, EntityDictionary, DictionaryField } from '../types'
import { parseJsonFields, getFieldStats, ParsedField, FieldStats } from '../utils/fieldParser'
import { createErrorMap } from '../utils/errorMapping'
import { escapeHtml } from '../utils/fieldFormatting'

interface FieldTableProps {
  data: Record<string, unknown>
  validationResult: ValidationResult
  dictionary?: EntityDictionary
  schema?: {
    required?: string[]
    properties?: Record<string, unknown>
  }
}

export default function FieldTable({
  data,
  validationResult,
  dictionary,
  schema
}: FieldTableProps) {
  const [showErrorsOnly, setShowErrorsOnly] = useState(false)

  // Parse fields and create error map
  const { errorMap, stats, sortedFields } = useMemo(() => {
    const parsedFields = parseJsonFields(data)
    const errMap = createErrorMap(validationResult.errors || [])
    const fieldStats = getFieldStats(parsedFields, errMap)

    // Sort fields by priority
    const sorted = sortFieldsByPriority(parsedFields, dictionary)

    return {
      errorMap: errMap,
      stats: fieldStats,
      sortedFields: sorted
    }
  }, [data, validationResult, dictionary])

  // Filter fields if showing errors only
  const displayFields = useMemo(() => {
    if (!showErrorsOnly) return sortedFields
    return sortedFields.filter(field =>
      errorMap[field.path] && errorMap[field.path].length > 0
    )
  }, [sortedFields, errorMap, showErrorsOnly])

  // Calculate filtered stats
  const displayStats: FieldStats = useMemo(() => {
    if (!showErrorsOnly) return stats
    return {
      total: displayFields.length,
      valid: 0,
      errors: displayFields.length
    }
  }, [showErrorsOnly, stats, displayFields])

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <SummaryStats stats={displayStats} showErrorsOnly={showErrorsOnly} />

      {/* Filter Toggle */}
      <div className="flex items-center gap-4">
        <label className="label cursor-pointer gap-2">
          <input
            type="checkbox"
            className="toggle toggle-error toggle-sm"
            checked={showErrorsOnly}
            onChange={(e) => setShowErrorsOnly(e.target.checked)}
          />
          <span className="label-text">Show errors only</span>
        </label>
        {showErrorsOnly && (
          <span className="badge badge-error badge-sm">
            Showing {displayFields.length} error{displayFields.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Field Table */}
      {dictionary ? (
        <EnhancedTable
          fields={displayFields}
          errorMap={errorMap}
          dictionary={dictionary}
        />
      ) : (
        <BasicTable
          fields={displayFields}
          errorMap={errorMap}
          requiredFields={schema?.required || []}
        />
      )}
    </div>
  )
}

function SummaryStats({ stats, showErrorsOnly }: { stats: FieldStats; showErrorsOnly: boolean }) {
  return (
    <div className="stats stats-horizontal shadow w-full bg-base-100">
      <div className="stat">
        <div className="stat-figure text-primary">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </div>
        <div className="stat-title">{showErrorsOnly ? 'Filtered Fields' : 'Total Fields'}</div>
        <div className="stat-value text-primary">{stats.total}</div>
      </div>

      <div className="stat">
        <div className="stat-figure text-success">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <div className="stat-title">Valid</div>
        <div className="stat-value text-success">{stats.valid}</div>
      </div>

      <div className="stat">
        <div className="stat-figure text-error">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <div className="stat-title">Errors</div>
        <div className="stat-value text-error">{stats.errors}</div>
      </div>
    </div>
  )
}

function BasicTable({
  fields,
  errorMap,
  requiredFields
}: {
  fields: ParsedField[]
  errorMap: Record<string, string[]>
  requiredFields: string[]
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-base-300 shadow-sm">
      <table className="table table-zebra table-sm">
        <thead className="bg-base-200 text-base-content">
          <tr>
            <th className="text-center">Status</th>
            <th>Field Name</th>
            <th>Value</th>
            <th>Type</th>
            <th>Errors</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field) => (
            <BasicTableRow
              key={field.path}
              field={field}
              hasError={!!(errorMap[field.path]?.length)}
              errors={errorMap[field.path] || []}
              isRequired={requiredFields.includes(field.name)}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function BasicTableRow({
  field,
  hasError,
  errors,
  isRequired
}: {
  field: ParsedField
  hasError: boolean
  errors: string[]
  isRequired: boolean
}) {
  return (
    <tr className={hasError ? 'bg-error/5' : ''} data-field-path={field.path}>
      <td className="text-center">
        {hasError ? (
          <span className="text-error text-lg">❌</span>
        ) : (
          <span className="text-success text-lg">✅</span>
        )}
      </td>
      <td className={isRequired ? 'font-semibold' : ''}>
        {field.displayName}
        {isRequired && <span className="badge badge-warning badge-xs ml-1">Required</span>}
      </td>
      <td className={`font-mono text-sm ${field.valueClass}`}>
        {field.displayValue}
      </td>
      <td className="text-xs text-base-content/60">{field.type}</td>
      <td>
        {errors.map((error, idx) => (
          <div key={idx} className="text-error text-xs">
            {escapeHtml(error)}
          </div>
        ))}
      </td>
    </tr>
  )
}

function EnhancedTable({
  fields,
  errorMap,
  dictionary
}: {
  fields: ParsedField[]
  errorMap: Record<string, string[]>
  dictionary: EntityDictionary
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-base-300 shadow-sm">
      <table className="table table-zebra enhanced-field-table">
        <thead className="bg-base-200 text-base-content">
          <tr>
            <th className="text-center w-20">Status</th>
            <th className="w-36">Field Name</th>
            <th className="text-center w-24">Required</th>
            <th className="w-64">Value</th>
            <th className="w-96">Description & Examples</th>
            <th className="w-40">Validation Errors</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field) => {
            const fieldInfo = getFieldDictionaryInfo(field.name, dictionary)
            const hasError = !!(errorMap[field.path]?.length)
            return (
              <EnhancedTableRow
                key={field.path}
                field={field}
                fieldInfo={fieldInfo}
                hasError={hasError}
                errors={errorMap[field.path] || []}
              />
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function EnhancedTableRow({
  field,
  fieldInfo,
  hasError,
  errors
}: {
  field: ParsedField
  fieldInfo: DictionaryField
  hasError: boolean
  errors: string[]
}) {
  const rowClass = hasError ? 'bg-error/5 hover:bg-error/10' : 'hover:bg-base-200'

  return (
    <tr className={rowClass} data-field-path={field.path}>
      {/* Status */}
      <td className="text-center align-top">
        {hasError ? (
          <span className="badge badge-error badge-sm gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
            </svg>
            Error
          </span>
        ) : (
          <span className="badge badge-success badge-sm gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            Valid
          </span>
        )}
      </td>

      {/* Field Name */}
      <td className="text-xs font-semibold align-top break-words text-base-content/90">
        {field.displayName}
      </td>

      {/* Required Status */}
      <td className="text-center align-top">
        {fieldInfo.required ? (
          <span className="badge badge-warning badge-sm">Required</span>
        ) : (
          <span className="badge badge-ghost badge-sm">Optional</span>
        )}
      </td>

      {/* Value */}
      <td className={`font-mono text-xs align-top break-all ${hasError ? 'text-error' : 'text-base-content/80'}`}>
        {field.displayValue}
      </td>

      {/* Description & Examples */}
      <td className="text-xs text-base-content/70 align-top">
        <FieldDescription fieldInfo={fieldInfo} />
      </td>

      {/* Validation Errors */}
      <td className="align-top">
        {hasError ? (
          errors.map((error, idx) => (
            <div key={idx} className="flex items-start gap-1 text-error text-xs leading-tight mb-1">
              <svg className="w-3 h-3 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              <span className="break-words">{escapeHtml(error)}</span>
            </div>
          ))
        ) : (
          <span className="text-success text-xs">✓ No errors</span>
        )}
      </td>
    </tr>
  )
}

function FieldDescription({ fieldInfo }: { fieldInfo: DictionaryField }) {
  if (!fieldInfo.description && !fieldInfo.examples) {
    return <span className="text-base-content/40 italic text-xs">No description available</span>
  }

  const description = fieldInfo.description || ''
  const examples = fieldInfo.examples || ''

  // Long descriptions with examples get a collapsible
  if (description.length > 100 && examples) {
    const truncated = description.substring(0, 100) + '...'
    return (
      <div className="collapse collapse-arrow bg-base-200/50 rounded-lg">
        <input type="checkbox" />
        <div className="collapse-title text-xs font-medium py-2 px-3">
          {truncated}
        </div>
        <div className="collapse-content text-xs px-3">
          <p className="mb-2">{description}</p>
          <div className="badge badge-outline badge-sm">Examples: {examples}</div>
        </div>
      </div>
    )
  }

  // Short description
  return (
    <div>
      {description && (
        <div className="text-xs leading-relaxed">{description}</div>
      )}
      {examples && (
        <div className="mt-2 p-2 bg-base-200/50 rounded border border-base-300 text-xs">
          <span className="font-semibold text-base-content/70">Ex:</span>
          <span className="text-base-content/80 ml-1">{examples}</span>
        </div>
      )}
    </div>
  )
}

/**
 * Get field information from dictionary data
 */
function getFieldDictionaryInfo(fieldName: string, dictionary: EntityDictionary): DictionaryField {
  const defaultInfo: DictionaryField = { required: false, description: '', examples: '', type: '' }

  if (!dictionary?.fields) {
    return defaultInfo
  }

  // Direct match first
  if (dictionary.fields[fieldName]) {
    return dictionary.fields[fieldName]
  }

  // Try partial matches for nested fields
  const keys = Object.keys(dictionary.fields)
  const partialMatch = keys.find(key =>
    fieldName.toLowerCase().includes(key.toLowerCase()) ||
    key.toLowerCase().includes(fieldName.toLowerCase())
  )

  if (partialMatch) {
    return dictionary.fields[partialMatch]
  }

  return defaultInfo
}

/**
 * Sort fields by priority: required first, then by importance score
 */
function sortFieldsByPriority(fields: ParsedField[], dictionary?: EntityDictionary): ParsedField[] {
  return [...fields].sort((a, b) => {
    const aInfo = dictionary ? getFieldDictionaryInfo(a.name, dictionary) : { required: false }
    const bInfo = dictionary ? getFieldDictionaryInfo(b.name, dictionary) : { required: false }

    // Required fields first
    if (aInfo.required && !bInfo.required) return -1
    if (!aInfo.required && bInfo.required) return 1

    // Within each group, sort by field importance
    const aImportance = getFieldImportanceScore(a.name)
    const bImportance = getFieldImportanceScore(b.name)

    if (aImportance !== bImportance) {
      return bImportance - aImportance // Higher importance first
    }

    // Finally, sort alphabetically
    return a.displayName.localeCompare(b.displayName)
  })
}

/**
 * Get importance score for a field (higher = more important)
 */
function getFieldImportanceScore(fieldName: string): number {
  const fieldLower = fieldName.toLowerCase()

  // Critical BOOST fields
  if (fieldLower.includes('traceableunitid')) return 100
  if (fieldLower.includes('organizationid')) return 95
  if (fieldLower.includes('@id')) return 90
  if (fieldLower.includes('@type')) return 85
  if (fieldLower.includes('uniqueidentifier')) return 80

  // Important identification fields
  if (fieldLower.includes('identificationmethod')) return 75
  if (fieldLower.includes('identificationconfidence')) return 70
  if (fieldLower.includes('harvester')) return 65
  if (fieldLower.includes('operator')) return 60

  // Material and geographic fields
  if (fieldLower.includes('materialtype')) return 55
  if (fieldLower.includes('geographic') || fieldLower.includes('location')) return 50
  if (fieldLower.includes('unittype')) return 45
  if (fieldLower.includes('timestamp') || fieldLower.includes('date')) return 40

  // Default importance
  return 10
}
