"""
BandBloom IELTS SaaS - Unit Test Suite
Tests schema integrity, constraints, entity relationships, seed data,
and official IELTS band rounding logic as defined in BandBloom Plan v2.
"""

import re
import sys
import unittest
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))
sys.path.insert(0, str(PROJECT_ROOT / "apps" / "api"))


def py_ielts_round_band(raw_avg: float | None) -> float | None:
    """Python reference implementation of database function ielts_round_band()."""
    if raw_avg is None:
        return None
    whole_part = int(raw_avg)
    fraction_part = round(raw_avg - whole_part, 4)

    if fraction_part < 0.25:
        return float(whole_part)
    elif fraction_part < 0.75:
        return float(whole_part) + 0.5
    else:
        return float(whole_part) + 1.0


def py_ielts_calculate_overall_band(
    l: float | None, r: float | None, w: float | None, s: float | None
) -> float | None:
    """Python reference implementation of ielts_calculate_overall_band()."""
    if l is None or r is None or w is None or s is None:
        return None
    return py_ielts_round_band((l + r + w + s) / 4.0)


class TestIELTSScoresAndRounding(unittest.TestCase):
    """Verifies that the band rounding rules conform exactly to Section 5.3 & Appendix A #4."""

    def test_official_rounding_table_examples(self):
        self.assertEqual(py_ielts_round_band(6.00), 6.0)
        self.assertEqual(py_ielts_round_band(6.25), 6.5)
        self.assertEqual(py_ielts_round_band(6.50), 6.5)
        self.assertEqual(py_ielts_round_band(6.75), 7.0)

    def test_boundary_fractions(self):
        self.assertEqual(py_ielts_round_band(7.10), 7.0)
        self.assertEqual(py_ielts_round_band(7.20), 7.0)
        self.assertEqual(py_ielts_round_band(7.24), 7.0)

        self.assertEqual(py_ielts_round_band(7.25), 7.5)
        self.assertEqual(py_ielts_round_band(7.40), 7.5)
        self.assertEqual(py_ielts_round_band(7.50), 7.5)
        self.assertEqual(py_ielts_round_band(7.70), 7.5)
        self.assertEqual(py_ielts_round_band(7.74), 7.5)

        self.assertEqual(py_ielts_round_band(7.75), 8.0)
        self.assertEqual(py_ielts_round_band(7.85), 8.0)
        self.assertEqual(py_ielts_round_band(7.90), 8.0)

    def test_overall_band_calculation(self):
        self.assertEqual(py_ielts_calculate_overall_band(6.5, 6.5, 6.0, 6.0), 6.5)
        self.assertEqual(py_ielts_calculate_overall_band(7.0, 6.5, 6.5, 7.0), 7.0)
        self.assertIsNone(py_ielts_calculate_overall_band(6.5, None, 6.0, 6.0))


class TestSchemaSQLIntegrity(unittest.TestCase):
    """Verifies the PostgreSQL DDL script 001_initial_schema.sql for completeness and blueprint rules."""

    @classmethod
    def setUpClass(cls):
        schema_path = PROJECT_ROOT / "infra" / "migrations" / "001_initial_schema.sql"
        cls.assertTrue(cls, schema_path.exists(), f"Schema file not found at {schema_path}")
        cls.schema_sql = schema_path.read_text(encoding="utf-8")

    def test_all_22_tables_present(self):
        expected_tables = [
            "users",
            "profiles",
            "consents",
            "media_assets",
            "recordings",
            "lessons",
            "questions",
            "question_options",
            "exams",
            "exam_sections",
            "exam_section_questions",
            "attempts",
            "responses",
            "scores",
            "feedback",
            "ai_jobs",
            "study_plans",
            "mistake_notes",
            "content_sources",
            "content_chunks",
            "tutor_reports",
            "audit_logs",
        ]
        for table in expected_tables:
            pattern = rf"CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?{table}\s*\("
            match = re.search(pattern, self.schema_sql, re.IGNORECASE)
            self.assertIsNotNone(match, f"Expected table '{table}' not found in 001_initial_schema.sql")

    def test_extensions_and_fallbacks_present(self):
        self.assertIn("uuid-ossp", self.schema_sql)
        self.assertIn("pgcrypto", self.schema_sql)
        self.assertIn("vector", self.schema_sql)

    def test_critical_constraints_present(self):
        self.assertIn("publishable_only", self.schema_sql)
        self.assertIn("idx_attempts_one_active_per_exam", self.schema_sql)
        self.assertIn("WHERE status = 'in_progress'", self.schema_sql)
        self.assertIn("uq_attempt_question", self.schema_sql)
        self.assertIn("uq_attempt_skill_score", self.schema_sql)

    def test_triggers_and_functions_present(self):
        self.assertIn("validate_chunk_source_permission", self.schema_sql)
        self.assertIn("ielts_round_band", self.schema_sql)
        self.assertIn("ielts_calculate_overall_band", self.schema_sql)
        self.assertIn("set_updated_at", self.schema_sql)


class TestSeedDataIntegrity(unittest.TestCase):
    """Verifies that seed data in 002_seed_data.sql conforms to constraints."""

    @classmethod
    def setUpClass(cls):
        seed_path = PROJECT_ROOT / "infra" / "migrations" / "002_seed_data.sql"
        cls.assertTrue(cls, seed_path.exists(), f"Seed data file not found at {seed_path}")
        cls.seed_sql = seed_path.read_text(encoding="utf-8")

    def test_seed_contains_essential_entities(self):
        for table in ["users", "profiles", "consents", "content_sources", "content_chunks", "lessons", "questions", "exams", "exam_section_questions"]:
            self.assertIn(f"INSERT INTO {table}", self.seed_sql, f"Missing seed INSERT for '{table}'")


class TestSQLAlchemyModelIntegrity(unittest.TestCase):
    """Verifies that SQLAlchemy ORM models can be imported and their metadata is registered."""

    def test_import_all_models(self):
        from src.db.base import Base
        from src.db.models import (
            User,
            Profile,
            Consent,
            MediaAsset,
            Recording,
            Lesson,
            Question,
            QuestionOption,
            Exam,
            ExamSection,
            ExamSectionQuestion,
            Attempt,
            Response,
            Score,
            Feedback,
            StudyPlan,
            MistakeNote,
            ContentSource,
            ContentChunk,
            TutorReport,
            AiJob,
            AuditLog,
        )

        registered_tables = set(Base.metadata.tables.keys())
        expected_tables = {
            "users",
            "profiles",
            "consents",
            "media_assets",
            "recordings",
            "lessons",
            "questions",
            "question_options",
            "exams",
            "exam_sections",
            "exam_section_questions",
            "attempts",
            "responses",
            "scores",
            "feedback",
            "study_plans",
            "mistake_notes",
            "content_sources",
            "content_chunks",
            "tutor_reports",
            "ai_jobs",
            "audit_logs",
        }
        for t in expected_tables:
            self.assertIn(t, registered_tables, f"SQLAlchemy Table '{t}' was not registered in Base.metadata")


if __name__ == "__main__":
    unittest.main(verbosity=2)
