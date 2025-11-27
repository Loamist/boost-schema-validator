import { ValidationResult } from '../../types'
import SummaryView from './SummaryView'

interface ValidationResultsProps {
  result: ValidationResult | null
  isValidating: boolean
}

export default function ValidationResults({ result, isValidating }: ValidationResultsProps) {
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
          <StatusBadge result={result} isValidating={isValidating} />
        </div>

        {/* Summary View */}
        <SummaryView result={result} isValidating={isValidating} />
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
