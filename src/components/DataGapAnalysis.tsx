/**
 * Data Gap Analysis Component
 * Displays side-by-side comparison of AFP (current LCFS) vs BOOST requirements
 * Shows what fields are provided vs missing, categorized by collection complexity
 */
import { ValidationResult } from '../types'
import { escapeHtml } from '../utils/fieldFormatting'

interface DataGapAnalysisProps {
  entityName: string
  data: Record<string, unknown>
  validationResult: ValidationResult
  schema?: {
    required?: string[]
    properties?: Record<string, unknown>
  }
}

interface FieldMetadata {
  description: string
  collectionMethod: string
  source: string
  openQuestion?: string
}

interface EntityConfig {
  title: string
  subtitle: string
  carbLabel: string
  carbDescription: string
  carbRequiredFields: string[]
  fieldComplexity: {
    reasonable: string[]
    robust: string[]
  }
  fieldMetadata: Record<string, FieldMetadata>
}

/**
 * Normalize entity name to match config keys
 * Handles: lcfs_pathway -> LCFSPathway, LcfsPathway -> LCFSPathway, etc.
 */
function normalizeEntityName(name: string): string {
  // Remove underscores and convert to title case
  const normalized = name
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('')

  // Special handling for LCFS prefix (should be all caps)
  if (normalized.toLowerCase().startsWith('lcfs')) {
    return 'LCFS' + normalized.slice(4)
  }

  return normalized
}

/**
 * Find matching config for entity name (case-insensitive)
 */
function findEntityConfig(entityName: string, configs: Record<string, EntityConfig>): EntityConfig | null {
  // Direct match first
  if (configs[entityName]) {
    return configs[entityName]
  }

  // Try normalized name
  const normalized = normalizeEntityName(entityName)
  if (configs[normalized]) {
    return configs[normalized]
  }

  // Try case-insensitive match
  const lowerName = entityName.toLowerCase()
  for (const [key, config] of Object.entries(configs)) {
    if (key.toLowerCase() === lowerName) {
      return config
    }
  }

  return null
}

// Entity-specific configurations
const entityConfigs: Record<string, EntityConfig> = {
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
    },
    fieldMetadata: {
      facilityCapacity: {
        description: 'Annual production capacity in gallons',
        collectionMethod: 'Facility operations data (self-reported)',
        source: 'Facility Operations'
      },
      geographicScope: {
        description: 'Geographic applicability of pathway',
        collectionMethod: 'Based on feedstock sourcing region',
        source: 'Supply Chain Analysis'
      },
      expirationDate: {
        description: 'Pathway certification expiration date',
        collectionMethod: 'CARB certification tracking',
        source: 'CARB Records'
      },
      processDescription: {
        description: 'Detailed production process description',
        collectionMethod: 'Engineering documentation and technical review',
        source: 'Engineering Documentation',
        openQuestion: 'How detailed must this be? Attestation vs technical review?'
      },
      lastUpdated: {
        description: 'Timestamp of most recent pathway data update',
        collectionMethod: 'Automated system timestamp',
        source: 'System Generated',
        openQuestion: 'What triggers an update? Any field change or only material changes?'
      }
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
    },
    fieldMetadata: {
      reportingId: {
        description: 'Internal unique identifier for the quarterly report',
        collectionMethod: 'Auto-generated by BOOST system',
        source: 'System Generated'
      },
      verificationDate: {
        description: 'Date when third-party verification was completed',
        collectionMethod: 'Third-party verifier submission',
        source: 'Verification Provider',
        openQuestion: 'Should this be automatically captured or manually entered?'
      },
      verificationRequired: {
        description: 'Flag indicating if third-party verification is required',
        collectionMethod: 'Based on entity size/volume thresholds',
        source: 'Business Logic'
      },
      VerificationStatementId: {
        description: 'Reference to VerificationStatement entity',
        collectionMethod: 'Link to verification documentation in BOOST',
        source: 'BOOST Supply Chain',
        openQuestion: 'How to integrate with external verification systems?'
      },
      reportingDeadline: {
        description: 'CARB deadline for report submission',
        collectionMethod: 'Calculated as 30 days after quarter end',
        source: 'System Calculated'
      },
      transactionIds: {
        description: 'Array of Transaction entity IDs included in this report',
        collectionMethod: 'Aggregated from Transaction entities',
        source: 'BOOST Data Lineage',
        openQuestion: 'Should we validate all transactions are within the reporting period?'
      },
      calculationParameters: {
        description: 'Parameters used for credit calculations (conversion factors, benchmarks)',
        collectionMethod: 'Regulatory parameters from CARB guidance',
        source: 'CARB Regulations'
      },
      complianceMetrics: {
        description: 'Business intelligence metrics (credit value, environmental impact)',
        collectionMethod: 'Calculated from credits and market data',
        source: 'Business Analytics',
        openQuestion: 'What credit price source should be used for valuations?'
      },
      lastUpdated: {
        description: 'Timestamp of most recent report update',
        collectionMethod: 'Automated system timestamp',
        source: 'System Generated'
      }
    }
  }
}

