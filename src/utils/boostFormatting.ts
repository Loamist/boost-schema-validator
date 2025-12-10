/**
 * BOOST-specific field formatting utilities
 * Transforms technical JSON data into user-friendly business information
 */

interface AlternativeFateMetrics {
  annualDecayRate?: number
  collectionEfficiency?: number
  baselineScenario?: string
}

interface CarbonImpact {
  emissionsAvoided?: number
  soilCarbonChange?: number
}

interface PhysicalArrangement {
  arrangementType?: string
  exposureConditions?: string
  groundContact?: boolean
  arrangementDate?: string
}

interface SecondaryIdentifier {
  identifierType: string
  identifierValue: string
  confidence?: number
}

/**
 * Format date strings into user-friendly format
 */
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateString
  }
}

/**
 * Format alternative fate metrics into readable summary
 */
function formatAlternativeFateMetrics(metrics: AlternativeFateMetrics): string {
  const parts: string[] = []

  if (metrics.annualDecayRate !== undefined) {
    parts.push(`Decay: ${metrics.annualDecayRate}%/yr`)
  }

  if (metrics.collectionEfficiency !== undefined) {
    parts.push(`Efficiency: ${(metrics.collectionEfficiency * 100).toFixed(0)}%`)
  }

  if (metrics.baselineScenario) {
    const scenarios: Record<string, string> = {
      'natural_decomposition': 'Natural decomposition',
      'wildfire': 'Wildfire',
      'prescribed_burn': 'Prescribed burn',
      'mulching': 'Mulching'
    }
    parts.push(`Scenario: ${scenarios[metrics.baselineScenario] || metrics.baselineScenario}`)
  }

  return parts.join(' • ')
}

/**
 * Format carbon impact data
 */
function formatCarbonImpact(impact: CarbonImpact): string {
  const parts: string[] = []

  if (impact.emissionsAvoided !== undefined) {
    parts.push(`Avoided: ${impact.emissionsAvoided} tons CO2e`)
  }

  if (impact.soilCarbonChange !== undefined) {
    const change = impact.soilCarbonChange
    const direction = change >= 0 ? '+' : ''
    parts.push(`Soil: ${direction}${change} tons CO2e`)
  }

  return parts.join(' • ')
}

/**
 * Format attached information array
 */
function formatAttachedInformation(docs: string[]): string {
  if (!Array.isArray(docs) || docs.length === 0) return '[]'

  if (docs.length <= 2) {
    return `${docs.length} docs: ${docs.join(', ')}`
  }

  // Shorten document names for display
  const shortDocs = docs.map(doc => {
    if (doc.length > 20) {
      if (doc.includes('permit')) return 'Harvest permit'
      if (doc.includes('inspection')) return 'Quality inspection'
      if (doc.includes('transport')) return 'Transport doc'
      return doc.substring(0, 17) + '...'
    }
    return doc
  })

  return `${docs.length} docs: ${shortDocs.slice(0, 2).join(', ')}${docs.length > 2 ? `, +${docs.length - 2} more` : ''}`
}

/**
 * Format processing history array
 */
function formatProcessingHistory(history: string[]): string {
  if (!Array.isArray(history) || history.length === 0) return '[]'

  const processes = history.map(id => {
    if (id.includes('HARVEST')) return 'Harvest'
    if (id.includes('TRANSPORT')) return 'Transport'
    if (id.includes('PROCESSING')) return 'Processing'
    if (id.includes('MILL')) return 'Mill'
    if (id.includes('DRY')) return 'Drying'
    return id.split('-').pop() || id
  })

  return `${history.length} steps: ${processes.join(' → ')}`
}

/**
 * Format LCFS pathway summary array
 */
function formatPathwaySummary(summaries: PathwaySummaryItem[]): string {
  if (!Array.isArray(summaries) || summaries.length === 0) return '[]'

  const formatted = summaries.map(item => {
    const pathwayId = item.pathwayId || 'Unknown'
    const volume = item.totalVolume ? `${(item.totalVolume / 1000).toFixed(0)}k gal` : ''
    const credits = item.creditsGenerated ? `${(item.creditsGenerated / 1000000).toFixed(2)}M credits` : ''
    return `${pathwayId}: ${[volume, credits].filter(Boolean).join(', ')}`
  })

  if (summaries.length <= 2) {
    return formatted.join(' | ')
  }
  return `${summaries.length} pathways: ${formatted[0]} (+${summaries.length - 1} more)`
}

