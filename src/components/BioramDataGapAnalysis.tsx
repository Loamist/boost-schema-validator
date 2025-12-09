/**
 * BioRAM Data Gap Analysis Component
 * Displays three-way comparison: Shared fields, BioRAM-specific fields, and BOOST-only fields
 *
 * Key difference from LCFS: BioRAM has a Venn diagram relationship with BOOST
 * - Shared: Fields in both BioRAM program operations AND BOOST schema
 * - BioRAM-specific: Fields tracked in real BioRAM operations but not in BOOST (potential future additions)
 * - BOOST-only: Fields in BOOST schema but not used in actual BioRAM program
 */
import { ValidationResult } from '../types'
import { escapeHtml } from '../utils/fieldFormatting'
import {
  BioramEntityConfig,
  findBioramEntityConfig
} from '../utils/bioramEntityConfig'

interface BioramDataGapAnalysisProps {
  entityName: string
  data: Record<string, unknown>
  validationResult: ValidationResult
  // schema prop kept for API compatibility with DataGapAnalysis, but not used
  // BioRAM gap analysis uses bioramEntityConfig instead of schema
  schema?: {
    required?: string[]
    properties?: Record<string, unknown>
  }
}

interface FieldMetadata {
  description: string
  source: string
  collectionMethod?: string
  notes?: string
}