interface ProvidedField {
  field: string
  value: unknown
  inCARB: boolean
  required: boolean
}

interface MissingField {
  field: string
  required: boolean
  complexity: 'reasonable' | 'robust' | 'unknown'
  metadata?: FieldMetadata
}

interface GapAnalysis {
  provided: ProvidedField[]
  missing: MissingField[]
  carbProvided: ProvidedField[]
  boostOnly: ProvidedField[]
  missingReasonable: MissingField[]
  missingRobust: MissingField[]
  missingCarbRequired: string[]
  missingBoostRequired: MissingField[]
  totalFields: number
  providedCount: number
  missingCount: number
  lcfsCompleteness: number
  boostCompleteness: number
  carbRequiredCount: number
  boostRequiredCount: number
}

export default function DataGapAnalysis({
  entityName,
  data,
  validationResult,
  schema
}: DataGapAnalysisProps) {
  // Detect entity type from JSON data, falling back to entityName from props
  const dataType = data['@type'] as string | undefined
  const currentEntityType = dataType || entityName

  // Find matching config (handles various naming formats)
  const config = findEntityConfig(currentEntityType, entityConfigs)
  if (!config) {
    return (
      <section className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="alert alert-info">
            <svg className="w-6 h-6 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
            </svg>
            <span>Gap analysis not available for entity type: {currentEntityType}</span>
          </div>
        </div>
      </section>
    )
  }

  // Analyze the data
  const analysis = analyzeDataGaps(data, schema, config)

  return (
    <section className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="space-y-6">
          <SummarySection analysis={analysis} config={config} validationResult={validationResult} />
          <MissingRequiredSection analysis={analysis} />
          <ProvidedDataSection analysis={analysis} config={config} currentEntityType={currentEntityType} />
          <MissingDataSection analysis={analysis} />
        </div>
      </div>
    </section>
  )
}

function analyzeDataGaps(
  jsonData: Record<string, unknown>,
  schema: { required?: string[]; properties?: Record<string, unknown> } | undefined,
  config: EntityConfig
): GapAnalysis {
  const provided: ProvidedField[] = []
  const missing: MissingField[] = []
  const schemaProperties = schema?.properties || {}
  const allFields = Object.keys(schemaProperties)
  const schemaRequired = schema?.required || []

  allFields.forEach(field => {
    // Skip only @context
    if (field === '@context') return

    const hasValue = Object.prototype.hasOwnProperty.call(jsonData, field) &&
                     jsonData[field] !== null &&
                     jsonData[field] !== undefined

    if (hasValue) {
      provided.push({
        field,
        value: jsonData[field],
        inCARB: config.carbRequiredFields.includes(field),
        required: schemaRequired.includes(field)
      })
    } else {
      missing.push({
        field,
        required: schemaRequired.includes(field),
        complexity: getFieldComplexity(field, config),
        metadata: config.fieldMetadata[field]
      })
    }
  })

  // Calculate missing CARB and BOOST required fields
  const missingCarbRequired = config.carbRequiredFields.filter(
    carbField => !provided.find(p => p.field === carbField)
  )

  const missingBoostRequired = missing.filter(f => f.required)

  // Calculate completion percentages
  const lcfsCompleteness = config.carbRequiredFields.length > 0
    ? Math.round(((config.carbRequiredFields.length - missingCarbRequired.length) / config.carbRequiredFields.length) * 100)
    : 100

  const boostRequiredCount = schemaRequired.filter(f => f !== '@context').length
  const boostRequiredProvided = provided.filter(f => f.required).length
  const boostCompleteness = boostRequiredCount > 0
    ? Math.round((boostRequiredProvided / boostRequiredCount) * 100)
    : 100

  return {
    provided,
    missing,
    carbProvided: provided.filter(f => f.inCARB),
    boostOnly: provided.filter(f => !f.inCARB),
    missingReasonable: missing.filter(f => f.complexity === 'reasonable'),
    missingRobust: missing.filter(f => f.complexity === 'robust'),
    missingCarbRequired,
    missingBoostRequired,
    totalFields: allFields.length - 1, // Exclude only @context
    providedCount: provided.length,
    missingCount: missing.length,
    lcfsCompleteness,
    boostCompleteness,
    carbRequiredCount: config.carbRequiredFields.length,
    boostRequiredCount
  }
}

