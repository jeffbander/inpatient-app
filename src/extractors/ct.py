"""CT (Computed Tomography) scan findings extractor."""

import re
from typing import Dict, List, Union

from .base import BaseImagingExtractor


class CTExtractor(BaseImagingExtractor):
    """
    Extractor for CT (Computed Tomography) findings.

    Extracts findings from CT head, chest, abdomen, spine,
    and CT angiography reports.
    """

    MODALITY = "CT"

    def get_modality_keywords(self) -> List[str]:
        """Return keywords that identify CT imaging in text."""
        return [
            "ct scan", "ct ", "computed tomography", "cat scan",
            "ct head", "ct chest", "ct abdomen", "ct pelvis",
            "ct spine", "ct cervical", "ct lumbar", "ct thoracic",
            "cta", "ct angiography", "ct angiogram",
            "ctpa", "ct pulmonary", "pe protocol",
            "ct with contrast", "ct without contrast",
            "non-contrast ct", "contrast-enhanced ct",
            "hounsfield", " hu "
        ]

    def get_extraction_parameters(self) -> Dict[str, List[str]]:
        """Return CT parameters to extract."""
        return {
            "head": [
                "hemorrhage", "intracranial hemorrhage", "ICH",
                "subdural", "epidural", "subarachnoid", "SAH",
                "infarct", "stroke", "ischemia",
                "mass", "lesion", "tumor",
                "midline shift", "herniation",
                "ventricle", "ventriculomegaly", "hydrocephalus",
                "edema", "vasogenic edema",
                "atrophy", "volume loss"
            ],
            "chest": [
                "nodule", "pulmonary nodule", "lung nodule",
                "mass", "lung mass",
                "consolidation", "infiltrate",
                "ground glass", "GGO", "ground glass opacity",
                "effusion", "pleural effusion",
                "pneumothorax", "PTX",
                "lymphadenopathy", "lymph node",
                "pulmonary embolism", "PE", "embolus",
                "aorta", "aortic aneurysm", "aortic dissection"
            ],
            "abdomen": [
                "liver lesion", "hepatic lesion",
                "kidney stone", "renal stone", "nephrolithiasis",
                "hydronephrosis",
                "appendicitis", "appendix",
                "bowel obstruction", "SBO", "ileus",
                "free fluid", "ascites",
                "gallstones", "cholelithiasis",
                "pancreatitis", "pancreatic",
                "splenomegaly", "hepatomegaly"
            ],
            "spine": [
                "fracture", "compression fracture",
                "disc herniation", "disc bulge",
                "stenosis", "spinal stenosis", "foraminal stenosis",
                "alignment", "listhesis", "spondylolisthesis"
            ],
            "vascular": [
                "stenosis", "occlusion",
                "aneurysm", "dissection",
                "thrombus", "thrombosis"
            ],
            "measurements": [
                "size", "diameter", "dimensions",
                "hounsfield", "HU",
                "enhancement"
            ]
        }

    def _get_default_prompt(self) -> str:
        """Return the default CT extraction prompt."""
        return """You are an AI medical data extraction agent.
Your task is to identify, extract, and structure CT scan findings from clinical text.
Return clean, grouped JSON data for each CT study.

Extract CT-specific findings including:
- Head CT: hemorrhage, infarct, mass, midline shift
- Chest CT: nodules, consolidation, effusion, PE, lymphadenopathy
- Abdominal CT: liver/kidney lesions, stones, obstruction
- Spine CT: fractures, disc herniation, stenosis
- CTA: stenosis, aneurysm, dissection

Rules:
- Extract only CT-related findings
- Be case-insensitive and synonym-aware
- Normalize dates to YYYY-MM-DD format
- Preserve units and measurements exactly
- If no CT data found, return "No Data"

Return JSON with format:
{"studies": [{"date": "YYYY-MM-DD", "source_text": "brief description", "is_latest": true/false, "findings": [{"finding_name": "name", "finding_value": "value"}]}]}
"""

    def _rule_based_extract(self, text: str) -> Union[List[Dict], str]:
        """
        Rule-based fallback extraction for CT findings.
        """
        findings = []

        # Pulmonary nodule patterns
        nodule_pattern = r'(?:pulmonary\s+)?nodule[s]?[:\s]*(\d+\.?\d*)\s*(mm|cm)(?:\s+(?:in|at|within)\s+(?:the\s+)?(\w+\s+\w+\s+lobe|\w+\s+lobe))?'
        for match in re.finditer(nodule_pattern, text, re.IGNORECASE):
            location = match.group(3) if match.group(3) else ""
            findings.append({
                "finding_name": "Pulmonary Nodule",
                "finding_value": f"{match.group(1)} {match.group(2)} {location}".strip()
            })

        # Pulmonary embolism
        pe_patterns = [
            r'(?:pulmonary\s+embol(?:ism|us)|PE)[:\s]*(present|positive|identified|seen|acute|chronic|bilateral|right|left|segmental|subsegmental)',
            r'(no|negative|absent|without)\s+(?:evidence\s+of\s+)?(?:pulmonary\s+embol|PE)',
        ]
        for pattern in pe_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                value = match.group(1).lower()
                if value in ["no", "negative", "absent", "without"]:
                    value = "negative"
                findings.append({
                    "finding_name": "Pulmonary Embolism",
                    "finding_value": value
                })
                break

        # Pleural effusion
        effusion_pattern = r'(?:pleural\s+)?effusion[s]?[:\s]*(small|moderate|large|trace|minimal|bilateral|right|left|none|no)'
        match = re.search(effusion_pattern, text, re.IGNORECASE)
        if match:
            findings.append({
                "finding_name": "Pleural Effusion",
                "finding_value": match.group(1).lower()
            })

        # Hemorrhage
        hemorrhage_pattern = r'(intracranial|subdural|epidural|subarachnoid|intraparenchymal)\s+(?:hemorrhage|hematoma)[:\s]*(present|seen|identified|acute|chronic|no|none)?'
        match = re.search(hemorrhage_pattern, text, re.IGNORECASE)
        if match:
            value = match.group(2) if match.group(2) else "present"
            findings.append({
                "finding_name": f"{match.group(1).title()} Hemorrhage",
                "finding_value": value.lower()
            })

        # Fracture
        fracture_pattern = r'(?:acute\s+)?fracture[s]?[:\s]+(?:of\s+)?(?:the\s+)?(\w+(?:\s+\w+)?)'
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
            "source_text": "CT report",
            "is_latest": True,
            "modality": self.MODALITY,
            "findings": findings
        }]
