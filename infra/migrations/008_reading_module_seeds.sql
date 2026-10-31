-- =============================================================================
-- BandBloom IELTS SaaS - Reading Module Question Types & Sections Seed Migration
-- Migration 008: Comprehensive Reading Questions & Question Types Fixtures
-- =============================================================================

-- 1. Insert Additional Calibrated Reading Questions (Academic & GT)
INSERT INTO questions (
    id, skill, type, module, difficulty, prompt, context_text, explanation, rights_status, status, version
)
VALUES
    -- Academic Reading: Sentence Completion (Megacities)
    (
        '88888888-8888-8888-8888-888888888891',
        'reading',
        'completion',
        'academic',
        'medium',
        'Green roofs can lower ambient roof temperatures by as much as [_____] degrees Celsius.',
        'Studies conducted by architectural consortia show that green roofs reduce ambient roof temperatures by up to 15 degrees Celsius while purifying urban runoff. (Paragraph C)',
        'Paragraph C explicitly specifies up to 15 degrees Celsius. Accepted answers: 15 or fifteen.',
        'owned',
        'published',
        1
    ),
    -- Academic Reading: Matching Headings (Megacities)
    (
        '88888888-8888-8888-8888-888888888892',
        'reading',
        'matching',
        'academic',
        'hard',
        'Which heading best matches Paragraph B regarding capital expenditure justification?',
        'Critics initially claimed that the exorbitant capital expenditure of underground cisterns would outweigh their ecological utility. However, post-monsoon economic assessments demonstrated that Tokyo G-Cans averted billions in damage. (Paragraph B)',
        'Heading: Financial justification for ambitious engineering. Paragraph B directly demonstrates that damage prevented exceeded costs.',
        'owned',
        'published',
        1
    ),
    -- Academic Reading: Yes / No / Not Given (Cognitive Archaeology)
    (
        '88888888-8888-8888-8888-888888888893',
        'reading',
        'yes_no_not_given',
        'academic',
        'hard',
        'The author believes that early Polynesian ocean voyages were governed predominantly by accidental drift rather than deliberate celestial observation.',
        'In our view, dismissing early Polynesian wayfinding as unguided drift ignores the sophisticated zenith star tracking and swells analysis documented by indigenous navigators.',
        'The author explicitly rejects accidental drift, stating that dismissing navigational knowledge as unguided drift is misguided. Hence the statement contradicts the writer (NO).',
        'owned',
        'published',
        1
    ),
    -- Academic Reading: Multiple Choice (Biomimicry)
    (
        '88888888-8888-8888-8888-888888888894',
        'reading',
        'multiple_choice',
        'academic',
        'medium',
        'What did longitudinal analysis reveal regarding property taxation revenues along the new rapid transit network?',
        'While opponents argued the high-speed rail line would destabilize suburban property values, longitudinal census data revealed a 14% increase in local municipal tax revenues.',
        'The census data directly showed a 14% increase in municipal tax receipts.',
        'owned',
        'published',
        1
    ),
    -- General Training Reading: Short Answer (Fire Safety Notice 2)
    (
        '88888888-8888-8888-8888-888888888895',
        'reading',
        'short_answer',
        'general_training',
        'easy',
        'Which specific stairwell must personnel in Wing A and Wing B utilize during an evacuation alarm?',
        'Staff occupying Wing A and Wing B must exit via Stairwell 3 and proceed immediately to Assembly Point C located in the southern staff car park.',
        'Notice 2 explicitly directs Wing A and B staff to use Stairwell 3.',
        'owned',
        'published',
        1
    ),
    -- General Training Reading: Summary Completion (Employee Grants)
    (
        '88888888-8888-8888-8888-888888888896',
        'reading',
        'completion',
        'general_training',
        'medium',
        'To qualify for financial reimbursement, staff development proposals must receive written [_____] from their department manager prior to course enrollment.',
        'Under workplace policy Section 4, employees seeking tuition subsidy must obtain formal written approval from their immediate supervisor prior to enrolling in accredited seminars.',
        'The policy requires written approval before enrollment.',
        'owned',
        'published',
        1
    )