function getFieldComplexity(field: string, config: EntityConfig): 'reasonable' | 'robust' | 'unknown' {
  if (config.fieldComplexity.reasonable.includes(field)) return 'reasonable'
  if (config.fieldComplexity.robust.includes(field)) return 'robust'
  return 'unknown'
}

function SummarySection({
  analysis,
  config,
  validationResult
}: {
  analysis: GapAnalysis
  config: EntityConfig
  validationResult: ValidationResult
}) {
  const lcfsColor = analysis.lcfsCompleteness >= 100 ? 'text-success' : 'text-error'
  const boostColor = analysis.boostCompleteness >= 80 ? 'text-success' : analysis.boostCompleteness >= 50 ? 'text-warning' : 'text-error'

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
            Validation Passed
          </span>
        ) : (
          <span className="badge badge-warning gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            Has Validation Errors
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
          <div className="stat-value text-primary">{analysis.providedCount}</div>
          <div className="stat-desc">Currently in submission</div>
        </div>

        <div className="stat">
          <div className={`stat-figure ${lcfsColor}`}>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
          </div>
          <div className="stat-title">LCFS Compliance</div>
          <div className={`stat-value ${lcfsColor}`}>{analysis.lcfsCompleteness}%</div>
          <div className="stat-desc">{analysis.carbRequiredCount - analysis.missingCarbRequired.length}/{analysis.carbRequiredCount} CARB required</div>
        </div>

        <div className="stat">
          <div className={`stat-figure ${boostColor}`}>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
          <div className="stat-title">BOOST Completeness</div>
          <div className={`stat-value ${boostColor}`}>{analysis.boostCompleteness}%</div>
          <div className="stat-desc">{analysis.boostRequiredCount - analysis.missingBoostRequired.length}/{analysis.boostRequiredCount} BOOST required</div>
        </div>
      </div>
    </div>
  )
}

