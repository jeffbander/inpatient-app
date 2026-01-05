"""Echocardiogram (ECHO) findings extractor."""

import re
from typing import Dict, List, Union

from .base import BaseImagingExtractor


class EchoExtractor(BaseImagingExtractor):
    """
    Extractor for echocardiogram (ECHO) findings.

    Extracts cardiac function, dimensions, hemodynamics, and
    qualitative assessments from clinical text.
    """

    MODALITY = "ECHO"

    def get_modality_keywords(self) -> List[str]:
        """Return keywords that identify echocardiogram in text."""
        return [
            "echocardiogram", "echo", "echocardiography",
            "tte", "tee", "transthoracic", "transesophageal",
            "cardiac ultrasound", "2d echo", "doppler echo",
            "ejection fraction", "lvef", "ef ", "e/f",
            "left ventricle", "lv function", "lv systolic"
        ]

    def get_extraction_parameters(self) -> Dict[str, List[str]]:
        """Return ECHO parameters to extract."""
        return {
            "functional": [
                "EF", "LVEF", "Ejection Fraction", "LV function",
                "LV systolic function", "RV function", "RVEF",
                "global longitudinal strain", "GLS"
            ],
            "dimensional": [
                "LVEDD", "LVESD", "LVIDd", "LVIDs",
                "IVSd", "IVSs", "LVPWd", "LVPWs",
                "LA diameter", "LA volume", "LAVi", "LA size",
                "RA size", "RV size", "RVEDD",
                "LV mass", "LV mass index", "LVMi",
                "aortic root", "ascending aorta"
            ],
            "hemodynamic": [
                "LVOT gradient", "LVOT VTI", "LVOT diameter",
                "PASP", "RVSP", "PA pressure", "pulmonary pressure",
                "TAPSE", "RV S'",
                "E velocity", "A velocity", "E/A ratio",
                "e'", "e prime", "E/e'", "E/e' ratio",
                "deceleration time", "DT", "IVRT",
                "cardiac output", "CO", "cardiac index", "CI",
                "stroke volume", "SV"
            ],
            "valvular": [
                "MR", "mitral regurgitation",
                "TR", "tricuspid regurgitation",
                "AR", "aortic regurgitation",
                "PR", "pulmonic regurgitation",
                "MS", "mitral stenosis", "MVA",
                "AS", "aortic stenosis", "AVA", "aortic valve area",
                "valve gradient", "mean gradient", "peak gradient"
            ],
            "qualitative": [
                "LVH", "left ventricular hypertrophy",
                "RVH", "right ventricular hypertrophy",
                "dilation", "dilated", "enlarged",
                "wall motion", "WMA", "wall motion abnormality",
                "hypokinesis", "akinesis", "dyskinesis",
                "pericardial effusion", "pericarditis",
                "diastolic dysfunction", "diastolic function"
            ]
        }

    def _get_default_prompt(self) -> str:
        """Return the default ECHO extraction prompt."""
        return """You are an AI medical data extraction agent.
Your task is to identify, extract, and structure echocardiogram (ECHO) findings from clinical text.
Return clean, grouped JSON data for each ECHO study.

Extract ECHO-specific findings including:
- Functional: EF, LVEF, LV function
- Dimensional: LVEDD, LVESD, IVSd, LVPWd, LA diameter/volume, LV mass
- Hemodynamic: LVOT gradient, PASP, TAPSE, E/e'
- Valvular: MR, TR, AR, AS, MS grades
- Qualitative: LVH, dilation, wall motion abnormalities

Rules:
- Extract only ECHO-related metrics
- Be case-insensitive and synonym-aware
- Normalize dates to YYYY-MM-DD format
- Preserve units exactly
- If no ECHO data found, return "No Data"

Return JSON with format:
{"studies": [{"date": "YYYY-MM-DD", "source_text": "brief description", "is_latest": true/false, "findings": [{"finding_name": "name", "finding_value": "value"}]}]}
"""

    def _rule_based_extract(self, text: str) -> Union[List[Dict], str]:
        """
        Rule-based fallback extraction for ECHO findings.

        Args:
            text: Clinical text

        Returns:
            Extracted findings or "No Data"
        """
        findings = []

        # EF/LVEF patterns
        ef_patterns = [
            r'(?:EF|LVEF|ejection\s*fraction)[:\s]*(\d{1,2}(?:\.\d+)?)\s*%',
            r'(?:EF|LVEF|ejection\s*fraction)[:\s]*(\d{1,2}(?:\.\d+)?)\s*(?:percent|to)',
            r'(\d{1,2}(?:\.\d+)?)\s*%\s*(?:EF|LVEF|ejection\s*fraction)',
        ]
        for pattern in ef_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                findings.append({
                    "finding_name": "Ejection Fraction",
                    "finding_value": f"{match.group(1)}%"
                })
                break

        # LVH patterns
        lvh_patterns = [
            r'(mild|moderate|severe|concentric|eccentric)?\s*(?:LVH|left\s*ventricular\s*hypertrophy)',
            r'(?:LVH|left\s*ventricular\s*hypertrophy)[:\s]*(mild|moderate|severe|concentric|eccentric)?',
        ]
        for pattern in lvh_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                qualifier = match.group(1) if match.group(1) else "present"
                findings.append({
                    "finding_name": "LVH",
                    "finding_value": qualifier.lower()
                })
                break

        # Dimension patterns (e.g., LVEDD 5.3 cm)
        dimension_params = ["LVEDD", "LVESD", "IVSd", "LVPWd", "LA diameter"]
        for param in dimension_params:
            pattern = rf'{param}[:\s]*(\d+\.?\d*)\s*(cm|mm)'
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                findings.append({
                    "finding_name": param,
                    "finding_value": f"{match.group(1)} {match.group(2)}"
                })

        # PASP pattern
        pasp_pattern = r'(?:PASP|PA\s*systolic\s*pressure|RVSP)[:\s]*(\d+\.?\d*)\s*(?:mmHg|mm\s*Hg)?'
        match = re.search(pasp_pattern, text, re.IGNORECASE)
        if match:
            findings.append({
                "finding_name": "PASP",
                "finding_value": f"{match.group(1)} mmHg"
            })

        # Regurgitation patterns
        regurg_mapping = {
            "MR": "Mitral Regurgitation",
            "TR": "Tricuspid Regurgitation",
            "AR": "Aortic Regurgitation"
        }
        for abbrev, full_name in regurg_mapping.items():
            pattern = rf'(?:{abbrev}|{full_name})[:\s]*(trace|trivial|mild|moderate|severe|mild-moderate|moderate-severe)'
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                findings.append({
                    "finding_name": full_name,
                    "finding_value": match.group(1).lower()
                })

        if not findings:
            return self.NO_DATA_RESPONSE

        # Try to extract date
        from ..utils.date_parser import extract_dates_from_text
        dates = extract_dates_from_text(text)
        study_date = dates[0][0] if dates else "No Data"

        return [{
            "date": study_date,
            "source_text": "ECHO report",
            "is_latest": True,
            "modality": self.MODALITY,
            "findings": findings
        }]
