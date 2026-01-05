"""X-ray (Radiograph) findings extractor."""

import re
from typing import Dict, List, Union

from .base import BaseImagingExtractor


class XRayExtractor(BaseImagingExtractor):
    """
    Extractor for X-ray (radiograph) findings.

    Extracts findings from chest X-rays, abdominal films,
    and skeletal radiographs.
    """

    MODALITY = "XRAY"

    def get_modality_keywords(self) -> List[str]:
        """Return keywords that identify X-ray imaging in text."""
        return [
            "x-ray", "xray", "x ray", "radiograph",
            "chest x-ray", "cxr", "chest film",
            "portable chest", "pa and lateral", "ap chest",
            "kub", "abdominal x-ray", "abdominal film",
            "plain film", "plain radiograph",
            "skeletal survey", "bone x-ray",
            "spine x-ray", "extremity x-ray"
        ]

    def get_extraction_parameters(self) -> Dict[str, List[str]]:
        """Return X-ray parameters to extract."""
        return {
            "chest": [
                "cardiomegaly", "cardiac silhouette", "heart size",
                "pulmonary edema", "vascular congestion", "CHF",
                "consolidation", "infiltrate", "opacity",
                "effusion", "pleural effusion",
                "pneumothorax", "PTX",
                "atelectasis",
                "nodule", "mass",
                "mediastinal widening", "mediastinum",
                "rib fracture", "fracture"
            ],
            "lines_tubes": [
                "ET tube", "endotracheal tube", "ETT",
                "NG tube", "nasogastric",
                "central line", "PICC", "port",
                "chest tube", "pacemaker", "ICD"
            ],
            "abdominal": [
                "bowel gas", "gas pattern",
                "obstruction", "SBO", "ileus",
                "free air", "pneumoperitoneum",
                "calcification", "stone"
            ],
            "skeletal": [
                "fracture", "dislocation",
                "alignment", "displacement",
                "arthritis", "degenerative",
                "hardware", "fixation"
            ]
        }

    def _get_default_prompt(self) -> str:
        """Return the default X-ray extraction prompt."""
        return """You are an AI medical data extraction agent.
Your task is to identify, extract, and structure X-ray findings from clinical text.
Return clean, grouped JSON data for each X-ray study.

Extract X-ray-specific findings including:
- Chest X-ray: cardiomegaly, edema, consolidation, effusion, pneumothorax
- Lines/tubes: ET tube position, NG tube, central lines
- Abdominal X-ray: bowel gas pattern, obstruction, free air
- Skeletal: fractures, dislocations, arthritis

Rules:
- Extract only X-ray/radiograph findings
- Be case-insensitive and synonym-aware
- Normalize dates to YYYY-MM-DD format
- Note comparisons to prior studies
- If no X-ray data found, return "No Data"

Return JSON with format:
{"studies": [{"date": "YYYY-MM-DD", "source_text": "brief description", "is_latest": true/false, "findings": [{"finding_name": "name", "finding_value": "value"}]}]}
"""

    def _rule_based_extract(self, text: str) -> Union[List[Dict], str]:
        """
        Rule-based fallback extraction for X-ray findings.
        """
        findings = []

        # Cardiomegaly
        cardio_pattern = r'cardiomegaly[:\s]*(present|enlarged|stable|mild|moderate|severe|no|none|absent|normal)'
        match = re.search(cardio_pattern, text, re.IGNORECASE)
        if match:
            findings.append({
                "finding_name": "Cardiomegaly",
                "finding_value": match.group(1).lower()
            })
        elif re.search(r'(enlarged|large)\s+(?:cardiac|heart)', text, re.IGNORECASE):
            findings.append({
                "finding_name": "Cardiomegaly",
                "finding_value": "present"
            })
        elif re.search(r'(?:cardiac|heart)\s+(?:size|silhouette)\s+(?:is\s+)?normal', text, re.IGNORECASE):
            findings.append({
                "finding_name": "Cardiomegaly",
                "finding_value": "none"
            })

        # Pulmonary edema
        edema_pattern = r'(?:pulmonary\s+)?(?:edema|vascular\s+congestion)[:\s]*(mild|moderate|severe|interstitial|alveolar|present|no|none)'
        match = re.search(edema_pattern, text, re.IGNORECASE)
        if match:
            findings.append({
                "finding_name": "Pulmonary Edema",
                "finding_value": match.group(1).lower()
            })

        # Consolidation/infiltrate
        consolidation_pattern = r'(?:consolidation|infiltrate|opacity)[:\s]*(?:in\s+)?(?:the\s+)?((?:right|left|bilateral)\s+(?:upper|lower|middle)?\s*(?:lobe)?|(?:right|left|bilateral))'
        match = re.search(consolidation_pattern, text, re.IGNORECASE)
        if match:
            findings.append({
                "finding_name": "Consolidation",
                "finding_value": match.group(1).lower().strip()
            })

        # Pleural effusion
        effusion_pattern = r'(?:pleural\s+)?effusion[s]?[:\s]*(small|moderate|large|trace|minimal|bilateral|right|left|none|no)'
        match = re.search(effusion_pattern, text, re.IGNORECASE)
        if match:
            findings.append({
                "finding_name": "Pleural Effusion",
                "finding_value": match.group(1).lower()
            })

        # Pneumothorax
        ptx_pattern = r'(?:pneumothorax|PTX)[:\s]*(small|moderate|large|tension|present|no|none|absent)'
        match = re.search(ptx_pattern, text, re.IGNORECASE)
        if match:
            findings.append({
                "finding_name": "Pneumothorax",
                "finding_value": match.group(1).lower()
            })
        elif re.search(r'no\s+(?:evidence\s+of\s+)?pneumothorax', text, re.IGNORECASE):
            findings.append({
                "finding_name": "Pneumothorax",
                "finding_value": "none"
            })

        # ET tube position
        ett_pattern = r'(?:ET\s+tube|ETT|endotracheal\s+tube)[^\.\n]*(\d+\.?\d*\s*cm\s+(?:above|from)\s+(?:the\s+)?carina|appropriately?\s+positioned|high|low|in\s+good\s+position)'
        match = re.search(ett_pattern, text, re.IGNORECASE)
        if match:
            findings.append({
                "finding_name": "ET Tube Position",
                "finding_value": match.group(1).lower()
            })

        # Fracture
        fracture_pattern = r'fracture[s]?[:\s]*(?:of\s+)?(?:the\s+)?(\w+(?:\s+\w+)?(?:\s+rib)?)'
        match = re.search(fracture_pattern, text, re.IGNORECASE)
        if match:
            findings.append({
                "finding_name": "Fracture",
                "finding_value": match.group(1)
            })

        if not findings:
            return self.NO_DATA_RESPONSE

        from ..utils.date_parser import extract_dates_from_text
        dates = extract_dates_from_text(text)
        study_date = dates[0][0] if dates else "No Data"

        return [{
            "date": study_date,
            "source_text": "X-ray report",
            "is_latest": True,
            "modality": self.MODALITY,
            "findings": findings
        }]
