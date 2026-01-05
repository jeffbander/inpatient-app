# Inpatient App - Medical Data Extraction

A Python-based medical data extraction system for identifying and extracting laboratory test results from medical text, including provider notes, lab reports, and EHR summaries.

## Purpose

This system acts as an AI medical data extraction agent that:
- Identifies and extracts laboratory test results from any medical text
- Returns structured lab data relevant to clinical research and patient prescreening
- Handles both narrative and columnar/tabular input formats

## Extraction Scope

Extracts clinically relevant labs, especially those used for cardiovascular, renal, hepatic, and metabolic studies:

| Category | Labs |
|----------|------|
| **Cardiac** | BNP, NT-proBNP, hs-Troponin, hsCRP, Troponin, CK-MB |
| **Renal** | Creatinine, eGFR, BUN |
| **Hepatic** | ALT (SGPT), AST (SGOT), Total Bilirubin, ALP |
| **Metabolic/Electrolyte** | Sodium (Na), Potassium (K), Glucose, HbA1c, Chloride, CO2 |
| **Lipids** | LDL, HDL, Triglycerides, Total Cholesterol |
| **Hematology** | Hemoglobin, Hematocrit, WBC, RBC, Platelets |
| **Other** | Albumin, TSH, Iron, Vitamin D, and more |

## Installation

```bash
pip install -r requirements.txt
```

## Usage

```python
from src.extractors.lab_extractor import LabExtractor

extractor = LabExtractor()

# Extract from narrative text
text = """Labs from Oct 5 2024: Cr 1.3 mg/dL, eGFR 62, ALT 24 U/L.
On 9/30/24: hsCRP 5.6 mg/L, LDL 110 mg/dL."""

# Get JSON string output
result = extractor.extract(text)

# Get Python data structure
result = extractor.extract_structured(text)

# Get pretty-printed JSON
result = extractor.extract_pretty(text, indent=2)
```

## Output Format

Returns an array of date-grouped lab objects:

```json
[
  {
    "date": "2024-10-05",
    "labs": [
      {"lab_name": "Creatinine", "lab_value": "1.3 mg/dL"},
      {"lab_name": "eGFR", "lab_value": "62"},
      {"lab_name": "ALT", "lab_value": "24 U/L"}
    ]
  },
  {
    "date": "2024-09-30",
    "labs": [
      {"lab_name": "hsCRP", "lab_value": "5.6 mg/L"},
      {"lab_name": "LDL", "lab_value": "110 mg/dL"}
    ]
  }
]
```

## Features

### Extraction Rules

1. **Case-Insensitive and Abbreviation-Aware**
   - Recognizes alternate spellings or abbreviations (e.g., "Cr" -> "Creatinine", "Na" -> "Sodium")
   - Applies clinical equivalence for common shorthand notations

2. **Value and Unit Handling**
   - Extracts numeric value and unit exactly as written (e.g., "1.2 mg/dL")
   - Supports values with colons, equals signs, or space separation

3. **Date Association**
   - Assigns each lab to its closest preceding or header date
   - Normalizes all dates to ISO format (YYYY-MM-DD)
   - If no date is found, records "date": "No Data"

4. **Formatting Consistency**
   - Preserves capitalization of units
   - Does not alter lab names or infer missing information
   - Ignores reference ranges and comments

5. **Chronological Grouping**
   - Groups labs under their associated date
   - Sorts date groups in descending order (newest first)

6. **Output Validity**
   - If no labs are detected, returns "No Data"
   - Output is always valid JSON

### Supported Input Formats

**Narrative Text:**
```
Labs from Oct 5 2024: Cr 1.3 mg/dL, eGFR 62, ALT 24 U/L.
```

**Columnar/List Format:**
```
10/05/2024
Creatinine 1.3 mg/dL
GFR 62
ALT 24 U/L
```

**Mixed Formats:** The extractor handles combinations of both formats.

## Running Tests

```bash
python -m pytest tests/ -v
```

## Project Structure

```
inpatient-app/
├── src/
│   ├── __init__.py
│   ├── models/
│   │   ├── __init__.py
│   │   └── lab_result.py      # Data models for lab results
│   └── extractors/
│       ├── __init__.py
│       └── lab_extractor.py   # Main extraction logic
├── tests/
│   ├── __init__.py
│   └── test_lab_extractor.py  # Unit tests
├── requirements.txt
└── README.md
```

## Dependencies

- `python-dateutil`: Flexible date parsing
- `regex`: Extended regular expression support
- `pytest`: Testing framework (dev)