ON CONFLICT (id) DO UPDATE SET
    prompt = EXCLUDED.prompt,
    context_text = EXCLUDED.context_text,
    explanation = EXCLUDED.explanation,
    status = 'published';

-- 2. Question Options for Multiple Choice and Heading Questions
INSERT INTO question_options (question_id, option_text, is_correct, option_order, explanation)
VALUES
    -- Options for Matching Headings 8892
    ('88888888-8888-8888-8888-888888888892', 'i. Financial justification for ambitious engineering', true, 1, 'Correct match for Paragraph B economic utility proof.'),
    ('88888888-8888-8888-8888-888888888892', 'ii. Ecological downsides of subterranean masonry', false, 2, 'Distractor focusing on negative criticism only.'),
    ('88888888-8888-8888-8888-888888888892', 'iii. Historical 20th century drainage networks', false, 3, 'Mentioned in Paragraph A, not Paragraph B.'),
    -- Options for YNNG 8893
    ('88888888-8888-8888-8888-888888888893', 'YES', false, 1, 'The author explicitly disputes this claim.'),
    ('88888888-8888-8888-8888-888888888893', 'NO', true, 2, 'Directly contradicts the author perspective.'),
    ('88888888-8888-8888-8888-888888888893', 'NOT GIVEN', false, 3, 'The author perspective is explicitly documented.'),
    -- Options for Multiple Choice 8894
    ('88888888-8888-8888-8888-888888888894', 'A. Construction deadlines were repeatedly extended', false, 1, 'Not mentioned in text.'),
    ('88888888-8888-8888-8888-888888888894', 'B. Suburban property values collapsed permanently', false, 2, 'Opponents predicted this, but census refuted it.'),
    ('88888888-8888-8888-8888-888888888894', 'C. Municipal governments experienced increased tax receipts', true, 3, 'Matches 14% increase in local municipal tax revenues.'),
    ('88888888-8888-8888-8888-888888888894', 'D. Commercial ridership declined after initial opening', false, 4, 'Unsubstantiated distractor.')
ON CONFLICT DO NOTHING;

-- 3. Link Questions to Academic Reading Lab Section
INSERT INTO exam_section_questions (exam_section_id, question_id, question_order, allocated_marks)
VALUES
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', '88888888-8888-8888-8888-888888888891', 2, 1.0),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', '88888888-8888-8888-8888-888888888892', 3, 1.0),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', '88888888-8888-8888-8888-888888888894', 4, 1.0)
ON CONFLICT (exam_section_id, question_id) DO NOTHING;

-- 4. Link Questions to General Training Reading Lab Section
INSERT INTO exam_section_questions (exam_section_id, question_id, question_order, allocated_marks)
VALUES
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', '88888888-8888-8888-8888-888888888895', 2, 1.0),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', '88888888-8888-8888-8888-888888888896', 3, 1.0)
ON CONFLICT (exam_section_id, question_id) DO NOTHING;

-- 5. Link Additional Questions to Full Mock Academic Reading Section
INSERT INTO exam_section_questions (exam_section_id, question_id, question_order, allocated_marks)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '88888888-8888-8888-8888-888888888891', 2, 1.0),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '88888888-8888-8888-8888-888888888892', 3, 1.0),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '88888888-8888-8888-8888-888888888893', 4, 1.0)
ON CONFLICT (exam_section_id, question_id) DO NOTHING;

-- 6. Link Additional Questions to Full Mock General Training Reading Section
INSERT INTO exam_section_questions (exam_section_id, question_id, question_order, allocated_marks)
VALUES
    ('cccccccc-cccc-cccc-cccc-ccccccccccc2', '88888888-8888-8888-8888-888888888895', 2, 1.0),
    ('cccccccc-cccc-cccc-cccc-ccccccccccc2', '88888888-8888-8888-8888-888888888896', 3, 1.0)
ON CONFLICT (exam_section_id, question_id) DO NOTHING;
