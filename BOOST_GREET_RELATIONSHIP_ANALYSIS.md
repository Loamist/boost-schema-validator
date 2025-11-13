# BOOST to GREET Model Relationship Analysis

**Date:** October 24, 2025
**Branch:** `lcfs_pathway`
**Purpose:** Clarify how BOOST entities relate to CA-GREET model inputs/outputs for LCFS compliance

---

## Executive Summary

### Key Finding: BOOST and GREET Serve Different (But Complementary) Roles

**GREET Model (CA-GREET):**
- **Purpose:** Lifecycle carbon intensity (CI) calculation modeling tool
- **Input:** Feedstock production data, facility energy use, transport distances, conversion efficiency
- **Output:** Certified carbon intensity (gCO2e/MJ) for fuel pathways
- **Users:** Fuel producers applying for CARB pathway certification

**BOOST Schema (LCFSPathway + LCFSReporting):**
- **Purpose:** Storage and validation of certified pathway data + transaction reporting
- **Input:** Certified pathway data from CARB (including GREET outputs) + fuel transaction volumes
- **Output:** Quarterly LCFS compliance reports for AFP submission
- **Users:** Regulated entities tracking credits/deficits

### The Critical Insight

**LCFSPathway stores the OUTPUT of GREET, not the input:**

```
Feedstock Data → [GREET Model] → Carbon Intensity (19.85 gCO2e/MJ)
                                            ↓
                            [Stored in BOOST LCFSPathway.carbonIntensity]
```

---

## Data Flow Architecture

### Scenario 1: Existing Certified Pathway (Current State)

```
┌─────────────────────────────────────────────────────────────┐
│  CARB Certified Pathways Database (via AFP)                │
│  - Pathway ID: CA-RD-2025-LMR-001                          │
│  - Carbon Intensity: 19.85 gCO2e/MJ (from GREET)           │
│  - Feedstock: logging_and_mill_residue                     │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
         ┌─────────────────────────────┐
         │  BOOST LCFSPathway Entity   │
         │  - pathwayId                │
         │  - carbonIntensity          │
         │  - caGreetVersion           │
         └──────────────┬──────────────┘
                        ↓
         ┌─────────────────────────────┐
         │  BOOST Transaction Entity   │
         │  - LcfsPathwayId (ref)      │
         │  - fuelVolume: 1,650,000 gal│
         └──────────────┬──────────────┘
                        ↓
         ┌─────────────────────────────┐
         │  BOOST LCFSReporting Entity │
         │  - totalCreditsGenerated    │
         │  - pathwaySummary           │
         └─────────────────────────────┘
                        ↓
              AFP Quarterly Submission
```

**In this scenario:** BOOST does NOT provide input to GREET. BOOST stores GREET's output and uses it for credit calculations.

---

### Scenario 2: New Pathway Application (Potential Use Case)

```
┌──────────────────────────────────────────────────────────────┐
│  BOOST Supply Chain Tracking (3+ months operational data)   │
│  - TraceableUnit: volumes, species, harvest locations       │
│  - GeographicData: origin/destination coordinates           │
│  - Transaction: transport distances, fuel volumes           │
│  - Material: moisture content, energy content               │
│  - EnergyCarbonData: measured CI values, transport fuel     │
└────────────────────────────┬─────────────────────────────────┘
                             ↓
              ┌──────────────────────────────┐
              │  CA-GREET Tier 1/2 Calculator│
              │  (Manual data entry by user) │
              │  - Feedstock volume          │
              │  - Transport distance        │
              │  - Moisture content          │
              │  - Facility energy inputs    │
              └──────────────┬───────────────┘
                             ↓
              ┌──────────────────────────────┐
              │  CARB Pathway Certification  │
              │  - Assigns Pathway ID        │
              │  - Certifies CI from GREET   │
              └──────────────┬───────────────┘
                             ↓
              ┌──────────────────────────────┐
              │  BOOST LCFSPathway Entity    │
              │  (stores certified results)  │
              └──────────────────────────────┘
```

**In this scenario:** BOOST TraceableUnit/Transaction data COULD help populate GREET Tier 1/2 calculator inputs, but this is not currently automated.

---

## Field-Level Mapping Summary

### Direct Matches (BOOST stores GREET outputs)

| BOOST Entity | BOOST Field | GREET Relationship | Direction |
|--------------|-------------|-------------------|-----------|
| LCFSPathway | carbonIntensity | Final CI output from GREET | GREET → BOOST |
| LCFSPathway | caGreetVersion | GREET model version used | GREET → BOOST |
| LCFSPathway | energyEconomyRatio | EER from GREET/CARB | GREET → BOOST |
| LCFSPathway | pathwayId | CARB pathway ID (post-GREET) | CARB → BOOST |
| LCFSPathway | feedstockCategory | GREET feedstock classification | GREET → BOOST |

