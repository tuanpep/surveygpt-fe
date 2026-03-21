# SurveyFlow — Project Roadmap & Milestones

**Date:** March 2026
**Version:** 1.0
**Status:** Draft

---

## Overview

This roadmap covers the development of SurveyFlow from MVP to a full-featured survey SaaS platform over 24 months. The project follows an agile approach with 2-week sprints.

### Tech Stack Summary

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, IBM Carbon Design System, TanStack Query, dnd-kit, ECharts |
| **Backend** | Go 1.22+, Echo v4, pgx, sqlc, Asynq, golang-jwt |
| **Database** | PostgreSQL 16 (JSONB), Redis |
| **Infrastructure** | Docker, Cloudflare (CDN + R2), Railway/Fly.io |
| **Services** | Claude API (AI), Resend (Email), Stripe (Billing), Twilio (SMS) |

---

## Phase 1: MVP — "First Response" (Months 1-4)

**Goal:** Launch a functional survey platform with core create-collect-analyze flow.

### Sprint 1-2 (Weeks 1-4): Foundation

#### Backend (Go)
- [ ] Project scaffolding (Go modules, Echo server, Docker Compose)
- [ ] PostgreSQL setup + sqlc configuration
- [ ] Redis connection setup
- [ ] Database schema: users, organizations, org_memberships, invitations
- [ ] Auth system: JWT generation/validation, bcrypt password hashing
- [ ] Auth endpoints: sign up, sign in, sign out, forgot/reset password
- [ ] Auth middleware: JWT validation, rate limiting
- [ ] Organization CRUD + member management
- [ ] Role-based authorization middleware
- [ ] Health check endpoint
- [ ] Structured logging (slog)
- [ ] Error handling middleware

#### Frontend (React + Carbon)
- [ ] Project scaffolding (Vite, React, TypeScript, Carbon packages)
- [ ] Routing setup (React Router v7)
- [ ] API client setup (ky)
- [ ] Auth pages: Sign in, Sign up, Forgot password
- [ ] Auth state management (JWT storage, token refresh)
- [ ] App layout: Sidebar (Carbon SideNav), Header
- [ ] Dashboard page (placeholder)
- [ ] Team management page
- [ ] Global error handling, toast notifications

#### DevOps
- [ ] Docker Compose (PostgreSQL 16, Redis 7)
- [ ] GitHub repository setup
- [ ] CI pipeline (lint, test, build)
- [ ] Local development guide

### Sprint 3-4 (Weeks 5-8): Core Survey Builder

#### Backend (Go)
- [ ] Database schema: surveys, templates (system templates)
- [ ] Survey CRUD endpoints (create, get, update, delete, list)
- [ ] Survey structure validation (JSONB schema)
- [ ] Survey publish/unpublish/close
- [ ] Template endpoints (list, get)
- [ ] Response submission endpoint (public)
- [ ] Response CRUD endpoints (authenticated)
- [ ] Answer storage (JSONB)
- [ ] Basic bot detection (honeypot, timing)
- [ ] Response quality flags
- [ ] Survey share URL generation

#### Frontend (React + Carbon)
- [ ] Survey list page (Carbon DataTable with search, filter, sort)
- [ ] New survey creation wizard (blank / template)
- [ ] Survey editor page layout (tabs: Edit, Settings)
- [ ] Question palette (Carbon SideNav or overflow menu)
- [ ] Drag-and-drop question placement (dnd-kit)
- [ ] Question components for MVP types:
  - Multiple Choice (single/multi)
  - Dropdown
  - Short Text
  - Long Text
  - Rating (Likert, Star, NPS)
  - Yes/No
- [ ] Question editor panel (title, description, required, choices, settings)
- [ ] Question reordering (drag & drop)
- [ ] Question duplication, deletion
- [ ] Survey settings panel (title, description, welcome/thank you screens, progress bar)
- [ ] Basic theme builder (primary color, font, logo upload)
- [ ] Survey preview (desktop + mobile toggle)
- [ ] Auto-save (debounced API calls)

