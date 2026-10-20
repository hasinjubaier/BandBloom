-- =============================================================================
-- BandBloom IELTS SaaS - Initial Seed Data
-- =============================================================================

-- 1. Insert Initial System / Test Users
INSERT INTO users (id, email, auth_subject, role, status)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'admin@bandbloom.com', 'auth0|admin_01', 'admin', 'active'),
    ('22222222-2222-2222-2222-222222222222', 'reviewer@bandbloom.com', 'auth0|rev_01', 'reviewer', 'active'),
    ('33333333-3333-3333-3333-333333333333', 'student@bandbloom.com', 'auth0|stu_01', 'student', 'active')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Student Profile
INSERT INTO profiles (id, user_id, test_type, target_band, target_date, daily_minutes, timezone, ui_language)
VALUES (
    '44444444-4444-4444-4444-444444444444',
    '33333333-3333-3333-3333-333333333333',
    'academic',
    7.5,
    CURRENT_DATE + INTERVAL '60 days',
    60,
    'Asia/Dhaka',
    'bn'
)
ON CONFLICT (user_id) DO NOTHING;

-- 3. Insert Student Consents (Section 2.3, 8.1)
INSERT INTO consents (user_id, type, policy_version, metadata)
VALUES
    ('33333333-3333-3333-3333-333333333333', 'terms_and_privacy', 'v2.0', '{"ip": "127.0.0.1"}'),
    ('33333333-3333-3333-3333-333333333333', 'ai_processing', 'v2.0', '{"consent_for_rubric_evaluation": true}'),
    ('33333333-3333-3333-3333-333333333333', 'recording', 'v2.0', '{"retention_days": 90}');

-- 4. Insert Verified RAG Content Sources (Section 10.1, 10.4)
INSERT INTO content_sources (
    id, title, source_url, owner, permission_status, source_type,
    skill, test_type, locale, version, published_at, status
)
VALUES
    (
        '55555555-5555-5555-5555-555555555551',
        'Official IELTS Academic Writing Task 2 Assessment Criteria',
        'https://ielts.org/take-a-test/preparation-resources/writing-test-resources',
        'IELTS Partners / Public Reference',
        'owned',
        'official_guidance',
        'writing',
        'academic',
        'en',
        '2026.1',
        clock_timestamp(),
        'published'
    ),
    (
        '55555555-5555-5555-5555-555555555552',
        'IELTS Academic Reading Strategy: Dealing with True, False, Not Given',
        'https://bandbloom.com/guides/reading-tfng',
        'BandBloom Academic Team',
        'owned',
        'original_lesson',
        'reading',
        'academic',
        'en',
        '1.0',
        clock_timestamp(),
        'published'
    ),
    (
        '55555555-5555-5555-5555-555555555553',
        'IELTS Test Delivery Updates 2026: Computer-delivered and One Skill Retake',
        'https://ielts.org/news-and-insights/updates-to-ielts-test-delivery',
        'IELTS Official Announcement',
        'link_only',
        'official_guidance',
        'general',
        'both',
        'en',
        '2026.3',
        clock_timestamp(),
        'published'
    )
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Sample RAG Chunks (Section 10.4, 11.2)
INSERT INTO content_chunks (
    id, source_id, chunk_no, heading_path, content, metadata, content_hash
)
VALUES
    (
        '66666666-6666-6666-6666-666666666661',
        '55555555-5555-5555-5555-555555555551',
        1,
        'Writing Task 2 > Task Response Band 7',
        'Band 7 Task Response: The candidate addresses all parts of the task, presents a clear position throughout the response, and presents, extends and supports main ideas, though there may be a tendency to over-generalise or supporting ideas may lack focus.',
        '{"band": 7.0, "criterion": "Task Response"}',
        'hash_w2_tr_band7'
    ),
    (
        '66666666-6666-6666-6666-666666666662',
        '55555555-5555-5555-5555-555555555551',
        2,
        'Writing Task 2 > Coherence and Cohesion Band 7',
        'Band 7 Coherence and Cohesion: Logically organises information and ideas; there is clear progression throughout. Uses a range of cohesive devices appropriately although there may be some under-/over-use. Presents a clear central topic within each paragraph.',
        '{"band": 7.0, "criterion": "Coherence and Cohesion"}',
        'hash_w2_cc_band7'
    ),
    (
        '66666666-6666-6666-6666-666666666663',
        '55555555-5555-5555-5555-555555555552',
        1,
        'Reading Strategy > Difference between FALSE and NOT GIVEN',
        'A statement is FALSE if the passage clearly contradicts it (the passage states the opposite). A statement is NOT GIVEN if the passage does not provide enough information to confirm or contradict the statement. Do not assume or extrapolate from external knowledge.',
        '{"strategy": "TFNG", "common_pitfall": "assuming external facts"}',
        'hash_r_tfng_strat'
    )
