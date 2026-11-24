# BandBloom IELTS

> **Project Status:** Under active development.

BandBloom helps candidates preparing for the IELTS Academic and General Training examinations build practical readiness on a computer-delivered test interface. Learners can practice standard Reading and Listening question formats, complete timed writing and speaking diagnostic tasks, review mistake notes categorized by cognitive error traps, and follow an adaptive study schedule.

---

## Verified Learner Workflow

A standard learner session in BandBloom follows a three-step cycle:

1. **Discover & Practice**: Select a skill from the Student Portal or Practice Hub ([`apps/web/src/app/practice/page.tsx`](apps/web/src/app/practice/page.tsx)), such as the Academic Reading Lab or the 4-part Listening practice set.
2. **Answer & Submit**: Work through authentic question formats (such as True/False/Not Given with strict word limits or Form Completion with calibrated audio playback), auto-saving responses and submitting for evaluation.
3. **Diagnostic Feedback & Mistake Tracking**: Inspect itemized feedback with paragraph-level evidence or synchronized transcript cues, save incorrect items to the Mistake Notebook ([`apps/web/src/app/notebook/page.tsx`](apps/web/src/app/notebook/page.tsx)), and review diagnostic score progression on the Results dashboard ([`apps/web/src/app/results/page.tsx`](apps/web/src/app/results/page.tsx)).

---

## Core Implemented Features

### 1. Reading Module
- **Stream-Aware Tracks**: Supports both **IELTS Academic** (extended analytical texts) and **IELTS General Training** (practical notices, workplace texts, and general-interest passages).
- **14 Question Formats**: Catalogs all standard IELTS Reading formats in [`apps/web/src/lib/reading-module-data.ts`](apps/web/src/lib/reading-module-data.ts): True / False / Not Given, Yes / No / Not Given, Matching Headings, Matching Information, Matching Features, Matching Sentence Endings, Sentence Completion, Summary Completion, Note Completion, Table Completion, Flow-chart Completion, Diagram Label Completion, Multiple Choice (Single & Multiple), and Short-Answer Questions. Each format includes strategy tips, common traps, and sample micro-drills.
- **Answer Validation Engine**: Evaluates candidate responses with case-insensitivity, whitespace trimming, punctuation stripping, hyphenated word counting (`state-of-the-art` = 1 word), strict word limit enforcement (`NO MORE THAN THREE WORDS`, `ONE NUMBER ONLY`), and accepted variants (`15` and `fifteen`).
- **Passage Practice Labs**: Provides interactive passages with paragraph-level evidence mapping, detailed explanations, and 1-click mistake saving.
- **Indicative Raw Score Conversion**: Maintained conversion tables mapping raw scores (out of 40) to indicative Reading band scores, paired with equating disclosures explaining live test boundary fluctuations.

### 2. Listening Module
- **Academic and General Training Parity**: Reflects official test design where Listening recordings, questions, and scoring boundaries are identical across both candidate tracks.
- **Calibrated 4-Part Structure**: Features a complete 4-part test totaling 40 distinct questions across Social Context Dialogues (Part 1), Community Monologues (Part 2), Educational Discussions (Part 3), and Academic Lectures (Part 4).
- **Audio Playback Engine**: Plays audio via HTML5 Audio with physical local `.wav` files located in [`apps/web/public/audio/listening/`](apps/web/public/audio/listening/), complemented by browser Web Speech API (`SpeechSynthesis`) fallback. All audio is explicitly labeled as `"Original BandBloom Synthetic Practice Audio"`.
- **Three Practice Modes**:
  - *Learning Mode*: Full playback controls, seeking slider, variable speed (0.75x, 1x, 1.25x), hint prompts, and synchronized timestamped transcripts.
  - *Timed Practice*: Sectional drills with 30-second question preview and 2-minute review countdowns.
  - *Exam Simulation*: Strict single-play rule where audio plays once, seeking and speed alterations are locked, and answer review is deferred until after submission.
- **13 Question Formats**: Implements micro-drills and distractor analysis in [`apps/web/src/lib/listening-module-data.ts`](apps/web/src/lib/listening-module-data.ts) for Form Completion, Note Completion, Table Completion, Flow-chart Completion, Summary Completion, Sentence Completion, Short-Answer Questions, Multiple Choice (Single Answer), Multiple Choice (Multiple Answers), Matching Features & Opinions, Plan Labelling, Map Labelling, and Diagram Labelling.