### Sprint 5-6 (Weeks 9-12): Response Collection + Basic Analytics

#### Backend (Go)
- [ ] Basic analytics queries (response count, completion rate, avg duration)
- [ ] Question-level stats (choice distribution, average rating, NPS score)
- [ ] Analytics endpoints (summary, question stats)
- [ ] CSV export endpoint
- [ ] Excel export endpoint
- [ ] Response listing with pagination (cursor-based)
- [ ] Response filtering (date, status, source)
- [ ] 10 system templates (customer satisfaction, employee engagement, event feedback, etc.)
- [ ] Asynq worker setup + Redis queue
- [ ] Webhook system: create, dispatch, retry

#### Frontend (React + Carbon)
- [ ] Public survey page (`/s/:id`) — respondent-facing
- [ ] Survey taking UI with Carbon components
- [ ] Progress bar
- [ ] Thank you page
- [ ] Responses tab: response list (Carbon DataTable)
- [ ] Individual response viewer
- [ ] Analytics tab: summary dashboard (Carbon Tiles)
- [ ] Question-level charts (ECharts: bar, pie, gauge for NPS)
- [ ] Export button (CSV, Excel)
- [ ] Webhook management page
- [ ] QR code generation display

### Sprint 7-8 (Weeks 13-16): Polish + Launch

#### Backend (Go)
- [ ] Email distribution: email list management, send endpoint
- [ ] Email templates (invitation, reminder, notification)
- [ ] Website embed code generation
- [ ] Stripe integration: subscription management
- [ ] Billing endpoints (plan info, change plan, portal URL)
- [ ] Usage tracking and limit enforcement
- [ ] SSE endpoint for live response count
- [ ] Security hardening (CSP, rate limits, input sanitization)

#### Frontend (React + Carbon)
- [ ] Distribution panel: web link, email, embed, QR code
- [ ] Email distribution UI (compose, contact list, scheduling)
- [ ] Billing page: plan display, upgrade prompts, usage meters
- [ ] Settings page: profile, notifications, security (2FA)
- [ ] Marketing pages: Landing, Pricing, Features
- [ ] Real-time response count (SSE)
- [ ] Mobile responsiveness pass
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Performance optimization (lazy loading, code splitting)
- [ ] Error boundary, loading states, empty states

#### Launch
- [ ] Deploy to production (Railway/Fly.io + Cloudflare)
- [ ] Custom domain setup
- [ ] SSL certificate
- [ ] Monitoring setup (Sentry)
- [ ] Product Hunt launch
- [ ] Initial documentation

### MVP Deliverables

| Feature | Status |
|---|---|
| Auth (email + Google OAuth) | Done |
| Organization + team management | Done |
| Survey builder (drag & drop, 8 question types) | Done |
| Basic logic (skip, display) | Done |
| 10 templates | Done |
| Web link + email + embed distribution | Done |
| Response collection + quality checks | Done |
| Basic analytics dashboard | Done |
| CSV/Excel export | Done |
| Theme builder (colors, font, logo) | Done |
| Webhooks | Done |
| Stripe billing (Free + Starter plans) | Done |
| Live response count (SSE) | Done |
| Mobile-responsive public survey | Done |

---

## Phase 2: V1.0 — "AI-Powered" (Months 5-8)

**Goal:** Add AI features, conversational UI, all question types, and integrations.

### Sprint 9-10 (Weeks 17-20): AI + Conversational UI

#### Backend (Go)
- [ ] Claude API integration (survey generation)
- [ ] AI survey generation endpoint (prompt → structured survey)
- [ ] AI question suggestion endpoint
- [ ] AI text analysis endpoint (sentiment, themes)
- [ ] AI summarization endpoint
- [ ] AI credit tracking and enforcement
- [ ] Asynq job: AI text analysis (background)
- [ ] Asynq job: AI summarization (background)
- [ ] AI analysis storage (JSONB in responses/surveys)
- [ ] Analytics cache table + update job

