# LCFSReporting Entity - Field Compliance Analysis

**Entity:** LCFSReporting
**Purpose:** Quarterly LCFS compliance report aggregating transaction data for CARB submission
**Analysis Date:** November 13, 2025

---

## Executive Summary

The **LCFSReporting** entity contains **19 fields** (including nested objects):
- ✅ **9 fields** (47%) are **CARB-required** for quarterly reporting compliance
- 🔵 **7 fields** (37%) are **BOOST-added** for enhanced tracking and business intelligence
- 📊 **3 fields** (16%) are **JSON-LD semantic web** fields

---

## Field-by-Field Analysis

### ✅ CARB-Required Fields (Compliance)

These fields are **required by CARB regulations** for quarterly LCFS reporting compliance.

| Field | Type | BOOST Required | CARB Requirement | Regulatory Basis |
|-------|------|----------------|------------------|------------------|
| `regulatedEntityId` | string | ✅ Yes | ✅ Required | § 95491(c)(2) - Organization FEIN |
| `reportingPeriod` | string | ✅ Yes | ✅ Required | § 95491(c)(2) - Reporting Period (year and quarter) |
| `totalFuelVolume` | number | ✅ Yes | ✅ Required | § 95491(c) - Aggregated fuel amounts |
| `totalCreditsGenerated` | number | ✅ Yes | ✅ Required | § 95491(c) - Credit generation reporting |
| `totalDeficitsIncurred` | number | ✅ Yes | ✅ Required | § 95491(c) - Deficit reporting |
| `netPosition` | number | ✅ Yes | ✅ Required | § 95491(c) - Net compliance position |
| `complianceStatus` | string | ✅ Yes | ✅ Required | § 95491(c) - Compliance determination |
| `pathwaySummary` | array | ❌ No* | ✅ Required | § 95491(c)(2) - Breakdown by FPC (Fuel Pathway Code) |
| `submissionDate` | date-time | ❌ No | ✅ Required | § 95491(a) - Report submission tracking |

**Note on `pathwaySummary`:** While not marked "required" in the BOOST schema, this field is essential for CARB reporting as it provides the breakdown by pathway (FPC), which is explicitly required by § 95491(c)(2).

### 🔵 BOOST-Added Fields (Enhanced Tracking)

These fields are **NOT required by CARB** but provide valuable business intelligence, supply chain tracking, and operational management.

| Field | Type | BOOST Required | Purpose | Business Value |
|-------|------|----------------|---------|----------------|
| `reportingId` | string | ✅ Yes | Internal unique identifier | BOOST entity tracking and database primary key |
| `verificationDate` | date-time | ❌ No | Track verification completion | Compliance workflow management |
| `verificationRequired` | boolean | ❌ No | Flag entities needing verification | Automated compliance workflow |
| `VerificationStatementId` | string | ❌ No | Link to VerificationStatement entity | BOOST supply chain traceability |
| `reportingDeadline` | date | ❌ No | Track CARB submission deadline | Internal deadline management |
| `transactionIds` | array | ❌ No | Reference to Transaction entities | BOOST data lineage and audit trail |
| `calculationParameters` | object | ❌ No | Document calculation methodology | Transparency and audit support |
| `complianceMetrics` | object | ❌ No | Business intelligence metrics | Financial planning and impact reporting |
| `lastUpdated` | date-time | ❌ No | Timestamp of last modification | BOOST data management |

### 📊 JSON-LD Semantic Web Fields

These fields enable **linked data** capabilities for interoperability and semantic web integration.

| Field | Type | BOOST Required | Purpose |
|-------|------|----------------|---------|
| `@context` | object | ✅ Yes | JSON-LD context definition |
| `@type` | string | ✅ Yes | Entity type identifier (always "LCFSReporting") |
| `@id` | string (URI) | ✅ Yes | Unique URI identifier for linked data |

---

## Summary Statistics

### Field Categories

```
┌─────────────────────────────────────────┐
│     LCFS REPORTING FIELD BREAKDOWN      │
├─────────────────────────────────────────┤
│                                         │
│  ✅ CARB-Required Fields:        9     │
│     (47% of all fields)                 │
│                                         │
│  🔵 BOOST-Added Fields:          9     │
│     (47% of all fields)                 │
│                                         │
│  📊 JSON-LD Fields:              3     │
│     (16% of all fields)                 │
│                                         │
│  ═══════════════════════════════════   │
│  Total Fields:                  19     │
└─────────────────────────────────────────┘
```

