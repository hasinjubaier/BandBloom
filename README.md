# BandBloom IELTS — Smart Computer-Delivered IELTS Preparation SaaS

> **Official Repository Documentation**  
> **Architecture Version:** 2.0  
> **Framework:** Next.js 16 (App Router, Turbopack) &bull; React 19 &bull; TypeScript 5 &bull; Tailwind CSS v4  
> **Database:** PostgreSQL 16+ with `pgvector` &bull; Redis 7  
> **Repository:** [https://github.com/hasinjubaier/BandBloom.git](https://github.com/hasinjubaier/BandBloom.git)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Features](#2-features)
3. [Technology Stack](#3-technology-stack)
4. [Project Architecture](#4-project-architecture)
5. [Project Directory Structure](#5-project-directory-structure)
6. [Prerequisites](#6-prerequisites)
7. [Installation and Local Development](#7-installation-and-local-development)
8. [Environment Variables](#8-environment-variables)
9. [Application Routes](#9-application-routes)
10. [Authentication and Authorization](#10-authentication-and-authorization)
11. [Database and Data Model](#11-database-and-data-model)
12. [AI Tutor and RAG Architecture](#12-ai-tutor-and-rag-architecture)
13. [Testing and Code Quality](#13-testing-and-code-quality)
14. [Deployment](#14-deployment)
15. [Troubleshooting & Known Gotchas](#15-troubleshooting--known-gotchas)
16. [Security, Ethics & Privacy](#16-security-ethics--privacy)
17. [Contribution Guidelines](#17-contribution-guidelines)
18. [License and Legal Attribution](#18-license-and-legal-attribution)

---

## 1. Project Overview

**BandBloom IELTS** is an international preparation SaaS platform built for candidates preparing for the **IELTS Academic** and **IELTS General Training** examinations.

### The Problem
Traditional IELTS preparation suffers from three acute pain points:
1. **Ergonomic Shock on Test Day**: The vast majority of candidates now take the official computer-delivered IELTS (CD-IELTS) test, but practice using paper textbooks. On exam day, they encounter split-screen reading passages, rigid question navigation matrices, and server-authoritative countdown timers.
2. **Subjective & Slow Grading**: Writing and Speaking assessments often take days or weeks for human tutors to score, offering generic advice rather than actionable diagnostic breakdown against official band criteria.
3. **Hallucinated Guidance & Scoring Rumors**: Free online test materials frequently propagate unsupported scoring myths and hallucinated explanations without citing verified test specifications.

### The Solution
BandBloom reproduces the ergonomics of the official computer-delivered IELTS exam environment. It pairs rigorous simulation with immediate diagnostic AI evaluations grounded in official specifications, mathematical Section 5.3 band rounding rules, a personal mistake notebook, and a bilingual interface tailored for global learners.

### Current Implementation Status
- **Frontend Core**: Production-ready Next.js 16 App Router application compiled with Turbopack, supporting 32 static and dynamic routes.
- **Design System**: Tailored IELTS education theme featuring pale teal canvases, rich navy typography, dark/light themes, and responsive mobile drawers.
- **State Management**: Reactive React 19 context providers for full exam sessions, bilingual translations (English & Bengali), and user preferences.
- **Database Architecture**: Comprehensive PostgreSQL 16 schema consisting of 22 normalized relational tables, `pgvector` HNSW semantic embeddings, and Docker Compose orchestration.
- **Authentication Suite**: Fully styled, accessible `/login`, `/signup`, and `/forgot-password` pages with client and server-side validation.

---

## 2. Features

### All Four IELTS Skill Modules
- **Reading**: Split-screen dual-pane viewer displaying academic reading passages alongside the question matrix. Supports authentic question formats:
  - True / False / Not Given & Yes / No / Not Given
  - Matching Headings & Information Location
  - Sentence Completion, Summary Completion & Diagram Labeling
- **Listening**: Audio controller with time-synchronized audio playback, official exam-paced pauses, and real-time form-filling inputs.
- **Writing**: Task 1 (academic graphs / general letters) and Task 2 (discursive essays) simulator with live word counters, distraction-free text editor, and grading breakdowns against official criteria:
  - *Task Achievement / Task Response (TA/TR)*
  - *Coherence & Cohesion (CC)*
  - *Lexical Resource (LR)*
  - *Grammatical Range & Accuracy (GRA)*
- **Speaking**: 3-part interactive interview simulation:
  - *Part 1*: Everyday familiar topics
  - *Part 2*: Long turn cue-card with an automated 1-minute preparation countdown timer and 2-minute recording window
  - *Part 3*: In-depth two-way abstract discussion
  - Built-in audio recorder with transparent microphone permissions and consent gates.

### Computer-Delivered Exam Simulation (CD-IELTS)
- **Distraction-Free Layout**: Dedicated `/mock-centre/exam` route that suppresses marketing navigation, footers, and notifications.
- **Ergonomic Question Navigation**: 40-question bottom matrix with answered, unanswered, and "Review" flags.
- **Server-Authoritative Countdown Timers**: Prevents client clock tampering; auto-submits upon deadline expiration.
- **Debounced Auto-Saves**: Guarantees answer persistence during network interruptions.

### Official Band Rounding Engine (Section 5.3)
In strict accordance with official IELTS scoring specifications, the average of the 4 skill component scores is rounded mathematically:
- An average ending in `.25` rounds **UP** to the next half band (e.g., $6.25 \rightarrow 6.5$).
- An average ending in `.75` rounds **UP** to the next whole band (e.g., $6.75 \rightarrow 7.0$).
- Implemented both in frontend TypeScript (`calculateOverallBand`) and in PostgreSQL schema functions (`ielts_round_band`).

### Grounded AI Tutor & RAG Knowledge Base
- Explanations are strictly grounded in official test specifications (e.g. *IELTS Academic Reading Candidate Guide 2026*, *Official Scoring Tables*).
- Responses include source citation badges and evidence labels.
- Community feedback mechanism: learners can report ambiguous or low-confidence tutor responses to the review queue (`tutor_reports`).

### Personal Mistake Notebook & Vocabulary Spaced Repetition
- **Cognitive Trap Categorization**: Identifies errors by specific tags (*paraphrase miss*, *inference trap*, *keyword trap*, *word limit breach*, *singular/plural error*).
- **Academic Word List (AWL)**: Vocabulary bank organized by CEFR/Band levels (Band 6.0 to 8.5+) with collocation patterns and spaced repetition review schedules.

### Localization & Accessibility
- **Bilingual Interface**: Instant one-click toggle between English (`en`) and Bengali (`bn`) with zero page reloads.
- **Theme Switcher**: Smooth transitions between crisp light mode and deep teal dark mode (`#0A1C1B`).
- **WCAG 2.1 AA Compliance**: Semantic HTML, screen-reader status announcements (`aria-live`), and full keyboard navigation.

---

## 3. Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | [Next.js](https://nextjs.org) | `16.4.2` | App Router, Turbopack, Partial Prerendering, Server Actions |
| **Frontend Library** | [React](https://react.dev) | `19.3.0` | React 19 concurrent features, transitions, actions |
| **Language** | [TypeScript](https://www.typescriptlang.org) | `^5.0.0` | Strict type safety across components, models, and hooks |
| **Styling** | [Tailwind CSS](https://tailwindcss.com) | `^4.0.0` | Modern utility styling with `@tailwindcss/turbopack` |
| **Icons** | [Lucide React](https://lucide.dev) | `^1.60.0` | Consistent, accessible vector icon library |
| **Typography** | `next/font` | Google Geist | Optimized font delivery for Geist Sans and Geist Mono |
| **Database** | [PostgreSQL](https://www.postgresql.org) | `16+` | Relational database with custom scoring triggers |
| **Vector Search** | [pgvector](https://github.com/pgvector/pgvector) | `0.7.0+` | HNSW cosine similarity vector indexing for RAG embeddings |
| **Caching & Queues**| [Redis](https://redis.io) | `7-alpine` | Fast session storage, background worker coordination |
| **Containerization**| [Docker Compose](https://docs.docker.com/compose/) | `3.8` | Local database, Redis, and migration orchestration |
| **Database Testing**| [Python](https://www.python.org) & `psycopg` | `3.10+` | Automated SQL schema verification and constraint testing |

---

## 4. Project Architecture

The BandBloom codebase is organized as an enterprise monorepo managing the web client application, infrastructure migrations, architecture documents, and test harnesses:

```
BandBloom Monorepo Root
├── apps/
│   └── web/                   # Next.js App Router Web Application
├── infra/
│   ├── docker/                # Docker Compose services (PostgreSQL + pgvector, Redis)
│   └── migrations/            # SQL migration scripts (001_initial_schema, 002_seed_data)
├── docs/
│   └── architecture/          # Engineering blueprints (database entity specifications)
└── tests/                     # Live PostgreSQL test suite & schema validation scripts
```

### Layout Hierarchy & AppShell Architecture
`apps/web/src/components/layout/AppShell.tsx` acts as the master layout router:
- **Marketing & Educational Pages**: Renders `DisclaimerBanner`, the interactive `Navbar`, child content, and `Footer`.
- **Exam Simulation (`/mock-centre/exam`)**: Suppresses all marketing elements to provide an authentic, distraction-free computer exam interface.
- **Authentication Pages (`/login`, `/signup`, `/forgot-password`)**: Renders a focused canvas without marketing headers, featuring the two-column card layout.

### Context State Management
- `LanguageContext.tsx`: Manages active language (`en` vs `bn`), localized string mappings (`translations.ts`), and persists user preference.
- `ThemeContext.tsx`: Detects system color schemes, toggles `dark` class on the root HTML document, and synchronizes with localStorage.
- `ExamContext.tsx`: Maintains user profile goals, active exam attempts, component band calculations, mistake notebook records, and spaced repetition vocabularies.

### Custom Navigation & Scroll Restoration Hook
[`useLandingNavigation.ts`](file:///d:/Project/IELTS%20SaaS/apps/web/src/hooks/useLandingNavigation.ts) manages landing page interactions:
- Uses the **Navigation Timing API** (`performance.getEntriesByType('navigation')[0].type === 'reload'`) to detect real browser page refreshes.
- Automatically clears stale hash fragments (such as `#ai-tutor`) via `history.replaceState` and resets scroll position cleanly to the top Hero section `(0, 0)`.
- Implements a high-precision `requestAnimationFrame`-throttled scroll spy that tracks document coordinates (`getBoundingClientRect().top + window.scrollY`).

---

## 5. Project Directory Structure

```
d:\Project\IELTS SaaS
├── .env.example                       # Canonical environment variable specification
├── package.json                       # Monorepo root package.json (npm workspaces)
├── README.md                          # Master documentation (this file)
│
├── apps/
│   └── web/                           # Next.js frontend application
│       ├── package.json               # Frontend dependencies & Next.js scripts
│       ├── next.config.ts             # Next.js 16 Turbopack & compiler configuration
│       ├── tsconfig.json              # TypeScript strict configuration
│       ├── public/                    # Static assets (optimized WebP logos, illustrations)
│       │   ├── logo-icon.webp         # Brand emblem (books + sprout)
│       │   ├── brand-logo-horizontal.webp # Complete horizontal wordmark
│       │   ├── login-illustration.webp    # Educational study illustration
│       │   └── hero-ielts-v4.webp     # Hero section study materials illustration
│       └── src/
│           ├── app/                   # Next.js App Router routes & APIs
│           │   ├── layout.tsx         # Root layout with font and provider injection
│           │   ├── page.tsx           # Marketing landing page
│           │   ├── login/page.tsx     # Authentication login page
│           │   ├── signup/page.tsx    # Registration signup page
│           │   ├── forgot-password/   # Password reset request page
│           │   ├── onboarding/        # 4-step onboarding flow
│           │   ├── dashboard/         # Student performance dashboard
│           │   ├── mock-centre/       # Mock test hub & exam runner (/exam)
│           │   ├── results/[id]/      # Diagnostic score report
│           │   ├── skills/            # Skill modules (reading, listening, writing, speaking)
│           │   ├── tutor/             # Grounded AI tutor workspace
│           │   ├── study-plan/        # Interactive study scheduler
│           │   ├── vocabulary/        # Spaced repetition vocabulary builder
│           │   ├── notebook/          # Personal mistake notebook
│           │   ├── api/auth/register/ # Secure server registration endpoint
│           │   └── (legal pages)/     # terms, privacy, disclaimer, accessibility
│           ├── components/
│           │   ├── auth/              # LoginForm, SignupForm, LoginIllustration, SignupIllustration
│           │   ├── landing/           # HeroSection, SkillLabs, InteractiveGlobe, AITutor, etc.
│           │   ├── layout/            # Navbar, Footer, AppShell, DisclaimerBanner
│           │   └── ui/                # ScoreCalculatorModal, GoalBandSelector
│           ├── context/               # ExamContext, LanguageContext, ThemeContext
│           ├── data/                  # translations.ts, mockCurriculum.ts, mockQuestions.ts
│           └── hooks/                 # useLandingNavigation.ts
│
├── infra/                             # Infrastructure definitions
│   ├── docker/
│   │   └── docker-compose.yml         # PostgreSQL 16 (pgvector) & Redis 7 services
│   └── migrations/
│       ├── 001_initial_schema.sql     # 22 relational tables, triggers, and functions
│       └── 002_seed_data.sql          # Academic & GT seed data, practice tests
│
├── docs/
│   └── architecture/
│       └── database.md                # 22-entity schema blueprint & scoring math
│
└── tests/                             # Test verification suites
    ├── test_database.py               # Unit tests for schema models and constraints
    └── run_live_postgres_tests.py     # Live integration runner against PostgreSQL
```

---

## 6. Prerequisites

Ensure your development environment meets the following requirements:

- **Node.js**: `v20.9.0` or higher (Node 20 or Node 22 LTS recommended for Next.js 16).
- **Package Manager**: `npm` `v9.x`+ or `v10.x`+ (monorepo scripts are configured using npm workspaces).
- **Docker & Docker Compose** *(Optional for local database)*: Docker Desktop or Docker Engine v24+.
- **Python** *(Optional for database tests)*: Python `3.10`+ with `psycopg` (binary) and `pytest`.

---

## 7. Installation and Local Development

### 1. Clone the Repository
```bash
git clone https://github.com/hasinjubaier/BandBloom.git
cd BandBloom
```

### 2. Install Dependencies
Install dependencies across all monorepo workspaces:
```bash
npm install
```

### 3. Configure Environment Variables
Copy the example environment configuration into the web app:
```bash
cp .env.example apps/web/.env.local
```

### 4. Start the Development Server
Launch the Next.js development server powered by Turbopack:
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser. The application updates automatically upon saving changes.

### 5. Build for Production
To validate TypeScript and build the optimized production bundle:
```bash
npm run build
```
To run the production build locally:
```bash
npm run start
```

### 6. (Optional) Start Local Database Services
To launch local PostgreSQL with `pgvector` and Redis:
```bash
docker compose -f infra/docker/docker-compose.yml up -d
```
The database will automatically initialize all 22 tables and seed data from `infra/migrations/`.

---

## 8. Environment Variables

All variables are defined in [`.env.example`](file:///d:/Project/IELTS%20SaaS/.env.example). Never commit real secrets or production credentials to source control.

| Variable Name | Required | Context | Description & Example Value |
| :--- | :---: | :---: | :--- |
| `APP_ENV` | Optional | Server | Runtime environment (`development`, `staging`, `production`) |
| `APP_NAME` | Optional | Shared | Application display identifier (`BandBloom`) |
| `PORT` | Optional | Server | Local web server port (default: `3000` / `8000`) |
| `DATABASE_URL` | Optional | Server | Async PostgreSQL connection string (`postgresql+asyncpg://...`) |
| `SYNC_DATABASE_URL` | Optional | Server | Synchronous PostgreSQL connection string (`postgresql://...`) |
| `REDIS_URL` | Optional | Server | Redis server connection string (`redis://localhost:6379/0`) |
| `OBJECT_STORAGE_ENDPOINT` | Optional | Server | S3/MinIO endpoint (`http://localhost:9000`) |
| `OBJECT_STORAGE_ACCESS_KEY` | Optional | Server | Object storage access key |
| `OBJECT_STORAGE_SECRET_KEY` | Optional | Server | Object storage secret key |
| `OBJECT_STORAGE_BUCKET` | Optional | Server | Bucket name (`bandbloom-private-media`) |
| `SIGNED_URL_TTL_SECONDS` | Optional | Server | Pre-signed URL expiration in seconds (default: `300`) |
| `LLM_API_KEY` | Optional | Server | OpenAI / Gemini API key for AI tutor grading |
| `LLM_MODEL` | Optional | Server | Language model identifier (e.g. `gpt-4o-mini`) |
| `EMBEDDING_MODEL` | Optional | Server | Embedding model identifier (`text-embedding-3-small`) |
| `EMBEDDING_DIMENSION` | Optional | Server | Vector embedding dimension size (default: `1536`) |
| `RAG_TOP_K` | Optional | Server | Number of relevant chunks retrieved per query (default: `8`) |
| `RAG_MIN_RELEVANCE` | Optional | Server | Cosine similarity cutoff threshold (default: `0.72`) |
| `MAX_TUTOR_REQUEST_CHARS` | Optional | Server | Character limit for learner prompt inputs (default: `4000`) |
| `TUTOR_PER_USER_DAILY_QUOTA`| Optional | Server | Daily AI prompt limit per learner account (default: `25`) |
| `GOOGLE_CLIENT_ID` | Optional | Server | OAuth client ID for Google Sign-in |
| `GOOGLE_CLIENT_SECRET` | Optional | Server | OAuth client secret for Google Sign-in |

---

## 9. Application Routes

The application features 32 compiled routes:

| Route Path | Type | Description |
| :--- | :---: | :--- |
| `/` | `Static` | Marketing landing page: Hero, Interactive 3D Globe, Skill Labs, AI Tutor, Band Calculator |
| `/login` | `Static` | Dedicated login page with email/password form, remember me, and Google OAuth button |
| `/signup` | `Static` | Dedicated registration page with name, email, password strength checks, and legal consent |
| `/forgot-password` | `Static` | Secure password reset request page with anti-enumeration protection |
| `/onboarding` | `Static` | 4-step student setup: track selection, target band, exam date, daily goal, AI consent |
| `/dashboard` | `Static` | Student portal with band projection, skill readiness radar, daily study tasks |
| `/mock-centre` | `Static` | Full-length exam hub and diagnostic test selector |
| `/mock-centre/exam` | `Static` | Distraction-free full-screen CD-IELTS computer exam simulation |
| `/results/[id]` | `Partial`| Diagnostic score report with Section 5.3 rounding, criteria breakdown, and feedback |
| `/skills/reading` | `Static` | Reading practice module with split-screen passage view and 3 question formats |
| `/skills/listening` | `Static` | Listening practice module with audio controller, transcript sync, note completion |
| `/skills/writing` | `Static` | Writing Task 1 & Task 2 timed simulator with authentic live word counters |
| `/skills/speaking` | `Static` | 3-part Speaking interview simulator with microphone recorder and cue card timer |
| `/tutor` | `Static` | Grounded AI tutor workspace with source citation badges and report queue |
| `/study-plan` | `Static` | Weekly roadmap with interactive completion checkboxes |
| `/vocabulary` | `Static` | Academic Word List & Collocation bank with spaced repetition mastery tiers |
| `/notebook` | `Static` | Personal Mistake Notebook categorizing errors by cognitive trap tags |
| `/lessons` | `Static` | Curriculum lesson library sorted by skill and CEFR band level |
| `/practice` | `Static` | Quick skill drill hub |
| `/settings` | `Static` | Student settings (target band, exam date, study goal, privacy consents, language, theme)|
| `/test-types` | `Static` | Academic vs General Training track comparison guide |
| `/test-day-guide` | `Static` | Computer-delivered test room ergonomics, ID requirements, and rules |
| `/terms` | `Static` | Terms of Service governing platform usage and materials protection |
| `/privacy` | `Static` | Privacy policy and student audio recording retention guidelines |
| `/accessibility` | `Static` | Accessibility compliance statement (WCAG 2.1 AA) |
| `/ai-feedback-policy`| `Static` | AI assessment boundaries, confidence scores, and human review guidelines |
| `/disclaimer` | `Static` | Trademark notices and official non-affiliation disclaimer |
| `/how-it-works` | `Static` | Platform overview detailing diagnostic assessment and scoring methodology |
| `/api/auth/register`| `Dynamic` | Server-side registration endpoint with payload validation |

---

## 10. Authentication and Authorization

### Registration & Login Workflows
- **Authentication Routes**: [`/login`](file:///d:/Project/IELTS%20SaaS/apps/web/src/app/login/page.tsx) and [`/signup`](file:///d:/Project/IELTS%20SaaS/apps/web/src/app/signup/page.tsx) are rendered inside dedicated layouts that omit public marketing banners and footers.
- **Client & Server Validation**:
  - Full name: trimmed, international characters supported, 2–80 characters.
  - Email: normalized (trimmed, lowercase) with RFC-compliant validation.
  - Password policy: minimum 8 characters, requiring both letters and numbers.
  - Confirmation: real-time inline mismatch feedback before submission.
  - Legal consent: mandatory agreement to Terms of Service and Privacy Policy.
- **Registration API**: [`/api/auth/register`](file:///d:/Project/IELTS%20SaaS/apps/web/src/app/api/auth/register/route.ts) validates input server-side and responds with structured JSON.
- **Demonstration / Preview Mode**: Entering test credentials (`student@...`, `test@...`, `demo@...`) demonstrates successful authentication and redirects directly to the student dashboard.
- **Google OAuth**: A standard Google button is integrated into both login and signup interfaces. If `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are not configured in the host environment, an informative, user-friendly notice is presented.
- **Password Recovery**: [`/forgot-password`](file:///d:/Project/IELTS%20SaaS/apps/web/src/app/forgot-password/page.tsx) provides a generic confirmation message to eliminate account enumeration attacks.

---

## 11. Database and Data Model

The complete entity specifications are detailed in [`docs/architecture/database.md`](file:///d:/Project/IELTS%20SaaS/docs/architecture/database.md) and applied via [`infra/migrations/001_initial_schema.sql`](file:///d:/Project/IELTS%20SaaS/infra/migrations/001_initial_schema.sql).

### 22 Relational Tables by Domain
1. **Identity & Access**: `users`, `profiles`, `consents`
2. **Media & Student Audio**: `media_assets`, `recordings`
3. **Content Bank**: `lessons`, `questions`, `question_options`
4. **Exam Engine**: `exams`, `exam_sections`, `attempts`, `responses`, `scores`, `feedback`
5. **Learning Support**: `study_plans`, `mistake_notes`
6. **RAG Knowledge Base**: `content_sources`, `content_chunks`, `tutor_reports`
7. **System Operations**: `ai_jobs`, `audit_logs`

### Core Architectural Invariants
- **User Ownership Scoping**: Every student-owned table possesses a foreign key referencing `users.id` that is validated server-side against the authenticated session context.
- **One-Active-Attempt Rule**: A partial unique index on `attempts(user_id, exam_id) WHERE status = 'in_progress'` guarantees that a candidate cannot open concurrent duplicate sessions for the same test.
- **Idempotent Auto-Saves**: `responses` enforces a unique constraint `UNIQUE (attempt_id, question_id)`, ensuring debounced auto-saves never duplicate database rows.
- **Content Immutability**: Active attempts store a `config_snapshot` JSONB to preserve grading integrity even if question bank items are edited in the future.

---

## 12. AI Tutor and RAG Architecture

BandBloom employs a grounded Retrieval-Augmented Generation (RAG) system to prevent AI hallucination and provide verified answers.

### Knowledge Pipeline
1. **Source Gating**: Content items are registered in `content_sources`. A database check constraint enforces that only sources with `permission_status IN ('owned', 'licensed', 'link_only')` can enter a `published` state.
2. **Chunking & Indexing**: Documents are split into semantic chunks stored in `content_chunks`. Each chunk stores a 1536-dimensional vector embedding alongside full-text search tokens (`fts`).
3. **Hybrid Search**: Combines semantic similarity (`pgvector` cosine distance index) with lexical search (`GIN` full-text index).
4. **Evidence Grounding**: Generated explanations display the verified source title (e.g. *IELTS Academic Guide 2026, Section 3.2*) and link to official resources.
5. **Hallucination Reporting**: Learners can flag unhelpful or suspicious answers, routing them directly to the `tutor_reports` table for human review.

---

## 13. Testing and Code Quality

### 1. TypeScript Static Verification
Run the TypeScript compiler to ensure zero typing errors across the entire codebase:
```bash
npm run --prefix apps/web tsc -- --noEmit
```

### 2. Next.js Production Build Test
Verify that all 32 pages compile and generate clean static/dynamic routes:
```bash
npm run build
```

### 3. Database Schema Verification Suite
To execute the live PostgreSQL integration tests (requires local database running via Docker):
```bash
python tests/run_live_postgres_tests.py
```

---

## 14. Deployment

### Frontend (Vercel or Next.js Node Host)
The Next.js application in `apps/web` is optimized for modern edge and serverless platforms:
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Environment Variables**: Configure the variables documented in [Section 8](#8-environment-variables).

### Database Infrastructure
Run migrations against any managed PostgreSQL 16 instance with the `vector` extension enabled:
```bash
psql -h <host> -U <user> -d <dbname> -f infra/migrations/001_initial_schema.sql
psql -h <host> -U <user> -d <dbname> -f infra/migrations/002_seed_data.sql
```

---

## 15. Troubleshooting & Known Gotchas

| Symptom / Error | Root Cause | Verified Resolution |
| :--- | :--- | :--- |
| `npm run dev` fails with `ENOENT: package.json` | Running command from subfolder or root without workspace configuration | Use root `npm run dev` (delegates via `--prefix apps/web`) |
| Page refresh lands at `#ai-tutor` instead of Home | Browser URL fragment & `scrollRestoration` restoring last scroll | Resolved in [`useLandingNavigation.ts`](file:///d:/Project/IELTS%20SaaS/apps/web/src/hooks/useLandingNavigation.ts) using Navigation Timing reload detection and `history.replaceState` |
| `usePathname() outside of <Suspense>` error during build | Next.js dynamic hook accessed during prerender without boundary | Resolved in [`AppShell.tsx`](file:///d:/Project/IELTS%20SaaS/apps/web/src/components/layout/AppShell.tsx) with a `<Suspense>` wrapper around `AppShellInner` |
| Turbopack ICO decoding error: `PNG not in RGBA format` | `favicon.ico` contains RGB metadata instead of 32-bit RGBA | Converted `favicon.ico` explicitly to 32x32 RGBA using Pillow |
| Playwright driver 404 during browser subagent launch | Headless browser agent encountered external CDN driver download restriction | Test application manually at `http://localhost:3000` or use system browser |

---

## 16. Security, Ethics & Privacy

- **Audio Consent & Retention (Section 2.3)**: Audio recorded during Speaking simulations is flagged with explicit learner authorization. Audio records support soft deletion (`deleted_at`) and automated expiration.
- **Model Training Opt-In**: Learners must explicitly opt in before anonymized writing or speaking samples can be used for evaluation model fine-tuning.
- **Age Declaration**: Learners declare they are 16+ or possess parental authorization during onboarding.
- **Rate Limiting**: AI prompts are subject to per-user daily quotas (`TUTOR_PER_USER_DAILY_QUOTA = 25`) and character caps (`MAX_TUTOR_REQUEST_CHARS = 4000`) to prevent abuse.
- **Credential Storage**: Raw passwords and sensitive tokens are never stored in `localStorage` or transmitted insecurely.

---

## 17. Contribution Guidelines

1. **Branching**: Create feature branches from `main` (`feature/your-feature-name` or `fix/issue-description`).
2. **Commit Conventions**: Use [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat(scope): ...` for new capabilities
   - `fix(scope): ...` for bug fixes
   - `docs(scope): ...` for documentation updates
   - `refactor(scope): ...` for architectural improvements
3. **Verification**: Always run `npm run --prefix apps/web tsc -- --noEmit` and `npm run build` prior to opening a pull request.
4. **Code Quality**: Preserve existing comments, avoid redundant abstractions, and adhere to established design tokens.

---

## 18. License and Legal Attribution

### Trademark & Disclaimer
**IELTS&reg;** is a registered trademark of the **University of Cambridge ESOL Examinations**, the **British Council**, and **IDP Education Australia**. 

BandBloom IELTS is an independent study preparation platform developed by BandBloom. BandBloom is not endorsed by, affiliated with, authorized, or sponsored by the official IELTS test owners. Practice tests, AI evaluations, and diagnostic band scores provided on this platform are unofficial estimates designed exclusively for academic preparation.

### Source Code License
The source code, user interface designs, and curriculum configurations within this repository are proprietary. For licensing, institutional use, or contribution inquiries, contact the repository maintainers.
