interface PlainTextViewProps {
  entityName: string
  data: Record<string, unknown>
}

// Field name translations for better readability
const FIELD_TRANSLATIONS: Record<string, string> = {
  traceableUnitId: 'Unit ID',
  uniqueIdentifier: 'Primary Identifier',
  totalVolumeM3: 'Total Volume',
  harvestGeographicDataId: 'Harvest Location',
  currentGeographicDataId: 'Current Location',
  speciesComponents: 'Species Composition',
  processingHistoryIds: 'Processing History',
  moistureContentIds: 'Moisture Records',
  measurementRecordIds: 'Measurements',
  '@context': 'Schema Context',
  '@type': 'Entity Type',
  '@id': 'Entity ID'
}

export default function PlainTextView({ entityName, data }: PlainTextViewProps) {
  const renderValue = (key: string, value: unknown, _depth = 0): string => {
    if (value === null || value === undefined) {
      return 'Not specified'
    }

    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No'
    }

    if (typeof value === 'number') {
      // Format numbers with units based on field name
      if (key.toLowerCase().includes('volume')) {
        return `${value} cubic meters`
      }
      if (key.toLowerCase().includes('weight') || key.toLowerCase().includes('mass')) {
        return `${value} kg`
      }
      if (key.toLowerCase().includes('percent') || key.toLowerCase().includes('confidence')) {
        return `${value}%`
      }
      return value.toLocaleString()
    }

    if (typeof value === 'string') {
      // Check if it's a date
      if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
        try {
          const date = new Date(value)
          return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        } catch {
          return value
        }
      }
      return value
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return 'None'
      }
      if (typeof value[0] === 'object') {
        return `${value.length} item${value.length !== 1 ? 's' : ''}`
      }
      return value.join(', ')
    }

    if (typeof value === 'object') {
      return JSON.stringify(value)
    }

    return String(value)
  }

  const getDisplayName = (key: string): string => {
    if (FIELD_TRANSLATIONS[key]) {
      return FIELD_TRANSLATIONS[key]
    }
    // Convert camelCase to Title Case
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim()
  }

  // Filter out @context for display (too verbose)
  const displayFields = Object.entries(data).filter(([key]) => key !== '@context')

  return (
    <div className="prose max-w-none">
      <div className="bg-base-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-primary">{entityName} Summary</h3>

        <div className="grid gap-3">
          {displayFields.map(([key, value]) => {
            const displayValue = renderValue(key, value)
            const displayName = getDisplayName(key)

            // Skip complex objects for the summary view
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
              return (
                <div key={key} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                  <span className="font-medium text-base-content/70 min-w-48">{displayName}:</span>
                  <span className="text-base-content italic">Complex object (expand below)</span>
                </div>
              )
            }

            return (
              <div key={key} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                <span className="font-medium text-base-content/70 min-w-48">{displayName}:</span>
                <span className="text-base-content">{displayValue}</span>
              </div>
            )
          })}
        </div>

        {/* Nested Objects Section */}
        {displayFields.some(([, value]) => typeof value === 'object' && value !== null && !Array.isArray(value)) && (
          <>
            <div className="divider"></div>
            <h4 className="text-md font-semibold mb-3 text-primary">Detailed Information</h4>
            {displayFields
              .filter(([, value]) => typeof value === 'object' && value !== null && !Array.isArray(value))
              .map(([key, value]) => (
                <div key={key} className="collapse collapse-arrow bg-base-100 mb-2">
                  <input type="checkbox" />
                  <div className="collapse-title font-medium">
                    {getDisplayName(key)}
                  </div>
                  <div className="collapse-content">
                    <pre className="text-xs overflow-x-auto">
                      {JSON.stringify(value, null, 2)}
                    </pre>
                  </div>
                </div>
              ))}
          </>
        )}
      </div>
    </div>
  )
}