function MissingRequiredSection({ analysis }: { analysis: GapAnalysis }) {
  if (analysis.missingCarbRequired.length === 0 && analysis.missingBoostRequired.length === 0) {
    return null
  }

  return (
    <div className="mb-6">
      {/* Missing LCFS Required Fields - CRITICAL */}
      {analysis.missingCarbRequired.length > 0 && (
        <>
          <div className="alert alert-error shadow-lg mb-4">
            <svg className="w-6 h-6 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
            </svg>
            <div className="flex-1">
              <h4 className="font-bold">CRITICAL: Missing LCFS Required Fields</h4>
              <p className="text-sm">The following fields are required by CARB regulations and MUST be provided for compliance</p>
            </div>
          </div>

          <div className="card bg-base-100 shadow-lg border-2 border-error mb-4">
            <div className="card-body">
              <h5 className="card-title text-error flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                Missing LCFS/CARB Required Fields
                <span className="badge badge-error badge-sm">{analysis.missingCarbRequired.length}</span>
              </h5>
              <div className="overflow-x-auto">
                <table className="table table-zebra table-sm">
                  <thead className="bg-error/10">
                    <tr>
                      <th>Field Name</th>
                      <th>Regulatory Requirement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.missingCarbRequired.map(fieldName => (
                      <tr key={fieldName} className="hover:bg-base-200">
                        <td><code className="text-sm font-mono font-semibold text-error">{fieldName}</code></td>
                        <td><span className="badge badge-error badge-sm">CARB Mandatory</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Missing BOOST Required Fields - WARNING */}
      {analysis.missingBoostRequired.length > 0 && (
        <>
          <div className="alert alert-warning shadow-lg mb-4">
            <svg className="w-6 h-6 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            <div className="flex-1">
              <h4 className="font-bold">Missing BOOST Required Fields</h4>
              <p className="text-sm">The following fields are required by the BOOST schema for complete supply chain tracking</p>
            </div>
          </div>

          <div className="card bg-base-100 shadow-lg border-2 border-warning mb-4">
            <div className="card-body">
              <h5 className="card-title text-warning flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                Missing BOOST Required Fields
                <span className="badge badge-warning badge-sm">{analysis.missingBoostRequired.length}</span>
              </h5>
              <div className="overflow-x-auto">
                <table className="table table-zebra table-sm">
                  <thead className="bg-warning/10">
                    <tr>
                      <th>Field Name</th>
                      <th>BOOST Requirement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.missingBoostRequired.map(field => (
                      <tr key={field.field} className="hover:bg-base-200">
                        <td><code className="text-sm font-mono font-semibold text-warning">{field.field}</code></td>
                        <td><span className="badge badge-warning badge-sm">BOOST Schema Required</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function ProvidedDataSection({
  analysis,
  config,
  currentEntityType
}: {
  analysis: GapAnalysis
  config: EntityConfig
  currentEntityType: string
}) {
  if (analysis.provided.length === 0) return null

  return (
    <div className="mb-6">
      <div className="alert alert-success shadow-lg mb-4">
        <svg className="w-6 h-6 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
        </svg>
        <span className="font-semibold">Currently Provided Data</span>
      </div>

      {analysis.carbProvided.length > 0 && (
        <div className="card bg-base-100 shadow-lg border border-success/20 mb-4">
          <div className="card-body">
            <h5 className="card-title text-success flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              {config.carbLabel}
              <span className="badge badge-success badge-sm">{analysis.carbProvided.length}</span>
            </h5>
            <p className="text-sm text-base-content/70 mb-3">{config.carbDescription}</p>
            <div className="overflow-x-auto">
              <table className="table table-zebra table-sm">
                <thead className="bg-success/10">
                  <tr>
                    <th>Field</th>
                    <th>Value</th>
                    <th className="text-center">LCFS Required</th>
                    <th className="text-center">BOOST Required</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.carbProvided.map(f => (
                    <ProvidedFieldRow key={f.field} field={f} isCARB={true} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {analysis.boostOnly.length > 0 && (
        <div className="card bg-base-100 shadow-lg border border-primary/20">
          <div className="card-body">
            <h5 className="card-title text-primary flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              BOOST Enhancement Fields
              <span className="badge badge-primary badge-sm">{analysis.boostOnly.length}</span>
            </h5>
            <p className="text-sm text-base-content/70 mb-3">
              Additional fields provided beyond {currentEntityType === 'LCFSPathway' ? 'standard AFP' : 'CARB compliance'} requirements
            </p>
            <div className="overflow-x-auto">
              <table className="table table-zebra table-sm">
                <thead className="bg-primary/10">
                  <tr>
                    <th>Field</th>
                    <th>Value</th>
                    <th className="text-center">LCFS Required</th>
                    <th className="text-center">BOOST Required</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.boostOnly.map(f => (
                    <ProvidedFieldRow key={f.field} field={f} isCARB={false} />
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

function ProvidedFieldRow({ field, isCARB }: { field: ProvidedField; isCARB: boolean }) {
  const value = formatValue(field.value)

  const lcfsRequiredBadge = isCARB
    ? <span className="badge badge-success badge-sm">Yes</span>
    : <span className="badge badge-ghost badge-sm">No</span>

  const boostRequiredBadge = field.required
    ? <span className="badge badge-warning badge-sm">Yes</span>
    : <span className="badge badge-ghost badge-sm">Optional</span>

  return (
    <tr className="hover:bg-base-200">
      <td><code className="text-sm font-mono font-semibold">{field.field}</code></td>
      <td className="text-sm">{value}</td>
      <td className="text-center">{lcfsRequiredBadge}</td>
      <td className="text-center">{boostRequiredBadge}</td>
    </tr>
  )
}

function MissingDataSection({ analysis }: { analysis: GapAnalysis }) {
  if (analysis.missing.length === 0) {
    return (
      <div className="alert alert-success shadow-lg">
        <svg className="w-6 h-6 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
        </svg>
        <div>
          <h4 className="font-bold">All BOOST fields provided!</h4>
          <p className="text-sm">No data gaps detected - submission is complete</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <div className="alert alert-warning shadow-lg mb-4">
        <svg className="w-6 h-6 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
        </svg>
        <span className="font-semibold">Additional BOOST Requirements (Not in Current AFP Submission)</span>
      </div>

      {analysis.missingReasonable.length > 0 && (
        <div className="card bg-base-100 shadow-lg border border-info/20 mb-4">
          <div className="card-body">
            <h5 className="card-title text-info flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
              </svg>
              Reasonable to Collect
              <span className="badge badge-info badge-sm">{analysis.missingReasonable.length}</span>
            </h5>
            <p className="text-sm text-base-content/70 mb-3">
              Fields that can be collected with existing data sources and minimal additional effort.
            </p>
            <div className="overflow-x-auto">
              <table className="table table-zebra table-sm">
                <thead className="bg-info/10">
                  <tr>
                    <th>Field</th>
                    <th>Description</th>
                    <th>Collection Method</th>
                    <th>Data Source</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.missingReasonable.map(f => (
                    <MissingFieldRow key={f.field} field={f} showOpenQuestion={false} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {analysis.missingRobust.length > 0 && (
        <div className="card bg-base-100 shadow-lg border border-warning/20">
          <div className="card-body">
            <h5 className="card-title text-warning flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
              Requires More Effort
              <span className="badge badge-warning badge-sm">{analysis.missingRobust.length}</span>
            </h5>
            <p className="text-sm text-base-content/70 mb-3">
              Fields requiring additional documentation, technical analysis, or third-party input.
            </p>
            <div className="overflow-x-auto">
              <table className="table table-zebra table-sm">
                <thead className="bg-warning/10">
                  <tr>
                    <th>Field</th>
                    <th>Description</th>
                    <th>Collection Method</th>
                    <th>Open Questions</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.missingRobust.map(f => (
                    <MissingFieldRow key={f.field} field={f} showOpenQuestion={true} />
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

function MissingFieldRow({ field, showOpenQuestion }: { field: MissingField; showOpenQuestion: boolean }) {
  const metadata = field.metadata || { description: 'No description available', collectionMethod: 'To be determined', source: 'Unknown' }

  if (showOpenQuestion && metadata.openQuestion) {
    return (
      <tr className="hover:bg-base-200">
        <td><code className="text-sm font-mono font-semibold">{field.field}</code></td>
        <td className="text-sm">{metadata.description}</td>
        <td className="text-sm">{metadata.collectionMethod}</td>
        <td>
          <div className="alert alert-info py-2 px-3">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
            </svg>
            <span className="text-xs">{metadata.openQuestion}</span>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <tr className="hover:bg-base-200">
      <td><code className="text-sm font-mono font-semibold">{field.field}</code></td>
      <td className="text-sm">{metadata.description}</td>
      <td className="text-sm">{metadata.collectionMethod}</td>
      <td className="text-sm">{metadata.source}</td>
    </tr>
  )
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '<em>null</em>'
  }

  if (typeof value === 'string') {
    if (value.length > 50) {
      return `${escapeHtml(value.substring(0, 50))}...`
    }
    return escapeHtml(value)
  }

  if (typeof value === 'number') {
    return value.toString()
  }

  if (typeof value === 'boolean') {
    return value ? '✓ true' : '✗ false'
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return '<em>empty array</em>'
    }
    if (value.length <= 2) {
      return JSON.stringify(value)
    }
    return `[${value.length} items]`
  }

  if (typeof value === 'object') {
    const keys = Object.keys(value as object)
    if (keys.length <= 3) {
      return JSON.stringify(value)
    }
    return `{${keys.slice(0, 2).join(', ')}, +${keys.length - 2} more}`
  }

  return String(value)
}
