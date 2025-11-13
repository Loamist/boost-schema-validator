# LCFS Data Collection: Executive Summary

**Date:** November 13, 2025
**Purpose:** Clarify actual LCFS data requirements vs. current collection list

---

## 🎯 Key Finding

**57% of items on the "LCFS - Current Data Collected" slide are ONLY required for new pathway applications, NOT for quarterly compliance reporting.**

---

## ⚠️ Critical Question

**"Are we reporting fuel transactions using existing certified pathways, OR applying for a new Tier 1/2 pathway?"**

- **If REPORTING** → Need ~40% of listed data
- **If APPLYING** → Need 100% of listed data

---

## 📊 The Fundamental Difference

### Quarterly Reporting (Existing Pathways)
```
We use CARB's certified pathway code
   ↓
Pathway code = CA-RD-2025-LMR-001
   ↓
This code ALREADY contains:
  ✓ Carbon Intensity (19.85 gCO2e/MJ)
  ✓ Feedstock type
  ✓ Fuel product
  ✓ CA-GREET version
   ↓
We just report: Volume + Pathway Code + Date
```

### Pathway Application (New Certification)
```
We DON'T have a certified pathway yet
   ↓
We must CALCULATE the CI ourselves
   ↓
Requires:
  • 3+ months operational data
  • Complete CA-GREET modeling
  • Detailed facility information
  • Third-party verification
  • CARB approval process (6-12 months)
   ↓
RESULT: CARB issues pathway code
```

---

## 📋 What's Actually Required?

### ✅ Required for QUARTERLY REPORTING

| Data Item | Why |
|-----------|-----|
| Company FEIN | Organization identification |
| Contact Information | Portal access |
| EPA CARB Facility ID | Facility identification |
| **Fuel Pathway Code (FPC)** | **Most critical field** |
| Fuel Volume (gallons) | Transaction amount |
| Transaction Date | Reporting period tracking |
| Transaction Type | Import/export/sale |
| Business Partner | Counterparty info |

**Source:** Cal. Code Regs. Tit. 17, § 95491(c)(2)

### ❌ NOT Required for Quarterly Reporting

| Data Item | Only For |
|-----------|----------|
| Fuel Production Capabilities | Pathway applications |
| Pathway Descriptions | Pathway applications |
| **Carbon Intensity Information** | **From pathway code, not calculated** |
| **Operational CI Information** | **Pathway applications only** |
| **Months in Operations** | **Pathway applications (min. 3 months)** |
| **Margin of Safety Value** | **Pathway applications only** |
| **CA-GREET Calculator** | **Pathway applications only** |
| Detailed Attestations | Pathway applications (reporting has basic attestation) |

---

## 💡 Key Regulatory Evidence

### 1. What Must Be Reported Quarterly

> **"Information that must be reported are as follows: Organization FEIN, Reporting Period (year and quarter), FPC, and Facility ID (if applicable)."**
>
> — Cal. Code Regs. Tit. 17, § 95491(c)(2)

**Note:** CI calculation is NOT in this list.

### 2. Pathway Code Contains Everything

> **"FPC refers to the Fuel Pathway Code, which identifies the specific certified pathway for the fuel being reported."**
>
> — CARB LCFS Registration and Reporting

**What this means:** The pathway code already has the CI value. You don't recalculate it.

### 3. Operational Data Only for Applications

> **"Tier 1 Pathways require minimum 3 months of fuel production data and corresponding feedstock procurement records."**
>
> — CARB Apply for an LCFS Fuel Pathway

**What this means:** This is for pathway APPLICATIONS, not transaction REPORTING.

---

## 📈 Visual Comparison

### If Reporting with Existing Pathways

```
┌─────────────────────────────────────────┐
│       QUARTERLY TRANSACTION REPORT       │
├─────────────────────────────────────────┤
│ Pathway Code: CA-RD-2025-LMR-001        │
│ Volume: 1,650,000 gallons               │
│ Date: Q2 2025                           │
│ Company: ABC Renewable Fuels            │
│                                         │
│ Carbon Intensity: 19.85 gCO2e/MJ       │
│ ➜ Retrieved from pathway code          │
│ ➜ We don't calculate this              │
└─────────────────────────────────────────┘

Time to submit: ~2 hours
Cost: Minimal (internal staff time)
```

### If Applying for New Pathway

```
┌─────────────────────────────────────────┐
│         TIER 1 PATHWAY APPLICATION       │
├─────────────────────────────────────────┤
│ ✓ Complete facility information         │
│ ✓ 3 months operational data             │
│ ✓ Feedstock characterization            │
│ ✓ Energy input measurements             │
│ ✓ Process flow diagrams                 │
│ ✓ CA-GREET modeling                     │
│ ✓ Calculate CI ourselves               │
│ ✓ Margin of safety analysis             │
│ ✓ Third-party verification              │
│ ✓ Attestations & legal declarations     │
│                                         │
│ Carbon Intensity: WE CALCULATE THIS     │
│ ➜ This is what we're applying for       │
│ ➜ Result: CARB issues pathway code      │
└─────────────────────────────────────────┘

Time to complete: 6-12 months
Cost: $50,000-$250,000+ (verification)
```

---

## 🔍 Item-by-Item Verdict

### From "LCFS - Current Data Collected" Slide

