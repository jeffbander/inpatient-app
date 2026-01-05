"""Tests for the lab extraction functionality."""

import json
import pytest
import sys
import os

# Add src to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from extractors.lab_extractor import LabExtractor
from models.lab_result import LabResult, LabGroup, LabResultCollection


class TestLabResult:
    """Tests for LabResult model."""

    def test_lab_result_creation(self):
        """Test creating a lab result."""
        result = LabResult(lab_name="Creatinine", lab_value="1.2 mg/dL")
        assert result.lab_name == "Creatinine"
        assert result.lab_value == "1.2 mg/dL"

    def test_lab_result_to_dict(self):
        """Test converting lab result to dictionary."""
        result = LabResult(lab_name="eGFR", lab_value="62")
        d = result.to_dict()
        assert d == {"lab_name": "eGFR", "lab_value": "62"}


class TestLabGroup:
    """Tests for LabGroup model."""

    def test_lab_group_creation(self):
        """Test creating a lab group."""
        group = LabGroup(date="2024-10-05")
        assert group.date == "2024-10-05"
        assert group.labs == []

    def test_add_lab(self):
        """Test adding a lab to a group."""
        group = LabGroup(date="2024-10-05")
        group.add_lab("Creatinine", "1.3 mg/dL")
        assert len(group.labs) == 1
        assert group.labs[0].lab_name == "Creatinine"

    def test_to_dict(self):
        """Test converting lab group to dictionary."""
        group = LabGroup(date="2024-10-05")
        group.add_lab("Creatinine", "1.3 mg/dL")
        group.add_lab("eGFR", "62")

        d = group.to_dict()
        assert d["date"] == "2024-10-05"
        assert len(d["labs"]) == 2


class TestLabResultCollection:
    """Tests for LabResultCollection."""

    def test_empty_collection(self):
        """Test empty collection returns No Data."""
        collection = LabResultCollection()
        assert collection.is_empty()
        result = collection.to_list()
        assert result == "No Data"

    def test_add_results(self):
        """Test adding results to collection."""
        collection = LabResultCollection()
        collection.add_result("2024-10-05", "Creatinine", "1.3 mg/dL")
        collection.add_result("2024-10-05", "eGFR", "62")
        collection.add_result("2024-09-30", "LDL", "110 mg/dL")

        result = collection.to_list()
        assert len(result) == 2
        # Should be sorted newest first
        assert result[0]["date"] == "2024-10-05"
        assert result[1]["date"] == "2024-09-30"


