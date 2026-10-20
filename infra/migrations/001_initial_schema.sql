-- =============================================================================
-- BandBloom IELTS SaaS - Complete PostgreSQL Database Schema
-- Version: 2.0 (Aligned with BandBloom Technical & Product Plan v2)
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Safe pgvector extension handling:
-- If pgvector is installed (e.g. docker pgvector/pgvector:pg16 or cloud managed),
-- enable extension and native vector type. Otherwise define compatible mock domain for dev/tests.
DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS "vector";
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'pgvector extension not installed in environment; using array fallback domain for development.';
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vector') THEN
        CREATE DOMAIN vector AS real[];
    END IF;
END $$;

-- =============================================================================
-- Helper Functions & Trigger Definitions
-- =============================================================================

-- Automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = clock_timestamp();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Official IELTS Band Score Rounding Function (Section 5.3 & Appendix A #4)
-- Rules:
-- If average fraction is < 0.25 -> round down to whole band (.00)
-- If average fraction is >= 0.25 and < 0.75 -> round to half band (.50)
-- If average fraction is >= 0.75 -> round up to next whole band (1.00)
CREATE OR REPLACE FUNCTION ielts_round_band(raw_avg NUMERIC)
RETURNS NUMERIC AS $$
DECLARE
    whole_part INTEGER;
    fraction_part NUMERIC;
BEGIN
    IF raw_avg IS NULL THEN
        RETURN NULL;
    END IF;
    
    whole_part := FLOOR(raw_avg);
    fraction_part := raw_avg - whole_part;
    
    IF fraction_part < 0.25 THEN
        RETURN whole_part::NUMERIC(2,1);
    ELSIF fraction_part < 0.75 THEN
        RETURN (whole_part + 0.5)::NUMERIC(2,1);
    ELSE
        RETURN (whole_part + 1.0)::NUMERIC(2,1);
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Overall Band Calculation Function from 4 skill components
CREATE OR REPLACE FUNCTION ielts_calculate_overall_band(
    l NUMERIC,
    r NUMERIC,
    w NUMERIC,
    s NUMERIC
)
RETURNS NUMERIC AS $$
BEGIN
    IF l IS NULL OR r IS NULL OR w IS NULL OR s IS NULL THEN
        RETURN NULL; -- Incomplete components cannot calculate overall band
    END IF;
    RETURN ielts_round_band((l + r + w + s) / 4.0);
END;
$$ LANGUAGE plpgsql IMMUTABLE;


-- =============================================================================
-- 1. USERS & PROFILES (Section 8.1, 14.1)
-- =============================================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    auth_subject TEXT UNIQUE,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'content_creator', 'reviewer', 'admin')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending_verification', 'suspended', 'deleted')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    test_type TEXT NOT NULL DEFAULT 'academic' CHECK (test_type IN ('academic', 'general_training')),
    target_band NUMERIC(2,1) CHECK (target_band >= 0.0 AND target_band <= 9.0),
    target_date DATE,
    daily_minutes INTEGER NOT NULL DEFAULT 60 CHECK (daily_minutes > 0),
    timezone TEXT NOT NULL DEFAULT 'UTC',
    ui_language TEXT NOT NULL DEFAULT 'en' CHECK (ui_language IN ('en', 'bn')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- =============================================================================
-- 2. CONSENTS (Section 2.3, 8.1, Appendix A #9)
-- Explicit user consent for recording, AI processing, model improvement opt-in
-- =============================================================================

CREATE TABLE IF NOT EXISTS consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('recording', 'ai_processing', 'model_improvement', 'terms_and_privacy')),
    policy_version TEXT NOT NULL,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    revoked_at TIMESTAMPTZ,
    metadata JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_consents_user_type ON consents(user_id, type);
CREATE INDEX IF NOT EXISTS idx_consents_granted ON consents(user_id, granted_at DESC);


-- =============================================================================
-- 3. MEDIA ASSETS & RECORDINGS (Section 7.2, 8.1, 14.3)
-- Static media assets (listening audio) vs learner recordings
-- =============================================================================

CREATE TABLE IF NOT EXISTS media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    object_key TEXT NOT NULL UNIQUE,
    mime_type TEXT NOT NULL,
    transcript_ref TEXT,
    license_status TEXT NOT NULL CHECK (license_status IN ('owned', 'licensed', 'public_domain', 'pending', 'prohibited')),
    file_size_bytes BIGINT CHECK (file_size_bytes IS NULL OR file_size_bytes > 0),
    duration_seconds INTEGER CHECK (duration_seconds IS NULL OR duration_seconds > 0),
    retention_until TIMESTAMPTZ,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_media_assets_license ON media_assets(license_status);


-- =============================================================================
-- 4. LESSONS & QUESTION BANK (Section 4, 8.1, 10.1)
-- =============================================================================

CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill TEXT NOT NULL CHECK (skill IN ('reading', 'listening', 'writing', 'speaking', 'general')),
    title TEXT NOT NULL,
    level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    module_type TEXT NOT NULL DEFAULT 'both' CHECK (module_type IN ('academic', 'general_training', 'both')),
    content_version TEXT NOT NULL DEFAULT '1.0',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'published', 'retired')),
    content JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_lessons_skill_status ON lessons(skill, status);
CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons(module_type);

DROP TRIGGER IF EXISTS trg_lessons_updated_at ON lessons;
CREATE TRIGGER trg_lessons_updated_at
BEFORE UPDATE ON lessons
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill TEXT NOT NULL CHECK (skill IN ('reading', 'listening', 'writing', 'speaking')),
    type TEXT NOT NULL CHECK (type IN (
        'multiple_choice',
        'true_false_not_given',
        'yes_no_not_given',
        'matching',
        'completion',
        'short_answer',
        'diagram_label',
        'task1_writing',
        'task2_writing',
        'part1_speaking',
        'part2_speaking',
        'part3_speaking'
    )),
    module TEXT NOT NULL DEFAULT 'both' CHECK (module IN ('academic', 'general_training', 'both')),
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
    prompt TEXT NOT NULL,
    context_text TEXT,
    media_asset_id UUID REFERENCES media_assets(id) ON DELETE SET NULL,
    explanation TEXT,
    rights_status TEXT NOT NULL CHECK (rights_status IN ('owned', 'licensed', 'link_only', 'pending', 'prohibited')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'published', 'retired')),
    version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_questions_skill_status ON questions(skill, status);
CREATE INDEX IF NOT EXISTS idx_questions_module ON questions(module);
CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(type);

DROP TRIGGER IF EXISTS trg_questions_updated_at ON questions;
CREATE TRIGGER trg_questions_updated_at
BEFORE UPDATE ON questions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE TABLE IF NOT EXISTS question_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT false,
    option_order INTEGER NOT NULL DEFAULT 0,
    explanation TEXT
);

CREATE INDEX IF NOT EXISTS idx_question_options_qid ON question_options(question_id);


-- =============================================================================
-- 5. EXAMS & EXAM SECTIONS (Section 5.1, 5.2, 8.1)
-- =============================================================================

CREATE TABLE IF NOT EXISTS exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    test_type TEXT NOT NULL CHECK (test_type IN ('academic', 'general_training')),
    config_version TEXT NOT NULL DEFAULT '1.0',
    start_at TIMESTAMPTZ,
    end_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'active', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_exams_status ON exams(status);
CREATE INDEX IF NOT EXISTS idx_exams_test_type ON exams(test_type);

DROP TRIGGER IF EXISTS trg_exams_updated_at ON exams;
CREATE TRIGGER trg_exams_updated_at
BEFORE UPDATE ON exams
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE TABLE IF NOT EXISTS exam_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    skill TEXT NOT NULL CHECK (skill IN ('reading', 'listening', 'writing', 'speaking')),
    duration_seconds INTEGER NOT NULL CHECK (duration_seconds > 0),
    order_index INTEGER NOT NULL CHECK (order_index > 0),
    instructions TEXT,
    config JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_exam_sections_exam ON exam_sections(exam_id, order_index);


