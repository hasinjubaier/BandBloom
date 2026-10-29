-- =============================================================================
-- BandBloom IELTS SaaS - Practice Hub Exams & Questions Seed Migration
-- Migration 006: Version-Controlled Practice Hub Fixtures
-- =============================================================================

-- 1. Insert 5 Practice Hub Lab Exams
INSERT INTO exams (id, title, test_type, config_version, status)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'Academic Reading Practice Lab', 'academic', '2026.1', 'active'),
    ('11111111-1111-1111-1111-111111111112', 'General Training Reading Practice Lab', 'general_training', '2026.1', 'active'),
    ('22222222-2222-2222-2222-222222222222', 'Computer-Delivered Listening Practice Lab', 'academic', '2026.1', 'active'),
    ('33333333-3333-3333-3333-333333333333', 'Writing Tasks 1 & 2 Practice Evaluator', 'academic', '2026.1', 'active'),
    ('44444444-4444-4444-4444-444444444444', 'Speaking Part 2 Cue Card & Recorder Lab', 'academic', '2026.1', 'active')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    test_type = EXCLUDED.test_type,
    status = 'active';

-- 2. Insert Corresponding Lab Sections
INSERT INTO exam_sections (id, exam_id, skill, duration_seconds, order_index, instructions)
VALUES
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', '11111111-1111-1111-1111-111111111111', 'reading', 1200, 1, 'Academic Reading Passage: Megacities & Climate Adaptation. 4 calibrated questions (Original BandBloom practice material).'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', '11111111-1111-1111-1111-111111111112', 'reading', 1200, 1, 'General Training Reading Passage: Workplace Fire Safety. 4 calibrated questions (Original BandBloom practice material).'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3', '22222222-2222-2222-2222-222222222222', 'listening', 900, 1, 'Listening Lab: Campus Orientation Dialogue. Original practice dialogue with local browser speech synthesis fallback.'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4', '33333333-3333-3333-3333-333333333333', 'writing', 3600, 1, 'Writing Evaluator: Academic/GT Task 1 and Task 2 with 2:1 official examiner weighting (Original BandBloom diagnostic prompts).'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb5', '44444444-4444-4444-4444-444444444444', 'speaking', 840, 1, 'Speaking Lab: Part 2 Candidate Task Card with 1-min prep and 2-min recording turn (Original BandBloom diagnostic prompt).')
ON CONFLICT (id) DO UPDATE SET
    instructions = EXCLUDED.instructions,
    duration_seconds = EXCLUDED.duration_seconds;

-- 3. Original BandBloom Practice Questions (Diagnostic Practice Content — Unofficial Material)
INSERT INTO questions (
    id, skill, type, module, difficulty, prompt, context_text, explanation, rights_status, status, version
)
VALUES
    (
        '88888888-8888-8888-8888-888888888881',
        'reading',
        'true_false_not_given',
        'academic',
        'medium',
        'Rotterdam and Singapore have implemented subterranean water storage systems to manage severe weather.',
        'Original BandBloom Academic Reading Passage: Megacities and Climate Adaptation (Paragraph A).',
        'Paragraph A explicitly confirms that Rotterdam, Tokyo, and Singapore have developed subterranean flood storage reservoirs.',
        'owned',
        'published',
        1
    ),
    (
        '88888888-8888-8888-8888-888888888882',
        'writing',
        'task2_writing',
        'both',
        'medium',
        'Some people believe university education should be free for all students, while others argue students should pay tuition fees. Discuss both views and give your own opinion.',
        'Original BandBloom Discursive Essay Prompt requiring minimum 250 words and balanced arguments.',
        'IELTS Task 2 essay evaluated on Task Response, Coherence and Cohesion, Lexical Resource, and Grammatical Range & Accuracy.',
        'owned',
        'published',
        1
    ),
    (
        '88888888-8888-8888-8888-888888888883',
        'listening',
        'completion',
        'academic',
        'medium',
        'Customer Surname: [_____] (First Name: Arthur)',
        'Original BandBloom Listening Dialogue: Campus Orientation Services (Tour Officer & Arthur Pendelton).',
        'Arthur clearly introduces and spells his surname: P-E-N-D-E-L-T-O-N.',
        'owned',
        'published',
        1
    ),
    (
        '88888888-8888-8888-8888-888888888884',
        'speaking',
        'part2_speaking',
        'academic',
        'medium',
        'Describe an environmental initiative in your locality that you admire.',
        'Original BandBloom Part 2 Candidate Task Card: 1 minute notes prep, up to 2 minutes speaking turn.',
        'Part 2 Candidate Task Card providing partial diagnostic feedback for Fluency, Lexical Resource, and Grammar.',
        'owned',
        'published',
        1
    ),
    (
        '88888888-8888-8888-8888-888888888885',
        'reading',
        'true_false_not_given',
        'general_training',
        'medium',
        'A pulsing alarm tone instructs all staff to immediately evacuate the building.',
        'Original BandBloom General Training Reading Notice: Workplace Fire Safety and Emergency Evacuation.',
        'Notice 1 explains that pulsing indicates cautionary alert (stand by at workstations); continuous unbroken tone signals evacuation.',
        'owned',
        'published',
        1
    )
ON CONFLICT (id) DO UPDATE SET
    prompt = EXCLUDED.prompt,
    context_text = EXCLUDED.context_text,
    explanation = EXCLUDED.explanation,
    status = 'published';

-- 4. Link Questions to Practice Exam Sections
INSERT INTO exam_section_questions (exam_section_id, question_id, question_order, allocated_marks)
VALUES
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', '88888888-8888-8888-8888-888888888881', 1, 1.0),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', '88888888-8888-8888-8888-888888888885', 1, 1.0),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3', '88888888-8888-8888-8888-888888888883', 1, 1.0),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4', '88888888-8888-8888-8888-888888888882', 1, 9.0),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb5', '88888888-8888-8888-8888-888888888884', 1, 9.0)
ON CONFLICT DO NOTHING;