class TestLabExtractor:
    """Tests for LabExtractor."""

    @pytest.fixture
    def extractor(self):
        """Create extractor instance."""
        return LabExtractor()

    def test_normalize_lab_name(self, extractor):
        """Test lab name normalization."""
        assert extractor.normalize_lab_name("Cr") == "Creatinine"
        assert extractor.normalize_lab_name("cr") == "Creatinine"
        assert extractor.normalize_lab_name("SGPT") == "ALT"
        assert extractor.normalize_lab_name("Na") == "Sodium"
        assert extractor.normalize_lab_name("K") == "Potassium"
        assert extractor.normalize_lab_name("NT-proBNP") == "NT-proBNP"

    def test_parse_date_iso(self, extractor):
        """Test ISO date parsing."""
        assert extractor.parse_date("2024-10-05") == "2024-10-05"
        assert extractor.parse_date("2024-1-5") == "2024-01-05"

    def test_parse_date_us_format(self, extractor):
        """Test US date format parsing."""
        assert extractor.parse_date("10/05/2024") == "2024-10-05"
        assert extractor.parse_date("10-05-2024") == "2024-10-05"
        assert extractor.parse_date("9/30/24") == "2024-09-30"

    def test_parse_date_written(self, extractor):
        """Test written date format parsing."""
        assert extractor.parse_date("Oct 5 2024") == "2024-10-05"
        assert extractor.parse_date("October 5, 2024") == "2024-10-05"

    def test_extract_narrative_example1(self, extractor):
        """Test extraction from narrative text (Example 1 from spec)."""
        text = """Labs from Oct 5 2024: Cr 1.3 mg/dL, eGFR 62, ALT 24 U/L.
On 9/30/24: hsCRP 5.6 mg/L, LDL 110 mg/dL."""

        result = extractor.extract_structured(text)

        assert isinstance(result, list)
        assert len(result) == 2

        # Check first date group (newest first)
        assert result[0]["date"] == "2024-10-05"
        labs_oct5 = {lab["lab_name"]: lab["lab_value"] for lab in result[0]["labs"]}
        assert "Creatinine" in labs_oct5
        assert labs_oct5["Creatinine"] == "1.3 mg/dL"
        assert "eGFR" in labs_oct5
        assert "ALT" in labs_oct5

        # Check second date group
        assert result[1]["date"] == "2024-09-30"
        labs_sep30 = {lab["lab_name"]: lab["lab_value"] for lab in result[1]["labs"]}
        assert "hsCRP" in labs_sep30
        assert "LDL" in labs_sep30

    def test_extract_columnar_example2(self, extractor):
        """Test extraction from columnar format (Example 2 from spec)."""
        text = """10/05/2024
Creatinine 1.3 mg/dL
GFR 62
ALT 24 U/L
Hemoglobin 12.8 g/dL

09/30/2024
hsCRP 5.6 mg/L
LDL 110 mg/dL"""

        result = extractor.extract_structured(text)

        assert isinstance(result, list)
        assert len(result) == 2

        # Check first date group
        assert result[0]["date"] == "2024-10-05"
        labs_oct5 = {lab["lab_name"]: lab["lab_value"] for lab in result[0]["labs"]}
        assert "Creatinine" in labs_oct5
        assert "GFR" in labs_oct5
        assert "ALT" in labs_oct5
        assert "Hemoglobin" in labs_oct5

        # Check second date group
        assert result[1]["date"] == "2024-09-30"
        labs_sep30 = {lab["lab_name"]: lab["lab_value"] for lab in result[1]["labs"]}
        assert "hsCRP" in labs_sep30
        assert "LDL" in labs_sep30

    def test_extract_no_data(self, extractor):
        """Test extraction with no labs found."""
        text = "Patient feels well. No complaints."
        result = extractor.extract_structured(text)
        assert result == "No Data"

    def test_extract_empty_text(self, extractor):
        """Test extraction with empty text."""
        result = extractor.extract_structured("")
        assert result == "No Data"

        result = extractor.extract_structured("   ")
        assert result == "No Data"

    def test_extract_no_date(self, extractor):
        """Test extraction when no date is present."""
        text = "Cr 1.2 mg/dL, BUN 18 mg/dL"
        result = extractor.extract_structured(text)

        assert isinstance(result, list)
        assert len(result) == 1
        assert result[0]["date"] == "No Data"

    def test_extract_json_output(self, extractor):
        """Test JSON output format."""
        text = "Labs from 2024-10-05: Creatinine 1.3 mg/dL"
        result = extractor.extract(text)

        # Should be valid JSON
        parsed = json.loads(result)
        assert isinstance(parsed, list)

    def test_extract_pretty_output(self, extractor):
        """Test pretty-printed JSON output."""
        text = "Labs from 2024-10-05: Creatinine 1.3 mg/dL"
        result = extractor.extract_pretty(text, indent=2)

        # Should be valid JSON with indentation
        parsed = json.loads(result)
        assert isinstance(parsed, list)
        assert "\n" in result  # Should have newlines from indentation

    def test_cardiac_labs(self, extractor):
        """Test extraction of cardiac labs."""
        text = "BNP 450 pg/mL, Troponin 0.02 ng/mL, CK-MB 3.2 ng/mL"
        result = extractor.extract_structured(text)

        labs = {lab["lab_name"]: lab["lab_value"] for lab in result[0]["labs"]}
        assert "BNP" in labs
        assert "Troponin" in labs
        assert "CK-MB" in labs

    def test_metabolic_panel(self, extractor):
        """Test extraction of metabolic panel labs."""
        text = "Na 140 mEq/L, K 4.2 mEq/L, Glucose 95 mg/dL, HbA1c 6.5%"
        result = extractor.extract_structured(text)

        labs = {lab["lab_name"]: lab["lab_value"] for lab in result[0]["labs"]}
        assert "Sodium" in labs
        assert "Potassium" in labs
        assert "Glucose" in labs
        assert "HbA1c" in labs

    def test_hepatic_labs(self, extractor):
        """Test extraction of hepatic labs."""
        text = "ALT 32 U/L, AST 28 U/L, Total Bilirubin 0.8 mg/dL"
        result = extractor.extract_structured(text)

        labs = {lab["lab_name"]: lab["lab_value"] for lab in result[0]["labs"]}
        assert "ALT" in labs
        assert "AST" in labs
        assert "Total Bilirubin" in labs

    def test_lipid_panel(self, extractor):
        """Test extraction of lipid panel."""
        text = "LDL 120 mg/dL, HDL 55 mg/dL, Triglycerides 150 mg/dL, Total Cholesterol 200 mg/dL"
        result = extractor.extract_structured(text)

        labs = {lab["lab_name"]: lab["lab_value"] for lab in result[0]["labs"]}
        assert "LDL" in labs
        assert "HDL" in labs
        assert "Triglycerides" in labs
        assert "Total Cholesterol" in labs

    def test_case_insensitivity(self, extractor):
        """Test case insensitive lab name matching."""
        text = "CREATININE 1.2 mg/dL, egfr 65, alt 30 U/L"
        result = extractor.extract_structured(text)

        labs = {lab["lab_name"] for lab in result[0]["labs"]}
        assert "Creatinine" in labs
        assert "eGFR" in labs
        assert "ALT" in labs

    def test_colon_separated_values(self, extractor):
        """Test extraction with colon-separated values."""
        text = "Creatinine: 1.2 mg/dL, BUN: 18 mg/dL"
        result = extractor.extract_structured(text)

        labs = {lab["lab_name"]: lab["lab_value"] for lab in result[0]["labs"]}
        assert labs["Creatinine"] == "1.2 mg/dL"
        assert labs["BUN"] == "18 mg/dL"

    def test_equals_separated_values(self, extractor):
        """Test extraction with equals-separated values."""
        text = "Creatinine = 1.2 mg/dL, BUN = 18 mg/dL"
        result = extractor.extract_structured(text)

        labs = {lab["lab_name"]: lab["lab_value"] for lab in result[0]["labs"]}
        assert labs["Creatinine"] == "1.2 mg/dL"
        assert labs["BUN"] == "18 mg/dL"

    def test_value_without_unit(self, extractor):
        """Test extraction of values without units."""
        text = "eGFR 62, INR 1.1"
        result = extractor.extract_structured(text)

        labs = {lab["lab_name"]: lab["lab_value"] for lab in result[0]["labs"]}
        assert labs["eGFR"] == "62"
        assert labs["INR"] == "1.1"


