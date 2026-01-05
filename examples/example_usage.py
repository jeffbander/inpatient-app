#!/usr/bin/env python3
"""
Example usage of the Imaging Extraction module.

This script demonstrates how to extract imaging findings from clinical text
using both the individual extractors and the orchestrator.
"""

import os
import sys

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.extractors import (
    EchoExtractor,
    CTExtractor,
    MRIExtractor,
    XRayExtractor,
    UltrasoundExtractor,
    ImagingExtractionOrchestrator,
)


# Sample clinical notes with multiple imaging studies
SAMPLE_CLINICAL_NOTE = """
ADMISSION DATE: 09/15/2024

HISTORY: 67-year-old male with chest pain and shortness of breath.

IMAGING STUDIES:

1. ECHOCARDIOGRAM (09/15/2024):
   - Ejection Fraction: 35%
   - Mild concentric LVH
   - LVEDD: 5.8 cm
   - Moderate mitral regurgitation
   - PASP: 45 mmHg
   - Mild tricuspid regurgitation
   - Diastolic dysfunction grade II

2. CHEST X-RAY PORTABLE (09/15/2024):
   - Cardiomegaly present, stable
   - Mild pulmonary edema with interstitial markings
   - Small bilateral pleural effusions
   - No pneumothorax
   - ET tube 3 cm above carina, appropriately positioned

3. CT CHEST WITH CONTRAST (09/14/2024):
   - No pulmonary embolism
   - 8mm nodule in right upper lobe, recommend follow-up
   - Moderate bilateral pleural effusions
   - Subcarinal lymph node 1.4 cm

4. RENAL ULTRASOUND (09/14/2024):
   - Right kidney 11.2 cm, left kidney 10.8 cm
   - Mild hydronephrosis on the right
   - No renal stones
   - Normal cortical echogenicity

5. PRIOR ECHO (06/01/2024):
   - Ejection Fraction: 45%
   - Mild LVH
   - Trace mitral regurgitation
   - Normal diastolic function

ASSESSMENT:
Acute on chronic heart failure with reduced ejection fraction.
"""


def example_single_extractor():
    """Demonstrate using a single extractor."""
    print("=" * 60)
    print("EXAMPLE 1: Single Extractor (ECHO)")
    print("=" * 60)

    # Create ECHO extractor (rule-based, no LLM)
    echo_extractor = EchoExtractor()

    # Extract findings
    result = echo_extractor.extract(SAMPLE_CLINICAL_NOTE)

    print("\nExtracted ECHO findings:")
    print(echo_extractor.to_json(result))
    print()


def example_orchestrator_all():
    """Demonstrate extracting all modalities."""
    print("=" * 60)
    print("EXAMPLE 2: Extract All Modalities")
    print("=" * 60)

    # Create orchestrator
    orchestrator = ImagingExtractionOrchestrator()

    # Detect what's present
    detected = orchestrator.detect_modalities(SAMPLE_CLINICAL_NOTE)
    print(f"\nDetected modalities: {detected}")

    # Extract all
    results = orchestrator.extract_all(SAMPLE_CLINICAL_NOTE)

    print("\nAll extracted findings:")
    print(orchestrator.to_json(results))
    print()


def example_combined_by_date():
    """Demonstrate combining findings by date."""
    print("=" * 60)
    print("EXAMPLE 3: Combined by Date")
    print("=" * 60)

    orchestrator = ImagingExtractionOrchestrator()

    # Extract and combine by date
    combined = orchestrator.extract_combined(
        SAMPLE_CLINICAL_NOTE,
        combine_by_date=True
    )

    print("\nFindings combined by date:")
    print(orchestrator.to_json(combined))
    print()


def example_specific_modality():
    """Demonstrate extracting a specific modality."""
    print("=" * 60)
    print("EXAMPLE 4: Specific Modality (CT)")
    print("=" * 60)

    orchestrator = ImagingExtractionOrchestrator()

    # Extract only CT findings
    ct_results = orchestrator.extract_modality(SAMPLE_CLINICAL_NOTE, "CT")

    print("\nCT findings only:")
    print(orchestrator.to_json(ct_results))
    print()


def example_with_llm():
    """Demonstrate using an LLM for extraction."""
    print("=" * 60)
    print("EXAMPLE 5: Using LLM (requires API key)")
    print("=" * 60)

    # Check for API key
    api_key = os.environ.get("OPENAI_API_KEY")

    if not api_key:
        print("\nSkipping LLM example - OPENAI_API_KEY not set")
        print("To use LLM extraction, set your API key:")
        print("  export OPENAI_API_KEY='your-key-here'")
        return

    try:
        from openai import OpenAI

        # Create client
        client = OpenAI(api_key=api_key)

        # Create orchestrator with LLM
        orchestrator = ImagingExtractionOrchestrator(
            llm_client=client,
            model="gpt-4o-mini",
            provider="openai"
        )

        # Extract all with LLM
        results = orchestrator.extract_all(SAMPLE_CLINICAL_NOTE)

        print("\nLLM-extracted findings:")
        print(orchestrator.to_json(results))

    except ImportError:
        print("\nOpenAI package not installed. Run: pip install openai")
    except Exception as e:
        print(f"\nLLM extraction failed: {e}")

    print()


def example_enabled_modalities():
    """Demonstrate enabling only specific modalities."""
    print("=" * 60)
    print("EXAMPLE 6: Enabled Modalities Subset")
    print("=" * 60)

    # Only enable ECHO and CT
    orchestrator = ImagingExtractionOrchestrator(
        enabled_modalities=["ECHO", "CT"]
    )

    print(f"\nEnabled modalities: {orchestrator.get_available_modalities()}")

    results = orchestrator.extract_all(SAMPLE_CLINICAL_NOTE)

    print("\nFiltered findings (ECHO + CT only):")
    print(orchestrator.to_json(results))
    print()


if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("MEDICAL IMAGING EXTRACTION - EXAMPLES")
    print("=" * 60 + "\n")

    example_single_extractor()
    example_orchestrator_all()
    example_combined_by_date()
    example_specific_modality()
    example_enabled_modalities()
    example_with_llm()

    print("=" * 60)
    print("Examples completed!")
    print("=" * 60)
