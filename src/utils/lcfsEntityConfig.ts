/**
 * LCFS Entity Configuration
 * Shared configuration for LCFS entities used by DataGapAnalysis and ValidationResults
 */

export interface EntityConfig {
  title: string
  subtitle: string
  carbLabel: string
  carbDescription: string
  carbRequiredFields: string[]
  fieldComplexity: {
    reasonable: string[]
    robust: string[]
  }
}

// Entity-specific configurations for LCFS compliance checking
export const lcfsEntityConfigs: Record<string, EntityConfig> = {
  'LCFSPathway': {
    title: 'LCFS Pathway - AFP vs BOOST',
    subtitle: 'Comparison: Current AFP Pathway Submission vs BOOST Requirements',
    carbLabel: 'Standard LCFS/AFP Fields',
    carbDescription: 'Fields already collected in current AFP portal submissions',
    carbRequiredFields: [
      'pathwayId',
      'pathwayType',
      'feedstockCategory',
      'fuelProduct',
      'facilityLocation',
      'carbonIntensity',
      'energyEconomyRatio',
      'certificationDate',
      'verificationStatus',
      'caGreetVersion'
    ],
    fieldComplexity: {
      reasonable: [
        'facilityCapacity',
        'geographicScope',
        'expirationDate'
      ],
      robust: [
        'processDescription',
        'lastUpdated'
      ]
    }
  },
  'LCFSReporting': {
    title: 'LCFS Reporting - CARB Required vs BOOST Enhanced',
    subtitle: 'Comparison: CARB Quarterly Reporting Requirements vs BOOST Enhancements',
    carbLabel: 'CARB-Required Fields',
    carbDescription: 'Fields mandated by Cal. Code Regs. Tit. 17, § 95491 for quarterly reporting',
    carbRequiredFields: [
      'reportingId',
      'regulatedEntityId',
      'reportingPeriod',
      'totalFuelVolume',
      'totalCreditsGenerated',
      'totalDeficitsIncurred',
      'netPosition',
      'complianceStatus',
      'submissionDate',
      'pathwaySummary'
    ],
    fieldComplexity: {
      reasonable: [
        'verificationRequired',
        'reportingDeadline',
        'calculationParameters'
      ],
      robust: [
        'verificationDate',
        'VerificationStatementId',
        'transactionIds',
        'complianceMetrics',
        'lastUpdated'
      ]
    }
  }
}

/**
 * Normalize entity name to match config keys
 * Handles: lcfs_pathway -> LCFSPathway, LcfsPathway -> LCFSPathway, etc.
 */
export function normalizeEntityName(name: string): string {
  // Remove underscores and convert to title case
  const normalized = name
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('')

  // Special handling for LCFS prefix (should be all caps)
  if (normalized.toLowerCase().startsWith('lcfs')) {
    const remainder = normalized.slice(4)
    // Capitalize first letter of remainder (e.g., 'reporting' -> 'Reporting')
    return 'LCFS' + remainder.charAt(0).toUpperCase() + remainder.slice(1)
  }

  return normalized
}

/**
 * Find matching config for entity name (case-insensitive)
 */
export function findLcfsEntityConfig(entityName: string): EntityConfig | null {
  // Direct match first
  if (lcfsEntityConfigs[entityName]) {
    return lcfsEntityConfigs[entityName]
  }

  // Try normalized name
  const normalized = normalizeEntityName(entityName)
  if (lcfsEntityConfigs[normalized]) {
    return lcfsEntityConfigs[normalized]
  }

  // Try case-insensitive match
  const lowerName = entityName.toLowerCase()
  for (const [key, config] of Object.entries(lcfsEntityConfigs)) {
    if (key.toLowerCase() === lowerName) {
      return config
    }
  }

  return null
}

/**
 * Check if an entity is an LCFS entity
 */
export function isLcfsEntity(entityName: string): boolean {
  return findLcfsEntityConfig(entityName) !== null
}

/**
 * Calculate LCFS compliance status for given data
 * Returns the number of CARB required fields that are present
 */
export function calculateLcfsCompliance(
  entityName: string,
  data: Record<string, unknown>
): { isCompliant: boolean; providedCount: number; requiredCount: number; missingFields: string[] } {
  const config = findLcfsEntityConfig(entityName)

  if (!config) {
    return { isCompliant: true, providedCount: 0, requiredCount: 0, missingFields: [] }
  }

  const missingFields: string[] = []
  let providedCount = 0

  for (const field of config.carbRequiredFields) {
    const hasValue = Object.prototype.hasOwnProperty.call(data, field) &&
                     data[field] !== null &&
                     data[field] !== undefined

    if (hasValue) {
      providedCount++
    } else {
      missingFields.push(field)
    }
  }

  return {
    isCompliant: missingFields.length === 0,
    providedCount,
    requiredCount: config.carbRequiredFields.length,
    missingFields
  }
}
