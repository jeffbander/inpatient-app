"""Ultrasound (non-cardiac) findings extractor."""

import re
from typing import Dict, List, Union

from .base import BaseImagingExtractor


class UltrasoundExtractor(BaseImagingExtractor):
    """
    Extractor for Ultrasound findings (non-cardiac).

    Extracts findings from abdominal, renal, pelvic, thyroid,
    vascular, and other ultrasound studies.
    Note: Echocardiograms are handled by EchoExtractor.
    """

    MODALITY = "ULTRASOUND"

    def get_modality_keywords(self) -> List[str]:
        """Return keywords that identify ultrasound in text."""
        return [
            "ultrasound", "sonogram", "sonography", "us ",
            "ruq ultrasound", "ruq us", "right upper quadrant",
            "abdominal ultrasound", "abdominal us",
            "renal ultrasound", "renal us", "kidney ultrasound",
            "pelvic ultrasound", "pelvic us", "transvaginal",
            "thyroid ultrasound", "thyroid us",
            "doppler", "duplex", "venous doppler",
            "carotid doppler", "carotid ultrasound",
            "lower extremity venous", "dvt study",
            "obstetric ultrasound", "ob ultrasound",
            "gallbladder", "hepatobiliary"
        ]

    def get_extraction_parameters(self) -> Dict[str, List[str]]:
        """Return ultrasound parameters to extract."""
        return {
            "abdominal": [
                "liver size", "liver echogenicity", "hepatomegaly",
                "steatosis", "fatty liver",
                "gallstones", "cholelithiasis", "sludge",
                "CBD", "common bile duct", "biliary dilation",
                "gallbladder wall", "cholecystitis",
                "spleen size", "splenomegaly",
                "pancreas", "ascites", "free fluid"
            ],
            "renal": [
                "kidney size", "kidney length",
                "cortical thickness", "cortical echogenicity",
                "hydronephrosis", "hydroureter",
                "renal stone", "nephrolithiasis",
                "renal cyst", "renal mass",
                "resistive index", "RI"
            ],
            "pelvic": [
                "uterus size", "uterine size",
                "endometrial thickness", "endometrium",
                "ovary size", "ovarian cyst", "ovarian mass",
                "fibroid", "leiomyoma",
                "free fluid", "adnexal"
            ],
            "thyroid": [
                "nodule", "thyroid nodule",
                "TI-RADS", "TIRADS",
                "lymph node", "cervical lymph",
                "thyroid size", "goiter"
            ],
            "vascular": [
                "DVT", "deep vein thrombosis", "thrombus",
                "compressible", "non-compressible",
                "carotid stenosis", "ICA stenosis",
                "plaque", "velocity",
                "AAA", "aortic aneurysm", "aorta diameter",
                "ABI", "ankle-brachial"
            ],
            "obstetric": [
                "gestational age", "GA",
                "fetal heart rate", "FHR",
                "amniotic fluid", "AFI",
                "placenta", "placental position",
                "BPD", "HC", "AC", "FL"
            ]
        }

    def _get_default_prompt(self) -> str:
        """Return the default ultrasound extraction prompt."""
        return """You are an AI medical data extraction agent.
Your task is to identify, extract, and structure ultrasound findings from clinical text.
Return clean, grouped JSON data for each ultrasound study.
NOTE: This is for NON-CARDIAC ultrasound. Echocardiograms are handled separately.

Extract ultrasound-specific findings including:
- Abdominal: liver, gallbladder, CBD, spleen, pancreas
- Renal: kidney size, hydronephrosis, stones, cysts
- Pelvic: uterus, ovaries, endometrium
- Thyroid: nodules, TI-RADS
- Vascular: DVT, carotid stenosis, AAA
- OB: gestational age, fetal heart rate, AFI

Rules:
- Extract only ultrasound findings (not cardiac echo)
- Be case-insensitive and synonym-aware
- Normalize dates to YYYY-MM-DD format
- Preserve measurements exactly
- If no ultrasound data found, return "No Data"

Return JSON with format:
{"studies": [{"date": "YYYY-MM-DD", "source_text": "brief description", "is_latest": true/false, "findings": [{"finding_name": "name", "finding_value": "value"}]}]}
"""

    def detect_modality_in_text(self, text: str) -> bool:
        """
        Check if non-cardiac ultrasound is mentioned.
        Exclude echocardiograms.
        """
        text_lower = text.lower()

        # Check for ultrasound keywords
        has_ultrasound = any(kw.lower() in text_lower for kw in self.get_modality_keywords())

        if not has_ultrasound:
            return False

        # Exclude if it's primarily an echocardiogram
        echo_keywords = ["echocardiogram", "echocardiography", "tte", "tee",
                         "transthoracic echo", "transesophageal echo",
                         "ejection fraction", "lvef", "cardiac echo"]

        # If strong echo indicators present without other US context, skip
        has_echo = any(kw in text_lower for kw in echo_keywords)
        has_other_us = any(kw in text_lower for kw in [
            "abdominal", "renal", "kidney", "liver", "gallbladder",
            "thyroid", "pelvic", "carotid", "dvt", "venous"
        ])

        if has_echo and not has_other_us:
            return False

        return True

    def _rule_based_extract(self, text: str) -> Union[List[Dict], str]:
        """
        Rule-based fallback extraction for ultrasound findings.
        """
        findings = []

        # Gallstones
        gallstone_pattern = r'(?:gallstone|cholelithiasis)[s]?[:\s]*(present|multiple|single|none|no|absent|\d+\.?\d*\s*(?:cm|mm))'
        match = re.search(gallstone_pattern, text, re.IGNORECASE)
        if match:
            findings.append({
                "finding_name": "Gallstones",
                "finding_value": match.group(1).lower()
            })
        elif re.search(r'stones?\s+(?:in|within)\s+(?:the\s+)?gallbladder', text, re.IGNORECASE):
            findings.append({
                "finding_name": "Gallstones",
                "finding_value": "present"
            })

        # CBD diameter
        cbd_pattern = r'(?:CBD|common\s+bile\s+duct)[^\.\n]*?(\d+\.?\d*)\s*(mm|cm)'
        match = re.search(cbd_pattern, text, re.IGNORECASE)
        if match:
            findings.append({
                "finding_name": "CBD Diameter",
                "finding_value": f"{match.group(1)} {match.group(2)}"
            })

        # Hydronephrosis
        hydro_pattern = r'hydronephrosis[:\s]*(mild|moderate|severe|grade\s*\d|none|no|absent|(?:right|left|bilateral))'
        match = re.search(hydro_pattern, text, re.IGNORECASE)
        if match:
            findings.append({
                "finding_name": "Hydronephrosis",
                "finding_value": match.group(1).lower()
            })

        # Kidney size
        kidney_pattern = r'(?:right|left)\s+kidney[^\.\n]*?(\d+\.?\d*)\s*(cm|mm)'
        for match in re.finditer(kidney_pattern, text, re.IGNORECASE):
            side = "Right" if "right" in match.group(0).lower() else "Left"
            findings.append({
                "finding_name": f"{side} Kidney Size",
                "finding_value": f"{match.group(1)} {match.group(2)}"
            })

        # DVT
        dvt_patterns = [
            r'(?:DVT|deep\s+vein\s+thrombosis)[:\s]*(present|positive|identified|acute|chronic|no|none|negative|absent)',
            r'(no|negative)\s+(?:evidence\s+of\s+)?(?:DVT|deep\s+vein\s+thrombosis)',
            r'veins?\s+(?:are\s+)?(compressible|non-compressible|patent)',
        ]
        for pattern in dvt_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                value = match.group(1).lower()
                if value in ["no", "negative", "compressible", "patent"]:
                    value = "negative"
                elif value == "non-compressible":
                    value = "positive (non-compressible)"
                findings.append({
                    "finding_name": "DVT",
                    "finding_value": value
                })
                break

        # Thyroid nodule
        thyroid_pattern = r'thyroid\s+nodule[^\.\n]*?(\d+\.?\d*)\s*(cm|mm)'
        match = re.search(thyroid_pattern, text, re.IGNORECASE)
        if match:
            findings.append({
                "finding_name": "Thyroid Nodule",
                "finding_value": f"{match.group(1)} {match.group(2)}"
            })

        # TI-RADS
        tirads_pattern = r'(?:TI-?RADS|TIRADS)[:\s]*(\d|TR\d)'
        match = re.search(tirads_pattern, text, re.IGNORECASE)
        if match:
            findings.append({
                "finding_name": "TI-RADS",
                "finding_value": match.group(1)
            })

        # Liver echogenicity / steatosis
        liver_pattern = r'(?:liver|hepatic)[^\.\n]*(increased\s+echogenicity|steatosis|fatty\s+(?:liver|infiltration)|normal\s+echogenicity)'
        match = re.search(liver_pattern, text, re.IGNORECASE)
        if match:
            findings.append({
                "finding_name": "Liver Echogenicity",
                "finding_value": match.group(1).lower()
            })

        # Ascites
        ascites_pattern = r'(?:ascites|free\s+fluid)[:\s]*(present|small|moderate|large|trace|none|no|absent)'
        match = re.search(ascites_pattern, text, re.IGNORECASE)
        if match:
            findings.append({
                "finding_name": "Ascites",
                "finding_value": match.group(1).lower()
            })

        if not findings:
            return self.NO_DATA_RESPONSE

        from ..utils.date_parser import extract_dates_from_text
        dates = extract_dates_from_text(text)
        study_date = dates[0][0] if dates else "No Data"

        return [{
            "date": study_date,
            "source_text": "Ultrasound report",
            "is_latest": True,
            "modality": self.MODALITY,
            "findings": findings
        }]