### 3. Practice Hub
- **Writing Evaluator**: Dual Task 1 and Task 2 input panels featuring live word counting, minimum length warnings (150 words for Task 1; 250 words for Task 2), and official 2:1 Task 2 to Task 1 examiner weighting:
  $$\text{Writing Band} = \text{round}\left(\frac{\text{Task 1} \times 1 + \text{Task 2} \times 2}{3}\right)$$
- **Speaking Recorder**: Part 2 candidate task card with automated 1-minute notes prep countdown, 2-minute recording timer, recognized transcript editing, and educational diagnostic breakdown across Fluency, Lexical Resource, and Grammar (with audio-based pronunciation limitation disclosures).

### 4. Computer-Delivered Exam Simulator (CD-IELTS)
- **Authentic Test Ergonomics**: Full-screen simulator interface ([`apps/web/src/app/mock-centre/exam/page.tsx`](apps/web/src/app/mock-centre/exam/page.tsx)) with a question navigation matrix showing answered, unanswered, and review-flagged questions.
- **Independent Section Eligibility Gating**: In [`apps/web/src/server/services/mock.service.ts`](apps/web/src/server/services/mock.service.ts), full-mock eligibility for Reading and Listening is validated **independently** per included section before starting an attempt:
  - *Reading Full-Mock Check (`checkFullReadingMockEligibility`)*: Requires strictly **40 distinct scoreable Reading questions** across at least 3 passages/sections, stream consistency, positive allocated marks, and complete answer keys.
  - *Listening Full-Mock Check (`checkFullListeningMockEligibility`)*: Requires strictly **40 distinct scoreable Listening questions** across 4 parts (10 questions per part), on-disk `.wav` audio files, verified transcripts in `audio_transcripts`, positive marks, and answer keys.
- **Server-Authoritative Timers**: Prevents client-side clock manipulation; validates submission deadlines on the server with a 60-second network grace window, auto-submitting on expiration.
- **Debounced Autosave**: Candidate responses are automatically saved in real time via `PATCH /api/attempts/[id]`.
- **Pre-Submission Answer Security**: Exam and active attempt endpoints (`GET /api/exams/[id]` and `GET /api/attempts/[id]`) strip all answer keys, explanations, and variants prior to final test submission.

### 5. Mistake Notebook
- **Dedicated Route**: Implemented at [`apps/web/src/app/notebook/page.tsx`](apps/web/src/app/notebook/page.tsx) and managed by [`apps/web/src/server/services/notebook.service.ts`](apps/web/src/server/services/notebook.service.ts).
- **Cognitive Trap Categorization**: Tags mistakes with specific error categories (*keyword trap*, *paraphrase miss*, *inference trap*, *word limit breach*, *singular/plural*, *distractor trap*).
- **Supported Learner Actions**:
  - Filter notes by skill (`all`, `reading`, `listening`, `writing`, `speaking`) and status (`all`, `pending`, `mastered`, `retest_needed`).
  - Create manual mistake entries with question prompts, student answers, and explanation reasoning.
  - Toggle retry status between `pending` and `mastered` with optimistic UI updates.
  - Automatically save mistakes directly from Reading and Listening practice labs via `POST /api/notebook`.

### 6. Adaptive Study Plan
- **Time-Constrained Scheduling**: Schedules weekly preparation tasks scaled strictly to the learner's configured daily study preference (e.g. 30 vs 120 minutes per day).
- **Capacity-Aware Rescheduling**: Allows moving tasks between days while enforcing maximum aggregate daily time limits.
- **Weakness Prioritization**: Prioritizes exercises targeting unresolved cognitive error tags from the learner's Mistake Notebook.
- **Self-Reflection Persistence**: Preserves weekly learner reflection notes across study plan revisions.

### 7. Grounded AI Tutor
- **Curriculum & Rubric Grounding**: The tutor service ([`apps/web/src/server/services/tutor.service.ts`](apps/web/src/server/services/tutor.service.ts)) checks student queries via `POST /api/tutor/chat`, queries published database chunks from `content_chunks`, or falls back to standard rubric definitions (`mode: "rubric_grounded_fallback"`).
- **Heuristic Keyword Responses**: Provides targeted guidance for core exam challenges (such as True/False/Not Given discrimination, Task 2 essay structure, and Speaking Part 2 timing) with source citation labels and suggested follow-up questions.
- **Input Boundaries**: Enforces character caps (maximum 4,000 characters per message) and daily per-user query limits to encourage focused study sessions.

