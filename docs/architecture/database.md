# BandBloom IELTS SaaS - Database Architecture & Entity Specifications

> **Version:** 2.0 (Aligned with BandBloom Product & Technical Blueprint v2)  
> **Status:** Production-Ready Schema  
> **Database:** PostgreSQL 16+ with `pgvector` and `GIN` Full-Text Search

---

## 1. Overview & Core Principles

The BandBloom database is designed around strict relational integrity, privacy-first user ownership scoping, and versioned educational content for computer-delivered IELTS preparation.

### Core Architectural Rules (Section 8.2 & 14.1)
1. **User Ownership Scoping**: Every student-owned table (`profiles`, `consents`, `attempts`, `responses`, `recordings`, `study_plans`, `mistake_notes`, `tutor_reports`) contains a foreign key to `users.id` and must be validated server-side using the authenticated session context (never trusting client-supplied user IDs).
2. **One-Active-Attempt Rule**: A partial unique index on `attempts(user_id, exam_id) WHERE status = 'in_progress'` guarantees that a student can only have one active session for a specific exam at a time.
3. **Idempotent Submission & Auto-Save**: `responses` has a unique constraint `UNIQUE (attempt_id, question_id)` ensuring debounced auto-saves and retried submissions do not duplicate records.
4. **Content Immutability & Snapshots**: Published questions, lessons, and exam configurations are versioned. Active exam attempts store a `config_snapshot` JSONB to ensure audits remain valid even if the question bank is revised.
5. **Separation of Student Audio & Public Media**: Public listening tracks are stored in `media_assets` with licensing statuses. Student speaking audio is stored separately in `recordings` with strict consent linking, retention dates, and soft-delete support (`deleted_at`).
6. **RAG Knowledge Gating**: RAG retrieval only queries `content_sources` with `status = 'published'` and `permission_status IN ('owned', 'licensed', 'link_only')`. Only `owned` and `licensed` sources have chunked embeddings stored in `content_chunks`.

---

## 2. Entity Relationship Summary (22 Tables)