// Field metadata for BioRAM entities
const bioramFieldMetadata: Record<string, Record<string, FieldMetadata>> = {
  'BioramPathway': {
    // Shared fields
    fuelType: {
      description: 'Type of biomass fuel (e.g., forest harvest residue, sawmill residual)',
      source: 'Fuel supply contracts',
      collectionMethod: 'Facility fuel intake records'
    },
    targetFacilityType: {
      description: 'Type of facility using the fuel (e.g., biomass power plant)',
      source: 'CEC certification',
      collectionMethod: 'Facility registration'
    },
    geographicScope: {
      description: 'Geographic region for fuel sourcing eligibility',
      source: 'CAL FIRE maps + IOU contract',
      collectionMethod: 'Contract terms and sourcing area definition'
    },
    fireHazardZoneEligibility: {
      description: 'Eligible High Hazard Zone tiers for fuel sourcing',
      source: 'CAL FIRE Tree Mortality maps',
      collectionMethod: 'Annual CAL FIRE HHZ tier updates'
    },
    eligibilityStatus: {
      description: 'Current eligibility status for BioRAM program participation',
      source: 'IOU contract status',
      collectionMethod: 'Contract management system'
    },
    sourceRegion: {
      description: 'Primary region where biomass fuel is sourced',
      source: 'Fuel delivery documentation',
      collectionMethod: 'Aggregated from delivery tickets'
    },
    haulDistanceLimit: {
      description: 'Maximum allowable haul distance for fuel deliveries (miles)',
      source: 'BioRAM contract terms',
      collectionMethod: 'Contract specification'
    },
    seasonalAvailability: {
      description: 'Seasonal patterns affecting fuel availability',
      source: 'Historical fuel supply data',
      collectionMethod: 'Supplier reporting and historical analysis'
    },
    // BioRAM-specific fields (not in BOOST)
    hhzTier: {
      description: 'High Hazard Zone tier classification (Tier 1, Tier 2, or Tier 3)',
      source: 'CAL FIRE Tree Mortality Task Force',
      collectionMethod: 'CAL FIRE annual HHZ map updates',
      notes: 'Tier 1 = highest priority dead/dying trees'
    },
    hhzFuelRequirements: {
      description: 'Minimum HHZ fuel percentage requirements per contract year',
      source: 'IOU BioRAM contract',
      collectionMethod: 'Contract terms (typically 80% HHZ by year 4+)',
      notes: 'Ramps up over contract term: 40% → 50% → 60% → 80%'
    },
    programVersion: {
      description: 'Applicable BioRAM program version (SB 859, SB 901, SB 1109)',
      source: 'California Legislature',
      collectionMethod: 'Contract effective date determines version'
    },
    applicableLegislation: {
      description: 'Specific legislation enabling this BioRAM pathway',
      source: 'California Public Resources Code',
      collectionMethod: 'Legal/regulatory reference'
    },
    compliancePriceMWh: {
      description: 'Contract price per MWh for delivered energy',
      source: 'BioRAM PPA (Power Purchase Agreement)',
      collectionMethod: 'Contract pricing terms'
    },
    penaltyPriceMWh: {
      description: 'Penalty price if HHZ requirements not met',
      source: 'BioRAM contract penalty clause',
      collectionMethod: 'Contract penalty provisions'
    },
    serviceTerritory: {
      description: 'IOU service territory (PG&E, SCE, or SDG&E)',
      source: 'BioRAM contract',
      collectionMethod: 'Contract counterparty'
    },
    // BOOST-only fields (in BOOST but not used in BioRAM)
    pathwayId: {
      description: 'BOOST internal pathway identifier',
      source: 'BOOST system',
      collectionMethod: 'Auto-generated',
      notes: 'BioRAM doesn\'t use pathway IDs like LCFS does'
    },
    carbonIntensity: {
      description: 'Carbon intensity score (gCO2e/MJ)',
      source: 'Lifecycle analysis',
      collectionMethod: 'Not applicable - BioRAM is RPS, not LCFS',
      notes: 'BioRAM tracks renewable energy, not carbon intensity'
    },
    certificationDate: {
      description: 'Date pathway was certified',
      source: 'BOOST system',
      collectionMethod: 'Not applicable - facilities get certified, not pathways',
      notes: 'BioRAM certifies facilities via CEC-RPS, not pathways'
    },
    expirationDate: {
      description: 'Pathway certification expiration',
      source: 'BOOST system',
      collectionMethod: 'Not applicable',
      notes: 'No pathway expiration concept in BioRAM'
    },
    cecVersion: {
      description: 'CEC pathway version number',
      source: 'BOOST system',
      collectionMethod: 'Not applicable',
      notes: 'BioRAM doesn\'t have versioned pathways like LCFS'
    }
  },
  'BioramReporting': {
    // Shared fields
    facilityEntityId: {
      description: 'Unique identifier for the biomass facility',
      source: 'CEC RPS certification',
      collectionMethod: 'Facility registration system'
    },
    bioramContractId: {
      description: 'BioRAM contract identifier with IOU',
      source: 'IOU contract management',
      collectionMethod: 'Contract execution'
    },
    reportingPeriod: {
      description: 'Quarterly reporting period (e.g., 2025-Q3)',
      source: 'Calendar',
      collectionMethod: 'System-generated based on report date'
    },
    totalBiomassVolume: {
      description: 'Total biomass fuel consumed in BDT (Bone Dry Tons)',
      source: 'Facility fuel intake records',
      collectionMethod: 'Weigh scale tickets with moisture adjustment'
    },
    totalEnergyGenerated: {
      description: 'Total electricity generated in MWh',
      source: 'Facility generation meters',
      collectionMethod: 'Revenue meter readings'
    },
    complianceStatus: {
      description: 'Current compliance status (compliant, non-compliant, pending)',
      source: 'IOU compliance review',
      collectionMethod: 'Quarterly compliance determination'
    },
    submissionDate: {
      description: 'Date report was submitted to IOU',
      source: 'Reporting system',
      collectionMethod: 'Submission timestamp'
    },
    verificationRequired: {
      description: 'Whether third-party verification is required',
      source: 'Contract terms',
      collectionMethod: 'Based on contract verification requirements'
    },
    verificationDate: {
      description: 'Date third-party verification was completed',
      source: 'Verification provider',
      collectionMethod: 'Verifier submission'
    },
    reportingDeadline: {
      description: 'Deadline for quarterly report submission',
      source: 'Contract terms',
      collectionMethod: 'Typically 30-45 days after quarter end'
    },
    fuelSourcingSummary: {
      description: 'Summary of fuel sources, types, and volumes',
      source: 'Facility fuel records',
      collectionMethod: 'Aggregated from delivery tickets'
    },
    performanceMetrics: {
      description: 'Facility performance metrics (capacity factor, availability)',
      source: 'Facility operations',
      collectionMethod: 'Calculated from generation and outage data'
    },
    financialSummary: {
      description: 'Financial summary (contract value, fuel costs)',
      source: 'Facility accounting',
      collectionMethod: 'Accounting system export'
    },
    // BioRAM-specific fields (not in BOOST)
    hhzPercentageTarget: {
      description: 'Contract-required HHZ fuel percentage for this period',
      source: 'BioRAM contract schedule',
      collectionMethod: 'Contract terms (ramps up over time)',
      notes: 'Critical metric - determines compliance status'
    },
    hhzPercentageActual: {
      description: 'Actual HHZ fuel percentage delivered this period',
      source: 'Facility fuel records + CAL FIRE HHZ maps',
      collectionMethod: 'Calculated from verified HHZ deliveries',
      notes: 'Must meet or exceed target for compliance'
    },
    totalHhzDeliveredBDT: {
      description: 'Total HHZ-sourced biomass delivered in BDT',
      source: 'Delivery tickets with HHZ verification',
      collectionMethod: 'Sum of verified HHZ deliveries'
    },
    totalHhzUsageToDateBDT: {
      description: 'Cumulative HHZ fuel usage since contract start',
      source: 'Historical fuel records',
      collectionMethod: 'Running total from all quarterly reports'
    },
    hhzTierBreakdown: {
      description: 'Breakdown of HHZ fuel by tier (Tier1, Tier2, NonHHZ)',
      source: 'Delivery tickets + CAL FIRE maps',
      collectionMethod: 'Each delivery mapped to HHZ tier based on origin',
      notes: 'Tier 1 is most valuable for compliance'
    },
    serviceTerritory: {
      description: 'IOU service territory (PG&E, SCE, or SDG&E)',
      source: 'BioRAM contract',
      collectionMethod: 'Contract counterparty'
    },
    // BOOST-only fields (in BOOST but not used in BioRAM)
    reportingId: {
      description: 'BOOST internal report identifier',
      source: 'BOOST system',
      collectionMethod: 'Auto-generated',
      notes: 'Internal BOOST construct'
    },
    overallEfficiency: {
      description: 'Overall facility efficiency metric',
      source: 'BOOST calculation',
      collectionMethod: 'Not standard in BioRAM - use capacityFactor instead',
      notes: 'BioRAM tracks capacity factor, not overall efficiency'
    },
    efficiencyTarget: {
      description: 'Target efficiency percentage',
      source: 'BOOST schema',
      collectionMethod: 'Not a standard BioRAM metric',
      notes: 'Not tracked in real BioRAM reporting'
    },
    VerificationStatementId: {
      description: 'Link to BOOST VerificationStatement entity',
      source: 'BOOST system',
      collectionMethod: 'Internal BOOST linkage',
      notes: 'BOOST-specific entity reference'
    },
    transactionIds: {
      description: 'Array of BOOST Transaction entity IDs',
      source: 'BOOST system',
      collectionMethod: 'Internal BOOST linkage',
      notes: 'BOOST-specific entity references'
    },
    environmentalImpact: {
      description: 'Environmental impact metrics',
      source: 'BOOST schema',
      collectionMethod: 'Not tracked this way in BioRAM',
      notes: 'BioRAM focuses on HHZ compliance, not environmental metrics'
    }
  }
}

