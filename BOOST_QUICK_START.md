# BOOST Extraction - Quick Start Guide

## 🎯 Goal

Convert your existing documents (CSV, tickets, certificates) into BOOST TraceableUnit JSON format using AI extraction.

## 📥 Import Configuration

1. **File to import**: `boost_extraction_config.json`
2. **Import into your AI extraction tool**
3. **3 document types will be added**:
   - Database - BOOST TraceableUnit
   - Load Ticket - BOOST TraceableUnit
   - Weight Certificate - BOOST Supplement

## 🔑 Key Philosophy: Data Over Format

**Important**: This configuration prioritizes **capturing data** over strict BOOST format compliance.

### What This Means:

❌ **NOT doing**: Generating formatted IDs like `ORG-HEADRICK-LOGGING-001`
✅ **DOING**: Extracting raw values like `Headrick Logging`

**Why?** Because you want:
- Real business data visible in the JSON
- Easier to read and understand
- Flexibility to apply formatting rules later
- Still compatible with BOOST structure (even if validation shows warnings)

## 📋 Field Extraction Examples

### Organization Fields

| Field | CSV Value | Extracted Value | Notes |
|-------|-----------|-----------------|-------|
| harvesterId | `Headrick Logging` | `"Headrick Logging"` | ✅ Plain name, not `ORG-HEADRICK-LOGGING-001` |
| operatorId | `Pacific Hauling` | `"Pacific Hauling"` | ✅ Plain name, not `ORG-PACIFIC-HAULING-001` |

### Geographic Fields

| Field | CSV Value | Extracted Value | Notes |
|-------|-----------|-----------------|-------|
| currentGeographicDataId | Deck `5` | `"Deck 5"` | ✅ Descriptive, not `GEO-DECK-5` |
| harvestGeographicDataId | `Trinity Forest` | `"Trinity Forest"` | ✅ Plain name, not `GEO-TRINITY-FOREST` |

### Material Fields

| Field | CSV Value | Extracted Value | Notes |
|-------|-----------|-----------------|-------|
| materialTypeId | `WF` | `"WF"` | ✅ Product code as-is, not `MAT-WHITE-FIR-001` |
| materialTypeId | `DF` | `"DF"` | ✅ Product code as-is, not `MAT-DOUGLAS-FIR-001` |

### ID Fields (These ARE formatted)

| Field | CSV Value | Extracted Value | Notes |
|-------|-----------|-----------------|-------|
| traceableUnitId | Load `12345` | `"TRU-12345"` | ⚠️ Must have `TRU-` prefix for BOOST |
| @id | Load `12345` | `"https://altacalifornia.com/boost/tru/12345"` | ⚠️ Must be a URI |

## 🔄 Critical Transformations (Still Applied)

Even though we're using plain values, these transformations are **essential**:

### 1. Weight → Volume Conversion

**From CSV (Tons):**
```
50 tons → 75.60 m³
Formula: (50 × 907.185) ÷ 600
```

**From Weight Cert (Pounds):**
```
110,000 lbs → 83.16 m³
Formula: (110000 × 0.453592) ÷ 600
```

### 2. Date Formatting

**Required format**: ISO 8601

```
Input:  8/15/2025
Output: 2025-08-15T00:00:00Z
```

### 3. ID Formatting

Only the core BOOST identifiers need formatting:

```
Load # 12345 → traceableUnitId: "TRU-12345"
```

## 📄 Example Output

Here's what your extracted JSON will look like:

```json
{
  "@context": {
    "boost": "https://github.com/carbondirect/BOOST/context/v1.0",
    "xsd": "http://www.w3.org/2001/XMLSchema#"
  },
  "@type": "TraceableUnit",
  "@id": "https://altacalifornia.com/boost/tru/12345",
  "traceableUnitId": "TRU-12345",
  "unitType": "volume_aggregation",
  "uniqueIdentifier": "12345",
  "identificationMethodId": "IM-TRIP-TICKET-001",
  "identificationConfidence": 95,
  "secondaryIdentifiers": [
    {
      "identifierType": "manual_id",
      "identifierValue": "WC-456789",
      "confidence": 95
    },
    {
      "identifierType": "trip_ticket",
      "identifierValue": "LOAD-12345",
      "confidence": 100
    }
  ],
  "methodReadinessLevel": 7,
  "totalVolumeM3": 75.60,
  "createdTimestamp": "2025-08-15T00:00:00Z",
  "materialTypeId": "WF",
  "harvesterId": "Headrick Logging",
  "operatorId": "Pacific Hauling",
  "currentGeographicDataId": "Deck 5",
  "harvestGeographicDataId": "Trinity Forest",
  "productClassification": "sawlog",
  "qualityGrade": "Grade-A",
  "currentStatus": "delivered",
  "attachedInformation": [
    "Truck #123",
    "Weight Certificate WC-456789"
  ],
  "lastUpdated": "2025-10-06T14:30:00Z"
}
```

