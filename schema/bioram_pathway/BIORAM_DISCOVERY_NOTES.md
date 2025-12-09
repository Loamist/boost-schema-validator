# BioRAM Entity Discovery Notes

## What is BOOST?

BOOST is a **data standard** for tracking biomass/biofuel supply chains. Think of it as a template that says: "If you want to record information about wood chips being turned into fuel, here's exactly how to structure that data."

---

## The Core Idea: Entities

BOOST defines **entities** - these are like database tables or document types. Each entity represents a "thing" in the real world:

```
Organization  →  A company (a sawmill, a fuel producer, a power plant)
Transaction   →  A sale/purchase of material
Material      →  Physical stuff (wood chips, sawdust, fuel)
Certificate   →  A sustainability certificate (FSC, SFI)
```

---

## How Entities Connect (Simple Example)

Imagine tracking wood chips from a forest to a power plant:

```
┌─────────────────┐
│  Organization   │  "Pacific Sawmill LLC"
│  (the seller)   │
└────────┬────────┘
         │ sells
         ▼
┌─────────────────┐
│   Transaction   │  "Sale of 500 tonnes wood chips"
│                 │  date: 2025-01-15
└────────┬────────┘
         │ of this
         ▼
┌─────────────────┐
│    Material     │  "Douglas Fir wood chips"
│                 │  moisture: 35%
└────────┬────────┘
         │ goes to
         ▼
┌─────────────────┐
│  Organization   │  "Sherwood Biomass Power"
│  (the buyer)    │
└─────────────────┘
```

---

## What are Pathways and Reporting?

These are **regulatory/compliance entities** - they track how your supply chain connects to government programs:

### LCFS (Low Carbon Fuel Standard)
California program that gives credits for low-carbon fuels.

```
┌─────────────────────┐
│    LCFSPathway      │  "This fuel type qualifies for LCFS"
│                     │  Carbon Intensity: 15.5 gCO2e/MJ
│                     │  Fuel Type: Renewable Diesel
└─────────────────────┘
         │
         │ used to calculate credits in
         ▼
┌─────────────────────┐
│   LCFSReporting     │  "Q1 2025 Compliance Report"
│                     │  Fuel sold: 1,000,000 gallons
│                     │  Credits earned: 54,580,477
└─────────────────────┘
```

### BioRAM (Bioenergy Renewable Auction Mechanism)
California program for biomass power plants to sell electricity.

```
┌─────────────────────┐
│   BioramPathway     │  "This fuel type qualifies for BioRAM"
│                     │  Fuel Type: lumber mill residue
│                     │  Efficiency: 35%
│                     │  Fire Hazard Zone: Very High, High
└─────────────────────┘
         │
         │ performance tracked in
         ▼
┌─────────────────────┐
│  BioramReporting    │  "Q3 2025 Compliance Report"
│                     │  Biomass burned: 3,500 tonnes
│                     │  Electricity generated: 2,800 MWh
└─────────────────────┘
```

---

## The Gap: What the PDF Contains vs What BOOST Has

The PDF (SDG&E BioRAM Project Description Form) is a **Project Application Form** - it's what a company fills out to **JOIN** the BioRAM program.

Here's the disconnect:

### What BioRAM Pathway covers:
```
✓ What fuel types are allowed
✓ What efficiency is required
✓ What fire hazard zones qualify
✗ NOT about a specific facility
```

### What BioRAM Reporting covers:
```
✓ How much fuel a facility burned this quarter
✓ How much electricity they made
✓ Did they meet their targets
✗ Assumes facility is ALREADY enrolled
```

### What the PDF contains:
```
? Company name and contacts
? Facility location (lat/long, address)
? Power capacity (10 MW, 15 MW, etc.)
? Interconnection to the grid (which substation, queue position)
? Contract terms (20-year PPA, price per MWh)
? High Hazard Zone fuel commitments (40% year 1, 80% by year 4)
```

This is **facility registration data** - the stuff that happens BEFORE reporting starts.

---

## Visual Timeline

```
TIME →

┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│                  │     │                  │     │                  │
│  PROJECT         │     │  OPERATIONAL     │     │  QUARTERLY       │
│  APPLICATION     │────▶│  (facility runs) │────▶│  REPORTING       │
│                  │     │                  │     │                  │
│  "I want to join │     │  Uses fuel that  │     │  "Here's how we  │
│   BioRAM, here's │     │  matches         │     │   performed in   │
│   my facility"   │     │  BioramPathway   │     │   Q3 2025"       │
│                  │     │                  │     │                  │
└──────────────────┘     └──────────────────┘     └──────────────────┘
        │                        │                        │
        ▼                        ▼                        ▼
   THE PDF DATA           BioramPathway             BioramReporting
   (no entity yet)        (exists in BOOST)         (exists in BOOST)
```

---

## Options for Handling This

### Option A: No new entity
- Put facility data in `Organization` (company/facility info)
- Put location in `GeographicData`
- Accept that interconnection/PPA details aren't captured

### Option B: Create `bioram_project` entity
- Captures the PDF data specifically
- Links to Organization, GeographicData, BioramPathway
- Contains: capacity, interconnection, PPA terms, HHZ commitments

---

## PDF Data Field Mapping (for reference)

| PDF Section | Fields | Potential BOOST Entity |
|-------------|--------|------------------------|
| A. Company Information | Company name, address, contacts | `Organization` |
| B. Company Representative | Primary/secondary contacts | `Organization` |
| C. Project Summary | MW capacity, MWh, capacity factor, service territory | Gap / `bioram_project`? |
| D. Eligibility | CEC certification, technology, site control | Gap / `bioram_project`? |
| E. PPA Summary | Delivery term, Energy Only vs FCDS, scheduling | Gap / `bioram_project`? |
| F. Proposed Facility Location | Address, lat/long, parcel numbers | `GeographicData` |
| G. Interconnection | Substation, queue position, Phase II study, costs | Gap / `bioram_project`? |
| H. Proposed Technology | Biomass technology type, manufacturer | `Equipment`? |
| I. Ownership and Operations | Operational control | `Organization` |
| J. Fuel Source Plan | HHZ fuel %, fuel availability studies | `BioramPathway` (partial) |
| K. Financing Plan | Debt/equity, financing sources | Gap |
| L. Permitting | Permit list, CEC RPS certification | `Certificate`? |
| M. Schedule | Milestones with dates | Gap |
| N. Operational Characteristics | Maintenance, delivery profile | Gap |
| O. Corporate Profile | Team experience | `Organization` |

---

## Next Steps

TBD based on discussion...
