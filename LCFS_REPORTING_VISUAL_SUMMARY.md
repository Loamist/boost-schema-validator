# LCFSReporting Field Summary - Visual Guide

**Quick Reference:** Which fields are required for CARB compliance vs. BOOST enhancements

---

## At A Glance

```
┌─────────────────────────────────────────────────────────┐
│          LCFS REPORTING ENTITY - FIELD BREAKDOWN         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Total Fields: 19                                        │
│                                                          │
│  ✅ CARB-Required (Compliance):         9  (47%)        │
│  🔵 BOOST-Added (Enhanced Tracking):    7  (37%)        │
│  📊 JSON-LD (Semantic Web):             3  (16%)        │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Annotated Example JSON

```json
{
  // ═══════════════════════════════════════════════════════
  // 📊 JSON-LD FIELDS (Semantic Web)
  // ═══════════════════════════════════════════════════════
  "@context": { ... },           // 📊 Linked data context
  "@type": "LCFSReporting",      // 📊 Entity type identifier
  "@id": "https://...",          // 📊 Global unique URI

  // ═══════════════════════════════════════════════════════
  // 🔵 BOOST INTERNAL TRACKING
  // ═══════════════════════════════════════════════════════
  "reportingId": "LCFS-RPT-2025-Q1-PACIFIC001",  // 🔵 Primary key

  // ═══════════════════════════════════════════════════════
  // ✅ CARB-REQUIRED CORE FIELDS
  // ═══════════════════════════════════════════════════════
  "regulatedEntityId": "pacific-renewable-fuels-001",  // ✅ Organization FEIN
  "reportingPeriod": "2025-Q1",                        // ✅ Quarter (YYYY-QN)
  "totalFuelVolume": 5075000.0,                        // ✅ Total gallons
  "totalCreditsGenerated": 54580477.10,                // ✅ Credits earned
  "totalDeficitsIncurred": 0.0,                        // ✅ Deficits incurred
  "netPosition": 54580477.10,                          // ✅ Net compliance position
  "complianceStatus": "compliant",                     // ✅ Compliance determination
  "submissionDate": "2025-04-15T10:30:00Z",            // ✅ CARB submission timestamp

  // ═══════════════════════════════════════════════════════
  // 🔵 BOOST VERIFICATION TRACKING
  // ═══════════════════════════════════════════════════════
  "verificationDate": "2025-04-10T14:00:00Z",          // 🔵 Verification completion
  "verificationRequired": true,                         // 🔵 Verification needed flag
  "reportingDeadline": "2025-05-15",                   // 🔵 Internal deadline tracking

  // ═══════════════════════════════════════════════════════
  // 🔵 BOOST SUPPLY CHAIN LINKAGE
  // ═══════════════════════════════════════════════════════
  "transactionIds": [                                  // 🔵 Transaction references
    "TXN-2025-Q1-001",                                 //    for data lineage
    "TXN-2025-Q1-002",
    "TXN-2025-Q1-003",
    "TXN-2025-Q1-004",
    "TXN-2025-Q1-005",
    "TXN-2025-Q1-006"
  ],

  // ═══════════════════════════════════════════════════════
  // ✅ CARB-REQUIRED PATHWAY BREAKDOWN
  // ═══════════════════════════════════════════════════════
  "pathwaySummary": [                                  // ✅ Activity by pathway (FPC)
    {
      "pathwayId": "CA-RD-2025-LMR-001",              // ✅ Pathway code
      "feedstockType": "logging_and_mill_residue",
      "transactionCount": 2,
      "totalVolume": 1650000.0,
      "creditsGenerated": 17995184.00
    },
    {
      "pathwayId": "CA-RD-2025-AGR-001",
      "feedstockType": "agricultural_residue",
      "transactionCount": 2,
      "totalVolume": 2350000.0,
      "creditsGenerated": 24886720.85
    },
    {
      "pathwayId": "CA-RD-2025-GRW-001",
      "feedstockType": "grass_residue_waste",
      "transactionCount": 1,
      "totalVolume": 650000.0,
      "creditsGenerated": 7171332.25
    },
    {
      "pathwayId": "CA-RD-2025-FHR-001",
      "feedstockType": "forest_harvest_residue",
      "transactionCount": 1,
      "totalVolume": 425000.0,
      "creditsGenerated": 4527240.00
    }
  ],

  // ═══════════════════════════════════════════════════════
  // 🔵 BOOST CALCULATION TRANSPARENCY
  // ═══════════════════════════════════════════════════════
  "calculationParameters": {                           // 🔵 Document methodology
    "conversionFactor": 138.7,                        //    for audit trail
    "conversionFactorUnit": "MJ/gallon",
    "regulatoryBenchmark": 98.47,
    "benchmarkUnit": "gCO2e/MJ",
    "defaultEER": 1.0
  },

  // ═══════════════════════════════════════════════════════
  // 🔵 BOOST BUSINESS INTELLIGENCE
  // ═══════════════════════════════════════════════════════
  "complianceMetrics": {                               // 🔵 Business metrics
    "creditValue": {                                   //    (not required by CARB)
      "estimatedValue": 109160954.20,                 //    Financial planning
      "valueUnit": "USD",
      "creditPrice": 2.00,
      "priceUnit": "USD_per_credit"
    },
    "environmentalImpact": {                          //    Stakeholder communication
      "co2ReductionMT": 55249.19,
      "co2ReductionUnit": "metric_tons",
      "equivalentCarsRemoved": 12011
    }
  },

  // ═══════════════════════════════════════════════════════
  // 🔵 BOOST DATA MANAGEMENT
  // ═══════════════════════════════════════════════════════
  "lastUpdated": "2025-07-21T16:45:00Z"               // 🔵 Change tracking
}
```

---

## Field Categories Explained

### ✅ CARB-Required Fields (9 fields)

**Why:** Required by Cal. Code Regs. Tit. 17, § 95491 for quarterly reporting compliance

| Field | Purpose |
|-------|---------|
| `regulatedEntityId` | Identifies reporting organization (FEIN) |
| `reportingPeriod` | Specifies compliance quarter (YYYY-QN) |
| `totalFuelVolume` | Total fuel volume in gallons |
| `totalCreditsGenerated` | Total LCFS credits earned |
| `totalDeficitsIncurred` | Total LCFS deficits incurred |
| `netPosition` | Net compliance position (credits - deficits) |
| `complianceStatus` | Compliance determination (compliant/deficit/pending) |
| `submissionDate` | When report was submitted to CARB |
| `pathwaySummary` | Breakdown by pathway code (FPC) |

**Minimum for CARB:** These 9 fields contain all data CARB requires for compliance

---

### 🔵 BOOST-Added Fields (9 fields)

**Why:** Enhanced tracking, business intelligence, supply chain traceability

| Field | BOOST Enhancement |
|-------|------------------|
| `reportingId` | **Internal tracking:** Unique identifier for BOOST database |
| `verificationDate` | **Workflow:** Track when verification completed |
| `verificationRequired` | **Automation:** Flag entities needing verification |
| `VerificationStatementId` | **Traceability:** Link to VerificationStatement entity |
| `reportingDeadline` | **Alerts:** Internal deadline management |
| `transactionIds` | **Data lineage:** Link to source transactions |
| `calculationParameters` | **Transparency:** Document calculation methodology |
| `complianceMetrics` | **Business intelligence:** Financial & environmental metrics |
| `lastUpdated` | **Data quality:** Track when report was modified |

**BOOST Value-Add:** These fields enable supply chain tracking, business intelligence, and operational efficiency

---

### 📊 JSON-LD Fields (3 fields)

**Why:** Enable semantic web, linked data, and interoperability

| Field | Purpose |
|-------|---------|
| `@context` | Define vocabulary for semantic web |
| `@type` | Entity type identifier (always "LCFSReporting") |
| `@id` | Globally unique URI identifier |

---

## Compliance vs. Enhanced View

### Minimum CARB Compliance Report

**Contains:** 11 fields (✅ + 📊)

```json
{
  "@context": { ... },                               // 📊
  "@type": "LCFSReporting",                          // 📊
  "@id": "https://...",                              // 📊
  "regulatedEntityId": "pacific-renewable-fuels-001", // ✅
  "reportingPeriod": "2025-Q1",                      // ✅
  "totalFuelVolume": 5075000.0,                      // ✅
  "totalCreditsGenerated": 54580477.10,              // ✅
  "totalDeficitsIncurred": 0.0,                      // ✅
  "netPosition": 54580477.10,                        // ✅
  "complianceStatus": "compliant",                   // ✅
  "submissionDate": "2025-04-15T10:30:00Z",          // ✅
  "pathwaySummary": [ ... ]                          // ✅
}
```

**Status:** ✅ Meets all CARB requirements

---

### Full BOOST Enhanced Report

**Contains:** 19 fields (✅ + 🔵 + 📊)

Adds these 8 fields to the compliance report:

```json
{
  // ... all compliance fields above ...

  "reportingId": "LCFS-RPT-2025-Q1-PACIFIC001",      // 🔵
  "verificationDate": "2025-04-10T14:00:00Z",        // 🔵
  "verificationRequired": true,                       // 🔵
  "reportingDeadline": "2025-05-15",                 // 🔵
  "transactionIds": [ ... ],                          // 🔵
  "calculationParameters": { ... },                   // 🔵
  "complianceMetrics": { ... },                       // 🔵
  "lastUpdated": "2025-07-21T16:45:00Z"              // 🔵
}
```

**Benefits:**
- ✅ CARB compliance
- 🔵 Supply chain traceability
- 🔵 Business intelligence
- 🔵 Audit trail
- 🔵 Workflow management
- 🔵 Financial visibility

---

## Web Interface Recommendations

### Display Strategy

#### Section 1: Compliance Core (Prominent Display)
Show with ✅ indicators:
```
┌─────────────────────────────────────┐
│     ✅ CARB COMPLIANCE REPORT       │
├─────────────────────────────────────┤
│ Organization: Pacific Renewable...  │
│ Period: Q1 2025                     │
│ Total Volume: 5,075,000 gallons     │
│ Credits Generated: 54,580,477       │
│ Deficits: 0                         │
│ Net Position: 54,580,477 ✅         │
│ Status: COMPLIANT ✅                │
│ Submitted: Apr 15, 2025             │
└─────────────────────────────────────┘
```

#### Section 2: Pathway Breakdown (Compliance Detail)
```
┌─────────────────────────────────────┐
│   ✅ PATHWAY ACTIVITY BREAKDOWN     │
├─────────────────────────────────────┤
│ CA-RD-2025-LMR-001                  │
│   Logging & Mill Residue            │
│   Volume: 1,650,000 gal             │
│   Credits: 17,995,184               │
│                                     │
│ CA-RD-2025-AGR-001                  │
│   Agricultural Residue              │
│   Volume: 2,350,000 gal             │
│   Credits: 24,886,721               │
│ ...                                 │
└─────────────────────────────────────┘
```

#### Section 3: BOOST Enhancements (Collapsible Panel)
```
┌─────────────────────────────────────┐
│  🔵 ENHANCED TRACKING & ANALYTICS   │
│  [Click to expand ▼]                │
├─────────────────────────────────────┤
│ Verification Status:                │
│   Required: Yes                     │
│   Completed: Apr 10, 2025 ✓         │
│   Statement ID: VS-2025-Q1-PAC-001  │
│                                     │
│ Transaction Traceability:           │
│   6 transactions included           │
│   [View transaction details →]      │
│                                     │
│ Business Metrics:                   │
│   Credit Value: $109,160,954        │
│   CO₂ Reduction: 55,249 metric tons │
│   Cars Equivalent: 12,011 cars      │
│                                     │
│ Calculation Parameters:             │
│   Conversion: 138.7 MJ/gallon       │
│   Benchmark: 98.47 gCO₂e/MJ         │
│   [View full calculations →]        │
└─────────────────────────────────────┘
```

---

## Field Validation Rules

### For CARB Compliance

**Critical Validations:**
```javascript
// Net position calculation
assert(netPosition === totalCreditsGenerated - totalDeficitsIncurred)

