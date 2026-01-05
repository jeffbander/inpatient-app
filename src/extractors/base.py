"""Base class for medical imaging extractors."""

import json
import os
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional, Union
from pathlib import Path


class BaseImagingExtractor(ABC):
    """
    Abstract base class for medical imaging data extraction.

    Subclasses implement specific extraction logic for different
    imaging modalities (ECHO, CT, MRI, X-ray, Ultrasound).
    """

    # Modality identifier (override in subclasses)
    MODALITY: str = "GENERIC"

    # Default output structure
    NO_DATA_RESPONSE = "No Data"

    def __init__(
        self,
        llm_client: Optional[Any] = None,
        model: str = "gpt-4o-mini",
        provider: str = "openai"
    ):
        """
        Initialize the extractor.

        Args:
            llm_client: Pre-configured LLM client (OpenAI or Anthropic)
            model: Model identifier to use
            provider: LLM provider ("openai" or "anthropic")
        """
        self.llm_client = llm_client
        self.model = model
        self.provider = provider
        self._system_prompt = self._load_system_prompt()

    def _load_system_prompt(self) -> str:
        """Load the system prompt for this extractor."""
        prompt_path = Path(__file__).parent.parent.parent / "prompts" / f"{self.MODALITY.lower()}_extraction.txt"
        if prompt_path.exists():
            return prompt_path.read_text()
        return self._get_default_prompt()

    @abstractmethod
    def _get_default_prompt(self) -> str:
        """Return the default system prompt for this modality."""
        pass

    @abstractmethod
    def get_modality_keywords(self) -> List[str]:
        """Return keywords that identify this imaging modality in text."""
        pass

    @abstractmethod
    def get_extraction_parameters(self) -> Dict[str, List[str]]:
        """
        Return parameters to extract for this modality.

        Returns:
            Dict mapping category names to lists of parameter names/synonyms
        """
        pass

    def detect_modality_in_text(self, text: str) -> bool:
        """
        Check if this imaging modality is mentioned in the text.

        Args:
            text: Clinical text to search

        Returns:
            True if modality appears present in text
        """
        text_lower = text.lower()
        return any(kw.lower() in text_lower for kw in self.get_modality_keywords())

    def extract(self, clinical_text: str) -> Union[List[Dict], str]:
        """
        Extract imaging findings from clinical text.

        Args:
            clinical_text: Raw clinical text (notes, reports, etc.)

        Returns:
            List of study objects with findings, or "No Data"
        """
        if not clinical_text or not clinical_text.strip():
            return self.NO_DATA_RESPONSE

        # Check if this modality is present
        if not self.detect_modality_in_text(clinical_text):
            return self.NO_DATA_RESPONSE

        # Use LLM for extraction
        if self.llm_client:
            return self._llm_extract(clinical_text)

        # Fallback to rule-based extraction
        return self._rule_based_extract(clinical_text)

    def _llm_extract(self, text: str) -> Union[List[Dict], str]:
        """
        Use LLM to extract imaging findings.

        Args:
            text: Clinical text

        Returns:
            Extracted findings or "No Data"
        """
        try:
            if self.provider == "openai":
                return self._openai_extract(text)
            elif self.provider == "anthropic":
                return self._anthropic_extract(text)
            else:
                raise ValueError(f"Unsupported provider: {self.provider}")
        except Exception as e:
            print(f"LLM extraction failed: {e}")
            return self._rule_based_extract(text)

    def _openai_extract(self, text: str) -> Union[List[Dict], str]:
        """Extract using OpenAI API."""
        response = self.llm_client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": self._system_prompt},
                {"role": "user", "content": text}
            ],
            temperature=0,
            response_format={"type": "json_object"}
        )

        result = response.choices[0].message.content
        return self._parse_llm_response(result)

    def _anthropic_extract(self, text: str) -> Union[List[Dict], str]:
        """Extract using Anthropic API."""
        response = self.llm_client.messages.create(
            model=self.model,
            max_tokens=4096,
            system=self._system_prompt,
            messages=[
                {"role": "user", "content": text}
            ]
        )

        result = response.content[0].text
        return self._parse_llm_response(result)

    def _parse_llm_response(self, response: str) -> Union[List[Dict], str]:
        """
        Parse LLM response into structured data.

        Args:
            response: Raw LLM response string

        Returns:
            Parsed findings or "No Data"
        """
        try:
            # Handle "No Data" response
            if "no data" in response.lower().strip():
                return self.NO_DATA_RESPONSE

            # Try to parse JSON
            data = json.loads(response)

            # Handle wrapped response
            if isinstance(data, dict):
                if "studies" in data:
                    data = data["studies"]
                elif "findings" in data and isinstance(data.get("date"), str):
                    data = [data]

            if isinstance(data, list) and len(data) > 0:
                return self._validate_and_clean(data)

            return self.NO_DATA_RESPONSE
        except json.JSONDecodeError:
            return self.NO_DATA_RESPONSE

    def _validate_and_clean(self, studies: List[Dict]) -> List[Dict]:
        """
        Validate and clean extracted study data.

        Args:
            studies: List of extracted study dictionaries

        Returns:
            Cleaned and validated studies
        """
        cleaned = []

        for study in studies:
            if not isinstance(study, dict):
                continue

            cleaned_study = {
                "date": study.get("date", "No Data"),
                "source_text": study.get("source_text", f"{self.MODALITY} report"),
                "is_latest": study.get("is_latest", False),
                "modality": self.MODALITY,
                "findings": []
            }

            findings = study.get("findings", [])
            seen_findings = set()

            for finding in findings:
                if not isinstance(finding, dict):
                    continue

                # Get name and value
                name = finding.get(f"{self.MODALITY.lower()}_name") or finding.get("finding_name") or finding.get("name", "")
                value = finding.get(f"{self.MODALITY.lower()}_value") or finding.get("finding_value") or finding.get("value", "")

                if name and value:
                    key = (name.lower(), str(value).lower())
                    if key not in seen_findings:
                        seen_findings.add(key)
                        cleaned_study["findings"].append({
                            "finding_name": name,
                            "finding_value": str(value)
                        })

            if cleaned_study["findings"]:
                cleaned.append(cleaned_study)

        # Sort by date (newest first) and mark latest
        cleaned = self._sort_and_mark_latest(cleaned)

        return cleaned if cleaned else self.NO_DATA_RESPONSE

    def _sort_and_mark_latest(self, studies: List[Dict]) -> List[Dict]:
        """Sort studies by date and mark the latest one."""
        if not studies:
            return studies

        # Sort by date descending (No Data at end)
        def date_key(s):
            d = s.get("date", "No Data")
            if d == "No Data":
                return "0000-00-00"
            return d

        studies.sort(key=date_key, reverse=True)

        # Mark latest
        for i, study in enumerate(studies):
            study["is_latest"] = (i == 0)

        return studies

    def _rule_based_extract(self, text: str) -> Union[List[Dict], str]:
        """
        Fallback rule-based extraction.

        Override in subclasses for modality-specific rules.

        Args:
            text: Clinical text

        Returns:
            Extracted findings or "No Data"
        """
        return self.NO_DATA_RESPONSE

    def to_json(self, result: Union[List[Dict], str]) -> str:
        """
        Convert extraction result to JSON string.

        Args:
            result: Extraction result

        Returns:
            JSON string
        """
        if result == self.NO_DATA_RESPONSE:
            return json.dumps(result)
        return json.dumps(result, indent=2)