#### Frontend (React + Carbon)
- [ ] "Generate with AI" flow in survey creation wizard
- [ ] AI prompt input with tone/length options
- [ ] AI-generated survey preview + edit
- [ ] "Suggest questions" button in survey editor
- [ ] Conversational UI mode (one-question-at-a-time)
  - Transition animations
  - Progress indicator
  - Previous/next navigation
- [ ] UI mode toggle (Classic ↔ Conversational) in settings
- [ ] AI Insights panel in analytics tab
  - Sentiment distribution chart
  - Theme extraction display
  - Auto-generated summary
  - Key findings list
  - Recommendation cards

### Sprint 11-12 (Weeks 21-24): All Question Types + Advanced Logic

#### Backend (Go)
- [ ] Text piping + carry forward logic
- [ ] Branch logic endpoint
- [ ] Loop & merge logic
- [ ] Randomization (questions, choices, blocks)
- [ ] Scoring system
- [ ] Survey flow validation

#### Frontend (React + Carbon)
- [ ] Remaining question type components:
  - Matrix / Grid Table
  - Ranking (drag-and-drop)
  - Slider
  - File Upload
  - Date/Time picker
  - Image Choice
  - Contact Information (grouped fields)
  - Address (grouped fields)
  - Constant Sum
  - Signature (canvas)
  - Consent checkbox
  - Descriptive text (section divider)
  - Hidden field
  - Emoji rating
  - Scale / Semantic differential
- [ ] Survey Flow visualization page (flowchart view)
- [ ] Advanced logic builder UI:
  - Visual logic builder (condition builder)
  - Branch logic flow editor
  - Loop & merge configuration
  - Randomization settings
  - Scoring configuration

### Sprint 13-14 (Weeks 25-28): Integrations + Pro Plan

#### Backend (Go)
- [ ] Slack integration (OAuth, event dispatch)
- [ ] Google Sheets integration (auto-sync responses)
- [ ] Zapier integration (trigger on new response)
- [ ] HubSpot integration (contact sync, trigger surveys)
- [ ] API key management (create, list, revoke, permissions)
- [ ] External REST API v1 documentation (Swagger)
- [ ] File upload to R2 (presigned URL)
- [ ] SMS distribution (Twilio)
- [ ] A/B testing support
- [ ] Cross-tabulation analytics endpoint

#### Frontend (React + Carbon)
- [ ] Integrations page (connect/disconnect providers)
- [ ] API key management page
- [ ] File upload question type with progress indicator
- [ ] SMS distribution panel
- [ ] A/B testing configuration in survey settings
- [ ] Cross-tabulation view in analytics
- [ ] 30+ total templates
- [ ] Pro plan billing page

### Sprint 15-16 (Weeks 29-32): Polish V1.0

#### Backend
- [ ] Email reminder system (scheduled Asynq job)
- [ ] Quota management
- [ ] Partial response save/resume
- [ ] Duplicate response detection
- [ ] Performance optimization (connection pooling, query optimization)

#### Frontend
- [ ] Email reminder scheduling UI
- [ ] Partial response indicator
- [ ] Duplicate detection notification
- [ ] Performance optimization (React.memo, virtualized lists)
- [ ] E2E tests (Playwright) for critical flows
- [ ] Accessibility re-audit

### V1.0 Deliverables

| Feature | Status |
|---|---|
| AI survey generation | Done |
| AI text analysis (sentiment + themes) | Done |
| AI summarization | Done |
| Conversational UI mode | Done |
| 25+ question types | Done |
| Advanced logic (branch, loop & merge, piping) | Done |
| Randomization + scoring | Done |
| Survey Flow visualization | Done |
| File upload (R2) | Done |
| SMS distribution (Twilio) | Done |
| Slack + Google Sheets + Zapier + HubSpot integrations | Done |
| API key management | Done |
| REST API v1 + Swagger docs | Done |
| A/B testing | Done |
| Cross-tabulation | Done |
| 30+ templates | Done |
| Pro + Business plans | Done |

