# BioRAM Discovery - Meeting Guide

## Summary

The BOOST schema for BioRAM (`BioramPathway` and `BioramReporting`) doesn't accurately represent how the real BioRAM program works. It appears to be modeled after LCFS, but BioRAM operates very differently.

---

## What is BioRAM?

**BioRAM = Bioenergy Renewable Auction Mechanism**

A California program where utilities (PG&E, SCE, SDG&E) are required to **buy electricity** from biomass power plants that burn wood from wildfire-prone areas.

- **Created:** 2016 (after Governor's tree mortality emergency)
- **Goal:** Remove dead trees from forests to reduce wildfire risk
- **How:** Pay biomass plants ~$120/MWh to burn wood from High Hazard Zones (HHZ)
- **Managed by:** CPUC (California Public Utilities Commission) + the utilities

---

## Key Terms

| Term | Meaning |
|------|---------|
| **HHZ** | High Hazard Zone - areas with dead/dying trees mapped by CAL FIRE |
| **IOU** | Investor-Owned Utility (PG&E, SCE, SDG&E) |
| **CPUC** | California Public Utilities Commission (government regulator) |
| **BDT** | Bone Dry Ton - unit for measuring biomass (~1 BDT = ~1 MWh) |
| **PPA** | Power Purchase Agreement - contract between plant and utility |
| **RFO** | Request for Offers - the auction where plants bid for contracts |
| **FHSZ** | Fire Hazard Severity Zone (different from HHZ - used for building codes) |

---

## BioRAM vs LCFS - Key Differences

| Aspect | LCFS | BioRAM |
|--------|------|--------|
| **What it is** | Carbon credit program | Power purchasing program |
| **Has pathways?** | Yes - certified by CARB with pathway IDs | No - no pathway concept |
| **Key metric** | Carbon Intensity (gCO2e/MJ) | HHZ fuel % (must hit 80%) |
| **Compliance** | Credits calculated from CI | Pass/fail (meet 80% HHZ or price penalty) |
| **Who reports** | Fuel producers | Power plants |
| **Managed by** | CARB | CPUC + utilities (IOUs) |
| **Output** | Low carbon fuel credits | Electricity (MWh) |

---

## Problems with Current BOOST Schema

### BioramPathway - Doesn't Match Reality

| BOOST Field | Real BioRAM | Issue |
|-------------|-------------|-------|
| `pathwayId` | Doesn't exist | BioRAM has no pathway IDs |
| `carbonIntensity` | Not used | BioRAM doesn't track CI |
| `fuelType` | Partial match | BioRAM cares about HHZ origin, not wood species |
| `certificationDate` | Misleading | Facilities get certified, not pathways |
| `fireHazardZoneEligibility` | Good match | This IS what BioRAM cares about |

**Verdict:** Seems copy-pasted from LCFS structure, but BioRAM doesn't work that way.

### BioramReporting - Closer to Reality but Missing Fields

| BOOST Field | Real BioRAM | Status |
|-------------|-------------|--------|
| `reportingPeriod` | Quarterly reports | Good |
| `totalBiomassVolume` | BDT tracked | Good |
| `totalEnergyGenerated` | MWh tracked | Good |
| `complianceStatus` | Pass/fail | Good |
| HHZ % target | 40%→50%→60%→80% ramp | **Missing** |
| HHZ % actual | What facility achieved | **Missing** |
| HHZ tier breakdown | Tier 1 vs Tier 2 sourcing | **Missing** |

**Verdict:** Better fit, but missing the core compliance metrics.

### Missing Entity - Facility Enrollment / PPA Contract

There's no BOOST entity for:
- Facility capacity (MW)
- PPA contract terms (delivery term, pricing)
- Service territory (which utility)
- Interconnection details (queue position, FCDS status)
- CEC RPS certification

This data appears in the SDG&E Project Description Form but has no home in BOOST.

---

## HHZ Fuel Requirements (The Core Compliance Rule)

| Year | Minimum % from HHZ |
|------|-------------------|
| 2016 | 40% |
| 2017 | 50% |
| 2018 | 60% |
| 2019+ | **80%** |

**Penalty:** If facility doesn't meet minimum → price drops from ~$120/MWh to $89.23/MWh

---

## Sources Used

### 1. CPUC BioRAM Main Page
**URL:** https://www.cpuc.ca.gov/industries-and-topics/electrical-energy/electric-power-procurement/rps/rps-procurement-programs/rps-bioram

**What it is:** Official CPUC page explaining the BioRAM program

**Key info extracted:**
- Program requires 146 MW procurement from HHZ fuel
- IOUs collect quarterly data from facilities
- IOUs perform annual audits
- SB 859, SB 901, SB 1109 legislation history
- HHZ fuel requirements (80% from sustainable forestry, 60% from HHZ)
- Price penalty for non-compliance ($89.23/MWh)
- Contract extensions via Resolution E-5288

---

### 2. CAL FIRE Fire Hazard Severity Zones
**URL:** https://osfm.fire.ca.gov/what-we-do/community-wildfire-preparedness-and-mitigation/fire-hazard-severity-zones

**What it is:** Official CAL FIRE maps of fire hazard zones

**Key info extracted:**
- FHSZ classifications: Very High, High, Moderate
- State Responsibility Areas (SRA) definition
- Different from HHZ (tree mortality) but related

---

### 3. CPUC Fire-Threat Maps
**URL:** https://www.cpuc.ca.gov/industries-and-topics/wildfires/fire-threat-maps-and-fire-safety-rulemaking

**What it is:** CPUC's fire threat tier system

**Key info extracted:**
- Tier 1 HHZ: Near communities, roads, utility lines (from USFS-CAL FIRE tree mortality map)
- Tier 2: Higher risk areas
- Tier 3: Extreme risk areas
- High Fire-Threat District (HFTD) map

---

### 4. SCE BioRAM RFO Page
**URL:** https://www.sce.com/about-sce/energy-procurement/solicitations/bioram-rfo

**What it is:** Southern California Edison's BioRAM auction page

**Key info extracted:**
- 2024 BioRAM RFO details
- Uses PowerAdvocate platform for bidding
- Seeks PCC1 (Portfolio Content Category 1) RECs

---

### 5. SDG&E 2016 BioRAM RFO
**URL:** https://www.sdge.com/2016-biomass-renewable-auction-mechanism-bioram

**What it is:** San Diego Gas & Electric's original BioRAM auction

**Key info extracted:**
- Link to Project Description Form (the PDF we analyzed)
- RFO process documentation

---

### 6. SDG&E Project Description Form (PDF)
**Document:** Advice Letter 2878-E-A, Attachment C

**What it is:** 26-page application form for facilities applying to BioRAM

**Key info extracted:**
- Company information fields
- Project capacity: Nameplate MW, Net Contract MW, Capacity Factor
- Expected MWh generation
- Service territory (SDG&E, SCE, PG&E)
- Eligibility criteria (CEC certification, technology, site control)
- Interconnection details (queue position, Phase II study, FCDS status)
- PPA terms (delivery term: 5/10/15/20 years, Energy Only vs FCDS)
- Fuel source plan (HHZ % ramp requirements)
- High Hazard Zone fuel targets by year
- Facility location (lat/long, parcel numbers)
- Permitting and schedule milestones

---

### 7. PG&E BioRAM Info
**URL:** https://www.pge.com/en_US/for-our-business-partners/energy-supply/electric-rfo/wholesale-electric-power-procurement/bioenergy-renewable-auction-mechanism-request-for-offers.page

**What it is:** PG&E's BioRAM procurement page

**Key info extracted:**
- Additional RFO documentation
- Fuel tracking protocol references

---

### 8. TSS Consultants - CA Biomass Sector Status (PDF)
**URL:** https://tssconsultants.com/wp-content/uploads/2020/03/CA-Biomass-Sector-FVMC-PPT-20200114.pdf

**What it is:** Industry presentation on California biomass sector

**Key info extracted:**
- BioRAM I vs BioRAM II fuel requirement differences
- BioRAM I: 80% from HHZ
- BioRAM II: 80% from sustainable forestry, 60% from HHZ
- Price penalty details ($89.23/MWh)
- Fuel availability estimates (BDT)
- SB 901 fuel flexibility provisions

---

## Recommendations

### Option A: Minimal Changes
- Add missing HHZ fields to `BioramReporting`
- Keep `BioramPathway` as-is (accept it doesn't match reality perfectly)
- Document the differences

### Option B: Schema Revision
- Repurpose `BioramPathway` as "BioramProgramRules" (eligibility rules, HHZ requirements)
- Add HHZ compliance fields to `BioramReporting`
- Create new `BioramEnrollment` or `BioramContract` entity for facility/PPA data

### Option C: Use Existing Entities
- Map facility data to `Organization` + `Equipment` + `Certificate`
- Extend `GeographicData` with HHZ tier info
- Extend `Transaction` with PPA contract terms
- Only add missing fields to `BioramReporting`

---

## Files Created During Discovery

| File | Location | Description |
|------|----------|-------------|
| Discovery Notes | `schema/bioram_pathway/BIORAM_DISCOVERY_NOTES.md` | Initial exploration and entity explanation |
| Field Mapping CSV | `schema/bioram_pathway/BIORAM_FIELD_MAPPING.csv` | Detailed field-by-field mapping with sources |
| Meeting Guide | `schema/bioram_pathway/BIORAM_MEETING_GUIDE.md` | This document |

---

## Questions for Discussion

1. Should `BioramPathway` be redesigned or removed since BioRAM doesn't have pathways?
2. Do we need a new entity for facility enrollment/PPA contracts?
3. Can we reuse existing entities (Organization, Equipment, Certificate, Transaction) instead?
4. What's the priority - accurate schema or working examples first?