interface PathwaySummaryItem {
  pathwayId?: string
  feedstockType?: string
  transactionCount?: number
  totalVolume?: number
  creditsGenerated?: number
}

/**
 * Format calculation parameters object
 */
function formatCalculationParameters(params: CalculationParameters): string {
  const parts: string[] = []

  if (params.conversionFactor !== undefined) {
    const unit = params.conversionFactorUnit || 'MJ/gal'
    parts.push(`CF: ${params.conversionFactor} ${unit}`)
  }

  if (params.regulatoryBenchmark !== undefined) {
    const unit = params.benchmarkUnit || 'gCO2e/MJ'
    parts.push(`Benchmark: ${params.regulatoryBenchmark} ${unit}`)
  }

  if (params.defaultEER !== undefined) {
    parts.push(`EER: ${params.defaultEER}`)
  }

  return parts.join(' • ')
}

interface CalculationParameters {
  conversionFactor?: number
  conversionFactorUnit?: string
  regulatoryBenchmark?: number
  benchmarkUnit?: string
  defaultEER?: number
}

/**
 * Format an array of objects by identifying a key field to display
 */
function formatArrayOfObjects(items: Record<string, unknown>[], _fieldName?: string): string {
  if (items.length === 0) return '[]'

  // Identify the best key to use for display
  const keyPriority = ['id', 'pathwayId', 'transactionId', 'name', 'type', '@id', '@type']
  const firstItem = items[0]
  const itemKeys = Object.keys(firstItem)

  let displayKey = itemKeys.find(k => keyPriority.some(pk => k.toLowerCase().includes(pk.toLowerCase())))
  if (!displayKey) displayKey = itemKeys[0]

  // Format each item using the display key
  const formatted = items.map(item => {
    const keyValue = item[displayKey as string]
    if (typeof keyValue === 'string') {
      return keyValue.length > 25 ? keyValue.substring(0, 22) + '...' : keyValue
    }
    return String(keyValue)
  })

  if (items.length === 1) {
    return `[${formatted[0]}]`
  }
  if (items.length === 2) {
    return `[${formatted.join(', ')}]`
  }
  return `${items.length} items: ${formatted[0]}, ${formatted[1]} (+${items.length - 2} more)`
}

/**
 * Format physical arrangement object
 */
function formatPhysicalArrangement(arrangement: PhysicalArrangement): string {
  const parts: string[] = []

  if (arrangement.arrangementType) {
    const types: Record<string, string> = {
      'scattered': 'Scattered',
      'piled': 'Piled',
      'windrow': 'Windrow',
      'stacked': 'Stacked',
      'bundled': 'Bundled',
      'in_situ': 'In-place'
    }
    parts.push(types[arrangement.arrangementType] || arrangement.arrangementType)
  }

  if (arrangement.exposureConditions) {
    const conditions: Record<string, string> = {
      'covered': 'covered',
      'exposed': 'exposed',
      'partially_covered': 'partially covered'
    }
    parts.push(conditions[arrangement.exposureConditions] || arrangement.exposureConditions)
  }

  if (arrangement.groundContact !== undefined) {
    parts.push(arrangement.groundContact ? 'ground contact' : 'no ground contact')
  }

  let result = parts.join(', ')

  if (arrangement.arrangementDate) {
    const shortDate = formatDate(arrangement.arrangementDate).split(',')[0]
    result += ` (${shortDate})`
  }

  return result
}

/**
 * Format secondary identifiers array
 */
function formatSecondaryIdentifiers(identifiers: SecondaryIdentifier[]): string {
  if (!Array.isArray(identifiers) || identifiers.length === 0) return '[]'

  const formatted = identifiers.map(id => {
    const types: Record<string, string> = {
      'trip_ticket': 'Trip ticket',
      'rfid': 'RFID',
      'qr_code': 'QR code',
      'barcode': 'Barcode',
      'biometric': 'Biometric',
      'manual_id': 'Manual ID',
      'photo_documentation': 'Photo'
    }

    const type = types[id.identifierType] || id.identifierType
    const value = id.identifierValue.length > 15 ?
                 id.identifierValue.substring(0, 12) + '...' :
                 id.identifierValue
    const confidence = id.confidence ? ` (${id.confidence}%)` : ''

    return `${type}: ${value}${confidence}`
  })

  return formatted.join(' • ')
}

