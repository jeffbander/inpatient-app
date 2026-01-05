"""Text processing utilities for medical imaging extraction."""

import re
from typing import Optional, Tuple


def clean_text(text: str) -> str:
    """
    Clean and normalize clinical text.

    Args:
        text: Raw clinical text

    Returns:
        Cleaned text
    """
    if not text:
        return ""

    # Normalize whitespace
    text = re.sub(r'\s+', ' ', text)

    # Remove excessive punctuation
    text = re.sub(r'\.{2,}', '.', text)

    # Normalize dashes
    text = re.sub(r'[-–—]{2,}', '-', text)

    return text.strip()


def extract_numeric_value(text: str) -> Optional[float]:
    """
    Extract numeric value from text.

    Args:
        text: Text potentially containing a number

    Returns:
        Extracted float value or None
    """
    if not text:
        return None

    # Match numbers with optional decimal
    match = re.search(r'(-?\d+\.?\d*)', text)
    if match:
        try:
            return float(match.group(1))
        except ValueError:
            return None
    return None


def extract_unit(text: str) -> Optional[str]:
    """
    Extract unit from a measurement string.

    Args:
        text: Measurement text (e.g., "5.3 cm", "45%")

    Returns:
        Unit string or None
    """
    if not text:
        return None

    # Common medical units
    unit_patterns = [
        r'(mm\s*Hg|mmHg)',
        r'(cm/s)',
        r'(m/s)',
        r'(mL/m2|ml/m2)',
        r'(g/m2)',
        r'(mm)',
        r'(cm)',
        r'(mL|ml)',
        r'(%)',
        r'(ms)',
        r'(bpm)',
        r'(HU)',  # Hounsfield Units for CT
        r'(SUV)',  # Standardized Uptake Value for PET
    ]

    for pattern in unit_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1)

    return None


def is_imaging_section(text: str, modality: str) -> bool:
    """
    Check if text section is related to a specific imaging modality.

    Args:
        text: Text to check
        modality: Imaging modality (ECHO, CT, MRI, etc.)

    Returns:
        True if section appears related to the modality
    """
    modality_keywords = {
        "ECHO": [
            "echocardiogram", "echo", "echocardiography", "tte", "tee",
            "transthoracic", "transesophageal", "cardiac ultrasound"
        ],
        "CT": [
            "ct scan", "ct ", "computed tomography", "cat scan",
            "ct chest", "ct abdomen", "ct head", "cta", "ctpa"
        ],
        "MRI": [
            "mri", "magnetic resonance", "mr imaging", "mra",
            "flair", "t1", "t2", "dwi", "diffusion"
        ],
        "XRAY": [
            "x-ray", "xray", "radiograph", "chest x-ray", "cxr",
            "plain film", "portable chest"
        ],
        "ULTRASOUND": [
            "ultrasound", "sonogram", "us ", "doppler",
            "abdominal ultrasound", "renal ultrasound", "carotid doppler"
        ]
    }

    keywords = modality_keywords.get(modality.upper(), [])
    text_lower = text.lower()

    return any(kw in text_lower for kw in keywords)


def extract_laterality(text: str) -> Optional[str]:
    """
    Extract laterality (left/right/bilateral) from text.

    Args:
        text: Text to search

    Returns:
        Laterality string or None
    """
    text_lower = text.lower()

    if "bilateral" in text_lower or "both" in text_lower:
        return "bilateral"
    elif "left" in text_lower or " l " in text_lower:
        return "left"
    elif "right" in text_lower or " r " in text_lower:
        return "right"

    return None