-- Mapping questions into exam sections for structured mock test generation
CREATE TABLE IF NOT EXISTS exam_section_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_section_id UUID NOT NULL REFERENCES exam_sections(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE RESTRICT,
    question_order INTEGER NOT NULL DEFAULT 1 CHECK (question_order > 0),
    allocated_marks NUMERIC(5,2) NOT NULL DEFAULT 1.0 CHECK (allocated_marks > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_section_question UNIQUE (exam_section_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_esq_section ON exam_section_questions(exam_section_id, question_order);
CREATE INDEX IF NOT EXISTS idx_esq_question ON exam_section_questions(question_id);


-- =============================================================================
-- 6. ATTEMPTS & RESPONSES (Section 5.2, 8.1, 8.2)
-- Enforces one active attempt rule, server authoritative deadlines, idempotency
-- =============================================================================

CREATE TABLE IF NOT EXISTS attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'abandoned', 'evaluated')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    submitted_at TIMESTAMPTZ,
    deadline_at TIMESTAMPTZ NOT NULL,
    config_snapshot JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_attempts_user_id ON attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_exam_id ON attempts(exam_id);
CREATE INDEX IF NOT EXISTS idx_attempts_status ON attempts(status);

-- One-active-attempt rule per user per exam: only 1 in_progress attempt allowed at any time
CREATE UNIQUE INDEX IF NOT EXISTS idx_attempts_one_active_per_exam
ON attempts(user_id, exam_id)
WHERE status = 'in_progress';

DROP TRIGGER IF EXISTS trg_attempts_updated_at ON attempts;
CREATE TRIGGER trg_attempts_updated_at
BEFORE UPDATE ON attempts
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE TABLE IF NOT EXISTS responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE RESTRICT,
    response_json JSONB NOT NULL,
    saved_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    awarded_marks NUMERIC(5,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_attempt_question UNIQUE (attempt_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_responses_attempt_id ON responses(attempt_id);
CREATE INDEX IF NOT EXISTS idx_responses_question_id ON responses(question_id);

DROP TRIGGER IF EXISTS trg_responses_updated_at ON responses;
CREATE TRIGGER trg_responses_updated_at
BEFORE UPDATE ON responses
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- =============================================================================
-- 7. LEARNER RECORDINGS (Section 4.4, 8.1, Appendix A #9)
-- Sensitive learner audio data; separate lifecycle, retention & deletion
-- =============================================================================

CREATE TABLE IF NOT EXISTS recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    attempt_id UUID REFERENCES attempts(id) ON DELETE SET NULL,
    question_id UUID REFERENCES questions(id) ON DELETE SET NULL,
    object_key TEXT NOT NULL UNIQUE,
    duration_s INTEGER CHECK (duration_s IS NULL OR duration_s > 0),
    consent_id UUID REFERENCES consents(id) ON DELETE RESTRICT,
    retention_until TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_recordings_user ON recordings(user_id);
CREATE INDEX IF NOT EXISTS idx_recordings_attempt ON recordings(attempt_id);
CREATE INDEX IF NOT EXISTS idx_recordings_retention ON recordings(retention_until) WHERE deleted_at IS NULL;


-- =============================================================================
-- 8. SCORES & RUBRIC FEEDBACK (Section 4.3, 5.3, 8.1)
-- =============================================================================

CREATE TABLE IF NOT EXISTS scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
    skill TEXT NOT NULL CHECK (skill IN ('overall', 'reading', 'listening', 'writing', 'speaking')),
    raw_score NUMERIC(5,2),
    estimated_band NUMERIC(2,1) CHECK (estimated_band IS NULL OR (estimated_band >= 0.0 AND estimated_band <= 9.0)),
    scoring_version TEXT NOT NULL,
    confidence_label TEXT CHECK (confidence_label IS NULL OR confidence_label IN ('supported', 'limited', 'insufficient_evidence')),
    is_unofficial BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_attempt_skill_score UNIQUE (attempt_id, skill)
);

CREATE INDEX IF NOT EXISTS idx_scores_attempt ON scores(attempt_id);


CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
    skill TEXT NOT NULL CHECK (skill IN ('reading', 'listening', 'writing', 'speaking')),
    rubric_json JSONB NOT NULL DEFAULT '{}',
    feedback_text TEXT NOT NULL,
    model_version TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'generated' CHECK (status IN ('generated', 'reviewed', 'published', 'flagged')),
    reviewer_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_feedback_attempt_skill ON feedback(attempt_id, skill);

DROP TRIGGER IF EXISTS trg_feedback_updated_at ON feedback;
CREATE TRIGGER trg_feedback_updated_at
BEFORE UPDATE ON feedback
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- =============================================================================
-- 9. AI JOBS (Section 8.1, 14.1, Appendix A #9)
-- Async queue state tracking for writing feedback, speech transcription, etc.
-- =============================================================================

CREATE TABLE IF NOT EXISTS ai_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('writing_feedback', 'speaking_transcription', 'speaking_feedback', 'rag_indexing')),
    attempt_id UUID REFERENCES attempts(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'retrying')),
    retry_count INTEGER NOT NULL DEFAULT 0 CHECK (retry_count >= 0),
    max_retries INTEGER NOT NULL DEFAULT 3 CHECK (max_retries >= 0),
    error_code TEXT,
    error_message TEXT,
    payload JSONB NOT NULL DEFAULT '{}',
    result JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_ai_jobs_status ON ai_jobs(status, type);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_attempt ON ai_jobs(attempt_id);

DROP TRIGGER IF EXISTS trg_ai_jobs_updated_at ON ai_jobs;
CREATE TRIGGER trg_ai_jobs_updated_at
BEFORE UPDATE ON ai_jobs
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- =============================================================================
-- 10. STUDY PLANS & MISTAKE NOTEBOOK (Section 4.5, 8.1)
-- =============================================================================

CREATE TABLE IF NOT EXISTS study_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_version INTEGER NOT NULL DEFAULT 1 CHECK (plan_version > 0),
    week_start DATE NOT NULL,
    plan_json JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_study_plans_user ON study_plans(user_id, is_active);

DROP TRIGGER IF EXISTS trg_study_plans_updated_at ON study_plans;
CREATE TRIGGER trg_study_plans_updated_at
BEFORE UPDATE ON study_plans
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE TABLE IF NOT EXISTS mistake_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source_attempt UUID REFERENCES attempts(id) ON DELETE SET NULL,
    question_id UUID REFERENCES questions(id) ON DELETE SET NULL,
    skill TEXT NOT NULL CHECK (skill IN ('reading', 'listening', 'writing', 'speaking')),
    error_tag TEXT NOT NULL,
    user_notes TEXT,
    original_answer TEXT,
    correct_reasoning TEXT,
    retry_status TEXT NOT NULL DEFAULT 'pending' CHECK (retry_status IN ('pending', 'mastered', 'retest_needed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_mistake_notes_user_skill ON mistake_notes(user_id, skill);
CREATE INDEX IF NOT EXISTS idx_mistake_notes_retry ON mistake_notes(user_id, retry_status);

DROP TRIGGER IF EXISTS trg_mistake_notes_updated_at ON mistake_notes;
CREATE TRIGGER trg_mistake_notes_updated_at
BEFORE UPDATE ON mistake_notes
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- =============================================================================
-- 11. RAG CONTENT INGESTION & VECTOR STORE (Section 10.1, 10.4, 11.1)
-- Approved registry + strict permission gating + hybrid vector & FTS indexing
-- =============================================================================

CREATE TABLE IF NOT EXISTS content_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    source_url TEXT,
    owner TEXT NOT NULL,
    permission_status TEXT NOT NULL CHECK (permission_status IN ('owned','licensed','link_only','pending','prohibited')),
    source_type TEXT NOT NULL CHECK (source_type IN ('official_guidance','original_lesson','internal_policy','sample_answer')),
    skill TEXT,
    test_type TEXT,
    locale TEXT NOT NULL DEFAULT 'en',
    version TEXT NOT NULL,
    content_hash TEXT,
    published_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    next_review_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved','published','retired')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    -- pending/prohibited source cannot be published
    CONSTRAINT publishable_only CHECK (
        status <> 'published' OR permission_status IN ('owned','licensed','link_only')
    )
);

CREATE INDEX IF NOT EXISTS idx_content_sources_status ON content_sources(status, permission_status);
CREATE INDEX IF NOT EXISTS idx_content_sources_skill ON content_sources(skill, test_type);

DROP TRIGGER IF EXISTS trg_content_sources_updated_at ON content_sources;
CREATE TRIGGER trg_content_sources_updated_at
BEFORE UPDATE ON content_sources
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- EMBEDDING DIMENSION DEFAULT: 1536 (OpenAI text-embedding-3-small or similar, configurable)
CREATE TABLE IF NOT EXISTS content_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES content_sources(id) ON DELETE CASCADE,
    chunk_no INTEGER NOT NULL,
    heading_path TEXT,
    content TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}',
    content_hash TEXT NOT NULL,
    fts TSVECTOR GENERATED ALWAYS AS (to_tsvector('simple', content)) STORED,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    UNIQUE (source_id, chunk_no, content_hash)
);

CREATE INDEX IF NOT EXISTS content_chunks_source_idx ON content_chunks (source_id);
CREATE INDEX IF NOT EXISTS content_chunks_fts_idx ON content_chunks USING GIN (fts);

-- Safe embedding column and index setup:
-- In Docker/Production with pgvector: uses native VECTOR(1536) and HNSW cosine index
-- In local standard PostgreSQL: uses real[] array type
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
        EXECUTE 'ALTER TABLE content_chunks ADD COLUMN IF NOT EXISTS embedding VECTOR(1536)';
        IF EXISTS (SELECT 1 FROM pg_am WHERE amname = 'hnsw') THEN
            EXECUTE 'CREATE INDEX IF NOT EXISTS content_chunks_embedding_idx ON content_chunks USING hnsw (embedding vector_cosine_ops)';
        END IF;
    ELSE
        EXECUTE 'ALTER TABLE content_chunks ADD COLUMN IF NOT EXISTS embedding real[]';
        RAISE NOTICE 'Native pgvector not found; using real[] fallback for embedding';
    END IF;
END $$;


-- STRICT RAG INGESTION SAFETY TRIGGER (Blueprint Section 10.1 & 10.4):
-- "link_only source-এর পাঠ্য কখনো chunk/embed হবে না; শুধু বাইরের লিঙ্ক হিসেবে দেখানো হবে।
--  শুধু owned ও licensed source-এর text index হবে।"
CREATE OR REPLACE FUNCTION validate_chunk_source_permission()
RETURNS TRIGGER AS $$
DECLARE
    source_perm TEXT;
BEGIN
    SELECT permission_status INTO source_perm
    FROM content_sources
    WHERE id = NEW.source_id;

    IF source_perm IS NULL THEN
        RAISE EXCEPTION 'Referenced content_source % not found', NEW.source_id;
    END IF;

    IF source_perm NOT IN ('owned', 'licensed') THEN
        RAISE EXCEPTION 'Cannot index or chunk source with permission "%". Blueprint Section 10.1 forbids chunking link_only, pending, or prohibited sources.', source_perm;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_chunk_source_permission ON content_chunks;
CREATE TRIGGER trg_validate_chunk_source_permission
BEFORE INSERT OR UPDATE ON content_chunks
FOR EACH ROW EXECUTE FUNCTION validate_chunk_source_permission();


-- =============================================================================
-- 12. TUTOR REPORTS & AUDIT LOGS (Section 8.1, 8.3, 14.1)
-- =============================================================================

CREATE TABLE IF NOT EXISTS tutor_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    request_id TEXT NOT NULL,
    user_query TEXT NOT NULL,
    tutor_response TEXT NOT NULL,
    cited_sources JSONB NOT NULL DEFAULT '[]',
    reason TEXT NOT NULL CHECK (reason IN ('incorrect_facts', 'harmful_content', 'hallucinated_citation', 'irrelevant', 'other')),
    user_comment TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    reviewer_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_tutor_reports_status ON tutor_reports(status);
CREATE INDEX IF NOT EXISTS idx_tutor_reports_user ON tutor_reports(user_id);


CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action, entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