// Pathway summary totals
assert(sum(pathwaySummary[].totalVolume) === totalFuelVolume)
assert(sum(pathwaySummary[].creditsGenerated) === totalCreditsGenerated)

// Period format
assert(reportingPeriod.matches(/^\d{4}-Q[1-4]$/))

// Submission required before finalization
if (complianceStatus !== "pending") {
  assert(submissionDate !== null)
}
```

### For BOOST Enhanced Features

**Enhanced Validations:**
```javascript
// Transaction references must exist
for (txnId of transactionIds) {
  assert(Transaction.exists(txnId))
}

// Organization reference must be valid
assert(Organization.exists(regulatedEntityId))

// Verification statement reference if provided
if (VerificationStatementId) {
  assert(VerificationStatement.exists(VerificationStatementId))
}

// Deadline should be 30 days after quarter end
expectedDeadline = quarterEnd + 30 days
assert(reportingDeadline === expectedDeadline)
```

---

## Quick Reference Table

| Field | BOOST Required | CARB Required | Category | Display Priority |
|-------|---------------|---------------|----------|-----------------|
| @context | ✅ | ❌ | 📊 JSON-LD | Low |
| @type | ✅ | ❌ | 📊 JSON-LD | Low |
| @id | ✅ | ❌ | 📊 JSON-LD | Low |
| reportingId | ✅ | ❌ | 🔵 BOOST | Medium |
| regulatedEntityId | ✅ | ✅ | ✅ CARB | **HIGH** |
| reportingPeriod | ✅ | ✅ | ✅ CARB | **HIGH** |
| totalFuelVolume | ✅ | ✅ | ✅ CARB | **HIGH** |
| totalCreditsGenerated | ✅ | ✅ | ✅ CARB | **HIGH** |
| totalDeficitsIncurred | ✅ | ✅ | ✅ CARB | **HIGH** |
| netPosition | ✅ | ✅ | ✅ CARB | **HIGH** |
| complianceStatus | ✅ | ✅ | ✅ CARB | **HIGH** |
| submissionDate | ❌ | ✅ | ✅ CARB | **HIGH** |
| verificationDate | ❌ | ❌ | 🔵 BOOST | Medium |
| verificationRequired | ❌ | ❌ | 🔵 BOOST | Medium |
| VerificationStatementId | ❌ | ❌ | 🔵 BOOST | Medium |
| reportingDeadline | ❌ | ❌ | 🔵 BOOST | Medium |
| transactionIds | ❌ | ❌ | 🔵 BOOST | Medium |
| pathwaySummary | ❌ | ✅ | ✅ CARB | **HIGH** |
| calculationParameters | ❌ | ❌ | 🔵 BOOST | Low |
| complianceMetrics | ❌ | ❌ | 🔵 BOOST | Medium |
| lastUpdated | ❌ | ❌ | 🔵 BOOST | Low |

---

## Key Takeaways

### 1. CARB Compliance = 47% of Fields
Only **9 out of 19 fields** (47%) are required by CARB regulations. The entity meets 100% of compliance requirements.

### 2. BOOST Value-Add = 47% of Fields
**9 additional fields** (47%) provide business intelligence, supply chain tracking, and operational efficiency beyond compliance.

### 3. The Schema is Well-Designed
The entity correctly separates:
- ✅ Compliance requirements (what CARB needs)
- 🔵 Business intelligence (what companies want)
- 📊 Interoperability (semantic web ready)

### 4. Web Interface Should Prioritize
- **Primary view:** CARB-required fields (compliance focus)
- **Secondary panel:** BOOST enhancements (opt-in details)
- **Clear labeling:** Show which fields serve which purpose

---

**Document Version:** 1.0
**Last Updated:** November 13, 2025
**Related Documents:**
- `LCFS_REPORTING_FIELD_ANALYSIS.md` - Detailed analysis with regulatory citations
- `LCFS_Reporting_vs_Pathway_Application_Requirements.md` - Reporting vs. application comparison
