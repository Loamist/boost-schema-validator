# LCFS: Quarterly Reporting vs. Pathway Application Requirements

**Analysis Date:** November 13, 2025
**Purpose:** Clarify data collection requirements for LCFS compliance reporting vs. new pathway certification applications

---

## Executive Summary

**Critical Distinction:** The data requirements differ dramatically depending on whether you are:

1. **Reporting fuel transactions using existing certified pathways** (ongoing quarterly reporting)
2. **Applying for a new Tier 1 or Tier 2 fuel pathway certification** (one-time application process)

**Key Finding:** Many items on the "LCFS - Current Data Collected" slide are **ONLY required for new pathway applications**, not for quarterly compliance reporting with existing certified pathways.

---

## Table of Contents

1. [Quarterly Reporting Requirements](#quarterly-reporting-requirements)
2. [Pathway Application Requirements](#pathway-application-requirements)
3. [Side-by-Side Comparison](#side-by-side-comparison)
4. [Analysis of Current Data Collection List](#analysis-of-current-data-collection-list)
5. [References & Regulatory Citations](#references--regulatory-citations)
6. [Recommendations](#recommendations)

---

## Quarterly Reporting Requirements

### Purpose
Report fuel transactions and generate LCFS credits/deficits based on **existing certified pathways**.

### Regulatory Basis
- **Cal. Code Regs. Tit. 17, § 95491** - Fuel Transactions and Compliance Reporting[^1]
- **LCFS Guidance 19-08** - Fuel Pathway Allocation for Produced Fuel and Quarterly Fuel Transactions Reporting[^2]

### Required Data Fields

According to § 95491(c)(2), quarterly fuel transaction reports must include:[^1]

| Data Field | Description | Example |
|------------|-------------|---------|
| **Organization FEIN** | Federal Employer Identification Number | 12-3456789 |
| **Reporting Period** | Year and quarter | 2025-Q2 |
| **FPC (Fuel Pathway Code)** | Certified pathway identifier | CA-RD-2025-LMR-001 |
| **Fuel Amount** | Volume (gallons, kWh, or kg) | 1,650,000 gallons |
| **Transaction Type** | Import, export, sale, purchase, etc. | Production |
| **Transaction Date** | Date of transaction | 2025-06-15 |
| **Business Partner** | Counterparty (if applicable) | Pacific Refining Co. |
| **Fuel Application** | End-use category | Transportation diesel |
| **Production Company ID** | Producer identifier (if applicable) | PROD-12345 |
| **Facility ID** | Production facility ID (if applicable) | FAC-67890 |

### What You DON'T Calculate or Submit

- ❌ **Carbon Intensity (CI)** - This comes from the certified pathway code (FPC)
- ❌ **CA-GREET Modeling** - Already completed during pathway certification
- ❌ **Operational CI Data** - Not required for transaction reporting
- ❌ **Detailed Pathway Descriptions** - Just reference the pathway code
- ❌ **Fuel Production Capabilities** - Not needed for reporting transactions
- ❌ **Months in Operations** - Not required for quarterly reports
- ❌ **Margin of Safety Values** - Not part of transaction reporting

### Key Regulatory Quote

> "Information that must be reported are as follows: Organization FEIN, Reporting Period (year and quarter), FPC, and Facility ID (if applicable)."
>
> — Cal. Code Regs. Tit. 17, § 95491(c)(2)[^1]

### Reporting System
- **LCFS Reporting Tool (LRT-CBTS)** at `ssl.arb.ca.gov/lcfsrt/`[^3]
- Quarterly deadlines: 30 days after quarter end (March 30, June 30, September 30, December 30)

---

## Pathway Application Requirements

### Purpose
Obtain a **new certified pathway** with a CARB-approved carbon intensity (CI) value for a specific fuel production process.

### Regulatory Basis
- **Cal. Code Regs. Tit. 17, § 95488** - Certification of Fuel Pathways[^4]
- **LCFS Guidance 19-05** - Low Carbon Fuel Standard Pathway Certification and Fuel Reporting[^5]

### Application Types

#### **Lookup Table Pathways**
- Use standardized CI values from CARB tables
- Minimal documentation required
- Example: Zero-CI electricity from renewable sources

#### **Tier 1 Pathways**
- Simplified CI calculation using standardized Tier 1 Calculators
- Requires **minimum 3 months of operational data**[^6]
- Standardized inputs for most parameters
- Site-specific data for key operational inputs
- Mandatory third-party verification

#### **Tier 2 Pathways**
- Full CA-GREET 3.0 modeling with project-specific parameters
- Custom modifications to address unique technologies or feedstocks
- Detailed technical report required
- **10-day public comment period**[^7]
- Comprehensive third-party verification

### Required Data for Tier 1/2 Applications

Based on CARB guidance documents[^6], pathway applications require:

| Data Category | Required Information | Why It's Needed |
|---------------|---------------------|-----------------|
| **Company Information** | Legal entity, FEIN, contact details | Application identification |
| **Facility Information** | Location, equipment, capacity, process description | Define production parameters |
| **Feedstock Data** | Type, source, properties (moisture, energy content) | Lifecycle upstream emissions |
| **Production Process** | Equipment, energy inputs (electricity, natural gas), yields | Calculate process emissions |
| **Fuel Product** | Type, specifications, energy content | Define fuel characteristics |
| **Carbon Intensity** | Complete CA-GREET or Simplified CI Calculator | **THIS IS WHAT YOU'RE APPLYING FOR** |
| **Operational Data** | 3+ months of production records | Validate CI inputs |
| **Margin of Safety** | Statistical uncertainty buffer | Account for operational variability |
| **Attestations** | Legal declarations, data accuracy affirmations | Regulatory compliance |
| **CA-GREET Version** | Model version used | Calculation methodology |

### Key Regulatory Quotes

> "Tier 1 is a simplified process where standardized inputs are used in fields in the CA-GREET 3.0 calculator, along with **24 months of site-specific operational data**."
>
> — CARB LCFS Guidance Documents[^7]

> "Tier 1 Pathways require **minimum 3 months of fuel production data and corresponding feedstock procurement records**."
>
> — CARB Apply for an LCFS Fuel Pathway[^6]

> "Tier 2 applications are based on **CARB-approved modifications to Tier 1 calculators or the CA-GREET3.0 model**, designed to capture project-specific parameters."
>
> — CARB LCFS Guidance Documents[^7]

### Application System
- **Alternative Fuels Portal (AFP)** - Online submission portal
- Processing time: 60-180 days depending on pathway type[^8]

---

## Side-by-Side Comparison

### Transaction Reporting (Existing Pathway)

```
┌─────────────────────────────────────┐
│  QUARTERLY FUEL TRANSACTION REPORT  │
└─────────────────────────────────────┘

Required Data:
✅ Pathway Code (FPC): CA-RD-2025-LMR-001
✅ Fuel Volume: 1,650,000 gallons
✅ Company/Facility IDs
✅ Transaction dates
✅ Reporting period: 2025-Q2

Carbon Intensity:
➜ Automatically retrieved from certified
  pathway CA-RD-2025-LMR-001
➜ CI = 19.85 gCO2e/MJ (already certified)

System: LRT-CBTS
Frequency: Quarterly
Verification: Annual (if large reporter)
```

### Pathway Application (New Certification)

```
┌─────────────────────────────────────┐
│    TIER 1/2 PATHWAY APPLICATION     │
└─────────────────────────────────────┘

Required Data:
✅ Facility details & capacity
✅ Complete process description
✅ Feedstock characteristics
✅ Production energy inputs
✅ 3+ months operational data
✅ CA-GREET modeling OR Simplified Calculator
✅ Operational CI calculations
✅ Margin of safety analysis
✅ Statistical uncertainty analysis
✅ Detailed attestations
✅ Third-party verification report

Carbon Intensity:
➜ YOU CALCULATE THIS using CA-GREET
➜ This is the OUTPUT of your application
➜ Result: Certified pathway code issued

System: Alternative Fuels Portal (AFP)
Frequency: One-time (+ annual updates)
Verification: Mandatory before certification
```

---

## Analysis of Current Data Collection List

Below is the analysis of each item on your "LCFS - Current Data Collected" slide:

| Item on Slide | Needed for Quarterly Reporting? | Needed for Pathway Application? | Evidence |
|---------------|--------------------------------|--------------------------------|----------|
| **Company Information** | ✅ **YES** (partial) | ✅ **YES** (detailed) | § 95491(c)(2) requires Organization FEIN[^1] |
| **Contact Information** | ✅ **YES** (basic) | ✅ **YES** (detailed) | Required for LRT-CBTS registration[^3] |
| **EPA CARB Facility ID** | ✅ **YES** (if applicable) | ✅ **YES** | § 95491(c)(2) requires Facility ID[^1] |
| **Facility Information** | ⚠️ **PARTIAL** (ID only) | ✅ **YES** (comprehensive) | Detailed facility data only for applications[^6] |
| **Fuel Production Capabilities** | ❌ **NO** | ✅ **YES** | Not in § 95491 reporting requirements[^1] |
| **Fuel Type** | ✅ **YES** (via FPC) | ✅ **YES** | § 95491(c)(2) requires Fuel Application[^1] |
| **Feedstock** | ✅ **YES** (via FPC) | ✅ **YES** (detailed) | Implicit in pathway code for reporting[^1] |
| **Pathway Descriptions** | ❌ **NO** - just use pathway code | ✅ **YES** (detailed) | FPC replaces need for description in reporting[^1] |
| **Carbon Intensity Information** | ❌ **NO** - comes from FPC | ✅ **YES** - you calculate it | CI is OUTPUT of pathway certification, INPUT to reporting[^9] |
| **Operational CI Information** | ❌ **NO** | ✅ **YES** (3+ months data) | Required for Tier 1/2 applications only[^6] |
| **Months in Operations** | ❌ **NO** | ✅ **YES** (min. 3 months) | Tier 1 requires 3 months operational data[^6] |
| **Margin of Safety Value** | ❌ **NO** | ✅ **YES** | Used in CI calculation for pathway apps[^5] |
| **Attestations** | ⚠️ **DIFFERENT TYPE** | ✅ **YES** (comprehensive) | Quarterly reports have simple attestations; applications need detailed technical attestations[^6] |
| **Complete Simplified CI Calculator or CA-GREET 3.0** | ❌ **NO** | ✅ **YES** | Required for Tier 1/2 applications[^7] |

### Summary Score

**For Quarterly Reporting with Existing Pathways:**
- ✅ Fully Required: **4 items** (Company info, Contact, Facility ID, Fuel type via FPC)
- ⚠️ Partially Required: **2 items** (Basic facility ID, Feedstock via FPC)
- ❌ Not Required: **8 items** (57% of the list)

**For New Pathway Application:**
- ✅ All **14 items** required

---

## Key Conceptual Difference

### The Pathway Code (FPC) Contains Everything

When reporting quarterly transactions, you use a **Fuel Pathway Code (FPC)** like `CA-RD-2025-LMR-001`.

This single code already contains:
- ✅ Carbon Intensity (19.85 gCO2e/MJ)
- ✅ Feedstock type (logging and mill residue)
- ✅ Fuel product (renewable diesel)
- ✅ Energy Economy Ratio (1.0)
- ✅ CA-GREET version (3.0)
- ✅ Facility location (general region)
- ✅ Pathway type (Tier 1)

### Regulatory Evidence

> "FPC refers to the **Fuel Pathway Code**, which identifies the specific certified pathway for the fuel being reported."
>
> — CARB LCFS Registration and Reporting[^3]

This is why you **don't recalculate CI** or submit detailed pathway information during quarterly reporting - you're simply referencing an existing certified pathway.

---

## Your BOOST Schema Alignment

Your BOOST schema correctly models this distinction:

### **LCFSPathway Entity** - Stores Certified Pathway Data

```json
{
  "pathwayId": "CA-RD-2025-LMR-001",
  "carbonIntensity": 19.85,
  "caGreetVersion": "3.0",
  "feedstockCategory": "logging_and_mill_residue",
  "fuelProduct": "renewable_diesel",
  "verificationStatus": "active"
}
```

This entity stores the **result** of pathway certification, not the inputs.

### **LCFSReporting Entity** - Quarterly Compliance Reports

```json
{
  "reportingId": "LCFS-RPT-2025-Q2-ABC123",
  "regulatedEntityId": "ORG-PACIFIC-RF-001",
  "reportingPeriod": "2025-Q2",
  "totalFuelVolume": 5075000.0,
  "totalCreditsGenerated": 54580477.10,
  "pathwaySummary": [
    {
      "pathwayId": "CA-RD-2025-LMR-001",
      "totalVolume": 1650000.0,
      "creditsGenerated": 18193492.37
    }
  ]
}
```

This entity **references** certified pathways and reports transaction volumes.

### Evidence from Your Mapping

From `BOOST_to_GREET_Field_Mapping.csv`:

**Row 57 - GREET Output Stored:**
- **Category:** "GREET Output Stored"
- **BOOST Entity:** LCFSPathway
- **BOOST Field:** carbonIntensity
- **GREET Model Input Category:** "GREET Model Output"
- **Data Flow Direction:** "GREET → BOOST"
- **Notes:** "This is the KEY OUTPUT from GREET that BOOST stores"

**Row 66 - Key Insight:**
- **Category:** "Key Insight"
- **Note:** "BOOST tracks supply chain; GREET models lifecycle. BOOST provides SOME inputs to GREET Tier 1/2 applications but is **primarily for tracking certified pathways**"

**Row 73 - AFP Alignment:**
- **Category:** "AFP Alignment"
- **BOOST Entity:** LCFSReporting
- **Note:** "LCFSReporting appears designed to **match AFP quarterly report structure**"
- **Required for LCFS Pathway:** Yes
- **Notes:** "Direct AFP submission"

---

## References & Regulatory Citations

[^1]: Cal. Code Regs. Tit. 17, § 95491 - Fuel Transactions and Compliance Reporting. Available at: https://www.law.cornell.edu/regulations/california/17-CCR-95491

[^2]: CARB LCFS Guidance 19-08 - Fuel Pathway Allocation for Produced Fuel and Quarterly Fuel Transactions Reporting. California Air Resources Board. Available at: https://ww2.arb.ca.gov/our-work/programs/low-carbon-fuel-standard/lcfs-guidance-documents-user-guides-and-faqs

[^3]: CARB LCFS Registration and Reporting. California Air Resources Board. Available at: https://ww2.arb.ca.gov/our-work/programs/low-carbon-fuel-standard/lcfs-registration-and-reporting

[^4]: Cal. Code Regs. Tit. 17, § 95488 - Certification of Fuel Pathways. California Code of Regulations.

[^5]: CARB LCFS Guidance 19-05 - Low Carbon Fuel Standard Pathway Certification and Fuel Reporting. California Air Resources Board. Available at: https://ww2.arb.ca.gov/sites/default/files/classic/fuels/lcfs/guidance/lcfsguidance_19-05.pdf

[^6]: Apply for an LCFS Fuel Pathway. California Air Resources Board. Retrieved November 13, 2025. Available at: https://ww2.arb.ca.gov/resources/documents/apply-lcfs-fuel-pathway. Quote: "Tier 1 Pathways require minimum 3 months of fuel production data and corresponding feedstock procurement records."

[^7]: LCFS Guidance Documents, User Guides, and FAQs. California Air Resources Board. Retrieved November 13, 2025. Available at: https://ww2.arb.ca.gov/our-work/programs/low-carbon-fuel-standard/lcfs-guidance-documents-user-guides-and-faqs

[^8]: Alternative Fuels Portal (AFP) User Guide. California Air Resources Board. Available through LCFS Guidance Documents.

[^9]: BOOST_to_GREET_Field_Mapping.csv (Internal documentation, November 2025). Row 57: "Category: GREET Output Stored, Notes: This is the KEY OUTPUT from GREET that BOOST stores, Data Flow Direction: GREET → BOOST"

### Additional References

- **2025 LCFS Amendment Implementation FAQ.** California Air Resources Board. Available at: https://ww2.arb.ca.gov/resources/fact-sheets/2025-lcfs-amendment-implementation-faq

- **LCFS Pathway Certified Carbon Intensities.** California Air Resources Board. Database of all certified pathways with CI values. Available at: https://ww2.arb.ca.gov/resources/documents/lcfs-pathway-certified-carbon-intensities

- **Low Carbon Fuel Standard Reporting Tool Quarterly Summaries.** California Air Resources Board. Available at: https://ww2.arb.ca.gov/resources/documents/low-carbon-fuel-standard-reporting-tool-quarterly-summaries

---

## Recommendations

### 1. Clarify Your Business Use Case

**Question to ask your boss:**
*"Are we reporting fuel transactions using existing certified pathways, or are we applying for our own new Tier 1 or Tier 2 pathway certification?"*

**If Reporting Transactions (Most Common):**
- Focus on **transaction-level data collection**
- Maintain database of **certified pathway codes** you're using
- Track **fuel volumes, dates, and business partners**
- **Do not** collect operational CI data, margin of safety, or CA-GREET calculators

**If Applying for New Pathway:**
- All items on the slide are necessary
- Budget 6-12 months for application process
- Expect $50,000-$250,000 in third-party verification costs
- Plan for annual updates with new operational data

### 2. Update Data Collection Based on Use Case

**For Quarterly Reporting, REMOVE these items:**
- ❌ Fuel Production Capabilities (not in § 95491)
- ❌ Detailed Pathway Descriptions (use FPC instead)
- ❌ Operational CI Information (comes from pathway code)
- ❌ Months in Operations (only for applications)
- ❌ Margin of Safety Value (only for applications)
- ❌ Complete CI Calculator/CA-GREET (only for applications)

**For Quarterly Reporting, KEEP these items:**
- ✅ Company Information (FEIN)
- ✅ Contact Information (LRT-CBTS access)
- ✅ EPA CARB Facility ID
- ✅ Fuel volumes and transaction dates
- ✅ Pathway codes (FPCs) being used
- ✅ Business partner information

### 3. Leverage Your BOOST Schema

Your BOOST schema is **already well-designed** for quarterly reporting:

- **LCFSPathway entity** stores certified pathway data (CI values from CARB)
- **LCFSReporting entity** matches quarterly report structure
- **Transaction entity** links volumes to pathway codes

**Recommended workflow:**
1. Import certified pathways from CARB database → LCFSPathway entities
2. Record transactions with pathway references → Transaction entities
3. Aggregate quarterly data → LCFSReporting entity
4. Submit to LRT-CBTS via AFP

### 4. Evidence-Based Discussion Points

When discussing with your boss, reference:

**Regulatory Evidence:**
- *"California Code of Regulations Title 17, Section 95491(c)(2) specifies exactly what must be reported quarterly: FEIN, reporting period, FPC, fuel amount, and transaction details - **it does not require CI calculations or operational data**."*

**Pathway Code Concept:**
- *"The Fuel Pathway Code (FPC) already contains the certified CI value. We don't recalculate it - we just reference the code. CARB already did the CA-GREET modeling when they certified the pathway."*

**Cost/Benefit:**
- *"Collecting operational CI data, margin of safety values, and maintaining CA-GREET calculators would require significant resources but **is not required by regulation for quarterly reporting** with existing pathways."*

**Internal Documentation:**
- *"Our own BOOST_to_GREET_Field_Mapping.csv (Row 57) confirms that carbonIntensity is 'the KEY OUTPUT from GREET that BOOST stores' with data flow direction 'GREET → BOOST', not something we calculate ourselves for reporting."*

### 5. Next Steps

1. **Confirm business model** - Reporting vs. pathway application
2. **Review CARB certified pathway database** - Identify pathways your company uses
3. **Simplify data collection** if doing quarterly reporting only
4. **Access LRT-CBTS portal** - Review actual reporting templates
5. **Test BOOST schema** with real transaction data
6. **Consider pathway application timeline** if planning to apply for new pathways in future

---

## Appendix: Quick Reference Chart

### "Do I need to collect this data?"

| Data Item | Transaction Reporting | Pathway Application |
|-----------|----------------------|---------------------|
| Company FEIN | ✅ Yes | ✅ Yes |
| Facility ID | ✅ Yes | ✅ Yes |
| Pathway Code (FPC) | ✅ **CRITICAL** | N/A - You're creating it |
| Fuel Volume | ✅ Yes | ✅ Yes (historical) |
| Transaction Dates | ✅ Yes | ✅ Yes (historical) |
| CI Value | ❌ From pathway code | ✅ You calculate |
| Feedstock Details | ❌ From pathway code | ✅ Detailed analysis |
| Production Capacity | ❌ No | ✅ Yes |
| Operational CI | ❌ No | ✅ 3+ months required |
| CA-GREET/Calculator | ❌ No | ✅ Required |
| Margin of Safety | ❌ No | ✅ Required |
| Months Operating | ❌ No | ✅ Min. 3 months |
| Process Description | ❌ No | ✅ Detailed required |
| Attestations | ✅ Basic | ✅ Comprehensive |

---

**Document Prepared By:** BOOST Schema Validation Team
**Date:** November 13, 2025
**Version:** 1.0

**For Questions or Clarifications:**
Consult CARB LCFS Helpline: (800) 242-4450 or helpline@arb.ca.gov