### Schema vs. Regulatory Requirements

| Aspect | BOOST Schema | CARB Requirement | Assessment |
|--------|--------------|------------------|------------|
| **Compliance Coverage** | 100% | - | ✅ All CARB requirements met |
| **Enhanced Features** | 9 additional fields | - | ✅ Significant value-add |
| **Data Lineage** | transactionIds array | Not required | ✅ Audit trail capability |
| **Business Intelligence** | complianceMetrics | Not required | ✅ Financial planning support |
| **Verification Tracking** | 3 verification fields | Basic requirement | ✅ Enhanced workflow |
| **Semantic Web** | Full JSON-LD support | Not required | ✅ Interoperability ready |

---

## Detailed Field Analysis

### 1. CARB-Required: Core Reporting Fields

#### `regulatedEntityId` (string, required)
- **CARB Requirement:** Organization FEIN per § 95491(c)(2)
- **BOOST Implementation:** Reference to Organization entity using EntityNameId convention
- **Example:** `"ORG-PACIFIC-RF-001"`
- **Why Required:** Identifies the regulated party submitting the report

#### `reportingPeriod` (string, required)
- **CARB Requirement:** Reporting Period (year and quarter) per § 95491(c)(2)
- **BOOST Implementation:** Standardized YYYY-QN format with validation pattern
- **Example:** `"2025-Q2"`
- **Why Required:** Specifies the compliance period being reported

#### `totalFuelVolume` (number, required)
- **CARB Requirement:** Aggregated fuel amounts per § 95491(c)
- **BOOST Implementation:** Total volume in gallons with minimum 0 validation
- **Example:** `5075000.0`
- **Why Required:** Total fuel volume drives credit/deficit calculations

#### `totalCreditsGenerated` (number, required)
- **CARB Requirement:** Credit generation reporting per § 95491(c)
- **BOOST Implementation:** Sum of all credits from transactions in reporting period
- **Example:** `54580477.10`
- **Why Required:** Determines compliance position and tradeable credits

#### `totalDeficitsIncurred` (number, required)
- **CARB Requirement:** Deficit reporting per § 95491(c)
- **BOOST Implementation:** Sum of all deficits from transactions in reporting period
- **Example:** `0.0` or `2500000.0`
- **Why Required:** Determines compliance obligations

#### `netPosition` (number, required)
- **CARB Requirement:** Net compliance position per § 95491(c)
- **BOOST Implementation:** Calculated as (totalCreditsGenerated - totalDeficitsIncurred)
- **Example:** `54580477.10` (surplus) or `-2500000.0` (deficit)
- **Why Required:** Final compliance determination for the period

#### `complianceStatus` (string enum, required)
- **CARB Requirement:** Compliance determination per § 95491(c)
- **BOOST Implementation:** Enum values: compliant, deficit, pending, under_review
- **Example:** `"compliant"`
- **Why Required:** Official compliance status for regulatory purposes

#### `pathwaySummary` (array, optional in schema but required for CARB)
- **CARB Requirement:** Breakdown by FPC (Fuel Pathway Code) per § 95491(c)(2)
- **BOOST Implementation:** Array of pathway activity summaries
- **Structure:**
  ```json
  {
    "pathwayId": "CA-RD-2025-LMR-001",
    "feedstockType": "logging_and_mill_residue",
    "transactionCount": 15,
    "totalVolume": 1650000.0,
    "creditsGenerated": 18193492.37
  }
  ```
- **Why Required:** CARB needs breakdown by certified pathway for validation
- **Note:** Should be marked required in schema for compliance

#### `submissionDate` (date-time, optional in schema but required for CARB)
- **CARB Requirement:** Report submission tracking per § 95491(a)
- **BOOST Implementation:** Timestamp of CARB submission
- **Example:** `"2025-04-15T10:30:00Z"`
- **Why Required:** Determines if report met quarterly deadline
- **Note:** Should be marked required upon submission

---

### 2. BOOST-Added: Enhanced Tracking Fields

#### `reportingId` (string, required by BOOST)
- **BOOST Purpose:** Primary key for database and entity reference
- **CARB Requirement:** ❌ Not required
- **Pattern:** `^LCFS-RPT-[0-9]{4}-Q[1-4]-[A-Z0-9]{3,8}$`
- **Example:** `"LCFS-RPT-2025-Q2-PACIFIC001"`
- **Business Value:** Enables unique identification and reference across BOOST system

