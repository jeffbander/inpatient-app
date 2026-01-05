"""Data models for laboratory test results."""

from dataclasses import dataclass, field
from typing import List, Optional
import json


@dataclass
class LabResult:
    """Represents a single laboratory test result."""

    lab_name: str
    lab_value: str

    def to_dict(self) -> dict:
        """Convert to dictionary format for JSON output."""
        return {
            "lab_name": self.lab_name,
            "lab_value": self.lab_value
        }


@dataclass
class LabGroup:
    """Represents a group of lab results associated with a date."""

    date: str  # ISO format YYYY-MM-DD or "No Data"
    labs: List[LabResult] = field(default_factory=list)

    def add_lab(self, lab_name: str, lab_value: str) -> None:
        """Add a lab result to this group."""
        self.labs.append(LabResult(lab_name=lab_name, lab_value=lab_value))

    def to_dict(self) -> dict:
        """Convert to dictionary format for JSON output."""
        return {
            "date": self.date,
            "labs": [lab.to_dict() for lab in self.labs]
        }


class LabResultCollection:
    """Collection of lab results grouped by date."""

    def __init__(self):
        self._groups: dict[str, LabGroup] = {}

    def add_result(self, date: str, lab_name: str, lab_value: str) -> None:
        """Add a lab result to the appropriate date group."""
        if date not in self._groups:
            self._groups[date] = LabGroup(date=date)
        self._groups[date].add_lab(lab_name, lab_value)

    def get_groups(self) -> List[LabGroup]:
        """Get all lab groups sorted by date (newest first)."""
        def sort_key(group: LabGroup) -> str:
            # "No Data" should come last
            if group.date == "No Data":
                return "0000-00-00"
            return group.date

        return sorted(self._groups.values(), key=sort_key, reverse=True)

    def to_list(self) -> List[dict]:
        """Convert to list format for JSON output."""
        groups = self.get_groups()
        if not groups:
            return "No Data"
        return [group.to_dict() for group in groups]

    def to_json(self, indent: Optional[int] = None) -> str:
        """Convert to JSON string."""
        result = self.to_list()
        return json.dumps(result, indent=indent)

    def is_empty(self) -> bool:
        """Check if collection has any results."""
        return len(self._groups) == 0
