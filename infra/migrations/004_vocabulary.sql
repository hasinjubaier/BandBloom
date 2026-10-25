-- =============================================================================
-- BandBloom IELTS SaaS - Vocabulary & Spaced Repetition Schema
-- =============================================================================

CREATE TABLE IF NOT EXISTS vocabulary_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    word TEXT NOT NULL UNIQUE,
    part_of_speech TEXT NOT NULL,
    band_level TEXT NOT NULL,
    meaning TEXT NOT NULL,
    collocation TEXT,
    example_sentence TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE IF NOT EXISTS user_vocabulary_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vocabulary_item_id UUID NOT NULL REFERENCES vocabulary_items(id) ON DELETE CASCADE,
    mastery TEXT NOT NULL DEFAULT 'learning' CHECK (mastery IN ('learning', 'reviewing', 'mastered')),
    interval_days INTEGER NOT NULL DEFAULT 1 CHECK (interval_days >= 0),
    next_review_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    last_reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_user_vocab UNIQUE (user_id, vocabulary_item_id)
);

CREATE INDEX IF NOT EXISTS idx_uvp_user_next_review ON user_vocabulary_progress(user_id, next_review_at);

-- Seed Initial High-Yield Academic Vocabulary
INSERT INTO vocabulary_items (word, part_of_speech, band_level, meaning, collocation, example_sentence)
VALUES
    (
        'Exacerbate',
        'verb',
        'Band 8.0+',
        'To make a problem, bad situation, or negative feeling worse',
        'exacerbate the environmental crisis / housing shortage',
        'Rapid industrialization without effluent treatment has exacerbated regional water contamination.'
    ),
    (
        'Corroborate',
        'verb',
        'Band 7.5+',
        'To confirm or give support to a statement, theory, or finding',
        'corroborate empirical findings / testimony',
        'Recent satellite telemetry corroborates the climatologists initial hypothesis.'
    ),
    (
        'Ubiquitous',
        'adjective',
        'Band 7.5+',
        'Present, appearing, or found everywhere',
        'ubiquitous influence / digital devices',
        'Smartphone usage has become ubiquitous among secondary school learners across urban hubs.'
    )
ON CONFLICT (word) DO NOTHING;