### 8. Results & Score Progression
- **Dual Reporting & Band Calculation Rules**:
  - *Diagnostic Drills & Partial Evaluations*: Reading and Listening sets with fewer than 40 questions in that section, as well as Speaking Part 2 drills (which withhold Pronunciation as `assessment_limited`), return `estimatedBand: null` and `confidenceLabel: "insufficient_evidence"`. Objective raw accuracy counts (`rawScore / maxScore`, percentage) are shown, and results pages ([`apps/web/src/app/results/[id]/page.tsx`](apps/web/src/app/results/[id]/page.tsx)) disclose that short diagnostic exercises do not provide band calibrations.
  - *Single-Skill Practice Estimates ([`apps/web/src/server/services/practice.service.ts`](apps/web/src/server/services/practice.service.ts))*: Eligible 40-question Reading (`full_reading_mock`) or 40-question Listening (`full_listening_mock`) practice evaluations produce a skill-level indicative estimated band from their respective conversion guide, while Writing computes a 2:1 weighted composite Writing band. *(Active-development caveat: `persistPracticeAttempt` currently writes a non-null single-skill practice `estimatedBand` to both that skill row and the `overall` row in `scores`.)*
  - *Four-Skill Overall Estimated Band Score*: Both [`apps/web/src/server/services/mock.service.ts`](apps/web/src/server/services/mock.service.ts) (`ieltsCalculateOverallBand`) and [`infra/migrations/001_initial_schema.sql`](infra/migrations/001_initial_schema.sql) (`ielts_calculate_overall_band`) return `null` unless **all four skill scores** (Listening, Reading, Writing, and Speaking) are available. When all four component bands exist, their arithmetic mean `(L + R + W + S) / 4.0` is rounded using Section 5.3 half-band rounding:
    $$\text{Fraction} < 0.25 \rightarrow \lfloor \text{band} \rfloor$$
    $$0.25 \le \text{Fraction} < 0.75 \rightarrow \lfloor \text{band} \rfloor + 0.5$$
    $$\text{Fraction} \ge 0.75 \rightarrow \lfloor \text{band} \rfloor + 1.0$$
  - *Current Mock Submission Limitation*: In `submitExamAttempt` ([`apps/web/src/server/services/mock.service.ts`](apps/web/src/server/services/mock.service.ts)), `diagnostic` submissions persist `NULL` scores (`insufficient_evidence`). Non-diagnostic mock submissions (`full_mock` or `sectional_practice`) currently feed static placeholder component scores (`7.5`, `7.0`, `6.5`, `7.0`) into `ieltsCalculateOverallBand` rather than dynamically grading saved mock `responses` yet. Unevaluated skill components remain displayed as `Unavailable`.

---

## Content Coverage & Verification

| Content Category | Verified Repository Inventory | Implementation Status |
| :--- | :--- | :--- |
| **Reading Question Types** | 14 official question formats with strategies, common traps, and sample micro-drills | Implemented in [`apps/web/src/lib/reading-module-data.ts`](apps/web/src/lib/reading-module-data.ts) |
| **Reading Passages & Questions** | 1 Academic passage ("Megacities & Climate Adaptation", 4 calibrated questions) and 1 General Training passage ("Workplace Fire Safety", 4 calibrated questions) | Implemented in practice data and seeded in database migrations 006 & 008 |
| **Listening Question Types** | 13 official question formats with distractor analysis and sample micro-drills | Implemented in [`apps/web/src/lib/listening-module-data.ts`](apps/web/src/lib/listening-module-data.ts) |
| **Listening Audio & Questions** | 1 complete 4-part Listening test (40 distinct questions, 4 physical `.wav` files totaling ~29.8 MB, and synchronized timestamped transcripts) | Implemented in code, public audio directory, and migration 009 |
| **Writing Prompts** | Academic Task 1, General Training Task 1, and Task 2 discursive essay prompts | Implemented in Practice Hub with live word counting and 2:1 weighting |
| **Speaking Prompts** | Part 2 candidate task card with automated preparation and recording turn timers | Implemented in Practice Hub with educational diagnostic breakdown |
| **Vocabulary Bank** | Academic Word List (AWL) items with collocation patterns and Leitner spaced repetition toggles | Seeded via migration 004 and accessible at `/vocabulary` |
| **Mock Exams** | Catalog entries for Academic and General Training Full Mocks and Sectional sets | Seeded in migrations 002, 006, and 007; Reading and Listening full-mock eligibility are checked independently and each requires 40 valid questions in its respective section |

