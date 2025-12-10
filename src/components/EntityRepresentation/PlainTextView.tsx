interface PlainTextViewProps {
  entityName: string
  data: Record<string, unknown>
}

/**
 * Format array of objects into a readable summary
 */
function formatArraySummary(items: Record<string, unknown>[], fieldName: string): string {
  if (items.length === 0) return 'None'

  // Special handling for pathwaySummary
  if (fieldName === 'pathwaySummary') {
    const summaries = items.map(item => {
      const pathwayId = item.pathwayId as string || 'Unknown'
      const volume = item.totalVolume as number
      const credits = item.creditsGenerated as number
      const volumeStr = volume ? `${(volume / 1000).toFixed(0)}k gal` : ''
      const creditsStr = credits ? `${(credits / 1000000).toFixed(2)}M credits` : ''
      return `${pathwayId} (${[volumeStr, creditsStr].filter(Boolean).join(', ')})`
    })
    return summaries.join(' | ')
  }

  // Generic handling - find best display key
  const keyPriority = ['id', 'pathwayId', 'transactionId', 'name', 'type', '@id']
  const firstItem = items[0]
  const itemKeys = Object.keys(firstItem)
  const displayKey = itemKeys.find(k =>
    keyPriority.some(pk => k.toLowerCase().includes(pk.toLowerCase()))
  ) || itemKeys[0]

  const values = items.map(item => {
    const val = item[displayKey]
    if (typeof val === 'string') {
      return val.length > 30 ? val.substring(0, 27) + '...' : val
    }
    return String(val)
  })

  if (items.length <= 3) {
    return values.join(', ')
  }
  return `${values.slice(0, 2).join(', ')} (+${items.length - 2} more)`
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
      // Handle arrays of objects - show summary based on key fields
      if (typeof value[0] === 'object' && value[0] !== null) {
        return formatArraySummary(value as Record<string, unknown>[], key)
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

        {/* Nested Objects and Arrays Section */}
        {displayFields.some(([, value]) =>
          (typeof value === 'object' && value !== null && !Array.isArray(value)) ||
          (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object')
        ) && (
          <>
            <div className="divider"></div>
            <h4 className="text-md font-semibold mb-3 text-primary">Detailed Information</h4>

            {/* Arrays of Objects */}
            {displayFields
              .filter(([, value]) => Array.isArray(value) && value.length > 0 && typeof value[0] === 'object')
              .map(([key, value]) => (
                <div key={key} className="collapse collapse-arrow bg-base-100 mb-2 border border-base-300">
                  <input type="checkbox" />
                  <div className="collapse-title font-medium">
                    {getDisplayName(key)} ({(value as unknown[]).length} items)
                  </div>
                  <div className="collapse-content">
                    <div className="space-y-2">
                      {(value as Record<string, unknown>[]).map((item, idx) => (
                        <div key={idx} className="bg-base-200 p-3 rounded-lg">
                          <div className="font-semibold text-sm mb-2 text-primary">Item {idx + 1}</div>
                          <div className="grid gap-1 text-sm">
                            {Object.entries(item).map(([itemKey, itemValue]) => (
                              <div key={itemKey} className="flex gap-2">
                                <span className="font-medium text-base-content/70 min-w-32">{getDisplayName(itemKey)}:</span>
                                <span className="text-base-content">
                                  {typeof itemValue === 'object' ? JSON.stringify(itemValue) : String(itemValue)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

            {/* Single Objects */}
            {displayFields
              .filter(([, value]) => typeof value === 'object' && value !== null && !Array.isArray(value))
              .map(([key, value]) => (
                <div key={key} className="collapse collapse-arrow bg-base-100 mb-2 border border-base-300">
                  <input type="checkbox" />
                  <div className="collapse-title font-medium">
                    {getDisplayName(key)}
                  </div>
                  <div className="collapse-content">
                    <div className="bg-base-200 p-3 rounded-lg">
                      <div className="grid gap-1 text-sm">
                        {Object.entries(value as Record<string, unknown>).map(([itemKey, itemValue]) => (
                          <div key={itemKey} className="flex gap-2">
                            <span className="font-medium text-base-content/70 min-w-32">{getDisplayName(itemKey)}:</span>
                            <span className="text-base-content">
                              {typeof itemValue === 'object' ? JSON.stringify(itemValue) : String(itemValue)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </>
        )}
      </div>
    </div>
  )
}
