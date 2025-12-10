import { useState } from 'react'
import PlainTextView from './PlainTextView'

interface EntityRepresentationProps {
  entityName: string
  data: Record<string, unknown>
}

export default function EntityRepresentation({ entityName, data }: EntityRepresentationProps) {
  const [activeView, setActiveView] = useState<'plainText' | 'visualJourney'>('plainText')

  // Check if this entity supports visual journey (TraceableUnit)
  const supportsJourney = entityName.toLowerCase().includes('traceableunit')

  return (
    <section className="card bg-base-100 shadow-xl">
      <div className="card-body">
        {/* Section Header with Tabs */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Entity Representation
            </h2>
            <p className="text-sm text-base-content/70 mt-1">
              Human-readable format and visual journey mapping
            </p>
          </div>

          {/* View Toggle Tabs */}
          <div className="tabs tabs-boxed bg-base-200">
            <button
              className={`tab ${activeView === 'plainText' ? 'tab-active' : ''}`}
              onClick={() => setActiveView('plainText')}
            >
              Plain Text
            </button>
            {supportsJourney && (
              <button
                className={`tab ${activeView === 'visualJourney' ? 'tab-active' : ''}`}
                onClick={() => setActiveView('visualJourney')}
              >
                Visual Journey
              </button>
            )}
          </div>
        </div>

        <div className="divider my-2"></div>

        {/* Content */}
        {activeView === 'plainText' ? (
          <PlainTextView entityName={entityName} data={data} />
        ) : (
          <div className="alert">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>Visual journey map coming soon...</span>
          </div>
        )}
      </div>
    </section>
  )
}
