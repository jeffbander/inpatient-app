"""MRI (Magnetic Resonance Imaging) findings extractor."""

import re
from typing import Dict, List, Union

from .base import BaseImagingExtractor


class MRIExtractor(BaseImagingExtractor):
    """
    Extractor for MRI (Magnetic Resonance Imaging) findings.

    Extracts findings from brain, spine, cardiac, MSK,
    and body MRI reports.
    """

    MODALITY = "MRI"

    def get_modality_keywords(self) -> List[str]:
        """Return keywords that identify MRI in text."""
        return [
            "mri", "magnetic resonance", "mr imaging", "mr ",
            "mri brain", "mri spine", "mri lumbar", "mri cervical",
            "mri knee", "mri shoulder", "mri hip",
            "mra", "mr angiography", "mr angiogram",
            "mrcp", "cardiac mri", "cardiac mr",
            "flair", "t1 weighted", "t2 weighted", "t1w", "t2w",
            "dwi", "diffusion weighted", "diffusion restriction",
            "adc", "apparent diffusion",
            "gadolinium", "gad", "with contrast",
            "stir", "gre", "swi"
        ]

    def get_extraction_parameters(self) -> Dict[str, List[str]]:
        """Return MRI parameters to extract."""
        return {
            "brain": [
                "white matter lesion", "T2 hyperintensity", "FLAIR hyperintensity",
                "diffusion restriction", "DWI positive", "acute infarct",
                "enhancement", "enhancing lesion",
                "mass effect", "midline shift", "herniation",
                "volume loss", "atrophy", "encephalomalacia",
                "demyelination", "MS", "multiple sclerosis"
            ],
            "spine": [
                "disc herniation", "disc bulge", "disc protrusion",
                "cord compression", "cord signal",
                "foraminal stenosis", "central stenosis",
                "nerve root", "impingement",
                "Modic changes", "degenerative"
            ],
            "cardiac": [
                "EF", "LVEF", "ejection fraction",
                "LV volume", "LVEDV", "LVESV",
                "late gadolinium enhancement", "LGE", "scar", "fibrosis",
                "T2 edema", "myocardial edema",
                "perfusion defect", "ischemia",
                "wall motion"
            ],
            "msk": [
                "ACL", "anterior cruciate", "tear",
                "meniscus", "meniscal tear",
                "rotator cuff", "supraspinatus", "infraspinatus",
                "tendon", "tendinopathy", "tendinosis",
                "bone marrow edema", "bone bruise",
                "cartilage", "chondral", "labrum", "labral"
            ],
            "body": [
                "lesion", "mass", "nodule",
                "PI-RADS", "prostate",
                "BI-RADS", "breast",
                "enhancement pattern", "washout"
            ],
            "sequences": [
                "T1", "T2", "FLAIR", "DWI", "ADC",
                "STIR", "GRE", "SWI", "post-contrast"
            ]
        }

    def _get_default_prompt(self) -> str:
        """Return the default MRI extraction prompt."""
        return """You are an AI medical data extraction agent.
Your task is to identify, extract, and structure MRI findings from clinical text.
Return clean, grouped JSON data for each MRI study.

Extract MRI-specific findings including:
- Brain MRI: white matter lesions, infarcts, enhancement, mass effect
- Spine MRI: disc herniation, cord compression, stenosis
- Cardiac MRI: EF, LGE, edema, perfusion defects
- MSK MRI: ligament tears, meniscal injury, tendon pathology
- Body MRI: lesion characterization, PI-RADS, BI-RADS

Rules:
- Extract only MRI-related findings
- Note which sequences show findings (T1, T2, FLAIR, DWI)
- Normalize dates to YYYY-MM-DD format
- Preserve measurements exactly
- If no MRI data found, return "No Data"

Return JSON with format:
{"studies": [{"date": "YYYY-MM-DD", "source_text": "brief description", "is_latest": true/false, "findings": [{"finding_name": "name", "finding_value": "value"}]}]}
"""

    def _rule_based_extract(self, text: str) -> Union[List[Dict], str]:
        """
        Rule-based fallback extraction for MRI findings.
        """
        findings = []

        # White matter lesions
        wml_pattern = r'(?:white\s+matter\s+(?:lesion|hyperintensit|change)|T2\s+hyperintens|FLAIR\s+hyperintens)[^\.\n]*(multiple|few|several|scattered|periventricular|subcortical)'
        match = re.search(wml_pattern, text, re.IGNORECASE)
        if match:
            findings.append({
                "finding_name": "White Matter Lesions",
                "finding_value": match.group(1).lower()
            })

        # Acute infarct / diffusion restriction
        infarct_patterns = [
            r'(?:acute\s+infarct|diffusion\s+restriction)[^\.\n]*((?:left|right)\s+\w+(?:\s+\w+)?)',
            r'(?:DWI|diffusion)\s+(?:positive|restricted|hyperintense)[^\.\n]*((?:left|right)\s+\w+)?',
        ]
        for pattern in infarct_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                location = match.group(1) if match.group(1) else "present"
                findings.append({
                    "finding_name": "Acute Infarct",
                    "finding_value": location
                })
                break

        # Disc herniation
        disc_pattern = r'(?:disc|disk)\s+(?:herniation|bulge|protrusion)[^\.\n]*(?:at\s+)?(L\d[-/](?:L|S)\d|C\d[-/]C?\d|T\d+[-/]T?\d+)'
        for match in re.finditer(disc_pattern, text, re.IGNORECASE):
            findings.append({
                "finding_name": "Disc Herniation",
                "finding_value": match.group(1)
            })

        # Stenosis
        stenosis_pattern = r'(foraminal|central|spinal\s+canal)\s+stenosis[:\s]*(mild|moderate|severe)?'
        match = re.search(stenosis_pattern, text, re.IGNORECASE)
        if match:
            severity = match.group(2) if match.group(2) else "present"
            findings.append({
                "finding_name": f"{match.group(1).title()} Stenosis",
                "finding_value": severity.lower()
            })

        # ACL / ligament tear
        ligament_pattern = r'(ACL|PCL|MCL|LCL|anterior\s+cruciate|posterior\s+cruciate)\s+(?:ligament\s+)?(tear|rupture|injury|intact)'
        match = re.search(ligament_pattern, text, re.IGNORECASE)
        if match:
            findings.append({
                "finding_name": f"{match.group(1).upper()} Status",
                "finding_value": match.group(2).lower()
            })

        # Meniscal tear
        meniscus_pattern = r'(medial|lateral)\s+meniscus[^\.\n]*(tear|intact|degenerative)'
        match = re.search(meniscus_pattern, text, re.IGNORECASE)
        if match:
            findings.append({
                "finding_name": f"{match.group(1).title()} Meniscus",
                "finding_value": match.group(2).lower()
            })

        if not findings:
            return self.NO_DATA_RESPONSE

        from ..utils.date_parser import extract_dates_from_text
        dates = extract_dates_from_text(text)
        study_date = dates[0][0] if dates else "No Data"

        return [{
            "date": study_date,
            "source_text": "MRI report",
            "is_latest": True,
            "modality": self.MODALITY,
            "findings": findings
        }]