#### `verificationDate` (date-time, optional)
- **BOOST Purpose:** Track when third-party verification was completed
- **CARB Requirement:** ❌ Not required (CARB only requires verification to occur, not date tracking)
- **Example:** `"2025-04-10T14:00:00Z"`
- **Business Value:** Compliance workflow management, identify verification bottlenecks

#### `verificationRequired` (boolean, optional)
- **BOOST Purpose:** Flag whether entity needs third-party verification
- **CARB Requirement:** ❌ Not required (entities know their obligations)
- **Example:** `true` (large reporters) or `false` (small reporters)
- **Business Value:** Automated workflow routing, compliance checklist generation

#### `VerificationStatementId` (string, optional)
- **BOOST Purpose:** Link to VerificationStatement entity in BOOST schema
- **CARB Requirement:** ❌ Not required (CARB accepts verification statement separately)
- **Pattern:** `^VS-[A-Z0-9-_]+$`
- **Example:** `"VS-2025-Q2-PACIFIC-001"`
- **Business Value:** Supply chain traceability, integrated audit trail

#### `reportingDeadline` (date, optional)
- **BOOST Purpose:** Track CARB's submission deadline for this report
- **CARB Requirement:** ❌ Not required (entities know quarterly deadlines)
- **Example:** `"2025-05-15"` (30 days after quarter end)
- **Business Value:** Internal deadline tracking, automated alerts

#### `transactionIds` (array, optional)
- **BOOST Purpose:** Reference Transaction entities included in this report
- **CARB Requirement:** ❌ Not required (CARB receives transaction data separately)
- **Example:** `["TXN-2025-Q2-001", "TXN-2025-Q2-002", ...]`
- **Business Value:**
  - **Data lineage:** Track which transactions contributed to report totals
  - **Audit trail:** Verify aggregation calculations
  - **Drill-down capability:** Navigate from summary to detail
  - **Reconciliation:** Match BOOST transactions to CARB submissions

#### `calculationParameters` (object, optional)
- **BOOST Purpose:** Document calculation methodology for transparency
- **CARB Requirement:** ❌ Not required (CARB defines calculation methods)
- **Structure:**
  ```json
  {
    "conversionFactor": 138.7,
    "conversionFactorUnit": "MJ/gallon",
    "regulatoryBenchmark": 98.47,
    "benchmarkUnit": "gCO2e/MJ",
    "defaultEER": 1.0
  }
  ```
- **Business Value:**
  - **Calculation transparency:** Document assumptions used
  - **Audit support:** Verify credit calculations
  - **Version tracking:** Handle regulatory updates to benchmarks
  - **Reproducibility:** Recreate credit calculations

#### `complianceMetrics` (object, optional)
- **BOOST Purpose:** Business intelligence and impact reporting
- **CARB Requirement:** ❌ Not required (purely business metrics)
- **Structure:**
  ```json
  {
    "creditValue": {
      "estimatedValue": 10916095.42,
      "valueUnit": "USD",
      "creditPrice": 200.0,
      "priceUnit": "USD_per_credit"
    },
    "environmentalImpact": {
      "co2ReductionMT": 5458.05,
      "co2ReductionUnit": "metric_tons",
      "equivalentCarsRemoved": 1186
    }
  }
  ```
- **Business Value:**
  - **Financial planning:** Estimate credit market value
  - **Environmental reporting:** Communicate sustainability impact
  - **Stakeholder communication:** Translate technical credits to understandable metrics
  - **Business intelligence:** Track credit value over time

#### `lastUpdated` (date-time, optional)
- **BOOST Purpose:** Track when report data was last modified
- **CARB Requirement:** ❌ Not required
- **Example:** `"2025-07-21T16:45:00Z"`
- **Business Value:** Data management, change tracking, audit trail

---

### 3. JSON-LD Semantic Web Fields

#### `@context` (object, required by BOOST)
- **Purpose:** Define JSON-LD context for semantic web interoperability
- **CARB Requirement:** ❌ Not required
- **Business Value:** Enable linked data applications, data integration

#### `@type` (string, required by BOOST)
- **Purpose:** Specify entity type in semantic web format
- **Value:** Always `"LCFSReporting"`
- **CARB Requirement:** ❌ Not required
- **Business Value:** Type identification in linked data systems

