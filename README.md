# Inpatient App - Medical Imaging Extraction

A Python module for extracting and structuring medical imaging findings from clinical text, including provider notes, imaging reports, and EHR summaries.

## Supported Imaging Modalities

- **ECHO** - Echocardiogram findings (EF, LVH, valve function, etc.)
- **CT** - Computed Tomography (head, chest, abdomen, spine, CTA)
- **MRI** - Magnetic Resonance Imaging (brain, spine, cardiac, MSK)
- **X-RAY** - Radiographs (chest x-ray, skeletal, abdominal)
- **ULTRASOUND** - Non-cardiac ultrasound (abdominal, renal, vascular, thyroid)

## Installation

```bash
pip install -r requirements.txt
```

## Quick Start

```python
from src.extractors import ImagingExtractionOrchestrator

# Create orchestrator
orchestrator = ImagingExtractionOrchestrator()

# Sample clinical text
clinical_note = """
ECHO 09/15/2024: EF 35%, mild MR, PASP 45 mmHg
CXR: Cardiomegaly present, bilateral pleural effusions
"""

# Extract all imaging findings
results = orchestrator.extract_all(clinical_note)
print(orchestrator.to_json(results))
```

## Usage Examples

### Extract from a Specific Modality

```python
from src.extractors import EchoExtractor

extractor = EchoExtractor()
result = extractor.extract("Echocardiogram shows EF 45%, mild LVH")
print(extractor.to_json(result))
```

### Detect Present Modalities

```python
orchestrator = ImagingExtractionOrchestrator()
detected = orchestrator.detect_modalities(clinical_note)
# Returns: ["ECHO", "XRAY"]
```

### Combine Findings by Date

```python
combined = orchestrator.extract_combined(clinical_note, combine_by_date=True)
```

### Use with LLM for Enhanced Extraction

```python
from openai import OpenAI

client = OpenAI(api_key="your-key")
orchestrator = ImagingExtractionOrchestrator(
    llm_client=client,
    model="gpt-4o-mini",
    provider="openai"
)
```

Or with Anthropic:

```python
from anthropic import Anthropic

client = Anthropic(api_key="your-key")
orchestrator = ImagingExtractionOrchestrator(
    llm_client=client,
    model="claude-3-haiku-20240307",
    provider="anthropic"
)
```

## Output Format

```json
[
  {
    "date": "2024-09-15",
    "source_text": "ECHO 09/15/2024",
    "modality": "ECHO",
    "is_latest": true,
    "findings": [
      {"finding_name": "Ejection Fraction", "finding_value": "35%"},
      {"finding_name": "Mitral Regurgitation", "finding_value": "mild"},
      {"finding_name": "PASP", "finding_value": "45 mmHg"}
    ]
  }
]
```

## Running Tests

```bash
python -m pytest tests/
# or
python tests/test_extractors.py
```

## Running Examples

```bash
python examples/example_usage.py
```

## Project Structure

```
inpatient-app/
├── src/
│   ├── extractors/
│   │   ├── base.py          # Base extractor class
│   │   ├── echo.py          # Echocardiogram extractor
│   │   ├── ct.py            # CT scan extractor
│   │   ├── mri.py           # MRI extractor
│   │   ├── xray.py          # X-ray extractor
│   │   ├── ultrasound.py    # Ultrasound extractor
│   │   └── orchestrator.py  # Multi-modality orchestrator
│   └── utils/
│       ├── date_parser.py   # Date normalization utilities
│       └── text_utils.py    # Text processing utilities
├── prompts/                  # LLM system prompts for each modality
├── tests/                    # Unit tests
├── examples/                 # Usage examples
└── requirements.txt
```

## Extraction Features

- **Rule-based extraction** - Works without LLM for common patterns
- **LLM-enhanced extraction** - Optional LLM integration for complex text
- **Date normalization** - Converts dates to ISO YYYY-MM-DD format
- **Deduplication** - Removes duplicate findings
- **Latest marking** - Identifies most recent studies
- **Modality filtering** - Enable/disable specific modalities
- **Combined output** - Group findings by date across modalities