## ✅ What Will Validate

With this approach:

| Aspect | Status | Notes |
|--------|--------|-------|
| JSON structure | ✅ Valid | Correct BOOST entity structure |
| Required fields | ✅ Valid | All required fields present |
| Data types | ✅ Valid | Strings, numbers, dates correct |
| Volume in m³ | ✅ Valid | Properly converted |
| Dates in ISO 8601 | ✅ Valid | Correctly formatted |
| traceableUnitId pattern | ✅ Valid | Matches `^TRU-[A-Z0-9-_]+$` |
| Reference IDs (org, geo, material) | ⚠️ Warnings | Won't match BOOST patterns but **data is preserved** |

## 🎯 Why This Approach Works

### Traditional BOOST (strict):
```json
{
  "harvesterId": "ORG-HEADRICK-LOGGING-001",
  "materialTypeId": "MAT-WHITE-FIR-001"
}
```
**Problem**: Hard to read, obscures actual business data

### Your Approach (pragmatic):
```json
{
  "harvesterId": "Headrick Logging",
  "materialTypeId": "WF"
}
```
**Benefit**: Clear, readable, real data preserved

## 🔮 Future Enhancement Path

When you're ready for stricter compliance:

1. **Keep extraction as-is** (captures data)
2. **Add post-processing layer** (formats IDs)
3. **Create entity lookup tables** (WF → MAT-WHITE-FIR-001)
4. **Generate Organization/GeographicData entities** (from plain names)

But for now, you have **working BOOST data** with real business information!

## 🚀 Testing Your Extractions

### Step 1: Extract a Document
Run your AI extraction on a CSV/ticket/certificate

### Step 2: Save the JSON
```bash
# Save output to a file
output.json
```

### Step 3: Test in BOOST Validator
```bash
# Start the validator
cd boost-schema-validator
./run.sh

# Open browser
http://localhost:5000
```

### Step 4: Validate
1. Select "TraceableUnit" entity
2. Paste your JSON
3. Click "Validate"
4. Review results

**Expected**: Schema valid, possible warnings on reference field patterns (this is OK!)

## 🛠️ Troubleshooting

### Common Issues

| Error | Cause | Fix |
|-------|-------|-----|
| "Invalid type: totalVolumeM3 expected number" | Volume is string | Check conversion formula, remove quotes |
| "Pattern mismatch: traceableUnitId" | Missing TRU- prefix | Check identifier extraction prompt |
| "Invalid date format" | Not ISO 8601 | Verify date conversion: YYYY-MM-DDTHH:MM:SSZ |
| "Missing required field: @type" | @type not set | Check static field extraction |

### Debug Checklist

- [ ] All numeric fields are numbers (not strings)
- [ ] All dates in ISO 8601 format
- [ ] traceableUnitId starts with "TRU-"
- [ ] @type is exactly "TraceableUnit"
- [ ] secondaryIdentifiers is an array of objects
- [ ] attachedInformation is an array of strings

## 📞 Quick Reference

### Required Fields (Must Have)

1. `@type` = `"TraceableUnit"`
2. `traceableUnitId` = `"TRU-{number}"`
3. `unitType` = `"volume_aggregation"`
4. `identificationMethodId` = `"IM-TRIP-TICKET-001"`
5. `identificationConfidence` = `95` (number)
6. `totalVolumeM3` = (converted from weight)
7. `createdTimestamp` = ISO 8601 date

### Always Use Plain Values

- `harvesterId` → Logger name as-is
- `operatorId` → Trucker name as-is
- `currentGeographicDataId` → Destination as-is
- `harvestGeographicDataId` → Origin as-is
- `materialTypeId` → Product code as-is

### Always Convert/Format

- Weights → m³ (use formulas)
- Dates → ISO 8601
- Load # → TRU-{number}

---

**You're ready to go!** 🎉

Import the config, run extractions, and start building your BOOST dataset with real, readable data.