#### `@id` (string URI, required by BOOST)
- **Purpose:** Globally unique identifier for linked data
- **Example:** `"https://github.com/carbondirect/BOOST/schemas/lcfs-reporting/LCFS-RPT-2025-Q2-PACIFIC001"`
- **CARB Requirement:** ❌ Not required
- **Business Value:** Global uniqueness, semantic web integration

---

## Comparison with CARB LRT-CBTS Reporting

### What CARB's System Captures

Based on § 95491, the LCFS Reporting Tool (LRT-CBTS) requires:

**Transaction-Level Data:**
- Organization FEIN
- Reporting Period (quarter)
- Fuel Pathway Code (FPC)
- Fuel Amount (gallons)
- Transaction Type
- Transaction Date
- Business Partner (if applicable)
- Fuel Application

**Quarterly Summary (Aggregated):**
- Total volumes by pathway
- Credits generated
- Deficits incurred
- Net position
- Compliance status

### What BOOST Adds Beyond CARB

**Supply Chain Integration:**
- ✅ Links to Transaction entities (data lineage)
- ✅ Links to Organization entities (enhanced entity management)
- ✅ Links to VerificationStatement entities (integrated audit trail)

**Business Intelligence:**
- ✅ Credit valuation estimates
- ✅ Environmental impact metrics
- ✅ Calculation parameter transparency

**Workflow Management:**
- ✅ Verification tracking and status
- ✅ Deadline management
- ✅ Update timestamps

**Data Quality:**
- ✅ Audit trail via transactionIds
- ✅ Calculation reproducibility via calculationParameters
- ✅ Version control via lastUpdated

---

## Use Case: Field Requirements

### Scenario 1: Minimum CARB Compliance

**Goal:** Submit valid quarterly report to CARB

**Required Fields:**
```json
{
  "@context": { ... },
  "@type": "LCFSReporting",
  "@id": "...",
  "reportingId": "LCFS-RPT-2025-Q2-ABC123",
  "regulatedEntityId": "ORG-PACIFIC-RF-001",
  "reportingPeriod": "2025-Q2",
  "totalFuelVolume": 5075000.0,
  "totalCreditsGenerated": 54580477.10,
  "totalDeficitsIncurred": 0.0,
  "netPosition": 54580477.10,
  "complianceStatus": "compliant",
  "submissionDate": "2025-07-15T10:30:00Z",
  "pathwaySummary": [
    {
      "pathwayId": "CA-RD-2025-LMR-001",
      "transactionCount": 15,
      "totalVolume": 1650000.0,
      "creditsGenerated": 18193492.37
    }
  ]
}
```

**Field Count:** 11 fields (58% of schema)

---

### Scenario 2: BOOST Enhanced Tracking

**Goal:** Full supply chain traceability with business intelligence

**Additional Fields:**
```json
{
  // ... all compliance fields from Scenario 1 ...

  "verificationDate": "2025-07-10T14:00:00Z",
  "verificationRequired": true,
  "VerificationStatementId": "VS-2025-Q2-PACIFIC-001",
  "reportingDeadline": "2025-08-15",
  "transactionIds": [
    "TXN-2025-Q2-001",
    "TXN-2025-Q2-002",
    // ... 15 transaction references ...
  ],
  "calculationParameters": {
    "conversionFactor": 138.7,
    "conversionFactorUnit": "MJ/gallon",
    "regulatoryBenchmark": 98.47,
    "benchmarkUnit": "gCO2e/MJ",
    "defaultEER": 1.0
  },
  "complianceMetrics": {
    "creditValue": {
      "estimatedValue": 10916095.42,
      "valueUnit": "USD",
      "creditPrice": 200.0,
      "priceUnit": "USD_per_credit"
    },
    "environmentalImpact": {
      "co2ReductionMT": 5458.05,
      "co2ReductionUnit": "metric_tons",
      "equivalentCarsRemoved": 1186
    }
  },
  "lastUpdated": "2025-07-21T16:45:00Z"
}
```

**Field Count:** 19 fields (100% of schema)

**Benefits Over Scenario 1:**
- ✅ Complete audit trail via transactionIds
- ✅ Financial visibility via credit valuation
- ✅ Stakeholder communication via environmental metrics
- ✅ Workflow management via verification tracking
- ✅ Data quality via calculation transparency

---

## Recommendations

### 1. Schema Adjustments

#### Mark `pathwaySummary` as Required
**Current:** Optional
**Should Be:** Required for CARB compliance
**Reason:** § 95491(c)(2) requires breakdown by FPC (Fuel Pathway Code)