ON CONFLICT (id) DO NOTHING;

-- 6. Insert Sample Practice Lessons
INSERT INTO lessons (
    id, skill, title, level, module_type, content_version, status, content
)
VALUES (
    '77777777-7777-7777-7777-777777777771',
    'reading',
    'Mastering True / False / Not Given Questions',
    'intermediate',
    'academic',
    '1.0',
    'published',
    '{
        "summary": "Learn step-by-step techniques to identify qualifiers, avoiding paraphrase traps and distinguishing False from Not Given.",
        "steps": [
            "Read the question statement carefully and identify keywords and qualifiers (always, sometimes, all, some).",
            "Scan the passage for keywords or their synonyms.",
            "Compare the exact meaning of the passage sentence with the question statement."
        ]
    }'
)
ON CONFLICT (id) DO NOTHING;

-- 7. Insert Sample Questions
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
        'All migratory birds travel south during the winter season.',
        'While many avian species in temperate regions embark on southward journeys to escape harsh freezing temperatures, several northern species remain stationary or migrate east-west toward coastal microclimates.',
        'The statement says "All", but the passage explicitly notes that "several northern species remain stationary or migrate east-west". Hence the passage contradicts the claim, making it FALSE.',
        'owned',
        'published',
        1
    ),
    (
        '88888888-8888-8888-8888-888888888882',
        'writing',
        'task2_writing',
        'academic',
        'medium',
        'Some people believe that university education should be free for everyone, while others argue that students should pay tuition fees. Discuss both views and give your own opinion.',
        NULL,
        'Minimum 250 words. Ensure you clearly discuss both sides (free education benefits vs cost/funding sustainability) and provide your well-argued opinion with examples.',
        'owned',
        'published',
        1
    )
ON CONFLICT (id) DO NOTHING;

-- 8. Question Options for Reading Question
INSERT INTO question_options (question_id, option_text, is_correct, option_order, explanation)
VALUES
    ('88888888-8888-8888-8888-888888888881', 'TRUE', false, 1, 'The text states that not all birds go south.'),
    ('88888888-8888-8888-8888-888888888881', 'FALSE', true, 2, 'Directly contradicted by "several northern species remain stationary or migrate east-west".'),
    ('88888888-8888-8888-8888-888888888881', 'NOT GIVEN', false, 3, 'Information is present in the passage.')
ON CONFLICT DO NOTHING;

-- 9. Insert Sample Exam & Sections
INSERT INTO exams (
    id, title, test_type, config_version, status
)
VALUES (
    '99999999-9999-9999-9999-999999999991',
    'BandBloom Academic Diagnostic Full Mock 1',
    'academic',
    '2026.1',
    'active'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO exam_sections (id, exam_id, skill, duration_seconds, order_index, instructions)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '99999999-9999-9999-9999-999999999991', 'listening', 1800, 1, '4 parts, 40 questions. Listen once as per standard test design.'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '99999999-9999-9999-9999-999999999991', 'reading', 3600, 2, '3 passages, 40 questions. 60 minutes total.'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '99999999-9999-9999-9999-999999999991', 'writing', 3600, 3, 'Task 1 (min 150 words) and Task 2 (min 250 words). 60 minutes total.'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '99999999-9999-9999-9999-999999999991', 'speaking', 840, 4, '3 parts, 11-14 minutes audio recorded responses.')
ON CONFLICT (id) DO NOTHING;

-- 10. Link Seed Questions to Exam Sections
INSERT INTO exam_section_questions (exam_section_id, question_id, question_order, allocated_marks)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '88888888-8888-8888-8888-888888888881', 1, 1.0),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '88888888-8888-8888-8888-888888888882', 1, 9.0)
ON CONFLICT DO NOTHING;

