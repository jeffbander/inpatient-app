"""Tests for imaging extraction modules."""

import json
import unittest
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.extractors import (
    EchoExtractor,
    CTExtractor,
    MRIExtractor,
    XRayExtractor,
    UltrasoundExtractor,
    ImagingExtractionOrchestrator,
)
from src.utils.date_parser import normalize_date, extract_dates_from_text


class TestDateParser(unittest.TestCase):
    """Test date parsing utilities."""

    def test_normalize_date_us_format(self):
        """Test US date format MM/DD/YYYY."""
        self.assertEqual(normalize_date("09/15/2024"), "2024-09-15")
        self.assertEqual(normalize_date("9/5/2024"), "2024-09-05")

    def test_normalize_date_iso_format(self):
        """Test ISO date format YYYY-MM-DD."""
        self.assertEqual(normalize_date("2024-09-15"), "2024-09-15")

    def test_normalize_date_text_format(self):
        """Test text date format."""
        self.assertEqual(normalize_date("September 15, 2024"), "2024-09-15")
        self.assertEqual(normalize_date("Sep 15, 2024"), "2024-09-15")

    def test_normalize_date_empty(self):
        """Test empty/invalid dates."""
        self.assertEqual(normalize_date(""), "No Data")
        self.assertEqual(normalize_date(None), "No Data")

    def test_extract_dates_from_text(self):
        """Test extracting dates from clinical text."""
        text = "Echocardiogram on 09/15/2024 showed EF 35%. Prior echo on 06/01/2024."
        dates = extract_dates_from_text(text)
        self.assertEqual(len(dates), 2)
        self.assertIn("2024-09-15", [d[0] for d in dates])
        self.assertIn("2024-06-01", [d[0] for d in dates])


class TestEchoExtractor(unittest.TestCase):
    """Test ECHO extractor."""

    def setUp(self):
        self.extractor = EchoExtractor()

    def test_detect_modality(self):
        """Test modality detection."""
        text = "Echocardiogram showed EF 45%"
        self.assertTrue(self.extractor.detect_modality_in_text(text))

        text = "CT chest showed no abnormality"
        self.assertFalse(self.extractor.detect_modality_in_text(text))

    def test_extract_ef(self):
        """Test ejection fraction extraction."""
        text = "ECHO 09/15/2024: LVEF 35%, mild MR"
        result = self.extractor.extract(text)

        self.assertIsInstance(result, list)
        self.assertEqual(len(result), 1)

        findings = result[0]["findings"]
        ef_finding = next((f for f in findings if "Ejection" in f["finding_name"]), None)
        self.assertIsNotNone(ef_finding)
        self.assertEqual(ef_finding["finding_value"], "35%")

    def test_extract_lvh(self):
        """Test LVH extraction."""
        text = "Echo shows moderate concentric LVH"
        result = self.extractor.extract(text)

        self.assertIsInstance(result, list)
        findings = result[0]["findings"]
        lvh = next((f for f in findings if "LVH" in f["finding_name"]), None)
        self.assertIsNotNone(lvh)

    def test_no_echo_data(self):
        """Test when no ECHO data is present."""
        text = "CT scan of the chest was unremarkable"
        result = self.extractor.extract(text)
        self.assertEqual(result, "No Data")


class TestCTExtractor(unittest.TestCase):
    """Test CT extractor."""

    def setUp(self):
        self.extractor = CTExtractor()

    def test_detect_modality(self):
        """Test CT modality detection."""
        text = "CT chest with contrast showed 8mm nodule"
        self.assertTrue(self.extractor.detect_modality_in_text(text))

    def test_extract_pulmonary_nodule(self):
        """Test pulmonary nodule extraction."""
        text = "CT chest: pulmonary nodule 8 mm in right upper lobe"
        result = self.extractor.extract(text)

        self.assertIsInstance(result, list)
        findings = result[0]["findings"]
        nodule = next((f for f in findings if "Nodule" in f["finding_name"]), None)
        self.assertIsNotNone(nodule)

    def test_extract_pe(self):
        """Test pulmonary embolism extraction."""
        text = "CT chest CTPA: no evidence of pulmonary embolism"
        result = self.extractor.extract(text)

        self.assertIsInstance(result, list)
        findings = result[0]["findings"]
        pe = next((f for f in findings if "Embolism" in f["finding_name"]), None)
        self.assertIsNotNone(pe)
        self.assertEqual(pe["finding_value"], "negative")


class TestMRIExtractor(unittest.TestCase):
    """Test MRI extractor."""

    def setUp(self):
        self.extractor = MRIExtractor()

    def test_detect_modality(self):
        """Test MRI modality detection."""
        text = "MRI brain showed T2 hyperintensities"
        self.assertTrue(self.extractor.detect_modality_in_text(text))

    def test_extract_disc_herniation(self):
        """Test disc herniation extraction."""
        text = "MRI lumbar spine: disc herniation at L4-L5"
        result = self.extractor.extract(text)

        self.assertIsInstance(result, list)
        findings = result[0]["findings"]
        disc = next((f for f in findings if "Disc" in f["finding_name"]), None)
        self.assertIsNotNone(disc)