interface FieldStatus {
  field: string
  value?: unknown
  isProvided: boolean
  metadata?: FieldMetadata
}

interface BioramGapAnalysis {
  // Shared fields (in both BioRAM program and BOOST)
  sharedProvided: FieldStatus[]
  sharedMissing: FieldStatus[]
  // BioRAM-specific fields (in BioRAM program but not BOOST)
  bioramSpecificProvided: FieldStatus[]
  bioramSpecificMissing: FieldStatus[]
  // BOOST-only fields (in BOOST but not used in BioRAM)
  boostOnlyProvided: FieldStatus[]
  boostOnlyMissing: FieldStatus[]
  // Summary stats
  cpucCompliance: {
    isCompliant: boolean
    providedCount: number
    requiredCount: number
    percentage: number
  }
  boostCompleteness: {
    isComplete: boolean
    providedCount: number
    requiredCount: number
    percentage: number
  }
}

export default function BioramDataGapAnalysis({
  entityName,
  data,
  validationResult,
  schema: _schema // kept for API compatibility, uses bioramEntityConfig instead
}: BioramDataGapAnalysisProps) {
  // Detect entity type from JSON data
  const dataType = data['@type'] as string | undefined
  const currentEntityType = dataType || entityName

  // Find matching config
  const config = findBioramEntityConfig(currentEntityType)
  if (!config) {
    return (
      <section className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="alert alert-info">
            <svg className="w-6 h-6 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
            </svg>
            <span>BioRAM gap analysis not available for entity type: {currentEntityType}</span>
          </div>
        </div>
      </section>
    )
  }

  // Get field metadata for this entity type
  const normalizedType = currentEntityType.replace(/[-_]/g, '').toLowerCase()
  const metadataKey = Object.keys(bioramFieldMetadata).find(
    k => k.toLowerCase() === normalizedType
  ) || currentEntityType
  const fieldMetadata = bioramFieldMetadata[metadataKey] || {}

  // Analyze the data
  const analysis = analyzeBioramGaps(data, config, fieldMetadata)

  return (
    <section className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="space-y-6">
          <SummarySection
            analysis={analysis}
            config={config}
            validationResult={validationResult}
          />
          <CpucComplianceSection analysis={analysis} config={config} />
          <BioramSpecificSection analysis={analysis} />
          <BoostOnlySection analysis={analysis} />
        </div>
      </div>
    </section>
  )
}