**Suggested Change:**
```json
"required": [
  "@context",
  "@type",
  "@id",
  "reportingId",
  "regulatedEntityId",
  "reportingPeriod",
  "totalFuelVolume",
  "totalCreditsGenerated",
  "totalDeficitsIncurred",
  "netPosition",
  "complianceStatus",
  "pathwaySummary"  // ← ADD THIS
]
```

#### Make `submissionDate` Required Upon Submission
**Current:** Optional
**Should Be:** Required when submitting to CARB
**Reason:** Tracks compliance with quarterly deadlines

**Suggested Implementation:** Add business rule validation that requires `submissionDate` when `complianceStatus` is not "pending"

---

### 2. Web Interface Display

#### Compliance-Focused View
Show CARB-required fields prominently with ✅ indicators:
- Organization & Period
- Volumes & Credits
- Compliance Status
- Pathway Breakdown

#### Enhanced Tracking Section
Show BOOST-added fields in a separate "Enhanced Tracking" panel:
- Verification Status
- Transaction References
- Business Metrics

#### Field Labels
Add indicators to show field purpose:
- ✅ "CARB Required"
- 🔵 "BOOST Enhanced"
- 📊 "Business Intelligence"

---

### 3. Validation Rules

#### CARB Compliance Validation
- ✅ `netPosition` must equal `totalCreditsGenerated - totalDeficitsIncurred`
- ✅ `pathwaySummary` total volumes must sum to `totalFuelVolume`
- ✅ `pathwaySummary` total credits must sum to `totalCreditsGenerated`
- ✅ `reportingPeriod` must follow YYYY-QN format
- ✅ `submissionDate` must be provided before CARB submission

#### BOOST Enhanced Validation
- 🔵 `transactionIds` must reference valid Transaction entities
- 🔵 `regulatedEntityId` must reference valid Organization entity
- 🔵 `VerificationStatementId` must reference valid VerificationStatement entity
- 🔵 `reportingDeadline` should be 30 days after quarter end

---

## References

### Regulatory Citations

**Cal. Code Regs. Tit. 17, § 95491** - Fuel Transactions and Compliance Reporting
- § 95491(a): Report submission requirements
- § 95491(c): Quarterly reporting obligations
- § 95491(c)(2): Specific data fields required

Available at: https://www.law.cornell.edu/regulations/california/17-CCR-95491

**CARB LCFS Guidance Documents**
- LCFS Guidance 19-08: Fuel Pathway Allocation and Quarterly Reporting
- LCFS Reporting Tool (LRT-CBTS) User Guide

Available at: https://ww2.arb.ca.gov/our-work/programs/low-carbon-fuel-standard/lcfs-guidance-documents-user-guides-and-faqs

---

## Appendix: Quick Reference

### Field Classification Cheat Sheet

| Field | Required by BOOST? | Required by CARB? | Category |
|-------|-------------------|-------------------|----------|
| @context | ✅ | ❌ | JSON-LD |
| @type | ✅ | ❌ | JSON-LD |
| @id | ✅ | ❌ | JSON-LD |
| reportingId | ✅ | ❌ | BOOST Enhanced |
| regulatedEntityId | ✅ | ✅ | CARB Required |
| reportingPeriod | ✅ | ✅ | CARB Required |
| totalFuelVolume | ✅ | ✅ | CARB Required |
| totalCreditsGenerated | ✅ | ✅ | CARB Required |
| totalDeficitsIncurred | ✅ | ✅ | CARB Required |
| netPosition | ✅ | ✅ | CARB Required |
| complianceStatus | ✅ | ✅ | CARB Required |
| submissionDate | ❌ | ✅* | CARB Required* |
| verificationDate | ❌ | ❌ | BOOST Enhanced |
| verificationRequired | ❌ | ❌ | BOOST Enhanced |
| VerificationStatementId | ❌ | ❌ | BOOST Enhanced |
| reportingDeadline | ❌ | ❌ | BOOST Enhanced |
| transactionIds | ❌ | ❌ | BOOST Enhanced |
| pathwaySummary | ❌ | ✅ | CARB Required |
| calculationParameters | ❌ | ❌ | BOOST Enhanced |
| complianceMetrics | ❌ | ❌ | BOOST Enhanced |
| lastUpdated | ❌ | ❌ | BOOST Enhanced |

**\*Upon submission**

---

**Document Version:** 1.0
**Last Updated:** November 13, 2025
**Prepared By:** BOOST Schema Validation Team
