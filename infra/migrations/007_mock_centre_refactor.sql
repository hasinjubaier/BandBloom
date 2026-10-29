-- =============================================================================
-- BandBloom IELTS SaaS - Mock Centre Full Diagnostics & GT Mocks Seed
-- Migration 007: Mock Centre Metadata Normalization & Full Exam Seeds
-- =============================================================================

-- 1. Ensure Full Mock 1 (Academic) links questions for all 4 sections
INSERT INTO exam_section_questions (exam_section_id, question_id, question_order, allocated_marks)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '88888888-8888-8888-8888-888888888883', 1, 1.0),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '88888888-8888-8888-8888-888888888884', 1, 9.0)
ON CONFLICT (exam_section_id, question_id) DO NOTHING;

-- 2. Insert Full Mock 2 (General Training)
INSERT INTO exams (id, title, test_type, config_version, status)
VALUES (
    '99999999-9999-9999-9999-999999999992',
    'BandBloom General Training Diagnostic Full Mock 1',
    'general_training',
    '2026.1',
    'active'
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    test_type = EXCLUDED.test_type,
    status = 'active';

-- 3. Sections for General Training Full Mock
INSERT INTO exam_sections (id, exam_id, skill, duration_seconds, order_index, instructions)
VALUES
    ('cccccccc-cccc-cccc-cccc-ccccccccccc1', '99999999-9999-9999-9999-999999999992', 'listening', 1800, 1, '4 parts, 40 questions. Listen once as per standard test design.'),
    ('cccccccc-cccc-cccc-cccc-ccccccccccc2', '99999999-9999-9999-9999-999999999992', 'reading', 3600, 2, '3 sections, 40 questions. 60 minutes total.'),
    ('cccccccc-cccc-cccc-cccc-ccccccccccc3', '99999999-9999-9999-9999-999999999992', 'writing', 3600, 3, 'Task 1 (min 150 words) and Task 2 (min 250 words). 60 minutes total.'),
    ('cccccccc-cccc-cccc-cccc-ccccccccccc4', '99999999-9999-9999-9999-999999999992', 'speaking', 840, 4, '3 parts, 11-14 minutes audio recorded responses.')
ON CONFLICT (id) DO UPDATE SET
    instructions = EXCLUDED.instructions,
    duration_seconds = EXCLUDED.duration_seconds;

-- 4. Link Questions to General Training Full Mock Sections
INSERT INTO exam_section_questions (exam_section_id, question_id, question_order, allocated_marks)
VALUES
    ('cccccccc-cccc-cccc-cccc-ccccccccccc1', '88888888-8888-8888-8888-888888888883', 1, 1.0),
    ('cccccccc-cccc-cccc-cccc-ccccccccccc2', '88888888-8888-8888-8888-888888888885', 1, 1.0),
    ('cccccccc-cccc-cccc-cccc-ccccccccccc3', '88888888-8888-8888-8888-888888888882', 1, 9.0),
    ('cccccccc-cccc-cccc-cccc-ccccccccccc4', '88888888-8888-8888-8888-888888888884', 1, 9.0)
ON CONFLICT (exam_section_id, question_id) DO NOTHING;