---

## Phase 3: V1.5 — "Team & Scale" (Months 9-12)

**Goal:** Enterprise features, team collaboration, advanced analytics, template marketplace.

### Sprint 17-18 (Weeks 33-36): Collaboration + White-Label

#### Backend
- [ ] Comment system (add, resolve, list per survey)
- [ ] @mention notification system
- [ ] Version history for surveys (audit trail)
- [ ] White-label: custom domain (CNAME), remove branding
- [ ] Custom email sender domain (SPF/DKIM setup)
- [ ] PDF export (report generation)

#### Frontend
- [ ] Comments panel in survey editor
- [ ] @mention autocomplete (Carbon ComposedModal)
- [ ] Version history viewer (diff view)
- [ ] Version restore functionality
- [ ] White-label settings in billing/settings
- [ ] PDF export with custom branding

### Sprint 19-20 (Weeks 37-40): Advanced Analytics

#### Backend
- [ ] Drop-off analysis endpoint
- [ ] AI-powered comparison analytics
- [ ] Response trend analysis (wave-over-wave)
- [ ] Advanced AI insights (recommendations, anomaly detection)
- [ ] Scheduled report generation (Asynq cron)

#### Frontend
- [ ] Drop-off funnel visualization
- [ ] Comparison view (segment A vs segment B)
- [ ] Trend analysis charts (line charts over time)
- [ ] AI recommendations panel
- [ ] Scheduled report configuration UI
- [ ] 50+ total templates

### Sprint 21-22 (Weeks 41-44): Marketplace + Developer

#### Backend
- [ ] Custom template CRUD (save, list, share)
- [ ] Template marketplace endpoints (browse, search, use)
- [ ] Embeddable widget SDK (JavaScript snippet)
- [ ] Widget server endpoints (render, submit, events)
- [ ] Webhook delivery log + retry UI

#### Frontend
- [ ] Custom template library (save survey as template)
- [ ] Template marketplace page (browse, preview, use)
- [ ] Embed widget configuration UI (mode, trigger, styling)
- [ ] Webhook delivery log viewer
- [ ] API documentation page (Swagger UI embedded)

### Sprint 23-24 (Weeks 45-48): Polish V1.5

#### Backend
- [ ] Salesforce integration
- [ ] Performance optimization at scale
- [ ] Database query optimization
- [ ] Analytics cache optimization
- [ ] Rate limiting refinement

#### Frontend
- [ ] Salesforce integration UI
- [ ] Performance audit and optimization
- [ ] Full accessibility audit
- [ ] E2E test coverage expansion
- [ ] User onboarding tour (Carbon Accordion + Tooltip)
- [ ] Referral program UI

### V1.5 Deliverables

| Feature | Status |
|---|---|
| Comments + @mentions | Done |
| Version history | Done |
| White-label (custom domain, remove branding) | Done |
| PDF export | Done |
| Drop-off analysis | Done |
| Comparison analytics | Done |
| Scheduled reports | Done |
| 50+ templates | Done |
| Template marketplace | Done |
| Embed widget SDK | Done |
| Salesforce integration | Done |
| Webhook delivery logs | Done |

---

## Phase 4: V2.0 — "Enterprise Ready" (Months 13-18)

**Goal:** Enterprise features, mobile app, advanced research tools.

### Months 13-14
- [ ] SSO (SAML 2.0 / OIDC)
- [ ] HIPAA compliance mode (encryption, audit logs, BAA)
- [ ] Data residency options (US/EU)
- [ ] Enterprise plan + custom pricing
- [ ] Conjoint analysis question type
- [ ] MaxDiff scaling question type
- [ ] Gap analysis question type

### Months 15-16
- [ ] Mobile app (React Native or Flutter) — offline data collection
- [ ] Mobile app: sync when online, GPS location capture
- [ ] Advanced driver analysis (statistical modeling)
- [ ] Predictive analytics (churn prediction)
- [ ] Multi-language UI (admin interface)