/**
 * Format reference IDs with icons
 */
function formatReferenceId(value: string, fieldName: string): string {
  const icons: Record<string, string> = {
    'GeographicDataId': '📍',
    'materialTypeId': '🌲',
    'harvesterId': '🏢',
    'operatorId': '👤',
    'identificationMethodId': '🔍'
  }

  let icon = ''
  for (const [pattern, iconChar] of Object.entries(icons)) {
    if (fieldName.includes(pattern) || fieldName === pattern) {
      icon = iconChar + ' '
      break
    }
  }

  return `${icon}${value}`
}

/**
 * Main BOOST field formatter - determines the best way to display each field
 */
export function formatBoostField(value: unknown, fieldName = ''): string {
  // Handle null/undefined
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'

  // Handle strings
  if (typeof value === 'string') {
    // Format dates
    if (fieldName.includes('Timestamp') || fieldName.includes('Date')) {
      if (value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
        return `"${formatDate(value)}"`
      }
    }

    // Format reference IDs with icons
    if (fieldName.includes('Id') && value.match(/^[A-Z]+-[A-Z0-9-_]+$/)) {
      return `"${formatReferenceId(value, fieldName)}"`
    }

    // Regular string formatting
    if (value.length > 100) return `"${value.substring(0, 97)}..."`
    return `"${value}"`
  }

  // Handle arrays
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'

    if (fieldName === 'attachedInformation') {
      return formatAttachedInformation(value as string[])
    }

    if (fieldName === 'processingHistory') {
      return formatProcessingHistory(value as string[])
    }

    if (fieldName === 'secondaryIdentifiers') {
      return formatSecondaryIdentifiers(value as SecondaryIdentifier[])
    }

    if (fieldName === 'pathwaySummary') {
      return formatPathwaySummary(value as PathwaySummaryItem[])
    }

    // Handle arrays of objects - show meaningful summary
    if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
      return formatArrayOfObjects(value as Record<string, unknown>[], fieldName)
    }

    // Default array formatting for primitives
    if (value.length <= 2) {
      return JSON.stringify(value)
    }
    const firstItem = typeof value[0] === 'string' ? `"${value[0]}"` : String(value[0])
    return `[${firstItem}, ... +${value.length - 1} more]`
  }

  // Handle objects
  if (typeof value === 'object') {
    const keys = Object.keys(value as object)

    // Special BOOST object formatting
    if (fieldName === '@context') {
      return 'JSON-LD metadata'
    }

    if (fieldName === 'alternativeFateMetrics') {
      return formatAlternativeFateMetrics(value as AlternativeFateMetrics)
    }

    if (fieldName === 'carbonImpact') {
      return formatCarbonImpact(value as CarbonImpact)
    }

    if (fieldName === 'physicalArrangement') {
      return formatPhysicalArrangement(value as PhysicalArrangement)
    }

    if (fieldName === 'calculationParameters') {
      return formatCalculationParameters(value as CalculationParameters)
    }

    // Handle small objects with @type
    if (keys.includes('@type') && keys.length <= 2) {
      return JSON.stringify(value, null, 2)
    }

    // Default object formatting for small objects
    if (keys.length <= 3) {
      const simplified: Record<string, unknown> = {}
      const obj = value as Record<string, unknown>
      keys.forEach(key => {
        const val = obj[key]
        if (typeof val === 'string' && val.length > 30) {
          simplified[key] = val.substring(0, 27) + '...'
        } else {
          simplified[key] = val
        }
      })
      return JSON.stringify(simplified, null, 2)
    }

    // Large objects - show key summary
    const sampleKeys = keys.slice(0, 2)
    const keyList = sampleKeys.join(', ')
    const moreCount = keys.length - sampleKeys.length
    return `{${keyList}${moreCount > 0 ? `, +${moreCount} more` : ''}}`
  }

  return String(value)
}