function analyzeBioramGaps(
  data: Record<string, unknown>,
  config: BioramEntityConfig,
  fieldMetadata: Record<string, FieldMetadata>
): BioramGapAnalysis {
  const hasValue = (field: string) =>
    Object.prototype.hasOwnProperty.call(data, field) &&
    data[field] !== null &&
    data[field] !== undefined

  // Analyze shared fields
  const sharedProvided: FieldStatus[] = []
  const sharedMissing: FieldStatus[] = []
  for (const field of config.sharedFields) {
    if (hasValue(field)) {
      sharedProvided.push({ field, value: data[field], isProvided: true, metadata: fieldMetadata[field] })
    } else {
      sharedMissing.push({ field, isProvided: false, metadata: fieldMetadata[field] })
    }
  }

  // Analyze BioRAM-specific fields (realityOnlyFields renamed conceptually)
  const bioramSpecificProvided: FieldStatus[] = []
  const bioramSpecificMissing: FieldStatus[] = []
  for (const field of config.realityOnlyFields) {
    if (hasValue(field)) {
      bioramSpecificProvided.push({ field, value: data[field], isProvided: true, metadata: fieldMetadata[field] })
    } else {
      bioramSpecificMissing.push({ field, isProvided: false, metadata: fieldMetadata[field] })
    }
  }

  // Analyze BOOST-only fields
  const boostOnlyProvided: FieldStatus[] = []
  const boostOnlyMissing: FieldStatus[] = []
  for (const field of config.boostOnlyFields) {
    if (hasValue(field)) {
      boostOnlyProvided.push({ field, value: data[field], isProvided: true, metadata: fieldMetadata[field] })
    } else {
      boostOnlyMissing.push({ field, isProvided: false, metadata: fieldMetadata[field] })
    }
  }

  // Calculate CPUC/IOU compliance (shared + BioRAM-specific)
  const cpucRequired = config.sharedFields.length + config.realityOnlyFields.length
  const cpucProvided = sharedProvided.length + bioramSpecificProvided.length
  const cpucPercentage = cpucRequired > 0 ? Math.round((cpucProvided / cpucRequired) * 100) : 100

  // Calculate BOOST completeness (shared + BOOST-only)
  const boostRequired = config.sharedFields.length + config.boostOnlyFields.length
  const boostProvided = sharedProvided.length + boostOnlyProvided.length
  const boostPercentage = boostRequired > 0 ? Math.round((boostProvided / boostRequired) * 100) : 100

  return {
    sharedProvided,
    sharedMissing,
    bioramSpecificProvided,
    bioramSpecificMissing,
    boostOnlyProvided,
    boostOnlyMissing,
    cpucCompliance: {
      isCompliant: sharedMissing.length === 0 && bioramSpecificMissing.length === 0,
      providedCount: cpucProvided,
      requiredCount: cpucRequired,
      percentage: cpucPercentage
    },
    boostCompleteness: {
      isComplete: sharedMissing.length === 0 && boostOnlyMissing.length === 0,
      providedCount: boostProvided,
      requiredCount: boostRequired,
      percentage: boostPercentage
    }
  }
}