class TestEdgeCases:
    """Test edge cases and complex scenarios."""

    @pytest.fixture
    def extractor(self):
        """Create extractor instance."""
        return LabExtractor()

    def test_mixed_format_text(self, extractor):
        """Test extraction from text with mixed formats."""
        text = """Patient seen on 2024-10-01.
Labs:
- Creatinine: 1.1 mg/dL
- eGFR: 72

Follow-up labs from 10/15/2024 showed improvement: Cr 0.9 mg/dL, GFR 85."""

        result = extractor.extract_structured(text)
        assert len(result) >= 2

    def test_reference_ranges_ignored(self, extractor):
        """Test that reference ranges are ignored."""
        text = "Creatinine 1.2 mg/dL (ref: 0.6-1.2), eGFR 65 (>60 normal)"
        result = extractor.extract_structured(text)

        labs = {lab["lab_name"]: lab["lab_value"] for lab in result[0]["labs"]}
        # Should only capture the value, not the reference range
        assert "1.2 mg/dL" in labs["Creatinine"]

    def test_multiple_values_same_lab(self, extractor):
        """Test handling of multiple values for same lab name."""
        text = """10/01/2024: Creatinine 1.2 mg/dL
10/05/2024: Creatinine 1.0 mg/dL"""

        result = extractor.extract_structured(text)
        # Should have two date groups
        assert len(result) == 2

    def test_abbreviation_variations(self, extractor):
        """Test various abbreviation forms."""
        text = "NT-proBNP 250 pg/mL, hs-CRP 2.1 mg/L, HbA1c 7.2%"
        result = extractor.extract_structured(text)

        labs = {lab["lab_name"] for lab in result[0]["labs"]}
        assert "NT-proBNP" in labs
        assert "hsCRP" in labs
        assert "HbA1c" in labs