---

## Route Protection & Security Architecture

The application enforces authentication, session validation, and tenant isolation through [`apps/web/src/proxy.ts`](apps/web/src/proxy.ts):

- **Proxy-Based Edge Route Guard**: Uses Next.js Turbopack proxy routing to protect authenticated student portal pages (`/dashboard`, `/study-plan`, `/mock-centre`, `/skills/*`, `/practice`, `/notebook`, `/vocabulary`, `/tutor`, `/results`, `/settings`, `/lessons`).
- **Unauthenticated Handling**:
  - Protected web pages automatically redirect to `/login?next=...`, validated by open-redirect sanitization in [`apps/web/src/lib/redirect.ts`](apps/web/src/lib/redirect.ts).
  - Protected API routes directly return `401 Unauthorized` JSON responses.
- **Authenticated Handling**: Logged-in users attempting to access `/login` or `/signup` are redirected to `/dashboard` or their intended destination.
- **Tenant Isolation**: Database queries enforce user scoping (`WHERE user_id = $1`) on attempts, responses, scores, and mistake notes, preventing cross-student data leakage.
- **Pre-Submission Sanitization**: Exam and attempt inspection endpoints omit answer keys, explanations, and accepted variants while attempts remain active.

---

## Developer Quick Start

Follow these steps to run BandBloom locally for development.

### 1. Prerequisites
- **Node.js**: `v20.9.0` or higher (Node 20 or Node 24 LTS recommended).
- **Package Manager**: `npm` `v9.x` or `v10.x`.
- **Docker & Docker Compose**: For local PostgreSQL 16 (with `pgvector`) and Redis services.
- **Python** *(optional)*: Python `3.10+` if running SQLAlchemy database models or Python unit tests.

### 2. Clone Repository & Install Dependencies
Run from the repository root:
```bash
git clone https://github.com/hasinjubaier/BandBloom.git
cd BandBloom
npm install
```

### 3. Configure Environment Variables
Copy the canonical example configuration to the web application's local environment file:
```bash
cp .env.example apps/web/.env.local
```

Ensure the database settings match your local environment. Default connection settings:
```ini
DATABASE_URL=postgresql://bandbloom_user:bandbloom_password@127.0.0.1:5432/bandbloom_db
SYNC_DATABASE_URL=postgresql://bandbloom_user:bandbloom_password@127.0.0.1:5432/bandbloom_db
PGHOST=127.0.0.1
PGPORT=5432
PGUSER=bandbloom_user
PGPASSWORD=bandbloom_password
PGDATABASE=bandbloom_db
```

### 4. Start Local Database Services
Launch the PostgreSQL and Redis containers using Docker Compose from the repository root:
```bash
docker compose -f infra/docker/docker-compose.yml up -d
```
*Note: The PostgreSQL container mounts `infra/migrations/` to `/docker-entrypoint-initdb.d:ro`, automatically executing migrations sequentially when the database volume is first created.*

If applying migrations manually against an existing PostgreSQL instance, run them in sequential order:
```bash
docker exec -i bandbloom-postgres psql -U bandbloom_user -d bandbloom_db < infra/migrations/001_initial_schema.sql
docker exec -i bandbloom-postgres psql -U bandbloom_user -d bandbloom_db < infra/migrations/002_seed_data.sql
docker exec -i bandbloom-postgres psql -U bandbloom_user -d bandbloom_db < infra/migrations/003_auth_and_profile_extensions.sql
docker exec -i bandbloom-postgres psql -U bandbloom_user -d bandbloom_db < infra/migrations/004_vocabulary.sql
docker exec -i bandbloom-postgres psql -U bandbloom_user -d bandbloom_db < infra/migrations/005_study_plan_unique_active.sql
docker exec -i bandbloom-postgres psql -U bandbloom_user -d bandbloom_db < infra/migrations/006_practice_hub_seeds.sql
docker exec -i bandbloom-postgres psql -U bandbloom_user -d bandbloom_db < infra/migrations/007_mock_centre_refactor.sql
docker exec -i bandbloom-postgres psql -U bandbloom_user -d bandbloom_db < infra/migrations/008_reading_module_seeds.sql
docker exec -i bandbloom-postgres psql -U bandbloom_user -d bandbloom_db < infra/migrations/009_listening_module_seeds.sql
```

