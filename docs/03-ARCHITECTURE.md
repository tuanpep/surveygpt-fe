# SurveyFlow — Technical Architecture

**Date:** March 2026
**Version:** 1.1
**Status:** Draft

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Tech Stack](#2-tech-stack)
3. [System Architecture](#3-system-architecture)
4. [Project Structure](#4-project-structure)
5. [Key Design Decisions](#5-key-design-decisions)
6. [Data Flow](#6-data-flow)
7. [Authentication & Authorization](#7-authentication--authorization)
8. [Real-Time Architecture](#8-real-time-architecture)
9. [Background Jobs](#9-background-jobs)
10. [File Storage](#10-file-storage)
11. [Caching Strategy](#11-caching-strategy)
12. [Deployment & Infrastructure](#12-deployment--infrastructure)
13. [Monitoring & Observability](#13-monitoring--observability)
14. [Security Architecture](#14-security-architecture)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CDN (Cloudflare)                          │
│   Static assets, published survey pages, images, fonts             │
└─────────────┬───────────────────────────────────────────┬───────────┘
              │                                           │
┌─────────────▼───────────────┐         ┌────────────────▼───────────┐
│   React App (Frontend)      │         │     Go API Server          │
│                             │         │                            │
│  • React 19 + Vite          │         │  • REST API (v1)           │
│  • Carbon Design System     │◄───────►│  • WebSocket / SSE         │
│  • React Router             │  JSON   │  • Webhook dispatch        │
│  • TanStack Query           │         │  • Background workers      │
│  • Survey builder (DnD)     │         │  • Auth (JWT + OAuth)      │
│  • Respondent UI            │         │  • File upload handling    │
└─────────────┬───────────────┘         └─────────────┬──────────────┘
              │                                       │
              │         ┌─────────────────────────────┤
              │         │                             │
┌─────────────▼─────┐  ┌▼──────────────┐  ┌─────────▼──────────┐
│   PostgreSQL 16   │  │    Redis       │  │  Background Workers │
│                   │  │                │  │   (Asynq)           │
│  • Users, Orgs    │  │  • Sessions    │  │                     │
│  • Surveys        │  │  • Rate limits │  │  • Email sends      │
│  • Responses      │  │  • Cache       │  │  • AI analysis      │
│  • JSONB for      │  │  • Pub/Sub     │  │  • Export jobs      │
│    flexible data  │  │  • Job queues  │  │  • Webhook dispatch │
└───────────────────┘  └────────────────┘  │  • Report generation│
                                           └─────────┬───────────┘
                                                     │
                                           ┌─────────▼───────────┐
                                           │   External Services  │
                                           │                     │
                                           │  • Cloudflare R2    │
                                           │  • Claude API (AI)  │
                                           │  • Resend (Email)   │
                                           │  • Stripe (Billing) │
                                           │  • Twilio (SMS)     │
                                           └─────────────────────┘
```

---

## 2. Tech Stack

### Frontend

| Layer | Technology | Rationale |
|---|---|---|
| **Framework** | React 19 + Vite | Fast builds, modern React features |
| **Design System** | IBM Carbon Design System | Enterprise-grade components, accessibility, consistency |
| **Routing** | React Router v7 | Declarative routing, nested layouts, loaders |
| **Data Fetching** | TanStack Query v5 | Caching, optimistic updates, real-time subscriptions |
| **Forms** | React Hook Form + Zod | Performance, validation |
| **State** | Zustand | Lightweight global state for builder, drag-and-drop |
| **DnD** | dnd-kit | Accessible, performant drag-and-drop for survey builder |
| **Charts** | ECharts | Rich chart types for analytics, customizable themes |
| **HTTP Client** | ky | Lightweight fetch wrapper, interceptors |
| **Styling** | Carbon SCSS + custom overrides | Consistent with Carbon design tokens |
| **Build** | Vite | Fast HMR, tree-shaking, optimized builds |

### Backend (Go)

| Layer | Technology | Rationale |
|---|---|---|
| **Language** | Go 1.22+ | Performance, concurrency, small binary, fast deployments |
| **HTTP Framework** | Echo v4 | Fast, minimal, middleware-rich |
| **WebSocket** | gorilla/websocket | Production-proven WebSocket support |
| **Database** | PostgreSQL 16 (via pgx) | Native PostgreSQL driver, prepared statements, connection pooling |
| **ORM/Query** | sqlc | Type-safe SQL, code generation, no runtime reflection |
| **Cache** | Redis (go-redis) | Client-side caching, pub/sub, rate limiting |
| **Queue** | Asynq | Reliable job queue (Redis-backed), Go-native |
| **Auth** | golang-jwt + bcrypt | JWT tokens, secure password hashing |
| **Validation** | go-playground/validator | Struct-based validation, custom validators |
| **Config** | envconfig | Environment-based configuration |
| **Logging** | slog (structured) | Structured logging with levels |
| **Testing** | testify + httpexpect | Unit + integration testing |
| **API Docs** | swaggo/swag | OpenAPI/Swagger generation from comments |

### External Services

| Service | Technology | Purpose |
|---|---|---|
| **AI** | Claude API (Anthropic) | Survey generation, text analysis, insights |
| **Email** | Resend | Transactional emails, notifications |
| **Payments** | Stripe | Subscriptions, billing, invoicing |
| **SMS** | Twilio | SMS survey distribution |
| **Storage** | Cloudflare R2 | File uploads, survey images |
| **CDN** | Cloudflare | Static assets, edge caching |
| **Monitoring** | Sentry | Error tracking, performance |
| **Analytics** | PostHog | Product analytics, feature flags |

### Development

| Tool | Purpose |
|---|---|
| **Package Manager (FE)** | pnpm |
| **Package Manager (BE)** | Go modules |
| **Linting (FE)** | ESLint + Prettier |
| **Linting (BE)** | golangci-lint |
| **Testing (FE)** | Vitest (unit), Playwright (e2e) |
| **Testing (BE)** | Go test + testify |
| **API Docs** | Swagger UI |
| **Container** | Docker Compose (Postgres, Redis) |
| **API Mocking** | Mockoon or wiremock (for frontend dev) |

---

## 3. System Architecture

### 3.1 Repository Structure

```
surveyflow/
├── web/                          # Frontend (React + Carbon)
│   ├── public/
│   │   ├── favicon.ico
│   │   └── survey/               # Public survey assets
│   ├── src/
│   │   ├── main.tsx              # App entry point
│   │   ├── App.tsx               # Root component + router
│   │   ├── routes/               # Route definitions
│   │   │   ├── index.ts
│   │   │   ├── marketing.ts      # /, /pricing, /features
│   │   │   ├── auth.ts           # /signin, /signup
│   │   │   ├── app.ts            # /app/* (authenticated)
│   │   │   └── survey.ts         # /s/:id (public survey)
│   │   ├── components/
│   │   │   ├── carbon/           # Carbon component wrappers
│   │   │   ├── layout/           # AppLayout, Sidebar, Header
│   │   │   ├── survey/           # SurveyBuilder, QuestionEditor, etc.
│   │   │   ├── analytics/        # Dashboard, Charts, CrossTab
│   │   │   └── shared/           # Button, Modal, Toast, etc.
│   │   ├── hooks/                # Custom React hooks
│   │   │   ├── useSurvey.ts
│   │   │   ├── useAuth.ts
│   │   │   ├── useQuery.ts       # TanStack Query wrappers
│   │   │   └── useWebSocket.ts
│   │   ├── stores/               # Zustand stores
│   │   │   ├── surveyBuilder.ts  # Builder state (questions, blocks, undo/redo)
│   │   │   └── auth.ts
│   │   ├── services/             # API client layer
│   │   │   ├── api.ts            # Base HTTP client (ky)
│   │   │   ├── surveys.ts        # Survey API calls
│   │   │   ├── responses.ts
│   │   │   ├── analytics.ts
│   │   │   └── auth.ts
│   │   ├── types/                # TypeScript type definitions
│   │   │   ├── survey.ts
│   │   │   ├── response.ts
│   │   │   ├── analytics.ts
│   │   │   └── api.ts
│   │   ├── utils/                # Helpers, formatters
│   │   └── styles/               # Global styles, Carbon overrides
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   ├── playwright.config.ts
│   └── package.json
│
├── server/                       # Backend (Go)
│   ├── cmd/
│   │   ├── server/
│   │   │   └── main.go           # HTTP server entry point
│   │   └── worker/
│   │       └── main.go           # Background worker entry point
│   ├── internal/
│   │   ├── config/
│   │   │   └── config.go         # Environment config
│   │   ├── db/
│   │   │   ├── db.go             # Database connection (pgx pool)
│   │   │   ├── redis.go          # Redis client
│   │   │   └── migrations/       # SQL migration files
│   │   ├── models/               # Go structs (shared types)
│   │   │   ├── survey.go
│   │   │   ├── response.go
│   │   │   ├── user.go
│   │   │   └── analytics.go
│   │   ├── handlers/             # HTTP handlers (Echo)
│   │   │   ├── auth.go
│   │   │   ├── survey.go
│   │   │   ├── response.go
│   │   │   ├── analytics.go
│   │   │   ├── template.go
│   │   │   ├── ai.go
│   │   │   ├── billing.go
│   │   │   ├── webhook.go
│   │   │   ├── integration.go
│   │   │   └── api_key.go
│   │   ├── middleware/            # Echo middleware
│   │   │   ├── auth.go           # JWT validation
│   │   │   ├── ratelimit.go      # Rate limiting
│   │   │   ├── cors.go
│   │   │   ├── requestid.go
│   │   │   ├── logger.go
│   │   │   └── recovery.go
│   │   ├── services/             # Business logic layer
│   │   │   ├── auth_service.go
│   │   │   ├── survey_service.go
│   │   │   ├── response_service.go
│   │   │   ├── analytics_service.go
│   │   │   ├── ai_service.go     # Claude API integration
│   │   │   ├── email_service.go  # Resend integration
│   │   │   ├── billing_service.go # Stripe integration
│   │   │   ├── storage_service.go # R2 integration
│   │   │   └── webhook_service.go
│   │   ├── workers/              # Background job handlers (Asynq)
│   │   │   ├── email.go
│   │   │   ├── ai_analysis.go
│   │   │   ├── export.go
│   │   │   ├── webhook.go
│   │   │   └── analytics_cache.go
│   │   ├── repository/           # Database access layer
│   │   │   ├── survey_repo.go
│   │   │   ├── response_repo.go
│   │   │   ├── user_repo.go
│   │   │   ├── template_repo.go
│   │   │   └── analytics_repo.go
│   │   └── pkg/                  # Shared utilities
│   │       ├── validator/
│   │       ├── jwt/
│   │       ├── errors/
│   │       └── pagination/
│   ├── api/                      # sqlc generated code
│   │   ├── queries/
│   │   │   ├── surveys.sql
│   │   │   ├── responses.sql
│   │   │   ├── users.sql
│   │   │   └── analytics.sql
│   │   ├── db.go                 # Generated DB interface
│   │   ├── models.go             # Generated models
│   │   └── queries.sql.go        # Generated query functions
│   ├── docs/                     # Swagger docs
│   │   └── swagger.json
│   ├── sqlc.yaml                 # sqlc configuration
│   ├── Dockerfile
│   ├── go.mod
│   └── go.sum
│
├── docker-compose.yml            # Local development (Postgres, Redis)
├── Makefile                      # Common commands
└── README.md
```

### 3.2 Data Architecture

The survey data model uses **JSONB heavily** for flexibility:

```go
// survey.go - Question definition stored as JSONB
type QuestionDef struct {
    ID          string         `json:"id"`
    BlockID     string         `json:"blockId"`
    Type        string         `json:"type"` // "multiple_choice", "text", "rating_nps", ...
    Title       string         `json:"title"`
    Description string         `json:"description,omitempty"`
    Required    bool           `json:"required"`
    Settings    map[string]any `json:"settings"`
    Choices     []Choice       `json:"choices,omitempty"`
    Validation  *Validation    `json:"validation,omitempty"`
    Logic       *QuestionLogic `json:"logic,omitempty"`
    Scoring     *ScoringConfig `json:"scoring,omitempty"`
    Position    int            `json:"position"`
}

type Choice struct {
    ID     string `json:"id"`
    Label  string `json:"label"`
    Value  string `json:"value"`
    Image  string `json:"image,omitempty"`
}

// Survey structure stored as JSONB
type SurveyStructure struct {
    Version   int            `json:"version"`
    Questions []QuestionDef  `json:"questions"`
    Blocks    []BlockDef     `json:"blocks"`
    Flow      []FlowStep     `json:"flow"`
}

// Response answer stored as JSONB (interface{} for flexibility)
// Go stores as: string, float64, []string, map[string]any, or bool
```

### 3.3 Frontend Architecture (React + Carbon)

```
┌─────────────────────────────────────────────────────────────┐
│                    React Application                         │
├─────────────────────────────────────────────────────────────┤
│  Routes                                                     │
│  ├─ Marketing: /, /pricing, /features, /templates           │
│  ├─ Auth: /signin, /signup, /forgot-password                │
│  ├─ App: /app/dashboard, /app/surveys/:id/edit, ...        │
│  └─ Survey: /s/:id (public respondent UI)                   │
├─────────────────────────────────────────────────────────────┤
│  State Management                                           │
│  ├─ TanStack Query: Server state (surveys, responses, etc.) │
│  ├─ Zustand: Client state (builder drag-drop, undo/redo)   │
│  └─ React Router: URL state, navigation                     │
├─────────────────────────────────────────────────────────────┤
│  Data Layer                                                 │
│  ├─ services/api.ts: HTTP client (ky) → Go backend          │
│  ├─ hooks/useQuery.ts: TanStack Query hooks                 │
│  └─ hooks/useWebSocket.ts: Real-time SSE/WebSocket          │
├─────────────────────────────────────────────────────────────┤
│  UI Layer                                                   │
│  ├─ IBM Carbon Design System components                     │
│  ├─ Custom survey builder components (dnd-kit)              │
│  ├─ ECharts for analytics dashboards                        │
│  └─ Carbon SCSS tokens + custom overrides                   │
└─────────────────────────────────────────────────────────────┘
```

#### Carbon Design System Usage

| Carbon Component | SurveyFlow Usage |
|---|---|
| `DataTable` | Survey list, response list, analytics tables |
| `StructuredList` | Template gallery, team members list |
| `Form`, `TextInput`, `TextArea`, `Select`, `Dropdown` | Settings, forms, filters |
| `Button`, `IconButton` | Actions throughout the app |
| `Modal` | Confirm dialogs, settings panels |
| `ComposedModal` | Multi-step dialogs (create survey, upgrade plan) |
| `Toast` | Success/error notifications |
| `Tabs` | Survey editor tabs (Edit, Flow, Settings, Responses, Analytics) |
| `Accordion` | FAQ, settings sections, template categories |
| `Breadcrumb` | Navigation breadcrumbs |
| `SideNav` | App sidebar navigation |
| `Header` | App top header with user menu |
| `Tag` | Status tags (Draft, Active, Closed), question type labels |
| `Notification` | In-app notification bell |
| `Loading` | Skeleton loaders, spinners |
| `ProgressBar` | Survey progress, upload progress |
| `NumberInput`, `Slider` | Numeric settings, rating question type |
| `RadioButtonGroup` | Plan selection, UI mode choice |
| `Checkbox` | Multi-select settings, consent |
| `DatePicker`, `DatePickerInput` | Date settings, date question type |
| `FileUploader` | File upload question type, image/logo upload |
| `CodeSnippet` | Embed code display, API key display |
| `Tooltip` | Help tooltips, feature explanations |
| `Popover` | Action menus, option selectors |
| `Dropdown` | User menu, action menus |
| `Search` | Global search, filter search |
| `Pagination` | Response list, template list |
| `Tile` | Dashboard metric cards, feature cards |
| `Link` | Navigation links |
| `Grid`, `Column`, `Row` | Layout (Carbon grid system) |
| `Theme` | Custom Carbon theme with SurveyFlow brand colors |

---

## 4. Project Structure

### 4.1 Frontend Routes

```typescript
// web/src/routes/
const routes = {
  // Marketing (public)
  '/': MarketingHome,
  '/pricing': PricingPage,
  '/features': FeaturesPage,
  '/templates': TemplatesPage,

  // Auth (public)
  '/signin': SignInPage,
  '/signup': SignUpPage,
  '/forgot-password': ForgotPasswordPage,

  // App (authenticated)
  '/app': {
    '/dashboard': DashboardPage,
    '/surveys': {
      '/new': NewSurveyWizard,
      '/:id': {
        '/edit': SurveyEditorPage,
        '/flow': SurveyFlowPage,
        '/responses': ResponsesPage,
        '/analytics': AnalyticsPage,
        '/settings': SurveySettingsPage,
      }
    },
    '/templates': TemplatesPage,
    '/integrations': IntegrationsPage,
    '/team': TeamPage,
    '/billing': BillingPage,
    '/api-keys': ApiKeysPage,
    '/settings': SettingsPage,
  },

  // Public survey (no auth)
  '/s/:id': PublicSurveyPage,
  '/s/:id/thank-you': ThankYouPage,
}
```

### 4.2 Backend API Routes (Go/Echo)

```go
// server/internal/handlers/routes.go
func SetupRoutes(e *echo.Echo, deps *Dependencies) {
    // Public API (no auth)
    public := e.Group("/api/v1")
    {
        public.POST("/auth/signup", deps.Auth.SignUp)
        public.POST("/auth/signin", deps.Auth.SignIn)
        public.POST("/auth/forgot-password", deps.Auth.ForgotPassword)
        public.POST("/auth/reset-password", deps.Auth.ResetPassword)

        public.GET("/surveys/:id/public", deps.Survey.GetPublic)
        public.POST("/surveys/:id/responses", deps.Response.Submit)
        public.POST("/surveys/:id/responses/partial", deps.Response.SavePartial)
        public.GET("/surveys/:id/responses/partial", deps.Response.ResumePartial)

        public.GET("/health", deps.Health.Check)
    }

    // Authenticated API (JWT)
    auth := e.Group("/api/v1")
    auth.Use(middleware.JWTAuth(deps.Config.JWTSecret))
    {
        // Surveys
        auth.GET("/surveys", deps.Survey.List)
        auth.POST("/surveys", deps.Survey.Create)
        auth.GET("/surveys/:id", deps.Survey.GetByID)
        auth.PUT("/surveys/:id", deps.Survey.Update)
        auth.DELETE("/surveys/:id", deps.Survey.Delete)
        auth.POST("/surveys/:id/publish", deps.Survey.Publish)
        auth.POST("/surveys/:id/close", deps.Survey.Close)
        auth.POST("/surveys/:id/duplicate", deps.Survey.Duplicate)

        // Responses
        auth.GET("/surveys/:id/responses", deps.Response.List)
        auth.GET("/surveys/:id/responses/:rid", deps.Response.GetByID)
        auth.DELETE("/surveys/:id/responses/:rid", deps.Response.Delete)
        auth.POST("/surveys/:id/responses/export", deps.Response.Export)

        // Analytics
        auth.GET("/surveys/:id/analytics/summary", deps.Analytics.Summary)
        auth.GET("/surveys/:id/analytics/questions/:qid", deps.Analytics.QuestionStats)
        auth.GET("/surveys/:id/analytics/cross-tab", deps.Analytics.CrossTab)
        auth.GET("/surveys/:id/analytics/dropoff", deps.Analytics.Dropoff)
        auth.GET("/surveys/:id/analytics/ai-insights", deps.Analytics.AIInsights)

        // AI
        auth.POST("/ai/generate-survey", deps.AI.GenerateSurvey)
        auth.POST("/ai/suggest-questions", deps.AI.SuggestQuestions)
        auth.POST("/ai/analyze-text", deps.AI.AnalyzeText)
        auth.POST("/ai/summarize", deps.AI.SummarizeResponses)

        // Templates
        auth.GET("/templates", deps.Template.List)
        auth.GET("/templates/:id", deps.Template.GetByID)
        auth.GET("/templates/org", deps.Template.GetOrgTemplates)
        auth.POST("/surveys/:id/save-as-template", deps.Template.SaveFromSurvey)

        // Distribution
        auth.GET("/surveys/:id/qr-code", deps.Distribution.GetQRCode)
        auth.GET("/surveys/:id/embed-code", deps.Distribution.GetEmbedCode)
        auth.GET("/email-lists", deps.Distribution.GetEmailLists)
        auth.POST("/email-lists", deps.Distribution.CreateEmailList)
        auth.POST("/surveys/:id/send-emails", deps.Distribution.SendEmails)

        // Organization
        auth.GET("/org", deps.Org.Get)
        auth.PUT("/org", deps.Org.Update)
        auth.GET("/org/members", deps.Org.GetMembers)
        auth.POST("/org/invite", deps.Org.InviteMember)
        auth.PUT("/org/members/:uid/role", deps.Org.UpdateMemberRole)
        auth.DELETE("/org/members/:uid", deps.Org.RemoveMember)
        auth.GET("/org/usage", deps.Org.GetUsage)

        // Integrations
        auth.GET("/integrations", deps.Integration.List)
        auth.POST("/integrations/:provider/connect", deps.Integration.Connect)
        auth.DELETE("/integrations/:provider", deps.Integration.Disconnect)

        // Webhooks
        auth.GET("/webhooks", deps.Webhook.List)
        auth.POST("/webhooks", deps.Webhook.Create)
        auth.PUT("/webhooks/:id", deps.Webhook.Update)
        auth.DELETE("/webhooks/:id", deps.Webhook.Delete)
        auth.GET("/webhooks/:id/deliveries", deps.Webhook.GetDeliveryLog)

        // Billing
        auth.GET("/billing/plan", deps.Billing.GetPlan)
        auth.GET("/billing/plans", deps.Billing.GetPlans)
        auth.POST("/billing/change-plan", deps.Billing.ChangePlan)
        auth.GET("/billing/portal", deps.Billing.GetPortalURL)
        auth.GET("/billing/history", deps.Billing.GetHistory)

        // API Keys
        auth.GET("/api-keys", deps.ApiKey.List)
        auth.POST("/api-keys", deps.ApiKey.Create)
        auth.DELETE("/api-keys/:id", deps.ApiKey.Revoke)

        // Real-time
        auth.GET("/surveys/:id/live", deps.Survey.LiveUpdates) // SSE
    }

    // External webhooks (incoming)
    e.POST("/webhooks/stripe", deps.Billing.StripeWebhook)
}
```

---

## 5. Key Design Decisions

### 5.1 Why Go for the Backend?

**Decision:** Go (Golang) for the API server and background workers.

**Rationale:**
- **Performance**: Compiled, low memory footprint, handles high concurrency with goroutines
- **Deployment**: Single static binary, easy to containerize, fast cold starts
- **Concurrency**: Goroutines + channels for handling thousands of concurrent survey submissions
- **JSONB support**: pgx driver has excellent JSONB support, no ORM overhead
- **sqlc**: Type-safe SQL without runtime reflection overhead
- **Asynq**: Reliable job queue built for Go, handles retries, scheduling, and priority
- **Long-term**: Easier to maintain, fewer dependencies than Node.js ecosystem

### 5.2 Why Carbon Design System?

**Decision:** IBM Carbon Design System for the frontend.

**Rationale:**
- **Enterprise-grade**: Built by IBM, used in production by large companies
- **Accessibility**: WCAG 2.1 AA compliant out of the box
- **Comprehensive**: 100+ components covering all UI needs (tables, forms, modals, tabs, etc.)
- **Design tokens**: Consistent spacing, colors, typography via Carbon tokens
- **Data-dense UIs**: Excellent `DataTable`, `StructuredList` for survey/response management
- **Customizable**: Theme system supports custom colors, fonts to match SurveyFlow brand
- **React support**: First-class React components

### 5.3 Why React (not Next.js) for Frontend?

**Decision:** React SPA with Vite (not Next.js).

**Rationale:**
- Backend is Go, not Node.js — no need for Next.js server-side rendering
- Vite provides faster development experience than Next.js for SPAs
- Simpler deployment: static files on CDN, Go API server handles all backend
- Clearer separation of concerns: React for UI, Go for API
- Better for Carbon Design System integration (no SSR hydration issues)

### 5.4 Why sqlc over GORM?

**Decision:** Use sqlc for database access.

**Rationale:**
- Write raw SQL, get type-safe Go code generated
- No ORM abstraction layer — full control over queries
- Better performance for complex JSONB queries
- Easier to optimize slow queries
- Schema changes are explicit in SQL migrations
- Trade-off: More SQL to write, but queries are more predictable

### 5.5 Why Asynq for Background Jobs?

**Decision:** Use Asynq (Redis-backed job queue).

**Rationale:**
- Built for Go, uses Redis (already needed for caching)
- Reliable: retry with exponential backoff, dead letter queue
- Priority queues, scheduled tasks
- Web UI for monitoring (asynqmon)
- Simple API: `client.Enqueue(task)`, `mux.HandleFunc(type, handler)`

### 5.6 Why JSONB for Questions & Answers?

**Decision:** Store question definitions and response answers as JSONB columns.

**Rationale:**
- New question types can be added without schema migrations
- Each question type has different settings — JSONB accommodates this naturally
- Response answers vary by question type — uniform JSONB storage simplifies queries
- PostgreSQL JSONB supports indexing (GIN), querying, and constraints
- Go's `encoding/json` handles JSONB natively with struct tags

---

## 6. Data Flow

### 6.1 Survey Creation Flow

```
React App (Browser)
  │
  ├─► POST /api/v1/surveys { title, uiMode }
  │     │
  │     ├─► [Go Handler] Validate request
  │     ├─► [Service] Create survey with empty structure
  │     ├─► [Repository] INSERT INTO surveys
  │     └─► Return survey JSON
  │
  ├─► PUT /api/v1/surveys/:id { structure: { questions, blocks, flow } }
  │     │
  │     ├─► [Go Handler] Validate JWT, check ownership
  │     ├─► [Service] Validate structure (question types, logic references)
  │     ├─► [Repository] UPDATE surveys SET structure = $1, updated_at = NOW()
  │     ├─► Invalidate Redis cache: survey:{id}:structure
  │     └─► Return updated survey
  │
  └─► POST /api/v1/surveys/:id/publish
        │
        ├─► [Go Handler] Validate JWT, check ownership
        ├─► [Service] Validate survey has questions, check plan limits
        ├─► [Repository] UPDATE surveys SET status = 'active', published_at = NOW()
        ├─► Cache survey in Redis: survey:{id}:structure (TTL 1h)
        └─► Return { shareUrl }
```

### 6.2 Survey Response Flow

```
Respondent Browser
  │
  ├─► GET /s/:id
  │     │
  │     ├─► [Go Handler] Check Redis cache for survey structure
  │     ├─► (Cache miss) SELECT from surveys → cache in Redis
  │     ├─► Validate: status = 'active', not closed, within limits
  │     ├─► Return survey JSON (title, structure, theme, settings)
  │     └─► React renders survey UI with Carbon components
  │
  └─► POST /api/v1/surveys/:id/responses { answers, metadata }
        │
        ├─► [Go Handler] Load survey structure (from Redis cache)
        ├─► [Service] Validate answers:
        │     ├─ Check required questions answered
        │     ├─ Validate answer types against question types
        │     ├─ Check custom validation rules
        │     └─ Run bot detection (honeypot, timing, behavioral)
        │
        ├─► [Repository] BEGIN TRANSACTION
        │     ├─ INSERT INTO responses
        │     ├─ INSERT INTO answers (batch)
        │     └─ UPDATE surveys SET response_count = response_count + 1
        │     COMMIT
        │
        ├─► [Asynq] Enqueue background jobs (async):
        │     ├─ Task: send-email-notification
        │     ├─ Task: dispatch-webhook
        │     ├─ Task: ai-text-analysis (if open-text answers exist)
        │     └─ Task: update-analytics-cache
        │
        └─► Return 201 { success: true, redirectUrl }
```

### 6.3 AI Analysis Flow

```
Go Worker (Asynq)
  │
  ├─► Handle Task: "ai:text-analysis" { responseId }
  │     │
  │     ├─► Load response answers (filter: text/essay types)
  │     ├─► Call Claude API (HTTP POST):
  │     │     ├─ Prompt: Analyze these responses for sentiment and themes
  │     │     └─ Response: { sentiment, themes, keyPhrases }
  │     │
  │     ├─► UPDATE responses SET ai_analysis = $1
  │     └─► UPDATE analytics_cache (increment sentiment counts)
  │
  └─► Handle Task: "ai:summarize" { surveyId }
        │
        ├─► Load all responses + existing AI analysis (batch)
        ├─► Call Claude API:
        │     ├─ Prompt: Generate executive summary of survey results
        │     └─ Response: { summary, keyFindings, recommendations }
        │
        ├─► UPDATE surveys SET ai_summary = $1
        └─► Publish SSE event: "ai:summary_ready" → notify frontend
```

---

## 7. Authentication & Authorization

### 7.1 Auth Flow

```
┌─────────┐     ┌──────────┐     ┌─────────────┐     ┌───────────┐
│ Browser  │────►│ Go API   │────►│ PostgreSQL  │────►│ Redis     │
│ (React)  │     │ (Echo)   │     │ (users)     │     │ (sessions)│
└─────────┘     └──────────┘     └─────────────┘     └───────────┘
                      │
                      ├─► Email/Password: bcrypt verify → JWT
                      ├─► Google OAuth: OAuth2 flow → JWT
                      └─► Microsoft OAuth: OAuth2 flow → JWT
```

### 7.2 JWT Strategy

```go
// JWT tokens
type Claims struct {
    UserID         string `json:"uid"`
    OrganizationID string `json:"org_id"`
    Role           string `json:"role"`
    jwt.RegisteredClaims
}

// Access token: 15 minutes
// Refresh token: 7 days (stored in Redis)
```

### 7.3 Middleware Chain (Go)

```go
// Echo middleware for authenticated routes
func JWTAuth(secret string) echo.MiddlewareFunc {
    return func(next echo.HandlerFunc) echo.HandlerFunc {
        return func(c echo.Context) error {
            token := c.Request().Header.Get("Authorization")
            // Validate JWT, extract claims
            // Store claims in context: c.Set("user", claims)
            return next(c)
        }
    }
}

func RequireRole(roles ...string) echo.MiddlewareFunc {
    return func(next echo.HandlerFunc) echo.HandlerFunc {
        return func(c echo.Context) error {
            claims := getUserClaims(c)
            if !contains(roles, claims.Role) {
                return echo.NewHTTPError(403, "Insufficient permissions")
            }
            return next(c)
        }
    }
}
```

---

## 8. Real-Time Architecture

### 8.1 Approach: Server-Sent Events (SSE)

**Decision:** Use SSE for real-time dashboard updates.

**Rationale:**
- One-way communication (server → client) sufficient for most use cases
- Simpler to implement than WebSocket in Go
- Works through CDNs and proxies
- Good fit for: live response counts, dashboard updates, notifications

### 8.2 Implementation (Go)

```go
// SSE endpoint
func (h *SurveyHandler) LiveUpdates(c echo.Context) error {
    surveyID := c.Param("id")

    c.Response().Header().Set("Content-Type", "text/event-stream")
    c.Response().Header().Set("Cache-Control", "no-cache")
    c.Response().Header().Set("Connection", "keep-alive")

    pubsub := h.Redis.Subscribe(ctx, "survey:"+surveyID+":events")
    defer pubsub.Close()

    for {
        select {
        case msg := <-pubsub.Channel():
            fmt.Fprintf(c.Response(), "data: %s\n\n", msg.Payload)
            c.Response().Flush()
        case <-ctx.Done():
            return nil
        }
    }
}
```

### 8.3 Publishing Events

```go
// After new response submitted
func (s *ResponseService) Submit(ctx context.Context, req SubmitRequest) error {
    // ... save response ...

    // Publish real-time event
    event := Event{
        Type:         "new_response",
        ResponseCount: newCount,
        Timestamp:    time.Now(),
    }
    s.Redis.Publish(ctx, "survey:"+surveyID+":events", json.Marshal(event))
    return nil
}
```

---

## 9. Background Jobs

### 9.1 Asynq Job Definitions

| Task Type | Trigger | Processing Time | Priority |
|---|---|---|---|
| `email:send` | Survey published, reminder due | < 5s | High |
| `email:notify` | New response received | < 5s | Medium |
| `webhook:dispatch` | New response received | < 2s | High |
| `ai:text-analysis` | New text response | 5-30s | Low |
| `ai:summarize` | Analytics requested, or 50 new responses | 30-120s | Low |
| `export:csv` | User requests export | 1-60s | Medium |
| `export:pdf` | User requests PDF report | 5-120s | Medium |
| `analytics:update-cache` | New response received | < 5s | Medium |
| `survey:auto-close` | Response limit or deadline reached | < 5s | Low |

### 9.2 Worker Implementation

```go
// cmd/worker/main.go
func main() {
    srv := asynq.NewServer(
        asynq.RedisClientOpt{Addr: redisAddr},
        asynq.Config{
            Concurrency: 10,
            Queues: map[string]int{
                "critical": 6,
                "default":  3,
                "low":      1,
            },
        },
    )

    mux := asynq.NewServeMux()
    mux.HandleFunc(types.TaskTypeEmailSend, handleEmailSend)
    mux.HandleFunc(types.TaskTypeAIAnalysis, handleAIAnalysis)
    mux.HandleFunc(types.TaskTypeWebhookDispatch, handleWebhookDispatch)
    mux.HandleFunc(types.TaskTypeExport, handleExport)
    mux.HandleFunc(types.TaskTypeAnalyticsCache, handleAnalyticsCache)

    srv.Run(mux)
}
```

---

## 10. File Storage

### 10.1 Storage (Cloudflare R2)

| File Type | Max Size | Retention |
|---|---|---|
| Survey images (theme, logos) | 5MB | Permanent |
| File upload responses | 5-25MB (by plan) | 90 days |
| CSV/Excel exports | 100MB | 7 days |
| PDF reports | 50MB | 7 days |
| User avatars | 2MB | Permanent |

### 10.2 Upload Flow

```
Client → POST /api/v1/upload-url { filename, contentType }
  → Server generates presigned URL (R2)
  → Client uploads directly to R2
  → Server records file reference in files table
```

### 10.3 Go Implementation

```go
func (s *StorageService) GeneratePresignedURL(ctx context.Context, key string, contentType string) (string, error) {
    // Use R2 S3-compatible API with presigned PUT
    req, _ := s.S3Client.PutObjectRequest(&s3.PutObjectInput{
        Bucket: &s.Bucket,
        Key:    &key,
    })
    return req.Presign(15 * time.Minute)
}
```

---

## 11. Caching Strategy

| Layer | Technology | TTL | Purpose |
|---|---|---|---|
| **Edge cache** | Cloudflare CDN | 5 min | Published survey static assets |
| **Application cache** | Redis | 1 hour | Survey structures, sessions |
| **Database cache** | Materialized views | N/A | Pre-computed analytics |

### Cache Key Patterns

```
survey:{id}:structure          → Survey question structure (JSON)
survey:{id}:analytics:summary  → Pre-computed analytics summary
survey:{id}:responseCount      → Live response count
session:{token}                → Session data + user context
org:{id}:members               → Organization member list
rate:{identifier}              → Rate limiting counter
```

---

## 12. Deployment & Infrastructure

### 12.1 Recommended Setup

| Component | Service | Cost |
|---|---|---|
| **Frontend** | Cloudflare Pages / Vercel | Free - $20/mo |
| **Backend API** | Railway / Fly.io / DigitalOcean | $5-20/mo |
| **Worker** | Railway / Fly.io / DigitalOcean | $5-10/mo |
| **Database** | Neon (serverless Postgres) / Supabase | Free - $19/mo |
| **Redis** | Upstash | Free - $10/mo |
| **File Storage** | Cloudflare R2 | ~$0.015/GB/mo |
| **Email** | Resend | Free - $20/mo |
| **Monitoring** | Sentry | Free - $26/mo |
| **AI** | Claude API | Pay-per-use |

**Estimated monthly infrastructure cost:**
- Development: ~$0 (free tiers)
- Production (early): ~$30-80/mo
- Production (scale): ~$150-400/mo

### 12.2 Docker Compose (Development)

```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: surveyflow
      POSTGRES_USER: surveyflow
      POSTGRES_PASSWORD: devpassword
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:
```

### 12.3 Dockerfile (Go)

```dockerfile
# Build stage
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /bin/server ./cmd/server
RUN CGO_ENABLED=0 GOOS=linux go build -o /bin/worker ./cmd/worker

# Runtime stage
FROM alpine:3.19
COPY --from=builder /bin/server /bin/server
COPY --from=builder /bin/worker /bin/worker
EXPOSE 8080
CMD ["/bin/server"]
```

### 12.4 Environment Variables

```env
# Server
APP_ENV=development
APP_PORT=8080
APP_URL=http://localhost:8080
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_URL=postgresql://surveyflow:devpassword@localhost:5432/surveyflow

# Redis
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=your-jwt-secret-key
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=168h
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
MICROSOFT_CLIENT_ID=...
MICROSOFT_CLIENT_SECRET=...

# AI
ANTHROPIC_API_KEY=...

# Email
RESEND_API_KEY=...
EMAIL_FROM=noreply@surveyflow.io

# Payments
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
STRIPE_PRO_PRICE_ID=...
STRIPE_BUSINESS_PRICE_ID=...

# Storage
R2_ACCOUNT_ID=...
R2_ACCESS_KEY=...
R2_SECRET_KEY=...
R2_BUCKET_NAME=surveyflow
R2_PUBLIC_URL=https://files.surveyflow.io

# SMS (optional)
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...

# Monitoring
SENTRY_DSN=...
```

---

## 13. Monitoring & Observability

### 13.1 Error Tracking (Sentry)

- Capture all panics and HTTP errors
- Track request performance
- Release tracking per deployment
- Alert on error spike

### 13.2 Structured Logging (Go slog)

```go
// All log entries are structured JSON
slog.Info("survey published",
    "survey_id", surveyID,
    "org_id", orgID,
    "user_id", userID,
    "response_count", count,
)
```

### 13.3 Key Metrics

| Metric | Source | Alert Threshold |
|---|---|---|
| API p95 latency | Go metrics / Sentry | > 500ms |
| Error rate | Sentry | > 1% |
| Survey submission rate | Redis counter | < 100/min sustained |
| Worker queue depth | Asynq dashboard | > 1000 jobs |
| Database connections | pgx pool stats | > 80% max |
| Job failure rate | Asynq | > 5% |
| Uptime | Health checks | < 99.9% |

---

## 14. Security Architecture

### 14.1 Security Layers

```
┌────────────────────────────────────────────┐
│  1. Network: Cloudflare (DDoS, WAF, SSL)   │
├────────────────────────────────────────────┤
│  2. App: Rate limiting, CORS, CSP,         │
│     CSRF, security headers                  │
├────────────────────────────────────────────┤
│  3. Auth: JWT, bcrypt, OAuth 2.0,          │
│     refresh tokens, 2FA                     │
├────────────────────────────────────────────┤
│  4. Authorization: Role-based,              │
│     resource ownership checks               │
├────────────────────────────────────────────┤
│  5. Data: AES-256 at rest, TLS 1.3         │
│     in transit, PostgreSQL RLS              │
├────────────────────────────────────────────┤
│  6. Audit: Activity logs, access logs,      │
│     data change tracking                    │
└────────────────────────────────────────────┘
```

### 14.2 Go Security Middleware

```go
func SecurityHeaders() echo.MiddlewareFunc {
    return func(next echo.HandlerFunc) echo.HandlerFunc {
        return func(c echo.Context) error {
            c.Response().Header().Set("X-Content-Type-Options", "nosniff")
            c.Response().Header().Set("X-Frame-Options", "DENY")
            c.Response().Header().Set("X-XSS-Protection", "1; mode=block")
            c.Response().Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
            c.Response().Header().Set("Content-Security-Policy", csp)
            c.Response().Header().Set("Strict-Transport-Security", "max-age=31536000")
            return next(c)
        }
    }
}

func RateLimit(rate int, per time.Duration) echo.MiddlewareFunc {
    return func(next echo.HandlerFunc) echo.HandlerFunc {
        limiter := rate.NewLimiter(rate.Limit(float64(rate)/per.Seconds()), rate)
        return func(c echo.Context) error {
            ip := c.RealIP()
            if !limiter.Allow() {
                return echo.NewHTTPError(429, "Too many requests")
            }
            return next(c)
        }
    }
}
```

### 14.3 Rate Limiting

| Endpoint | Limit |
|---|---|
| Auth (login, signup) | 5 req/min per IP |
| Survey submission | 10 req/min per IP |
| API (authenticated) | 100 req/min (Free), 1000 req/min (Pro+) |
| AI endpoints | 20 req/min per user |
| File upload | 5 req/min per user |
