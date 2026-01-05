"""
Imaging Extraction Orchestrator.

Coordinates extraction across all imaging modalities and provides
a unified interface for extracting imaging findings from clinical text.
"""

import json
from typing import Any, Dict, List, Optional, Union

from .echo import EchoExtractor
from .ct import CTExtractor
from .mri import MRIExtractor
from .xray import XRayExtractor
from .ultrasound import UltrasoundExtractor


class ImagingExtractionOrchestrator:
    """
    Orchestrates extraction across all imaging modalities.

    Provides a unified interface for extracting imaging findings
    from clinical text, automatically detecting and extracting
    findings for all relevant imaging types.
    """

    def __init__(
        self,
        llm_client: Optional[Any] = None,
        model: str = "gpt-4o-mini",
        provider: str = "openai",
        enabled_modalities: Optional[List[str]] = None
    ):
        """
        Initialize the orchestrator.

        Args:
            llm_client: Pre-configured LLM client (OpenAI or Anthropic)
            model: Model identifier to use
            provider: LLM provider ("openai" or "anthropic")
            enabled_modalities: List of modalities to enable.
                                If None, all modalities are enabled.
                                Options: ["ECHO", "CT", "MRI", "XRAY", "ULTRASOUND"]
        """
        self.llm_client = llm_client
        self.model = model
        self.provider = provider

        # Initialize all extractors
        extractor_classes = {
            "ECHO": EchoExtractor,
            "CT": CTExtractor,
            "MRI": MRIExtractor,
            "XRAY": XRayExtractor,
            "ULTRASOUND": UltrasoundExtractor,
        }

        # Filter based on enabled modalities
        if enabled_modalities:
            enabled = [m.upper() for m in enabled_modalities]
            extractor_classes = {k: v for k, v in extractor_classes.items() if k in enabled}

        self.extractors = {
            name: cls(llm_client=llm_client, model=model, provider=provider)
            for name, cls in extractor_classes.items()
        }

    def extract_all(self, clinical_text: str) -> Dict[str, Union[List[Dict], str]]:
        """
        Extract findings from all imaging modalities present in text.

        Args:
            clinical_text: Raw clinical text (notes, reports, etc.)

        Returns:
            Dictionary mapping modality names to their extracted findings
        """
        results = {}

        for modality, extractor in self.extractors.items():
            result = extractor.extract(clinical_text)
            if result != "No Data":
                results[modality] = result

        return results if results else {"status": "No imaging data found"}

    def extract_modality(
        self,
        clinical_text: str,
        modality: str
    ) -> Union[List[Dict], str]:
        """
        Extract findings for a specific imaging modality.

        Args:
            clinical_text: Raw clinical text
            modality: Modality to extract (ECHO, CT, MRI, XRAY, ULTRASOUND)

        Returns:
            Extracted findings or "No Data"
        """
        modality = modality.upper()

        if modality not in self.extractors:
            raise ValueError(
                f"Unknown modality: {modality}. "
                f"Available: {list(self.extractors.keys())}"
            )

        return self.extractors[modality].extract(clinical_text)

    def detect_modalities(self, clinical_text: str) -> List[str]:
        """
        Detect which imaging modalities are present in the text.

        Args:
            clinical_text: Raw clinical text

        Returns:
            List of detected modality names
        """
        detected = []

        for modality, extractor in self.extractors.items():
            if extractor.detect_modality_in_text(clinical_text):
                detected.append(modality)

        return detected

    def extract_combined(
        self,
        clinical_text: str,
        combine_by_date: bool = True
    ) -> Union[List[Dict], str]:
        """
        Extract all imaging findings and optionally combine by date.

        Args:
            clinical_text: Raw clinical text
            combine_by_date: If True, group findings by date across modalities

        Returns:
            Combined list of imaging studies or "No Data"
        """
        all_results = self.extract_all(clinical_text)

        if "status" in all_results:
            return "No Data"

        # Flatten all studies
        all_studies = []
        for modality, studies in all_results.items():
            if isinstance(studies, list):
                all_studies.extend(studies)

        if not all_studies:
            return "No Data"

        if not combine_by_date:
            # Sort by date, newest first
            all_studies.sort(
                key=lambda x: x.get("date", "0000-00-00"),
                reverse=True
            )
            # Re-mark latest
            for i, study in enumerate(all_studies):
                study["is_latest"] = (i == 0)
            return all_studies

        # Combine studies by date
        date_groups: Dict[str, Dict] = {}

        for study in all_studies:
            date = study.get("date", "No Data")

            if date not in date_groups:
                date_groups[date] = {
                    "date": date,
                    "modalities": [],
                    "source_texts": [],
                    "findings": []
                }

            group = date_groups[date]
            modality = study.get("modality", "UNKNOWN")

            if modality not in group["modalities"]:
                group["modalities"].append(modality)

            source = study.get("source_text", "")
            if source and source not in group["source_texts"]:
                group["source_texts"].append(source)

            # Add findings with modality prefix
            for finding in study.get("findings", []):
                finding_with_modality = {
                    "modality": modality,
                    "finding_name": finding.get("finding_name", ""),
                    "finding_value": finding.get("finding_value", "")
                }
                group["findings"].append(finding_with_modality)

        # Convert to list and sort by date
        combined = list(date_groups.values())
        combined.sort(
            key=lambda x: x.get("date", "0000-00-00"),
            reverse=True
        )

        # Format output
        result = []
        for i, group in enumerate(combined):
            result.append({
                "date": group["date"],
                "source_text": ", ".join(group["source_texts"]),
                "modalities": group["modalities"],
                "is_latest": (i == 0),
                "findings": group["findings"]
            })

        return result

    def to_json(self, result: Union[Dict, List, str], indent: int = 2) -> str:
        """
        Convert extraction result to JSON string.

        Args:
            result: Extraction result
            indent: JSON indentation level

        Returns:
            JSON string
        """
        return json.dumps(result, indent=indent)

    def get_available_modalities(self) -> List[str]:
        """Return list of available modality extractors."""
        return list(self.extractors.keys())

    def get_extractor(self, modality: str):
        """
        Get a specific extractor instance.

        Args:
            modality: Modality name

        Returns:
            Extractor instance
        """
        modality = modality.upper()
        if modality not in self.extractors:
            raise ValueError(f"Unknown modality: {modality}")
        return self.extractors[modality]