### Potential GREET Inputs (from BOOST supply chain tracking)

| BOOST Entity | BOOST Field | GREET Input Category | Tier 1/2 Applicability |
|--------------|-------------|---------------------|----------------------|
| TraceableUnit | totalVolumeM3 | Feedstock volume | Required for Tier 1 |
| TraceableUnit | harvestGeographicDataId → GeographicData | Origin coordinates | Transport distance calculation |
| TraceableUnit | currentGeographicDataId → GeographicData | Destination coordinates | Transport distance calculation |
| Transaction | haulDistance | Transport distance (miles) | Direct GREET input |
| Material | standardMoistureContent | Moisture content (%) | Critical for biomass CI |
| Material | energyContent | Energy density (MJ/kg) | Feedstock energy properties |
| EnergyCarbonData | value (when dataType=moisture) | As-received moisture | Affects energy content |
| GeographicData | administrativeRegion | Regional grid mix | Electricity CI by region |

### Missing GREET Inputs (Not in BOOST)

| GREET Requirement | BOOST Coverage | Gap Description |
|------------------|---------------|-----------------|
| Facility energy consumption (kWh, natural gas) | Not tracked | Production process energy use |
| Co-product allocation (biochar, heat, etc.) | Not tracked | Multi-product system boundaries |
| Avoided emissions (baseline scenario) | Not tracked | Counterfactual modeling |
| Transport mode (truck vs rail vs barge) | Partially (could enhance) | Different emission factors |
| N2O emissions from soil | Not applicable | Only for agricultural feedstocks |
| Fertilizer inputs | Not applicable | Only for cultivated crops |

---

## LCFSReporting to AFP Alignment

**Excellent alignment** - LCFSReporting entity appears purpose-built for AFP quarterly submissions:

| LCFSReporting Field | AFP Requirement | Match Quality |
|---------------------|-----------------|---------------|
| reportingPeriod | Quarterly period (YYYY-QN) | Exact match |
| totalFuelVolume | Total gallons reported | Exact match |
| totalCreditsGenerated | Credits generated | Exact match |
| pathwaySummary | Breakdown by pathway | Exact match |
| transactionIds | Transaction-level detail | Exact match |
| calculationParameters | Conversion factors, benchmarks | Exact match |
| verificationRequired | Third-party verification flag | Exact match |
| submissionDate | AFP submission timestamp | Exact match |

**Conclusion:** BOOST LCFSReporting entity can directly generate AFP submissions.

---

## Critical Questions from Meeting (Oct 22, 2025)

### Question 1: "If Boost's output is not an input to the GREET model, it is irrelevant" - Peter Christensen

**Answer:**
- **Current State:** BOOST LCFSPathway is NOT a GREET input - it stores GREET outputs
- **Potential Use:** BOOST TraceableUnit/Transaction data COULD feed GREET Tier 1/2 applications
- **Primary Value:** BOOST provides transaction tracking and AFP reporting, not GREET modeling

### Question 2: Does BOOST duplicate existing AFP functionality?

**Answer:**
- **No duplication in reporting:** LCFSReporting entity structures AFP submission data
- **Added value:** Supply chain traceability (TraceableUnit) that AFP doesn't provide
- **Potential duplication:** If goal is only to submit quarterly reports without supply chain tracking

### Question 3: What is BOOST's unique value for LCFS?

**Three potential value propositions:**

1. **Supply Chain Transparency** (Primary value)
   - Track biomass from harvest → facility → fuel production → sale
   - Meet 2026 geographic coordinate requirements
   - Meet 2028 third-party certification requirements
   - Provide audit trail beyond what AFP requires

2. **Pathway Application Assistance** (Potential value)
   - Aggregate 3+ months operational data for Tier 1 applications
   - Auto-populate some GREET calculator inputs
   - Streamline new pathway certification process

3. **Transaction Management** (Operational value)
   - Link fuel volumes to certified pathways
   - Calculate credits in real-time
   - Simplify quarterly AFP reporting

---

## 2026 & 2028 LCFS Biomass Requirements

### 2026: Attestation + Geographic Coordinates

**Requirement:** Maintain attestations and geographic shapefiles/coordinates of harvest plots

**BOOST Readiness:**
- ✅ GeographicData entity supports GeoJSON boundaries
- ✅ TraceableUnit links to harvestGeographicDataId
- ✅ Can store plot boundaries as Polygon GeoJSON
- ⚠️ Need to ensure data collection workflow captures this