| Category | Table Name | Purpose / Responsibility |
| :--- | :--- | :--- |
| **Identity & Access** | [`users`](file:///d:/Project/IELTS%20SaaS/infra/migrations/001_initial_schema.sql) | User credentials, roles (`student`, `content_creator`, `reviewer`, `admin`), account status |
| | [`profiles`](file:///d:/Project/IELTS%20SaaS/infra/migrations/001_initial_schema.sql) | IELTS goal (Academic/GT), target band (0.0-9.0), test date, daily study minutes, language |
| | [`consents`](file:///d:/Project/IELTS%20SaaS/infra/migrations/001_initial_schema.sql) | Granular user opt-ins: voice recording, AI processing, model training opt-in, terms |
| **Media & Audio** | [`media_assets`](file:///d:/Project/IELTS%20SaaS/infra/migrations/001_initial_schema.sql) | Official listening audio, reading figures, transcripts, and licensing metadata |
| | [`recordings`](file:///d:/Project/IELTS%20SaaS/infra/migrations/001_initial_schema.sql) | Student speaking test recordings with retention policy and deletion support |
| **Content & Bank** | [`lessons`](file:///d:/Project/IELTS%20SaaS/infra/migrations/001_initial_schema.sql) | Structured learning modules by skill (Reading, Listening, Writing, Speaking, General) |
| | [`questions`](file:///d:/Project/IELTS%20SaaS/infra/migrations/001_initial_schema.sql) | Question bank items, types (TFNG, MCQ, completion, essay prompt, cue card), rights status |
| | [`question_options`](file:///d:/Project/IELTS%20SaaS/infra/migrations/001_initial_schema.sql) | Options for MCQ/matching questions; `is_correct` restricted from public API queries |
| **Exam Engine** | [`exams`](file:///d:/Project/IELTS%20SaaS/infra/migrations/001_initial_schema.sql) | Weekly mocks and diagnostic tests (test type, config version, scheduling) |
| | [`exam_sections`](file:///d:/Project/IELTS%20SaaS/infra/migrations/001_initial_schema.sql) | Section configuration per skill, sequence index, duration in seconds, instructions |
| | [`attempts`](file:///d:/Project/IELTS%20SaaS/infra/migrations/001_initial_schema.sql) | Learner exam attempts, server-side authoritative timer (`deadline_at`), status |
| | [`responses`](file:///d:/Project/IELTS%20SaaS/infra/migrations/001_initial_schema.sql) | Student answers per question, debounced auto-saves, raw awarded marks |
| | [`scores`](file:///d:/Project/IELTS%20SaaS/infra/migrations/001_initial_schema.sql) | Component and overall estimated band scores, confidence labels, unofficial disclaimer |
| | [`feedback`](file:///d:/Project/IELTS%20SaaS/infra/migrations/001_initial_schema.sql) | AI rubric evaluations (TA/TR, CC, LR, GRA) and revision suggestions |
| **Learning Support** | [`study_plans`](file:///d:/Project/IELTS%20SaaS/infra/migrations/001_initial_schema.sql) | Personalized daily task breakdown, preserving historical plan iterations |
| | [`mistake_notes`](file:///d:/Project/IELTS%20SaaS/infra/migrations/001_initial_schema.sql) | Personal Mistake Notebook: categorized error tags, reasoning, mastery retry status |
| **RAG Knowledge Base**| [`content_sources`](file:///d:/Project/IELTS%20SaaS/infra/migrations/001_initial_schema.sql) | Governed knowledge registry (official guidance, teaching notes) with permission checks |
| | [`content_chunks`](file:///d:/Project/IELTS%20SaaS/infra/migrations/001_initial_schema.sql) | Heading-aware chunk embeddings (`pgvector`), GIN full-text index, hash deduplication |
| | [`tutor_reports`](file:///d:/Project/IELTS%20SaaS/infra/migrations/001_initial_schema.sql) | Learner reporting queue for low-confidence or hallucinated tutor responses |
| **System Operations** | [`ai_jobs`](file:///d:/Project/IELTS%20SaaS/infra/migrations/001_initial_schema.sql) | Async queue state tracking (writing evaluation, audio transcription, vector indexing) |
| | [`audit_logs`](file:///d:/Project/IELTS%20SaaS/infra/migrations/001_initial_schema.sql) | Security event logs, admin approvals, content publishing, data deletion trails |

---

## 3. Official IELTS Score Rounding Rules (Section 5.3)

In accordance with official IELTS standards, the average of the 4 skill component scores is rounded as follows:

$$
\text{Overall Band} = 
\begin{cases} 
\lfloor \mu \rfloor, & \text{if } (\mu - \lfloor \mu \rfloor) < 0.25 \\
\lfloor \mu \rfloor + 0.5, & \text{if } 0.25 \le (\mu - \lfloor \mu \rfloor) < 0.75 \\
\lfloor \mu \rfloor + 1.0, & \text{if } (\mu - \lfloor \mu \rfloor) \ge 0.75 
\end{cases}
$$

### Test Table Verification:
* `6.00` $\rightarrow$ `6.0` (unmodified)
* `6.25` $\rightarrow$ `6.5` (fraction $0.25$ rounds up to next half band)
* `6.50` $\rightarrow$ `6.5` (unmodified)
* `6.75` $\rightarrow$ `7.0` (fraction $0.75$ rounds up to next whole band)

This logic is pre-compiled directly in the database as:
```sql
SELECT ielts_round_band(6.25); -- Output: 6.5
SELECT ielts_calculate_overall_band(6.5, 6.0, 6.5, 6.0); -- Average 6.25 -> Output: 6.5
```

---

## 4. RAG Hybrid Search & Gating (Section 10.4)

Chunks are indexed using two complementary strategies:
1. **Semantic Vector Search**: HNSW cosine distance index on `content_chunks.embedding` (`VECTOR(1536)`).
2. **Lexical Keyword Search**: GIN index on `content_chunks.fts` using PostgreSQL's simple configuration.

### Ingestion Constraint:
```sql
CONSTRAINT publishable_only CHECK (
    status <> 'published' OR permission_status IN ('owned', 'licensed', 'link_only')
)
```
Ensures that no content item can ever enter `published` state if its permission status is `pending` or `prohibited`.
