-- =============================================================================
-- Migration 005: Enforce Single Active Study Plan Per Student
-- =============================================================================

CREATE UNIQUE INDEX IF NOT EXISTS uq_study_plans_active_user
ON study_plans (user_id)
WHERE is_active = true;
