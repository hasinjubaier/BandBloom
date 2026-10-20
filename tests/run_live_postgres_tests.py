"""
BandBloom IELTS SaaS - Full Combinations Test Runner on PostgreSQL
Tests all possible constraint combinations, triggers, business rules,
and functions against live PostgreSQL.
"""

import subprocess
import time
import sys
from pathlib import Path
import psycopg2
from psycopg2 import errors

PROJECT_ROOT = Path(__file__).resolve().parent.parent
PG_DIR = "C:/Users/Hasin/AppData/Local/Temp/test_pg_bandbloom"
PG_BIN = "C:/Program Files/PostgreSQL/18/bin/postgres.exe"
PG_PORT = 54331


def main():
    print("=" * 70)
    print("STARTING LIVE POSTGRESQL COMBINATIONS TEST SUITE")
    print("=" * 70)

    # 1. Start isolated PostgreSQL instance
    proc = subprocess.Popen(
        [PG_BIN, "-D", PG_DIR, "-p", str(PG_PORT)],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    time.sleep(2)

    passed = 0
    failed = 0

    def assert_test(name, condition, error_msg=""):
        nonlocal passed, failed
        if condition:
            passed += 1
            print(f" [PASS] {name}")
        else:
            failed += 1
            print(f" [FAIL] {name}: {error_msg}")

    try:
        conn = psycopg2.connect(
            host="127.0.0.1", port=PG_PORT, user="postgres", dbname="postgres"
        )
        conn.autocommit = True
        cur = conn.cursor()

        # Clean public schema
        cur.execute("DROP SCHEMA public CASCADE; CREATE SCHEMA public;")

        # Test 1: Schema creation
        schema_file = PROJECT_ROOT / "infra" / "migrations" / "001_initial_schema.sql"
        cur.execute(schema_file.read_text(encoding="utf-8"))
        assert_test("001_initial_schema.sql executed without errors", True)

        # Test 2: Seed data creation
        seed_file = PROJECT_ROOT / "infra" / "migrations" / "002_seed_data.sql"
        cur.execute(seed_file.read_text(encoding="utf-8"))
        assert_test("002_seed_data.sql executed without errors", True)

        # Test 3: Official IELTS Rounding Function
        cur.execute("SELECT ielts_round_band(6.00);")
        assert_test("ielts_round_band(6.00) == 6.0", cur.fetchone()[0] == 6.0)

        cur.execute("SELECT ielts_round_band(6.25);")
        assert_test("ielts_round_band(6.25) == 6.5", cur.fetchone()[0] == 6.5)

        cur.execute("SELECT ielts_round_band(6.50);")
        assert_test("ielts_round_band(6.50) == 6.5", cur.fetchone()[0] == 6.5)

        cur.execute("SELECT ielts_round_band(6.75);")
        assert_test("ielts_round_band(6.75) == 7.0", cur.fetchone()[0] == 7.0)

        cur.execute("SELECT ielts_round_band(7.10);")
        assert_test("ielts_round_band(7.10) == 7.0 (fraction < 0.25 rounds down)", cur.fetchone()[0] == 7.0)

        cur.execute("SELECT ielts_round_band(7.40);")
        assert_test("ielts_round_band(7.40) == 7.5 (fraction 0.25..0.75 rounds to half band)", cur.fetchone()[0] == 7.5)

        cur.execute("SELECT ielts_round_band(7.85);")
        assert_test("ielts_round_band(7.85) == 8.0 (fraction >= 0.75 rounds up)", cur.fetchone()[0] == 8.0)

        # Test 4: Overall Band calculation
        cur.execute("SELECT ielts_calculate_overall_band(6.5, 6.5, 6.0, 6.0);")
        assert_test("ielts_calculate_overall_band(6.5, 6.5, 6.0, 6.0) == 6.5", cur.fetchone()[0] == 6.5)

        cur.execute("SELECT ielts_calculate_overall_band(7.0, 6.5, 6.5, 7.0);")
        assert_test("ielts_calculate_overall_band(7.0, 6.5, 6.5, 7.0) == 7.0", cur.fetchone()[0] == 7.0)

        cur.execute("SELECT ielts_calculate_overall_band(6.5, NULL, 6.0, 6.0);")
        assert_test("ielts_calculate_overall_band with missing component returns NULL", cur.fetchone()[0] is None)

        # Test 5: Combinations for publishable_only constraint on content_sources
        # 5a: published + owned -> ALLOWED
        try:
            cur.execute("""
                INSERT INTO content_sources (title, owner, permission_status, source_type, version, status)
                VALUES ('Test Owned', 'Admin', 'owned', 'official_guidance', '1.0', 'published');
            """)
            assert_test("Constraint publishable_only allows published + owned", True)
        except Exception as e:
            assert_test("Constraint publishable_only allows published + owned", False, str(e))

        # 5b: published + licensed -> ALLOWED
        try:
            cur.execute("""
                INSERT INTO content_sources (title, owner, permission_status, source_type, version, status)
                VALUES ('Test Licensed', 'Admin', 'licensed', 'official_guidance', '1.0', 'published');
            """)
            assert_test("Constraint publishable_only allows published + licensed", True)
        except Exception as e:
            assert_test("Constraint publishable_only allows published + licensed", False, str(e))

        # 5c: published + link_only -> ALLOWED
        try:
            cur.execute("""
                INSERT INTO content_sources (title, owner, permission_status, source_type, version, status)
                VALUES ('Test Link Only', 'Admin', 'link_only', 'official_guidance', '1.0', 'published');
            """)
            assert_test("Constraint publishable_only allows published + link_only", True)
        except Exception as e:
            assert_test("Constraint publishable_only allows published + link_only", False, str(e))

        # 5d: published + pending -> MUST BE BLOCKED
        try:
            cur.execute("""
                INSERT INTO content_sources (title, owner, permission_status, source_type, version, status)
                VALUES ('Test Pending Published', 'Admin', 'pending', 'official_guidance', '1.0', 'published');
            """)
            assert_test("Constraint publishable_only BLOCKS published + pending", False, "Should have failed constraint!")
        except errors.CheckViolation:
            assert_test("Constraint publishable_only BLOCKS published + pending", True)
        except Exception as e:
            assert_test("Constraint publishable_only BLOCKS published + pending", False, f"Unexpected error: {e}")

        # 5e: published + prohibited -> MUST BE BLOCKED
        try:
            cur.execute("""
                INSERT INTO content_sources (title, owner, permission_status, source_type, version, status)
                VALUES ('Test Prohibited Published', 'Admin', 'prohibited', 'official_guidance', '1.0', 'published');
            """)
            assert_test("Constraint publishable_only BLOCKS published + prohibited", False, "Should have failed constraint!")
        except errors.CheckViolation:
            assert_test("Constraint publishable_only BLOCKS published + prohibited", True)
        except Exception as e:
            assert_test("Constraint publishable_only BLOCKS published + prohibited", False, f"Unexpected error: {e}")

        # 5f: draft + pending -> ALLOWED (in drafting phase)
        try:
            cur.execute("""
                INSERT INTO content_sources (title, owner, permission_status, source_type, version, status)
                VALUES ('Test Draft Pending', 'Admin', 'pending', 'official_guidance', '1.0', 'draft');
            """)
            assert_test("Constraint publishable_only allows draft + pending", True)
        except Exception as e:
            assert_test("Constraint publishable_only allows draft + pending", False, str(e))

        # Test 6: Strict Section 10.1 Trigger on content_chunks
        # 6a: Chunking owned source -> ALLOWED
        cur.execute("SELECT id FROM content_sources WHERE permission_status = 'owned' LIMIT 1;")
        owned_source_id = cur.fetchone()[0]
        try:
            cur.execute("""
                INSERT INTO content_chunks (source_id, chunk_no, content, content_hash)
                VALUES (%s, 99, 'Sample chunk text', 'hash_owned_test');
            """, (owned_source_id,))
            assert_test("Trigger allows chunking of owned source", True)
        except Exception as e:
            assert_test("Trigger allows chunking of owned source", False, str(e))

        # 6b: Chunking link_only source -> MUST BE BLOCKED BY TRIGGER
        cur.execute("SELECT id FROM content_sources WHERE permission_status = 'link_only' LIMIT 1;")
        link_only_source_id = cur.fetchone()[0]
        try:
            cur.execute("""
                INSERT INTO content_chunks (source_id, chunk_no, content, content_hash)
                VALUES (%s, 99, 'Illegal chunk for link_only source', 'hash_link_test');
            """, (link_only_source_id,))
            assert_test("Trigger BLOCKS chunking of link_only source (Blueprint Section 10.1)", False, "Should have failed trigger!")
        except errors.RaiseException:
            assert_test("Trigger BLOCKS chunking of link_only source (Blueprint Section 10.1)", True)
        except Exception as e:
            assert_test("Trigger BLOCKS chunking of link_only source", False, f"Unexpected error: {e}")

        # 6c: Chunking pending source -> MUST BE BLOCKED BY TRIGGER
        cur.execute("SELECT id FROM content_sources WHERE permission_status = 'pending' LIMIT 1;")
        pending_source_id = cur.fetchone()[0]
        try:
            cur.execute("""
                INSERT INTO content_chunks (source_id, chunk_no, content, content_hash)
                VALUES (%s, 99, 'Illegal chunk for pending source', 'hash_pending_test');
            """, (pending_source_id,))
            assert_test("Trigger BLOCKS chunking of pending source", False, "Should have failed trigger!")
        except errors.RaiseException:
            assert_test("Trigger BLOCKS chunking of pending source", True)
        except Exception as e:
            assert_test("Trigger BLOCKS chunking of pending source", False, f"Unexpected error: {e}")

        # Test 7: One-active-attempt rule (Section 8.2)
        cur.execute("SELECT id FROM users WHERE role = 'student' LIMIT 1;")
        student_id = cur.fetchone()[0]
        cur.execute("SELECT id FROM exams LIMIT 1;")
        exam_id = cur.fetchone()[0]

        # First attempt in_progress -> ALLOWED
        cur.execute("""
            INSERT INTO attempts (user_id, exam_id, status, deadline_at)
            VALUES (%s, %s, 'in_progress', clock_timestamp() + interval '1 hour')
            RETURNING id;
        """, (student_id, exam_id))
        attempt_id_1 = cur.fetchone()[0]
        assert_test("First in_progress attempt allowed", True)

        # Second attempt in_progress for same user and exam -> MUST BE BLOCKED by partial unique index
        try:
            cur.execute("""
                INSERT INTO attempts (user_id, exam_id, status, deadline_at)
                VALUES (%s, %s, 'in_progress', clock_timestamp() + interval '1 hour');
            """, (student_id, exam_id))
            assert_test("Second in_progress attempt BLOCKED by one-active-attempt rule", False, "Should have failed unique constraint!")
        except errors.UniqueViolation:
            assert_test("Second in_progress attempt BLOCKED by one-active-attempt rule", True)
        except Exception as e:
            assert_test("Second in_progress attempt BLOCKED", False, str(e))

        # Submit first attempt
        cur.execute("UPDATE attempts SET status = 'submitted' WHERE id = %s;", (attempt_id_1,))

        # Now starting a second attempt in_progress is ALLOWED!
        try:
            cur.execute("""
                INSERT INTO attempts (user_id, exam_id, status, deadline_at)
                VALUES (%s, %s, 'in_progress', clock_timestamp() + interval '1 hour')
                RETURNING id;
            """, (student_id, exam_id))
            attempt_id_2 = cur.fetchone()[0]
            assert_test("New attempt allowed after previous attempt is submitted (Retake flow)", True)
        except Exception as e:
            assert_test("New attempt allowed after previous attempt is submitted", False, str(e))

        # Test 8: Response Idempotency (Section 8.2)
        cur.execute("SELECT id FROM questions LIMIT 1;")
        question_id = cur.fetchone()[0]

        cur.execute("""
            INSERT INTO responses (attempt_id, question_id, response_json)
            VALUES (%s, %s, '{"answer": "A"}');
        """, (attempt_id_2, question_id))
        assert_test("First response saved successfully", True)

        # Duplicate response insertion for same attempt & question -> MUST BE BLOCKED
        try:
            cur.execute("""
                INSERT INTO responses (attempt_id, question_id, response_json)
                VALUES (%s, %s, '{"answer": "B"}');
            """, (attempt_id_2, question_id))
            assert_test("Duplicate response insertion BLOCKED by unique constraint", False, "Should have failed uq_attempt_question!")
        except errors.UniqueViolation:
            assert_test("Duplicate response insertion BLOCKED by unique constraint", True)
        except Exception as e:
            assert_test("Duplicate response insertion BLOCKED", False, str(e))

        # Test 9: Score uniqueness per skill per attempt
        cur.execute("""
            INSERT INTO scores (attempt_id, skill, raw_score, estimated_band, scoring_version)
            VALUES (%s, 'reading', 35, 8.0, '2026.1');
        """, (attempt_id_2,))
        assert_test("First score for skill 'reading' inserted", True)

        try:
            cur.execute("""
                INSERT INTO scores (attempt_id, skill, raw_score, estimated_band, scoring_version)
                VALUES (%s, 'reading', 36, 8.5, '2026.1');
            """, (attempt_id_2,))
            assert_test("Duplicate score for same skill BLOCKED", False, "Should have failed uq_attempt_skill_score!")
        except errors.UniqueViolation:
            assert_test("Duplicate score for same skill BLOCKED", True)
        except Exception as e:
            assert_test("Duplicate score for same skill BLOCKED", False, str(e))

        # Test 10: Invalid check constraints
        # 10a: Invalid role on users
        try:
            cur.execute("INSERT INTO users (email, role) VALUES ('bad@role.com', 'super_hacker');")
            assert_test("Invalid user role 'super_hacker' BLOCKED", False)
        except errors.CheckViolation:
            assert_test("Invalid user role 'super_hacker' BLOCKED", True)

        # 10b: Invalid score band (> 9.0)
        try:
            cur.execute("""
                INSERT INTO scores (attempt_id, skill, raw_score, estimated_band, scoring_version)
                VALUES (%s, 'writing', 30, 9.5, '2026.1');
            """, (attempt_id_2,))
            assert_test("Invalid estimated_band 9.5 BLOCKED (Band > 9.0)", False)
        except errors.CheckViolation:
            assert_test("Invalid estimated_band 9.5 BLOCKED (Band > 9.0)", True)

        # 10c: Invalid score band (< 0.0)
        try:
            cur.execute("""
                INSERT INTO scores (attempt_id, skill, raw_score, estimated_band, scoring_version)
                VALUES (%s, 'writing', 30, -0.5, '2026.1');
            """, (attempt_id_2,))
            assert_test("Invalid estimated_band -0.5 BLOCKED (Band < 0.0)", False)
        except errors.CheckViolation:
            assert_test("Invalid estimated_band -0.5 BLOCKED (Band < 0.0)", True)

        # 10d: Target band range in profiles
        try:
            cur.execute("""
                INSERT INTO profiles (user_id, test_type, target_band)
                VALUES ('11111111-1111-1111-1111-111111111111', 'academic', 9.5);
            """)
            assert_test("Invalid target_band 9.5 in profile BLOCKED", False)
        except errors.CheckViolation:
            assert_test("Invalid target_band 9.5 in profile BLOCKED", True)

        # Test 11: Foreign Key Cascade on user deletion
        cur.execute("DELETE FROM users WHERE id = %s;", (student_id,))
        cur.execute("SELECT count(*) FROM profiles WHERE user_id = %s;", (student_id,))
        profile_count = cur.fetchone()[0]
        cur.execute("SELECT count(*) FROM attempts WHERE user_id = %s;", (student_id,))
        attempt_count = cur.fetchone()[0]
        assert_test("User deletion cascades cleanly to profiles & attempts", profile_count == 0 and attempt_count == 0)

        # Test 12: Foreign Key Restrict on exam deletion
        # Create an attempt on exam_id
        cur.execute("""
            INSERT INTO users (id, email) VALUES ('77777777-0000-0000-0000-000000000000', 'audit@test.com');
            INSERT INTO attempts (user_id, exam_id, status, deadline_at)
            VALUES ('77777777-0000-0000-0000-000000000000', %s, 'submitted', clock_timestamp());
        """, (exam_id,))
        try:
            cur.execute("DELETE FROM exams WHERE id = %s;", (exam_id,))
            assert_test("Deleting exam with existing attempts is RESTRICTED (protects student history)", False)
        except (errors.ForeignKeyViolation, errors.RestrictViolation, errors.IntegrityError):
            assert_test("Deleting exam with existing attempts is RESTRICTED (protects student history)", True)

        conn.close()

    finally:
        proc.terminate()
        proc.wait()

    print("=" * 70)
    print(f"RESULTS: {passed} PASSED, {failed} FAILED")
    print("=" * 70)
    if failed > 0:
        sys.exit(1)


if __name__ == "__main__":
    main()
