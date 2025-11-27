import { useState } from 'react'
import { ValidationResult, ValidationError } from '../../types'

interface SummaryViewProps {
  result: ValidationResult | null
  isValidating: boolean
}

const ERROR_TYPE_LABELS: Record<string, string> = {
  required: 'Required Fields',
  format: 'Format Issues',
  pattern: 'Pattern Mismatches',
  enum: 'Invalid Values',
  type: 'Type Errors',
  constraint: 'Constraint Violations',
  other: 'Other Errors'
}

export default function SummaryView({ result, isValidating }: SummaryViewProps) {
  const [activeTab, setActiveTab] = useState<string>('all')

  if (isValidating) {
    return (
      <div className="p-6 min-h-96 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-base-content/70">Validating...</p>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="p-6 min-h-96 flex items-center justify-center">
        <div className="text-center text-base-content/50">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-lg">Select an entity and click "Validate" to see results</p>
        </div>
      </div>
    )
  }

  if (result.valid) {
    return (
      <div className="p-6 min-h-96">
        <div className="alert alert-success">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-bold">Validation Successful!</h3>
            <p>The JSON data is valid according to the schema.</p>
          </div>
        </div>
      </div>
    )
  }

  // Group errors by type
  const errorsByType = result.errors_by_type || groupErrorsByType(result.errors)
  const errorTypes = Object.entries(errorsByType).filter(([, errors]) => errors.length > 0)

  // Get errors to display based on active tab
  const displayErrors = activeTab === 'all'
    ? result.errors
    : errorsByType[activeTab] || []

  return (
    <div className="p-6 min-h-96">
      {/* Error Summary Alert */}
      <div className="alert alert-error mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h3 className="font-bold">Validation Failed</h3>
          <p>{result.errors.length} error{result.errors.length !== 1 ? 's' : ''} found</p>
        </div>
      </div>

      {/* Error Type Tabs */}
      {errorTypes.length > 1 && (
        <div className="tabs tabs-boxed mb-4">
          <button
            className={`tab ${activeTab === 'all' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All ({result.errors.length})
          </button>
          {errorTypes.map(([type, errors]) => (
            <button
              key={type}
              className={`tab ${activeTab === type ? 'tab-active' : ''}`}
              onClick={() => setActiveTab(type)}
            >
              {ERROR_TYPE_LABELS[type] || type} ({errors.length})
            </button>
          ))}
        </div>
      )}

      {/* Error List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {displayErrors.map((error, index) => (
          <ErrorItem key={index} error={error} />
        ))}
      </div>
    </div>
  )
}

function ErrorItem({ error }: { error: ValidationError }) {
  const getBadgeClass = (type: string) => {
    switch (type) {
      case 'required':
        return 'badge-error'
      case 'type':
        return 'badge-warning'
      case 'enum':
        return 'badge-info'
      case 'pattern':
      case 'format':
        return 'badge-warning'
      default:
        return 'badge-ghost'
    }
  }

  return (
    <div className="flex items-start gap-3 p-3 bg-base-200 rounded-lg">
      <span className={`badge ${getBadgeClass(error.type)} badge-sm mt-0.5`}>
        {error.type}
      </span>
      <div className="flex-1">
        <p className="text-sm">{error.message}</p>
        {error.actual_value !== undefined && (
          <p className="text-xs text-base-content/60 mt-1">
            Received: <code className="bg-base-300 px-1 rounded">{JSON.stringify(error.actual_value)}</code>
          </p>
        )}
      </div>
    </div>
  )
}

function groupErrorsByType(errors: ValidationError[]): Record<string, ValidationError[]> {
  const groups: Record<string, ValidationError[]> = {}
  for (const error of errors) {
    if (!groups[error.type]) {
      groups[error.type] = []
    }
    groups[error.type].push(error)
  }
  return groups
}