### 2028: Third-Party Certification

**Requirement:** Biomass feedstock must have third-party sustainability certification from origin to gathering point

**BOOST Readiness:**
- ✅ CertificationBody entity exists
- ✅ CertificationScheme entity exists
- ✅ Claim entity can link certifications
- ⚠️ Need integration with certification bodies (FSC, SBP, etc.)

**Compliance Advantage:** BOOST appears well-positioned for future LCFS biomass sustainability requirements.

---

## Recommended Actions

### 1. Clarify Project Scope (URGENT)
**Action:** Send email to Dan Sanchez / Kelly (per meeting notes)

**Questions to ask:**
- Is the goal to auto-populate GREET Tier 1/2 calculator inputs from BOOST data?
- Or is the goal to track certified pathways and report transactions to AFP?
- What is the relationship between BOOST feedstock tracking and LCFS pathway applications?

**Deliverable:** Email draft with clear input/output expectations

---

### 2. Test GREET Tier 1 Calculator Mapping
**Action:** Obtain actual CA-GREET Tier 1 calculator for woody biomass → renewable diesel

**Process:**
1. Download CA-GREET Tier 1 calculator spreadsheet from CARB
2. List every input field required
3. Map each input to BOOST entity/field
4. Identify gaps where BOOST doesn't have data
5. Calculate "GREET input coverage %" from BOOST

**Deliverable:** Enhanced field mapping with actual GREET calculator worksheet tabs

---

### 3. Create Sample Workflow
**Action:** Build example showing both data flows

**Scenario A - Using Existing Pathway:**
1. Load certified pathway from CARB database → LCFSPathway
2. Record fuel transaction → Transaction (references LcfsPathwayId)
3. Aggregate quarterly → LCFSReporting
4. Submit to AFP

**Scenario B - New Pathway Application:**
1. Collect 3 months TraceableUnit + Transaction data
2. Extract GREET inputs (volumes, distances, moisture, etc.)
3. Manually populate CA-GREET Tier 1 calculator
4. Submit to CARB for certification
5. Store certified pathway → LCFSPathway

**Deliverable:** Step-by-step workflow diagrams

---

### 4. Enhance Validator for LCFS Context
**Action:** Update BOOST validator to show LCFS/GREET relationships

**Features:**
- Flag fields that are GREET inputs vs outputs
- Show which TraceableUnit fields could populate Tier 1 applications
- Validate geographic coordinates for 2026 compliance
- Check certification requirements for 2028 compliance
- Display LCFS-specific validation messages

**Deliverable:** Enhanced validator on `lcfs_pathway` branch

---

## Conclusion

### The Core Relationship

```
┌─────────────────────────────────────────────────────────────────┐
│  BOOST Supply Chain Tracking                                    │
│  ├─ TraceableUnit: biomass volumes, species, harvest locations  │
│  ├─ GeographicData: coordinates for transport calculations      │
│  ├─ Material: feedstock properties (moisture, energy content)   │
│  └─ Transaction: transport distances, operational data          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    (could feed into)
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│  CA-GREET Model (Tier 1/2 Calculator)                           │
│  ├─ Feedstock inputs: volume, moisture, transport distance      │
│  ├─ Production inputs: facility energy, efficiency              │
│  ├─ Regional data: grid mix, fuel specs                         │
│  └─ Outputs: Carbon Intensity (gCO2e/MJ)                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    (certifies pathway)
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│  CARB Pathway Certification                                     │
│  ├─ Issues Pathway ID (e.g., CA-RD-2025-LMR-001)               │
│  ├─ Certifies CI value                                          │
│  └─ Publishes to AFP database                                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                      (stored in BOOST)
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│  BOOST LCFS Compliance Tracking                                 │
│  ├─ LCFSPathway: stores certified CI and pathway metadata       │
│  ├─ Transaction: links fuel volumes to pathways                 │
│  └─ LCFSReporting: aggregates quarterly for AFP submission      │
└─────────────────────────────────────────────────────────────────┘
```

### Bottom Line

**BOOST is not a replacement for GREET** - it's a complementary system that:
1. **Could potentially** help gather data for GREET Tier 1/2 pathway applications
2. **Definitely** stores certified pathway results from GREET/CARB
3. **Definitely** enables transaction tracking and AFP reporting
4. **Uniquely** provides supply chain traceability for biomass sustainability

**The value depends on stakeholder intent** - which is why the email to Dan/Kelly is critical.

---

**Next Meeting Prep:**
- Share this analysis
- Share field mapping spreadsheet
- Ask for specific use cases
- Align on whether BOOST → GREET integration is a goal
