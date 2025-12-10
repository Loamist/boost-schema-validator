/**
 * Field Importance Utilities
 * Defines importance levels for BOOST entity fields for intelligent ordering
 */

// Define importance levels (1-10, 10 being most important)
const importanceMap: Record<string, number> = {
  // Critical identification fields (10)
  '@type': 10,
  '@id': 10,
  'traceableUnitId': 10,
  'organizationId': 10,

  // Core business identifiers (9)
  'uniqueIdentifier': 9,
  'harvesterId': 9,
  'materialTypeId': 9,
  'identificationMethodId': 9,

  // Key operational fields (8)
  'unitType': 8,
  'totalVolumeM3': 8,
  'createdTimestamp': 8,
  'identificationConfidence': 8,

  // Geographic and tracking (7)
  'harvestGeographicDataId': 7,
  'currentGeographicDataId': 7,
  'operatorId': 7,
  'currentStatus': 7,

  // Business classification (6)
  'productClassification': 6,
  'qualityGrade': 6,
  'isMultiSpecies': 6,
  'methodReadinessLevel': 6,

  // Processing and history (5)
  'processingHistory': 5,
  'parentTraceableUnitId': 5,
  'childTraceableUnitIds': 5,
  'sustainabilityCertification': 5,

  // Context fields (4)
  '@context': 4,
  'organizationName': 4,
  'organizationType': 4,
  'certificateId': 4,

  // Secondary identifiers (3)
  'secondaryIdentifiers': 3,
  'attachedInformation': 3,
  'mediaBreakFlags': 3,

  // Detailed metadata (2)
  'physicalArrangement': 2,
  'alternativeFateMetrics': 2,
  'lastUpdated': 2,

  // Nested object fields get lower priority (1)
  'arrangementType': 1,
  'arrangementDate': 1,
  'exposureConditions': 1,
  'groundContact': 1,
  'baselineScenario': 1,
  'annualDecayRate': 1,
  'collectionEfficiency': 1,
  'carbonImpact': 1,
  'soilCarbonChange': 1,
  'emissionsAvoided': 1,
  'identifierType': 1,
  'identifierValue': 1,
  'confidence': 1
}

/**
 * Get the importance level of a field (1-10, 10 being most important)
 */
export function getFieldImportance(fieldName: string, prefix = ''): number {
  // Check for exact field name match
  if (importanceMap[fieldName] !== undefined) {
    return importanceMap[fieldName]
  }

  // Check for pattern-based importance
  if (fieldName.endsWith('Id')) return 8 // ID fields are generally important
  if (fieldName.endsWith('Timestamp') || fieldName.endsWith('Date')) return 6
  if (fieldName.includes('Geographic') || fieldName.includes('Location')) return 7
  if (fieldName.includes('Certificate') || fieldName.includes('Certification')) return 5
  if (fieldName.includes('Error') || fieldName.includes('Issue')) return 9 // Errors are high priority

  // Nested fields get lower priority
  if (prefix) return 2

  // Default priority for unknown fields
  return 3
}