function SummarySection({
  analysis,
  config,
  validationResult
}: {
  analysis: BioramGapAnalysis
  config: BioramEntityConfig
  validationResult: ValidationResult
}) {
  const cpucColor = analysis.cpucCompliance.percentage >= 100 ? 'text-success' : 'text-error'
  const boostColor = analysis.boostCompleteness.percentage >= 80 ? 'text-success' :
                     analysis.boostCompleteness.percentage >= 50 ? 'text-warning' : 'text-error'

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            {config.title}
          </h3>
          <p className="text-base-content/70 mt-1">{config.subtitle}</p>
        </div>
        {validationResult.valid ? (
          <span className="badge badge-success gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            BOOST Valid
          </span>
        ) : (
          <span className="badge badge-warning gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            BOOST Gaps
          </span>
        )}
      </div>

      <div className="stats stats-horizontal shadow w-full bg-base-100">
        <div className="stat">
          <div className="stat-figure text-primary">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <div className="stat-title">Fields Provided</div>
          <div className="stat-value text-primary">
            {analysis.sharedProvided.length + analysis.bioramSpecificProvided.length + analysis.boostOnlyProvided.length}
          </div>
          <div className="stat-desc">Currently in submission</div>
        </div>

        <div className="stat">
          <div className={`stat-figure ${cpucColor}`}>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
          </div>
          <div className="stat-title">CPUC/IOU Compliance</div>
          <div className={`stat-value ${cpucColor}`}>{analysis.cpucCompliance.percentage}%</div>
          <div className="stat-desc">{analysis.cpucCompliance.providedCount}/{analysis.cpucCompliance.requiredCount} program fields</div>
        </div>

        <div className="stat">
          <div className={`stat-figure ${boostColor}`}>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
          <div className="stat-title">BOOST Completeness</div>
          <div className={`stat-value ${boostColor}`}>{analysis.boostCompleteness.percentage}%</div>
          <div className="stat-desc">{analysis.boostCompleteness.providedCount}/{analysis.boostCompleteness.requiredCount} schema fields</div>
        </div>
      </div>
    </div>
  )
}

