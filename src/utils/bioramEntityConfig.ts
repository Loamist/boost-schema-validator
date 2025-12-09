/**
 * BioRAM Entity Configuration
 * Extended configuration for BioRAM entities - handles the case where
 * CPUC/IOU reality differs significantly from BOOST schema
 *
 * Key difference from LCFS:
 * - LCFS: CARB fields are mostly a subset of BOOST
 * - BioRAM: Reality has fields BOOST doesn't have, and BOOST has fields reality doesn't use
 */

export interface BioramEntityConfig {
  title: string
  subtitle: string
  realityLabel: string
  realityDescription: string
  // Fields that exist in BOTH reality and BOOST (use BOOST names)
  sharedFields: string[]
  // Fields required in real CPUC/IOU exports but NOT in BOOST schema
  realityOnlyFields: string[]
  // Fields required in BOOST schema but NOT used in real BioRAM
  boostOnlyFields: string[]
  // Fields that would be nice to have from reality (optional)
  fieldComplexity: {
    reasonable: string[]
    robust: string[]
  }
}

// Entity-specific configurations for BioRAM compliance checking
export const bioramEntityConfigs: Record<string, BioramEntityConfig> = {
  'BioramPathway': {
    title: 'BioRAM Pathway - CPUC/IOU vs BOOST',
    subtitle: 'Comparison: Real BioRAM Program Rules vs BOOST Schema Requirements',
    realityLabel: 'CPUC/IOU Required Fields',
    realityDescription: 'Fields tracked in actual BioRAM program compliance (SB 859/901/1109)',
    sharedFields: [
      'fuelType',
      'targetFacilityType',
      'geographicScope',
      'fireHazardZoneEligibility',
      'eligibilityStatus',
      'sourceRegion',
      'haulDistanceLimit',
      'seasonalAvailability'
    ],
    realityOnlyFields: [
      'hhzTier',
      'hhzFuelRequirements',
      'programVersion',
      'applicableLegislation',
      'compliancePriceMWh',
      'penaltyPriceMWh',
      'serviceTerritory'
    ],
    boostOnlyFields: [
      'pathwayId',        // BioRAM doesn't have pathway IDs like LCFS
      'carbonIntensity',  // Not tracked in BioRAM (it's RPS, not LCFS)
      'certificationDate', // Facilities get certified, not pathways
      'expirationDate',   // No pathway expiration concept
      'cecVersion'        // Not a real versioned pathway system
    ],
    fieldComplexity: {
      reasonable: [
        'lastUpdated'
      ],
      robust: []
    }
  },
  'BioramReporting': {
    title: 'BioRAM Reporting - CPUC/IOU vs BOOST',
    subtitle: 'Comparison: Real IOU Quarterly Reports vs BOOST Schema Requirements',
    realityLabel: 'CPUC/IOU Required Fields',
    realityDescription: 'Fields required in quarterly reports to IOUs per BioRAM contract terms',
    sharedFields: [
      'facilityEntityId',
      'bioramContractId',
      'reportingPeriod',
      'totalBiomassVolume',
      'totalEnergyGenerated',
      'complianceStatus',
      'submissionDate',
      'verificationRequired',
      'verificationDate',
      'reportingDeadline',
      'fuelSourcingSummary',
      'performanceMetrics',
      'financialSummary'
    ],
    realityOnlyFields: [
      'hhzPercentageTarget',
      'hhzPercentageActual',
      'totalHhzDeliveredBDT',
      'totalHhzUsageToDateBDT',
      'hhzTierBreakdown',
      'serviceTerritory'
    ],
    boostOnlyFields: [
      'reportingId',           // BOOST internal construct
      'overallEfficiency',     // Tracked as capacityFactor in reality
      'efficiencyTarget',      // Not a standard BioRAM metric
      'VerificationStatementId', // BOOST internal linkage
      'transactionIds',        // BOOST internal linkage
      'environmentalImpact'    // Not tracked this way in BioRAM
    ],
    fieldComplexity: {
      reasonable: [
        'lastUpdated'
      ],
      robust: []
    }
  }
}