### 5. Seed Demo Account Credentials
Hash and seed passwords for the built-in demo accounts:
```bash
node apps/web/scripts/seed-passwords.js
```
*This configures the password `Password123!` for `student@bandbloom.test` and `admin@bandbloom.test`.*

### 6. Start the Development Server
Run from the repository root:
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your web browser.

### 7. Run Test Suites & Quality Checks
Run tests from the repository root:

- **Core Architecture & Integration Tests** *(requires development server running at `http://localhost:3000` and database running)*:
  ```bash
  node --test tests/listening_module_architecture.test.mjs \
              tests/reading_module_architecture.test.mjs \
              tests/mock_centre_architecture.test.mjs \
              tests/practice_hub.test.mjs \
              tests/reading_security_matrix.test.mjs \
              tests/study_plan_architecture.test.mjs
  ```
- **Backend Database Integration Test Runner** *(executes `node tests/run_backend_tests.js`, connecting directly to PostgreSQL)*:
  ```bash
  npm test
  ```
- **Python SQLAlchemy Model & Rounding Tests** *(requires Python 3.10+ with `apps/api/requirements.txt` installed)*:
  ```bash
  python -m unittest tests/test_database.py
  ```
- **TypeScript Compilation Check**:
  ```bash
  node apps/web/node_modules/typescript/bin/tsc -p apps/web/tsconfig.json --noEmit
  ```
- **Production Build**:
  ```bash
  npm run build
  ```

---

## Technical Overview

### Monorepo Structure
```
BandBloom Root
├── apps/
│   ├── web/                   # Next.js 16 full-stack App Router application
│   │   ├── public/audio/      # Physical .wav audio assets for listening practice
│   │   ├── scripts/           # seed-passwords.js credential script
│   │   └── src/
│   │       ├── app/           # App Router pages and dynamic API route handlers
│   │       ├── components/    # Layout, portal, auth, and UI component modules
│   │       ├── context/       # React 19 Language, Theme, and Exam contexts
│   │       ├── lib/           # Question data libraries, validation engines, redirect utility
│   │       ├── proxy.ts       # Edge route protection & authentication gate
│   │       └── server/        # Server architecture: DB pool, auth, and 9 domain services
│   └── api/                   # Python / SQLAlchemy 2.0 backend model definitions
│       ├── alembic/           # Alembic migration configuration
│       └── src/db/models/     # Declarative relational models mirroring PostgreSQL tables
├── infra/
│   ├── docker/                # Docker Compose definition (PostgreSQL 16 with pgvector, Redis 7)
│   └── migrations/            # 9 sequential SQL schema and seed migration scripts
└── tests/                     # Node.js and Python test suites
```

### Technology Stack
- **Web Framework**: [Next.js](https://nextjs.org) `16.4.2` (App Router, Turbopack, Partial Prerendering) with [React](https://react.dev) `19.3.0`.
- **Language & Styling**: [TypeScript](https://www.typescriptlang.org) `5.x` and [Tailwind CSS](https://tailwindcss.com) `v4`.
- **Database & Pooling**: [PostgreSQL](https://www.postgresql.org) `16` with native connection pooling via [`pg`](https://node-postgres.com/) (`^8.23.1`) and stored scoring functions.
- **Session Security**: 64-character cryptographic tokens hashed with SHA-256 in the database; password encryption via [`bcryptjs`](https://www.npmjs.com/package/bcryptjs).
- **Python Modeling**: Python `3.10+` with [SQLAlchemy](https://www.sqlalchemy.org) `2.0+` declarative models.
- **Containerization**: Docker Compose orchestrating PostgreSQL with `pgvector` and Redis 7.

---

## Disclaimers & Licensing

### IELTS Trademark & Non-Affiliation Disclosure
**IELTS®** is a registered trademark of the **University of Cambridge ESOL Examinations**, the **British Council**, and **IDP Education Australia**.

BandBloom IELTS is an independent preparation platform developed by BandBloom. BandBloom is not endorsed by, affiliated with, authorized, or sponsored by the official IELTS test owners. Practice tests, AI evaluations, diagnostic breakdowns, and band score calculations provided on this platform are unofficial educational estimates designed exclusively for study preparation.

### Source Code License
The source code, user interface designs, curriculum fixtures, and practice materials within this repository are proprietary. For licensing inquiries, institutional partnerships, or contribution access, contact the repository maintainers.
