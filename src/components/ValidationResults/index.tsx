import { ValidationResult } from '../../types'
import { isLcfsEntity, calculateLcfsCompliance } from '../../utils/lcfsEntityConfig'
import SummaryView from './SummaryView'

interface ValidationResultsProps {
  result: ValidationResult | null
  isValidating: boolean
  entityName?: string
  parsedData?: Record<string, unknown> | null
}

export default function ValidationResults({ result, isValidating, entityName, parsedData }: ValidationResultsProps) {
  const showDualStatus = entityName && parsedData && isLcfsEntity(entityName)

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body p-0">
        {/* Results Header */}
        <div className="bg-base-200 px-6 py-3 border-b border-base-300 flex justify-between items-center gap-4">
          <h3 className="text-base font-semibold text-primary flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Validation Results
          </h3>
          {showDualStatus ? (
            <DualStatusBadge
              result={result}
              isValidating={isValidating}
              entityName={entityName}
              parsedData={parsedData}
            />
          ) : (
            <StatusBadge result={result} isValidating={isValidating} />
          )}
        </div>

        {/* Summary View */}
        <SummaryView
          result={result}
          isValidating={isValidating}
          entityName={entityName}
          parsedData={parsedData}
        />
      </div>
    </div>
  )
}

function StatusBadge({ result, isValidating }: { result: ValidationResult | null; isValidating: boolean }) {
  if (isValidating) {
    return (
      <div className="badge badge-lg badge-ghost flex-shrink-0">
        <span className="loading loading-dots loading-xs mr-2"></span>
        Validating...
      </div>
    )
  }

  if (!result) {
    return (
      <div className="badge badge-lg badge-ghost flex-shrink-0">
        Ready
      </div>
    )
  }

  if (result.valid) {
    return (
      <div className="badge badge-lg badge-success flex-shrink-0">
        Valid
      </div>
    )
  }

  return (
    <div className="badge badge-lg badge-error flex-shrink-0">
      {result.errors.length} Error{result.errors.length !== 1 ? 's' : ''}
    </div>
  )
}

interface DualStatusBadgeProps {
  result: ValidationResult | null
  isValidating: boolean
  entityName: string
  parsedData: Record<string, unknown>
}

function DualStatusBadge({ result, isValidating, entityName, parsedData }: DualStatusBadgeProps) {
  if (isValidating) {
    return (
      <div className="badge badge-lg badge-ghost flex-shrink-0">
        <span className="loading loading-dots loading-xs mr-2"></span>
        Validating...
      </div>
    )
  }

  if (!result) {
    return (
      <div className="badge badge-lg badge-ghost flex-shrink-0">
        Ready
      </div>
    )
  }

  // Calculate LCFS compliance
  const lcfsCompliance = calculateLcfsCompliance(entityName, parsedData)
  const boostValid = result.valid

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      {/* LCFS Compliance Badge - Primary importance */}
      <div className="flex flex-col items-center">
        <span className="text-xs text-base-content/60 mb-0.5">LCFS</span>
        {lcfsCompliance.isCompliant ? (
          <div className="badge badge-success gap-1" title={`${lcfsCompliance.providedCount}/${lcfsCompliance.requiredCount} CARB required fields`}>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
            </svg>
            Compliant
          </div>
        ) : (
          <div className="badge badge-error gap-1" title={`Missing: ${lcfsCompliance.missingFields.join(', ')}`}>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
            {lcfsCompliance.missingFields.length} Missing
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="divider divider-horizontal mx-0 my-0 w-px h-8 bg-base-300"></div>

      {/* BOOST Compliance Badge - Secondary importance */}
      <div className="flex flex-col items-center">
        <span className="text-xs text-base-content/60 mb-0.5">BOOST</span>
        {boostValid ? (
          <div className="badge badge-outline badge-success gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
            </svg>
            Valid
          </div>
        ) : (
          <div className="badge badge-outline badge-warning gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            {result.errors.length} Gap{result.errors.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  )
}