/**
 * Normalize entity name to match config keys
 * Handles: bioram_pathway -> BioramPathway, etc.
 */
export function normalizeBioramEntityName(name: string): string {
  const normalized = name
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('')

  // Special handling for Bioram prefix
  if (normalized.toLowerCase().startsWith('bioram')) {
    const remainder = normalized.slice(6)
    return 'Bioram' + remainder.charAt(0).toUpperCase() + remainder.slice(1)
  }

  return normalized
}

/**
 * Find matching config for entity name (case-insensitive)
 */
export function findBioramEntityConfig(entityName: string): BioramEntityConfig | null {
  // Direct match first
  if (bioramEntityConfigs[entityName]) {
    return bioramEntityConfigs[entityName]
  }

  // Try normalized name
  const normalized = normalizeBioramEntityName(entityName)
  if (bioramEntityConfigs[normalized]) {
    return bioramEntityConfigs[normalized]
  }

  // Try case-insensitive match
  const lowerName = entityName.toLowerCase()
  for (const [key, config] of Object.entries(bioramEntityConfigs)) {
    if (key.toLowerCase() === lowerName) {
      return config
    }
  }

  return null
}

/**
 * Check if an entity is a BioRAM entity
 */
export function isBioramEntity(entityName: string): boolean {
  return findBioramEntityConfig(entityName) !== null
}

/**
 * Calculate BioRAM reality compliance status for given data
 * Checks if all CPUC/IOU required fields are present
 */
export function calculateBioramRealityCompliance(
  entityName: string,
  data: Record<string, unknown>
): {
  isCompliant: boolean
  providedCount: number
  requiredCount: number
  missingSharedFields: string[]
  missingRealityFields: string[]
  presentRealityOnlyFields: string[]
} {
  const config = findBioramEntityConfig(entityName)

  if (!config) {
    return {
      isCompliant: true,
      providedCount: 0,
      requiredCount: 0,
      missingSharedFields: [],
      missingRealityFields: [],
      presentRealityOnlyFields: []
    }
  }

  const missingSharedFields: string[] = []
  const missingRealityFields: string[] = []
  const presentRealityOnlyFields: string[] = []
  let providedCount = 0

  // Check shared fields
  for (const field of config.sharedFields) {
    const hasValue = Object.prototype.hasOwnProperty.call(data, field) &&
                     data[field] !== null &&
                     data[field] !== undefined

    if (hasValue) {
      providedCount++
    } else {
      missingSharedFields.push(field)
    }
  }

  // Check reality-only fields
  for (const field of config.realityOnlyFields) {
    const hasValue = Object.prototype.hasOwnProperty.call(data, field) &&
                     data[field] !== null &&
                     data[field] !== undefined

    if (hasValue) {
      providedCount++
      presentRealityOnlyFields.push(field)
    } else {
      missingRealityFields.push(field)
    }
  }

  const totalRequired = config.sharedFields.length + config.realityOnlyFields.length

  return {
    isCompliant: missingSharedFields.length === 0 && missingRealityFields.length === 0,
    providedCount,
    requiredCount: totalRequired,
    missingSharedFields,
    missingRealityFields,
    presentRealityOnlyFields
  }
}

/**
 * Get BOOST-only fields that are missing from data
 * These are fields BOOST requires but reality doesn't use
 */
export function getBoostOnlyFieldsStatus(
  entityName: string,
  data: Record<string, unknown>
): {
  missingBoostOnly: string[]
  presentBoostOnly: string[]
} {
  const config = findBioramEntityConfig(entityName)

  if (!config) {
    return { missingBoostOnly: [], presentBoostOnly: [] }
  }

  const missingBoostOnly: string[] = []
  const presentBoostOnly: string[] = []

  for (const field of config.boostOnlyFields) {
    const hasValue = Object.prototype.hasOwnProperty.call(data, field) &&
                     data[field] !== null &&
                     data[field] !== undefined

    if (hasValue) {
      presentBoostOnly.push(field)
    } else {
      missingBoostOnly.push(field)
    }
  }

  return { missingBoostOnly, presentBoostOnly }
}
