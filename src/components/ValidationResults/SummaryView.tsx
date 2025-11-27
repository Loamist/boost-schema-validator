import { useState } from 'react'
import { ValidationResult, ValidationError } from '../../types'
import { isLcfsEntity, calculateLcfsCompliance, findLcfsEntityConfig } from '../../utils/lcfsEntityConfig'

interface SummaryViewProps {
  result: ValidationResult | null
  isValidating: boolean
  entityName?: string
  parsedData?: Record<string, unknown> | null
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

export default function SummaryView({ result, isValidating, entityName, parsedData }: SummaryViewProps) {
  const showSplitView = entityName && parsedData && isLcfsEntity(entityName)

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

  // For LCFS entities, show split view
  if (showSplitView) {
    return (
      <SplitValidationView
        result={result}
        entityName={entityName}
        parsedData={parsedData}
      />
    )
  }

  // Default single view for non-LCFS entities
  return <SingleValidationView result={result} />
}

// Split view for LCFS entities showing LCFS and BOOST validation separately
function SplitValidationView({
  result,
  entityName,
  parsedData
}: {
  result: ValidationResult
  entityName: string
  parsedData: Record<string, unknown>
}) {
  // Calculate LCFS compliance
  const lcfsCompliance = calculateLcfsCompliance(entityName, parsedData)
  const config = findLcfsEntityConfig(entityName)
  const carbRequiredFields = config?.carbRequiredFields || []

  // Separate errors into LCFS errors (missing CARB required fields) and BOOST-only errors
  const lcfsErrors: ValidationError[] = []
  const boostErrors: ValidationError[] = []

  for (const error of result.errors) {
    // Check if this is a missing CARB required field
    const fieldMatch = error.message.match(/Missing required field: '([^']+)'/)
    if (fieldMatch) {
      const fieldName = fieldMatch[1]
      if (carbRequiredFields.includes(fieldName)) {
        lcfsErrors.push(error)
      } else {
        boostErrors.push(error)
      }
    } else {
      // Non-required errors go to BOOST
      boostErrors.push(error)
    }
  }

  const lcfsPassed = lcfsCompliance.isCompliant
  const boostPassed = result.valid

  return (
    <div className="p-6 min-h-96">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* LCFS Validation Section */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm uppercase tracking-wide text-base-content/70 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            LCFS Compliance
          </h4>

          {lcfsPassed ? (
            <div className="alert alert-success">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-bold">LCFS Compliant</h3>
                <p className="text-sm">All {lcfsCompliance.requiredCount} CARB required fields present</p>
              </div>
            </div>
          ) : (
            <div className="alert alert-error">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-bold">Not LCFS Compliant</h3>
                <p className="text-sm">{lcfsCompliance.missingFields.length} CARB required field{lcfsCompliance.missingFields.length !== 1 ? 's' : ''} missing</p>
              </div>
            </div>
          )}

          {/* LCFS Errors/Missing Fields */}
          {!lcfsPassed && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {lcfsCompliance.missingFields.map((field, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-error/10 border border-error/20 rounded-lg">
                  <span className="badge badge-error badge-sm mt-0.5">required</span>
                  <div className="flex-1">
                    <p className="text-sm">Missing CARB required field: '<code className="font-mono">{field}</code>'</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {lcfsPassed && (
            <div className="text-sm text-base-content/60 p-3 bg-success/10 border border-success/20 rounded-lg">
              <p className="font-medium text-success mb-2">Provided CARB Fields:</p>
              <div className="flex flex-wrap gap-1">
                {carbRequiredFields.map(field => (
                  <span key={field} className="badge badge-success badge-sm badge-outline">{field}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* BOOST Validation Section */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm uppercase tracking-wide text-base-content/70 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            BOOST Schema
          </h4>

          {boostPassed ? (
            <div className="alert alert-success">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-bold">BOOST Valid</h3>
                <p className="text-sm">All BOOST schema requirements met</p>
              </div>
            </div>
          ) : (
            <div className="alert alert-warning">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="font-bold">BOOST Gaps Found</h3>
                <p className="text-sm">{boostErrors.length} additional field{boostErrors.length !== 1 ? 's' : ''} needed for full BOOST compliance</p>
              </div>
            </div>
          )}

          {/* BOOST Errors */}
          {!boostPassed && boostErrors.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {boostErrors.map((error, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                  <span className="badge badge-warning badge-sm mt-0.5">{error.type}</span>
                  <div className="flex-1">
                    <p className="text-sm">{error.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {boostPassed && (
            <div className="text-sm text-base-content/60 p-3 bg-success/10 border border-success/20 rounded-lg">
              <p>Full BOOST schema compliance achieved. Data is ready for enhanced supply chain tracking.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Original single view for non-LCFS entities
function SingleValidationView({ result }: { result: ValidationResult }) {
  const [activeTab, setActiveTab] = useState<string>('all')

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
