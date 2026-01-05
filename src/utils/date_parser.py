"""Date parsing utilities for medical imaging extraction."""

import re
from datetime import datetime
from typing import Optional, List, Tuple
from dateutil import parser as date_parser


def normalize_date(date_str: str) -> str:
    """
    Normalize a date string to ISO YYYY-MM-DD format.

    Args:
        date_str: Date string in various formats

    Returns:
        ISO formatted date string or "No Data" if parsing fails
    """
    if not date_str or date_str.strip() == "":
        return "No Data"

    # Common date patterns in medical records
    patterns = [
        # MM/DD/YYYY, MM-DD-YYYY
        (r'(\d{1,2})[/\-](\d{1,2})[/\-](\d{4})', lambda m: f"{m.group(3)}-{m.group(1).zfill(2)}-{m.group(2).zfill(2)}"),
        # YYYY/MM/DD, YYYY-MM-DD
        (r'(\d{4})[/\-](\d{1,2})[/\-](\d{1,2})', lambda m: f"{m.group(1)}-{m.group(2).zfill(2)}-{m.group(3).zfill(2)}"),
        # Month DD, YYYY (e.g., "September 12, 2024")
        (r'([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})', None),
        # DD Month YYYY (e.g., "12 September 2024")
        (r'(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})', None),
    ]

    date_str = date_str.strip()

    # Try pattern matching first for common formats
    for pattern, formatter in patterns:
        match = re.search(pattern, date_str)
        if match:
            if formatter:
                try:
                    return formatter(match)
                except Exception:
                    pass
            break

    # Fall back to dateutil parser
    try:
        parsed = date_parser.parse(date_str, fuzzy=True)
        return parsed.strftime("%Y-%m-%d")
    except Exception:
        return "No Data"


def extract_dates_from_text(text: str) -> List[Tuple[str, int]]:
    """
    Extract all dates from text with their positions.

    Args:
        text: Clinical text to search

    Returns:
        List of tuples (normalized_date, position_in_text)
    """
    dates = []

    # Comprehensive date patterns
    patterns = [
        # MM/DD/YYYY or MM-DD-YYYY
        r'\b(\d{1,2}[/\-]\d{1,2}[/\-]\d{4})\b',
        # YYYY/MM/DD or YYYY-MM-DD
        r'\b(\d{4}[/\-]\d{1,2}[/\-]\d{1,2})\b',
        # Month DD, YYYY
        r'\b((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4})\b',
        # DD Month YYYY
        r'\b(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})\b',
        # Mon DD, YYYY (abbreviated)
        r'\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4})\b',
        # MM/DD/YY (2-digit year)
        r'\b(\d{1,2}[/\-]\d{1,2}[/\-]\d{2})\b',
    ]

    for pattern in patterns:
        for match in re.finditer(pattern, text, re.IGNORECASE):
            date_str = match.group(1)
            normalized = normalize_date(date_str)
            if normalized != "No Data":
                dates.append((normalized, match.start()))

    # Sort by position and remove duplicates
    seen = set()
    unique_dates = []
    for date, pos in sorted(dates, key=lambda x: x[1]):
        if date not in seen:
            seen.add(date)
            unique_dates.append((date, pos))

    return unique_dates
