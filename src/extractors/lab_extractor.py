"""
Medical Laboratory Data Extractor

Extracts laboratory test results from medical text including provider notes,
lab reports, and EHR summaries. Returns structured JSON data for clinical
research and patient prescreening.
"""

import re
import json
from datetime import datetime
from typing import List, Optional, Tuple, Dict
from dateutil import parser as date_parser

from models.lab_result import LabResultCollection


class LabExtractor:
    """
    AI-style medical data extraction agent for laboratory test results.

    Extracts clinically relevant labs especially those used for cardiovascular,
    renal, hepatic, and metabolic studies.
    """

    # Mapping of abbreviations/aliases to canonical lab names
    LAB_ABBREVIATIONS: Dict[str, str] = {
        # Renal
        "cr": "Creatinine",
        "creat": "Creatinine",
        "creatinine": "Creatinine",
        "serum creatinine": "Creatinine",
        "egfr": "eGFR",
        "gfr": "GFR",
        "estimated gfr": "eGFR",
        "bun": "BUN",
        "blood urea nitrogen": "BUN",
        "urea nitrogen": "BUN",

        # Cardiac
        "bnp": "BNP",
        "b-type natriuretic peptide": "BNP",
        "nt-probnp": "NT-proBNP",
        "ntprobnp": "NT-proBNP",
        "nt probnp": "NT-proBNP",
        "pro-bnp": "NT-proBNP",
        "hs-trop": "hs-Troponin",
        "hstrop": "hs-Troponin",
        "hs-troponin": "hs-Troponin",
        "hs troponin": "hs-Troponin",
        "high sensitivity troponin": "hs-Troponin",
        "troponin": "Troponin",
        "troponin i": "Troponin I",
        "troponin t": "Troponin T",
        "trop": "Troponin",
        "trop i": "Troponin I",
        "trop t": "Troponin T",
        "hscrp": "hsCRP",
        "hs-crp": "hsCRP",
        "hs crp": "hsCRP",
        "high sensitivity crp": "hsCRP",
        "c-reactive protein": "CRP",
        "crp": "CRP",
        "ck-mb": "CK-MB",
        "ckmb": "CK-MB",
        "ck mb": "CK-MB",
        "creatine kinase mb": "CK-MB",

        # Hepatic
        "alt": "ALT",
        "sgpt": "ALT",
        "alanine aminotransferase": "ALT",
        "alanine transaminase": "ALT",
        "ast": "AST",
        "sgot": "AST",
        "aspartate aminotransferase": "AST",
        "aspartate transaminase": "AST",
        "total bilirubin": "Total Bilirubin",
        "tbili": "Total Bilirubin",
        "t bili": "Total Bilirubin",
        "bilirubin total": "Total Bilirubin",
        "bilirubin": "Bilirubin",
        "direct bilirubin": "Direct Bilirubin",
        "indirect bilirubin": "Indirect Bilirubin",
        "alp": "ALP",
        "alkaline phosphatase": "ALP",
        "alk phos": "ALP",

        # Metabolic / Electrolytes
        "na": "Sodium",
        "sodium": "Sodium",
        "na+": "Sodium",
        "k": "Potassium",
        "potassium": "Potassium",
        "k+": "Potassium",
        "glucose": "Glucose",
        "glu": "Glucose",
        "blood glucose": "Glucose",
        "fasting glucose": "Fasting Glucose",
        "fbg": "Fasting Glucose",
        "hba1c": "HbA1c",
        "a1c": "HbA1c",
        "hemoglobin a1c": "HbA1c",
        "glycated hemoglobin": "HbA1c",
        "glycohemoglobin": "HbA1c",
        "cl": "Chloride",
        "chloride": "Chloride",
        "co2": "CO2",
        "bicarbonate": "Bicarbonate",
        "bicarb": "Bicarbonate",
        "hco3": "Bicarbonate",
        "calcium": "Calcium",
        "ca": "Calcium",
        "ca++": "Calcium",
        "magnesium": "Magnesium",
        "mg": "Magnesium",
        "phosphorus": "Phosphorus",
        "phos": "Phosphorus",
        "phosphate": "Phosphate",

        # Lipids
        "ldl": "LDL",
        "ldl-c": "LDL",
        "ldl cholesterol": "LDL",
        "low density lipoprotein": "LDL",
        "hdl": "HDL",
        "hdl-c": "HDL",
        "hdl cholesterol": "HDL",
        "high density lipoprotein": "HDL",
        "tg": "Triglycerides",
        "triglycerides": "Triglycerides",
        "trigs": "Triglycerides",
        "cholesterol": "Cholesterol",
        "total cholesterol": "Total Cholesterol",
        "tc": "Total Cholesterol",
        "chol": "Cholesterol",

        # Hematology
        "hgb": "Hemoglobin",
        "hb": "Hemoglobin",
        "hemoglobin": "Hemoglobin",
        "haemoglobin": "Hemoglobin",
        "hct": "Hematocrit",
        "hematocrit": "Hematocrit",
        "wbc": "WBC",
        "white blood cells": "WBC",
        "white blood cell count": "WBC",
        "leukocytes": "WBC",
        "rbc": "RBC",
        "red blood cells": "RBC",
        "red blood cell count": "RBC",
        "erythrocytes": "RBC",
        "plt": "Platelets",
        "platelets": "Platelets",
        "platelet count": "Platelets",
        "mcv": "MCV",
        "mch": "MCH",
        "mchc": "MCHC",
        "rdw": "RDW",
        "mpv": "MPV",

        # Coagulation
        "pt": "PT",
        "prothrombin time": "PT",
        "inr": "INR",
        "ptt": "PTT",
        "aptt": "aPTT",
        "partial thromboplastin time": "PTT",

        # Other
        "albumin": "Albumin",
        "alb": "Albumin",
        "total protein": "Total Protein",
        "protein total": "Total Protein",
        "tp": "Total Protein",
        "uric acid": "Uric Acid",
        "ua": "Uric Acid",
        "tsh": "TSH",
        "thyroid stimulating hormone": "TSH",
        "t3": "T3",
        "t4": "T4",
        "free t4": "Free T4",
        "ft4": "Free T4",
        "free t3": "Free T3",
        "ft3": "Free T3",
        "iron": "Iron",
        "fe": "Iron",
        "ferritin": "Ferritin",
        "tibc": "TIBC",
        "transferrin": "Transferrin",
        "vitamin d": "Vitamin D",
        "vit d": "Vitamin D",
        "25-oh vitamin d": "Vitamin D",
        "vitamin b12": "Vitamin B12",
        "b12": "Vitamin B12",
        "folate": "Folate",
        "folic acid": "Folate",
    }

    # Common date patterns
    DATE_PATTERNS = [
        # ISO format: 2024-10-05
        r'\b(\d{4}-\d{1,2}-\d{1,2})\b',
        # US format: 10/05/2024, 10-05-2024
        r'\b(\d{1,2}[/-]\d{1,2}[/-]\d{4})\b',
        # US format short year: 10/05/24, 10-05-24
        r'\b(\d{1,2}[/-]\d{1,2}[/-]\d{2})\b',
        # Written format: Oct 5 2024, October 5, 2024
        r'\b((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},?\s+\d{4})\b',
        # Written format: 5 Oct 2024, 5 October 2024
        r'\b(\d{1,2}\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4})\b',
    ]

    # Lab value pattern: captures number with optional decimal and optional unit
    LAB_VALUE_PATTERN = r'(?::|=|is|was|of)?\s*<?([<>]?\d+(?:\.\d+)?(?:\s*[-–]\s*\d+(?:\.\d+)?)?)\s*((?:[a-zA-Z]+/?[a-zA-Z]*(?:/[a-zA-Z]+)?)?(?:\^?\d+)?)?'

    def __init__(self):
        """Initialize the lab extractor."""
        self._build_lab_pattern()

    def _build_lab_pattern(self) -> None:
        """Build regex pattern for lab name matching."""
        # Get all lab names (both abbreviations and canonical names)
        all_lab_names = set(self.LAB_ABBREVIATIONS.keys()) | set(self.LAB_ABBREVIATIONS.values())

        # Sort by length (longest first) to match longer names before shorter ones
        sorted_names = sorted(all_lab_names, key=len, reverse=True)

        # Escape special regex characters and build pattern
        escaped_names = [re.escape(name) for name in sorted_names]
        self._lab_name_pattern = re.compile(
            r'\b(' + '|'.join(escaped_names) + r')\b',
            re.IGNORECASE
        )

    def normalize_lab_name(self, name: str) -> str:
        """
        Normalize a lab name to its canonical form.

        Args:
            name: The lab name to normalize

        Returns:
            Canonical lab name
        """
        name_lower = name.lower().strip()
        return self.LAB_ABBREVIATIONS.get(name_lower, name)

    def parse_date(self, date_str: str) -> Optional[str]:
        """
        Parse a date string and return ISO format (YYYY-MM-DD).

        Args:
            date_str: The date string to parse

        Returns:
            ISO formatted date string or None if parsing fails
        """
        try:
            # Use dateutil for flexible parsing
            parsed = date_parser.parse(date_str, fuzzy=True)
            return parsed.strftime('%Y-%m-%d')
        except (ValueError, TypeError):
            return None

    def find_dates(self, text: str) -> List[Tuple[int, str, str]]:
        """
        Find all dates in text with their positions.

        Args:
            text: The text to search

        Returns:
            List of tuples (position, original_text, normalized_date)
        """
        dates = []
        for pattern in self.DATE_PATTERNS:
            for match in re.finditer(pattern, text, re.IGNORECASE):
                original = match.group(1)
                normalized = self.parse_date(original)
                if normalized:
                    dates.append((match.start(), original, normalized))

        # Remove duplicates and sort by position
        seen = set()
        unique_dates = []
        for pos, orig, norm in sorted(dates, key=lambda x: x[0]):
            if pos not in seen:
                seen.add(pos)
                unique_dates.append((pos, orig, norm))

        return unique_dates

    def extract_lab_value(self, text: str, start_pos: int) -> Optional[str]:
        """
        Extract a lab value and unit from text starting at a position.

        Args:
            text: The text to search
            start_pos: Position to start searching from

        Returns:
            Extracted lab value with unit, or None
        """
        # Look for value after the lab name
        remaining = text[start_pos:start_pos + 50]  # Look ahead up to 50 chars

        # Pattern to match lab values
        match = re.search(self.LAB_VALUE_PATTERN, remaining)
        if match:
            value = match.group(1).strip()
            unit = match.group(2).strip() if match.group(2) else ""

            if value:
                if unit:
                    return f"{value} {unit}"
                return value

        return None

    def extract_from_line(self, line: str, current_date: str) -> List[Tuple[str, str, str]]:
        """
        Extract lab results from a single line of text.

        Args:
            line: The line to process
            current_date: The current date context

        Returns:
            List of tuples (date, lab_name, lab_value)
        """
        results = []

        # Check for inline date in this line
        dates_in_line = self.find_dates(line)
        if dates_in_line:
            current_date = dates_in_line[0][2]  # Use first date found

        # Find all lab names in line
        for match in self._lab_name_pattern.finditer(line):
            lab_name_raw = match.group(1)
            lab_name = self.normalize_lab_name(lab_name_raw)

            # Extract value after this lab name
            value = self.extract_lab_value(line, match.end())

            if value:
                results.append((current_date, lab_name, value))

        return results

    def extract_columnar_format(self, text: str) -> List[Tuple[str, str, str]]:
        """
        Extract lab results from columnar/list format.

        Args:
            text: The text to process

        Returns:
            List of tuples (date, lab_name, lab_value)
        """
        results = []
        current_date = "No Data"

        lines = text.split('\n')
        for line in lines:
            line = line.strip()
            if not line:
                continue

            # Check if line is primarily a date
            dates = self.find_dates(line)
            if dates:
                # Check if line is mostly just a date (header line)
                date_text = dates[0][1]
                remaining = line.replace(date_text, '').strip()
                remaining = re.sub(r'^[:\-–\s]+', '', remaining)

                # If line is mostly date, treat as header
                if len(remaining) < 10 or not self._lab_name_pattern.search(remaining):
                    current_date = dates[0][2]
                    continue

            # Extract labs from this line
            line_results = self.extract_from_line(line, current_date)
            results.extend(line_results)

        return results

    def extract_narrative_format(self, text: str) -> List[Tuple[str, str, str]]:
        """
        Extract lab results from narrative text format.

        Args:
            text: The text to process

        Returns:
            List of tuples (date, lab_name, lab_value)
        """
        results = []

        # Find all dates and their positions
        dates = self.find_dates(text)

        # Create date ranges
        date_ranges = []
        for i, (pos, _, norm_date) in enumerate(dates):
            end_pos = dates[i + 1][0] if i + 1 < len(dates) else len(text)
            date_ranges.append((pos, end_pos, norm_date))

        # If no dates found, process entire text with "No Data" date
        if not date_ranges:
            date_ranges = [(0, len(text), "No Data")]

        # Extract labs within each date range
        for start, end, date in date_ranges:
            segment = text[start:end]

            # Find all lab names in segment
            for match in self._lab_name_pattern.finditer(segment):
                lab_name_raw = match.group(1)
                lab_name = self.normalize_lab_name(lab_name_raw)

                # Extract value after this lab name
                value = self.extract_lab_value(segment, match.end())

                if value:
                    results.append((date, lab_name, value))

        return results

    def extract(self, text: str) -> str:
        """
        Extract laboratory results from medical text.

        This is the main entry point for extraction. It handles both
        columnar and narrative formats.

        Args:
            text: The medical text to extract from

        Returns:
            JSON string with extracted lab results
        """
        if not text or not text.strip():
            return json.dumps("No Data")

        # Determine format based on text structure
        lines = [l.strip() for l in text.split('\n') if l.strip()]

        # Use columnar format if multiple lines detected
        if len(lines) > 1:
            results = self.extract_columnar_format(text)
        else:
            results = self.extract_narrative_format(text)

        # Also try narrative format and merge (for mixed formats)
        if len(lines) > 1:
            narrative_results = self.extract_narrative_format(text)
            # Merge results, avoiding duplicates
            existing = {(d, n, v) for d, n, v in results}
            for r in narrative_results:
                if r not in existing:
                    results.append(r)

        # Build output collection
        collection = LabResultCollection()
        for date, lab_name, lab_value in results:
            collection.add_result(date, lab_name, lab_value)

        if collection.is_empty():
            return json.dumps("No Data")

        return collection.to_json()

    def extract_structured(self, text: str) -> List[dict]:
        """
        Extract laboratory results and return as Python data structure.

        Args:
            text: The medical text to extract from

        Returns:
            List of date-grouped lab objects, or "No Data" string
        """
        json_str = self.extract(text)
        return json.loads(json_str)

    def extract_pretty(self, text: str, indent: int = 2) -> str:
        """
        Extract laboratory results with pretty-printed JSON output.

        Args:
            text: The medical text to extract from
            indent: Number of spaces for JSON indentation

        Returns:
            Pretty-printed JSON string
        """
        result = self.extract_structured(text)
        return json.dumps(result, indent=indent)