class TestXRayExtractor(unittest.TestCase):
    """Test X-ray extractor."""

    def setUp(self):
        self.extractor = XRayExtractor()

    def test_detect_modality(self):
        """Test X-ray modality detection."""
        text = "Chest x-ray shows cardiomegaly"
        self.assertTrue(self.extractor.detect_modality_in_text(text))

    def test_extract_cardiomegaly(self):
        """Test cardiomegaly extraction."""
        text = "CXR: Cardiomegaly present, stable"
        result = self.extractor.extract(text)

        self.assertIsInstance(result, list)
        findings = result[0]["findings"]
        cardio = next((f for f in findings if "Cardiomegaly" in f["finding_name"]), None)
        self.assertIsNotNone(cardio)

    def test_extract_effusion(self):
        """Test pleural effusion extraction."""
        text = "Chest x-ray: pleural effusion small bilateral"
        result = self.extractor.extract(text)

        self.assertIsInstance(result, list)
        findings = result[0]["findings"]
        effusion = next((f for f in findings if "Effusion" in f["finding_name"]), None)
        self.assertIsNotNone(effusion)


class TestUltrasoundExtractor(unittest.TestCase):
    """Test Ultrasound extractor."""

    def setUp(self):
        self.extractor = UltrasoundExtractor()

    def test_detect_modality(self):
        """Test ultrasound modality detection."""
        text = "RUQ ultrasound showed gallstones"
        self.assertTrue(self.extractor.detect_modality_in_text(text))

    def test_exclude_echo(self):
        """Test that echocardiograms are excluded."""
        text = "Echocardiogram showed EF 45%, no other ultrasound done"
        self.assertFalse(self.extractor.detect_modality_in_text(text))

    def test_extract_gallstones(self):
        """Test gallstone extraction."""
        text = "Abdominal ultrasound: gallstones present, CBD 4mm"
        result = self.extractor.extract(text)

        self.assertIsInstance(result, list)
        findings = result[0]["findings"]
        stones = next((f for f in findings if "Gallstone" in f["finding_name"]), None)
        self.assertIsNotNone(stones)

    def test_extract_dvt(self):
        """Test DVT extraction."""
        text = "Lower extremity venous Doppler: no DVT"
        result = self.extractor.extract(text)

        self.assertIsInstance(result, list)
        findings = result[0]["findings"]
        dvt = next((f for f in findings if "DVT" in f["finding_name"]), None)
        self.assertIsNotNone(dvt)
        self.assertEqual(dvt["finding_value"], "negative")


class TestOrchestrator(unittest.TestCase):
    """Test the imaging extraction orchestrator."""

    def setUp(self):
        self.orchestrator = ImagingExtractionOrchestrator()
        self.sample_note = """
        ECHO 09/15/2024: EF 35%, mild MR
        CXR 09/15/2024: Cardiomegaly, mild pulmonary edema
        CT chest 09/14/2024: No PE, 8mm RUL nodule
        """

    def test_detect_modalities(self):
        """Test modality detection."""
        detected = self.orchestrator.detect_modalities(self.sample_note)
        self.assertIn("ECHO", detected)
        self.assertIn("XRAY", detected)
        self.assertIn("CT", detected)

    def test_extract_all(self):
        """Test extracting all modalities."""
        results = self.orchestrator.extract_all(self.sample_note)

        self.assertIn("ECHO", results)
        # CT should be found
        self.assertIn("CT", results)

    def test_extract_specific_modality(self):
        """Test extracting a specific modality."""
        result = self.orchestrator.extract_modality(self.sample_note, "ECHO")
        self.assertIsInstance(result, list)

    def test_enabled_modalities(self):
        """Test enabling only specific modalities."""
        orch = ImagingExtractionOrchestrator(enabled_modalities=["ECHO", "CT"])
        available = orch.get_available_modalities()

        self.assertIn("ECHO", available)
        self.assertIn("CT", available)
        self.assertNotIn("MRI", available)
        self.assertNotIn("XRAY", available)

    def test_extract_combined(self):
        """Test combined extraction by date."""
        result = self.orchestrator.extract_combined(self.sample_note, combine_by_date=True)

        self.assertIsInstance(result, list)
        # Should have findings grouped by date
        for study in result:
            self.assertIn("date", study)
            self.assertIn("findings", study)
            self.assertIn("modalities", study)

    def test_no_data(self):
        """Test when no imaging data present."""
        result = self.orchestrator.extract_all("Patient was seen in clinic for routine visit.")
        self.assertIn("status", result)

    def test_to_json(self):
        """Test JSON serialization."""
        results = self.orchestrator.extract_all(self.sample_note)
        json_str = self.orchestrator.to_json(results)

        # Should be valid JSON
        parsed = json.loads(json_str)
        self.assertIsInstance(parsed, dict)


if __name__ == "__main__":
    unittest.main()