function CpucComplianceSection({
  analysis,
  config
}: {
  analysis: BioramGapAnalysis
  config: BioramEntityConfig
}) {
  const allProvided = [...analysis.sharedProvided, ...analysis.bioramSpecificProvided]
  const allMissing = [...analysis.sharedMissing, ...analysis.bioramSpecificMissing]

  return (
    <div className="mb-6">
      {/* Status Alert */}
      {analysis.cpucCompliance.isCompliant ? (
        <div className="alert alert-success shadow-lg mb-4">
          <svg className="w-6 h-6 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          </svg>
          <div>
            <h4 className="font-bold">CPUC/IOU Compliant</h4>
            <p className="text-sm">{config.realityDescription}</p>
          </div>
        </div>
      ) : (
        <div className="alert alert-error shadow-lg mb-4">
          <svg className="w-6 h-6 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
          </svg>
          <div>
            <h4 className="font-bold">Missing CPUC/IOU Required Fields</h4>
            <p className="text-sm">{allMissing.length} field{allMissing.length !== 1 ? 's' : ''} needed for program compliance</p>
          </div>
        </div>
      )}

      {/* Missing Fields Table */}
      {allMissing.length > 0 && (
        <div className="card bg-base-100 shadow-lg border-2 border-error mb-4">
          <div className="card-body">
            <h5 className="card-title text-error flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              Missing CPUC/IOU Fields
              <span className="badge badge-error badge-sm">{allMissing.length}</span>
            </h5>
            <div className="overflow-x-auto">
              <table className="table table-zebra table-sm">
                <thead className="bg-error/10">
                  <tr>
                    <th>Field Name</th>
                    <th>Description</th>
                    <th>Data Source</th>
                  </tr>
                </thead>
                <tbody>
                  {allMissing.map(f => (
                    <tr key={f.field} className="hover:bg-base-200">
                      <td><code className="text-sm font-mono font-semibold text-error">{f.field}</code></td>
                      <td className="text-sm">{f.metadata?.description || 'No description'}</td>
                      <td className="text-sm">{f.metadata?.source || 'TBD'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Provided Fields Table */}
      {allProvided.length > 0 && (
        <div className="card bg-base-100 shadow-lg border border-success/20">
          <div className="card-body">
            <h5 className="card-title text-success flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              {config.realityLabel}
              <span className="badge badge-success badge-sm">{allProvided.length}</span>
            </h5>
            <p className="text-sm text-base-content/70 mb-3">{config.realityDescription}</p>
            <div className="overflow-x-auto">
              <table className="table table-zebra table-sm">
                <thead className="bg-success/10">
                  <tr>
                    <th>Field</th>
                    <th>Value</th>
                    <th>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {allProvided.map(f => (
                    <tr key={f.field} className="hover:bg-base-200">
                      <td><code className="text-sm font-mono font-semibold">{f.field}</code></td>
                      <td className="text-sm">{formatValue(f.value)}</td>
                      <td className="text-sm text-base-content/60">{f.metadata?.source || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function BioramSpecificSection({ analysis }: { analysis: BioramGapAnalysis }) {
  const allBioramSpecific = [...analysis.bioramSpecificProvided, ...analysis.bioramSpecificMissing]

  if (allBioramSpecific.length === 0) return null

  return (
    <div className="mb-6">
      <div className="alert alert-info shadow-lg mb-4">
        <svg className="w-6 h-6 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
        </svg>
        <div>
          <h4 className="font-bold">BioRAM-Specific Fields</h4>
          <p className="text-sm">Fields currently tracked in BioRAM program operations (potential future BOOST additions)</p>
        </div>
      </div>

      <div className="card bg-base-100 shadow-lg border border-info/20">
        <div className="card-body">
          <h5 className="card-title text-info flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            BioRAM Program Fields
            <span className="badge badge-info badge-sm">{allBioramSpecific.length}</span>
          </h5>
          <p className="text-sm text-base-content/70 mb-3">
            These fields are used in actual CPUC/IOU BioRAM reporting but are not currently part of the BOOST schema.
          </p>
          <div className="overflow-x-auto">
            <table className="table table-zebra table-sm">
              <thead className="bg-info/10">
                <tr>
                  <th>Field</th>
                  <th>Status</th>
                  <th>Description</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {allBioramSpecific.map(f => (
                  <tr key={f.field} className="hover:bg-base-200">
                    <td><code className="text-sm font-mono font-semibold">{f.field}</code></td>
                    <td>
                      {f.isProvided ? (
                        <span className="badge badge-success badge-sm">Provided</span>
                      ) : (
                        <span className="badge badge-warning badge-sm">Missing</span>
                      )}
                    </td>
                    <td className="text-sm">{f.metadata?.description || 'No description'}</td>
                    <td className="text-sm text-base-content/60">{f.metadata?.notes || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

function BoostOnlySection({ analysis }: { analysis: BioramGapAnalysis }) {
  const allBoostOnly = [...analysis.boostOnlyProvided, ...analysis.boostOnlyMissing]

  if (allBoostOnly.length === 0) return null

  return (
    <div className="mb-6">
      <div className="alert alert-warning shadow-lg mb-4">
        <svg className="w-6 h-6 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
        </svg>
        <div>
          <h4 className="font-bold">BOOST-Only Fields</h4>
          <p className="text-sm">Fields required by BOOST schema but not typically used in BioRAM program operations</p>
        </div>
      </div>

      <div className="card bg-base-100 shadow-lg border border-warning/20">
        <div className="card-body">
          <h5 className="card-title text-warning flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            BOOST Schema Fields
            <span className="badge badge-warning badge-sm">{allBoostOnly.length}</span>
          </h5>
          <p className="text-sm text-base-content/70 mb-3">
            These fields exist in the BOOST schema for standardization purposes but are not part of typical BioRAM program reporting.
          </p>
          <div className="overflow-x-auto">
            <table className="table table-zebra table-sm">
              <thead className="bg-warning/10">
                <tr>
                  <th>Field</th>
                  <th>Status</th>
                  <th>Description</th>
                  <th>Why Not Used in BioRAM</th>
                </tr>
              </thead>
              <tbody>
                {allBoostOnly.map(f => (
                  <tr key={f.field} className="hover:bg-base-200">
                    <td><code className="text-sm font-mono font-semibold">{f.field}</code></td>
                    <td>
                      {f.isProvided ? (
                        <span className="badge badge-success badge-sm">Provided</span>
                      ) : (
                        <span className="badge badge-ghost badge-sm">Not Used</span>
                      )}
                    </td>
                    <td className="text-sm">{f.metadata?.description || 'No description'}</td>
                    <td className="text-sm text-base-content/60">{f.metadata?.notes || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '-'
  }

  if (typeof value === 'string') {
    if (value.length > 50) {
      return `${escapeHtml(value.substring(0, 50))}...`
    }
    return escapeHtml(value)
  }

  if (typeof value === 'number') {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M`
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`
    }
    return value.toLocaleString()
  }

  if (typeof value === 'boolean') {
    return value ? '✓ true' : '✗ false'
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    if (value.length <= 2) return JSON.stringify(value)
    return `[${value.length} items]`
  }

  if (typeof value === 'object') {
    const keys = Object.keys(value as object)
    if (keys.length <= 2) return JSON.stringify(value)
    return `{${keys.length} fields}`
  }

  return String(value)
}