### Months 17-18
- [ ] Bulk operations (import/export surveys, bulk response management)
- [ ] Advanced permission system (per-survey, per-section)
- [ ] Audit log viewer with filtering
- [ ] SOC 2 Type II preparation
- [ ] Performance optimization for 10M+ responses
- [ ] API rate limiting per plan
- [ ] Enterprise documentation

---

## Phase 5: V3.0 — "AI-Native Platform" (Months 19-24)

**Goal:** AI-first experience, international expansion, ecosystem.

### Months 19-20
- [ ] AI Agents: conversational survey bot (adaptive questioning)
- [ ] AI auto-follow-up: "Clarify with AI" for ambiguous responses
- [ ] Video/voice feedback question type
- [ ] Async video response capture
- [ ] AI-powered response quality scoring

### Months 21-22
- [ ] International expansion: local payment methods (Stripe local)
- [ ] Additional languages: Japanese, Korean, Arabic, Hindi
- [ ] RTL (right-to-left) language support
- [ ] Multi-currency billing
- [ ] Regional data centers

### Months 23-24
- [ ] Developer program (SDKs: JavaScript, Python, Go)
- [ ] Public API v2 (GraphQL option)
- [ ] Plugin/App marketplace (third-party extensions)
- [ ] Reseller/white-label partner program
- [ ] Advanced reporting (Power BI, Tableau native connectors)
- [ ] Headless API for custom survey frontends

---

## Team & Resource Estimates

### Phase 1 (MVP) — Months 1-4

| Role | Count | Focus |
|---|---|---|
| Full-Stack Developer (Go + React) | 1-2 | Backend API, frontend, devops |
| UI/UX Designer | 0.5 (part-time) | Survey builder UX, respondent UI, marketing |

### Phase 2 (V1.0) — Months 5-8

| Role | Count | Focus |
|---|---|---|
| Backend Developer (Go) | 1 | API, AI integration, workers |
| Frontend Developer (React) | 1 | Survey builder, analytics, integrations |
| UI/UX Designer | 0.5 | Conversational UI, advanced features |

### Phase 3-5 (V1.5-V3.0) — Months 9-24

| Role | Count | Focus |
|---|---|---|
| Backend Developer (Go) | 1-2 | Enterprise features, performance |
| Frontend Developer (React) | 1-2 | Advanced UI, marketplace, mobile |
| AI/ML Engineer | 0.5-1 | AI features, NLP, predictive analytics |
| DevOps | 0.5 | Infrastructure, monitoring, scaling |
| Product Manager | 0.5 | Roadmap, user research, prioritization |

---

## Risk Register

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Go learning curve (if team is JS-only) | Medium | Medium | Invest in Go training, start with simple endpoints |
| Carbon Design System limitations | Low | Medium | Custom components where needed, Carbon is very comprehensive |
| AI API costs spiral | Medium | High | Credit system, caching AI results, usage alerts |
| Low free-to-paid conversion | Medium | High | Clear value in paid tiers, in-app upgrade prompts |
| Database performance at scale | Low | High | JSONB indexing, read replicas, materialized views, partitioning |
| Scope creep delays MVP | High | Medium | Strict MVP feature list, user feedback-driven prioritization |
| Security breach | Low | Critical | Security-by-design, regular audits, bug bounty program |

---

## Success Criteria by Phase

| Phase | Key Metrics |
|---|---|
| **MVP (Month 4)** | Working product with 100 beta users, 500+ surveys created |
| **V1.0 (Month 8)** | 1,000+ users, 50+ paid customers, 4% conversion rate |
| **V1.5 (Month 12)** | 5,000+ users, 200+ paid customers, $10K+ MRR |
| **V2.0 (Month 18)** | 15,000+ users, 500+ paid customers, $30K+ MRR, enterprise customers |
| **V3.0 (Month 24)** | 30,000+ users, 2,000+ paid customers, $100K+ MRR, developer ecosystem |