| Item | Reporting? | Application? | Evidence |
|------|-----------|--------------|----------|
| Company Information | ✅ YES | ✅ YES | § 95491(c)(2) |
| Contact Information | ✅ YES | ✅ YES | Portal requirement |
| EPA CARB Facility ID | ✅ YES | ✅ YES | § 95491(c)(2) |
| Facility Information | ⚠️ ID only | ✅ Detailed | Reporting needs ID; apps need full details |
| Fuel Production Capabilities | ❌ NO | ✅ YES | Not in § 95491 |
| Fuel Type | ✅ Via code | ✅ YES | Implicit in pathway code |
| Feedstock | ✅ Via code | ✅ YES | Implicit in pathway code |
| Pathway Descriptions | ❌ NO | ✅ YES | Use code for reporting |
| **Carbon Intensity Information** | ❌ **NO** | ✅ **YES** | From pathway, not calculated |
| **Operational CI Information** | ❌ **NO** | ✅ **YES** | Apps only |
| **Months in Operations** | ❌ **NO** | ✅ **YES** | Apps need 3+ months |
| **Margin of Safety Value** | ❌ **NO** | ✅ **YES** | Apps only |
| Attestations | ⚠️ Basic | ✅ Detailed | Different types |
| **CA-GREET Calculator** | ❌ **NO** | ✅ **YES** | Apps only |

**Result:** 8 items (57%) not needed for quarterly reporting

---

## 💼 Our BOOST Schema Status

### ✅ Already Well-Designed for Reporting

**LCFSPathway Entity:**
- Stores certified pathway data FROM CARB
- Contains pathway code, CI value, feedstock, fuel type
- This is REFERENCE data, not data we calculate

**LCFSReporting Entity:**
- Matches quarterly report structure
- References pathway codes
- Aggregates transaction volumes

**Evidence from Our Own Documentation:**

From `BOOST_to_GREET_Field_Mapping.csv`:

> **Row 57:** "carbonIntensity is 'the KEY OUTPUT from GREET that BOOST stores' with data flow direction **'GREET → BOOST'**"
>
> **Row 66:** "BOOST tracks supply chain; GREET models lifecycle. BOOST is **primarily for tracking certified pathways**"

**Translation:** We store CI values from CARB's certified pathways. We don't calculate them ourselves for reporting.

---

## 🎯 Recommended Next Steps

### 1. Clarify Business Model
**Ask:** "Which scenario applies to us?"

**Scenario A: Quarterly Reporting (Most Common)**
- Using existing CARB-certified pathways
- Reporting fuel transactions
- Generating credits based on certified CI values

**Scenario B: Pathway Application (Major Project)**
- Creating our own custom pathway
- Need unique CI value for our process
- 6-12 month project with verification costs

### 2. Adjust Data Collection

**If Scenario A (Reporting):**
- ❌ **STOP collecting:** Operational CI, margin of safety, months operating, CA-GREET calculators
- ✅ **START collecting:** Pathway codes (FPCs) for fuels we use
- ✅ **FOCUS ON:** Transaction volumes, dates, business partners

**If Scenario B (Application):**
- ✅ **CONTINUE collecting:** All items on current list
- ✅ **ADD:** Third-party verifier engagement
- ✅ **PLAN:** 6-12 month timeline, verification budget

### 3. Quick Validation Check

**Open CARB's certified pathway database:**
- https://ww2.arb.ca.gov/resources/documents/lcfs-pathway-certified-carbon-intensities

**Check:** Do certified pathways already exist for our fuel products and feedstocks?
- **YES** → Use those pathway codes for reporting (Scenario A)
- **NO** → Need to apply for new pathway (Scenario B)

---

## 📞 Questions to Ask Your Boss

1. **"Are we producing fuel using processes that already have CARB-certified pathways?"**
   - If YES → We should use existing pathways (just report transactions)
   - If NO → We need to apply for a new pathway

2. **"Do we have pathway codes (like CA-RD-2025-XXX-###) for the fuels we're producing?"**
   - If YES → We're doing quarterly reporting
   - If NO → Either we need to get pathway codes OR apply for our own

3. **"What's our timeline and budget for LCFS compliance?"**
   - If "start reporting next quarter" → Must use existing pathways
   - If "6-12 months and $100k+ budget" → Could apply for custom pathway

4. **"Are our production processes unique/innovative, or standard industry processes?"**
   - If standard → Likely certified pathways already exist
   - If unique → May need Tier 2 application for custom pathway

---

## 🔑 Key Takeaways

### The Bottom Line

1. **Pathway Code = Everything**
   - A single FPC contains CI, feedstock, fuel type, GREET version
   - For reporting, you just reference the code
   - You DON'T recalculate CI for quarterly reports

2. **Two Different Processes**
   - **Pathway Application** = One-time certification (all slide items needed)
   - **Quarterly Reporting** = Ongoing transactions (only 43% of slide items needed)

3. **Regulation is Clear**
   - § 95491(c)(2) lists exactly what's required for quarterly reporting
   - It does NOT include CI calculations, operational data, or GREET modeling

4. **Our Schema is Correct**
   - BOOST stores certified pathway data
   - References pathways in transaction reporting
   - Designed for Scenario A (reporting), not Scenario B (applications)

### The Ask

**"Can we confirm which scenario we're in so we can focus data collection efforts appropriately?"**

---

## 📚 Full Documentation

For detailed analysis with regulatory citations:
→ See **`LCFS_Reporting_vs_Pathway_Application_Requirements.md`**

Includes:
- Complete regulatory citations
- Detailed evidence for each item
- CARB guidance document references
- Full comparison tables
- BOOST schema alignment analysis

---

**Prepared by:** BOOST Schema Validation Team
**Date:** November 13, 2025

**CARB LCFS Helpline:** (800) 242-4450 | helpline@arb.ca.gov
