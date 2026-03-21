# SurveyFlow — Database Schema Design

**Date:** March 2026
**Version:** 1.0
**Status:** Draft

---

## Table of Contents

1. [Overview](#1-overview)
2. [Entity Relationship Diagram](#2-entity-relationship-diagram)
3. [Schema Definitions](#3-schema-definitions)
4. [Indexes](#4-indexes)
5. [Row-Level Security](#5-row-level-security)
6. [Migrations Strategy](#6-migrations-strategy)

---

## 1. Overview

### Design Principles

- **JSONB for flexibility**: Questions, answers, survey settings, and AI results stored as JSONB to avoid migrations for new question types
- **Multi-tenant isolation**: All data scoped to `organization_id`
- **Soft deletes**: Critical tables use `deleted_at` instead of hard deletes
- **UUIDs**: All primary keys use UUIDs (no auto-increment)
- **Timestamps**: All tables have `created_at` and `updated_at`
- **Audit trail**: Key changes tracked in `audit_logs` table

### Database

- **PostgreSQL 16** with JSONB support
- **Drizzle ORM** for schema management and queries

---

## 2. Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────────┐
│ organizations│       │  org_memberships │       │      users       │
├──────────────┤       ├──────────────────┤       ├──────────────────┤
│ id (PK)      │◄──┐   │ id (PK)          │   ┌──►│ id (PK)          │
│ name         │   │   │ org_id (FK)      │   │   │ email            │
│ slug         │   └───│ user_id (FK)     │───┘   │ name             │
│ plan         │       │ role             │       │ avatar_url       │
│ stripe_*     │       │ invited_by (FK)  │       │ email_verified   │
│ settings     │       │ joined_at        │       │ created_at       │
│ created_at   │       │ created_at       │       │ updated_at       │
│ updated_at   │       └──────────────────┘       └──────────────────┘
└──────┬───────┘
       │
       │ 1:N
       │
┌──────▼───────┐       ┌──────────────────┐       ┌──────────────────┐
│   surveys    │       │     responses    │       │      answers     │
├──────────────┤       ├──────────────────┤       ├──────────────────┤
│ id (PK)      │       │ id (PK)          │       │ id (PK)          │
│ org_id (FK)  │       │ survey_id (FK)   │       │ response_id (FK) │
│ created_by   │◄──┐   │ respondent_*     │       │ question_id      │
│ title        │   │   │ status           │       │ value (JSONB)    │
│ description  │   │   │ duration_ms      │       │ metadata (JSONB) │
│ status       │   │   │ metadata (JSONB) │       │ created_at       │
│ structure    │   │   │ ai_analysis      │       └──────────────────┘
│ settings     │   │   │ created_at       │
│ theme        │   │   └──────────────────┘
│ response_cnt │   │
│ published_at │   │
│ closes_at    │   │
│ deleted_at   │   │
│ created_at   │   │
│ updated_at   │   │
└──────┬───────┘   │
       │           │
       │ 1:N       │ N:1
       │           │
┌──────▼───────┐   │
│  templates   │   │
├──────────────┤   │
│ id (PK)      │   │
│ org_id (FK?) │   │   ┌──────────────────┐
│ category     │   │   │   api_keys       │
│ title        │   │   ├──────────────────┤
│ description  │   │   │ id (PK)          │
│ structure    │   │   │ org_id (FK)      │
│ theme        │   │   │ name             │
│ is_system    │   │   │ key_hash         │
│ created_at   │   │   │ permissions      │
└──────────────┘   │   │ last_used_at     │
                   │   │ expires_at       │
┌──────────────┐   │   │ created_at       │
│  webhooks    │   │   └──────────────────┘
├──────────────┤   │
│ id (PK)      │   │   ┌──────────────────┐
│ org_id (FK)  │   │   │  integrations   │
│ survey_id?   │   │   ├──────────────────┤
│ url          │   │   │ id (PK)          │
│ events       │   │   │ org_id (FK)      │
│ secret       │   │   │ provider         │
│ is_active    │   │   │ config (JSONB)   │
│ created_at   │   │   │ enabled          │
└──────────────┘   │   │ created_at       │
                   │   │ updated_at       │
┌──────────────┐   │   └──────────────────┘
│ audit_logs   │   │
├──────────────┤   │   ┌──────────────────┐
│ id (PK)      │   │   │  email_lists    │
│ org_id (FK)  │   │   ├──────────────────┤
│ user_id (FK) │   │   │ id (PK)          │
│ action       │   │   │ org_id (FK)      │
│ resource     │   │   │ name             │
│ resource_id  │   │   │ contacts (JSONB) │
│ details      │   │   │ contact_count    │
│ ip_address   │   │   │ created_at       │
│ created_at   │   │   │ updated_at       │
└──────────────┘   │   └──────────────────┘
                   │
┌──────────────┐   │
│  invitiations│   │
├──────────────┤   │
│ id (PK)      │   │
│ org_id (FK)  │   │
│ email        │   │
│ role         │   │
│ invited_by   │   │
│ token        │   │
│ expires_at   │   │
│ accepted_at  │   │
│ created_at   │   │
└──────────────┘   │
                   │
┌──────────────┐   │
│  sessions    │   │
├──────────────┤   │
│ id (PK)      │   │
│ user_id (FK) │   │
│ token_hash   │   │
│ ip_address   │   │
│ user_agent   │   │
│ expires_at   │   │
│ created_at   │   │
└──────────────┘   │
                   │
┌──────────────┐   │
│  ai_credits  │   │
├──────────────┤   │
│ id (PK)      │   │
│ org_id (FK)  │   │
│ total        │   │
│ used         │   │
│ reset_at     │   │
│ created_at   │   │
│ updated_at   │   │
└──────────────┘   │
                   │
┌──────────────┐   │
│  usage_logs  │   │
├──────────────┤   │
│ id (PK)      │   │
│ org_id (FK)  │   │
│ metric       │   │
│ value        │   │
│ period       │   │
│ created_at   │   │
└──────────────┘   │
                   │
┌──────────────┐   │
│  files       │   │
├──────────────┤   │
│ id (PK)      │   │
│ org_id (FK)  │   │
│ survey_id?   │   │
│ response_id? │   │
│ key          │   │
│ filename     │   │
│ mime_type    │   │
│ size_bytes   │   │
│ uploaded_by  │   │
│ created_at   │   │
└──────────────┘
```

---

## 3. Schema Definitions

### 3.1 Users

```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) NOT NULL UNIQUE,
  name          VARCHAR(255),
  avatar_url    TEXT,
  password_hash TEXT,                              -- NULL for OAuth-only users
  email_verified_at TIMESTAMP,
  two_factor_secret TEXT,                         -- TOTP secret
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMP,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
```

### 3.2 Organizations

```sql
CREATE TABLE organizations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(255) NOT NULL,
  slug            VARCHAR(50) NOT NULL UNIQUE,     -- subdomain: mycompany.surveyflow.io
  plan            VARCHAR(20) NOT NULL DEFAULT 'free',
                  -- CHECK (plan IN ('free', 'starter', 'pro', 'business', 'enterprise'))
  stripe_customer_id    VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  billing_email   VARCHAR(255),
  settings        JSONB NOT NULL DEFAULT '{}',
                  -- { timezone, language, default_theme_id, data_retention_days }
  response_limit  INTEGER NOT NULL DEFAULT 100,    -- per month, by plan
  survey_limit    INTEGER NOT NULL DEFAULT 3,      -- active surveys, by plan
  member_limit    INTEGER NOT NULL DEFAULT 1,
  ai_credits      INTEGER NOT NULL DEFAULT 0,      -- monthly AI credit allocation
  current_period_start TIMESTAMPTZ,
  current_period_end   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orgs_slug ON organizations(slug);
CREATE INDEX idx_orgs_plan ON organizations(plan);
```

### 3.3 Organization Memberships

```sql
CREATE TABLE org_memberships (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role        VARCHAR(20) NOT NULL DEFAULT 'viewer',
              -- CHECK (role IN ('owner', 'admin', 'editor', 'viewer'))
  invited_by  UUID REFERENCES users(id),
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(org_id, user_id)
);

CREATE INDEX idx_memberships_org ON org_memberships(org_id);
CREATE INDEX idx_memberships_user ON org_memberships(user_id);
CREATE INDEX idx_memberships_role ON org_memberships(org_id, role);
```

### 3.4 Invitations

```sql
CREATE TABLE invitations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email       VARCHAR(255) NOT NULL,
  role        VARCHAR(20) NOT NULL DEFAULT 'viewer',
  invited_by  UUID NOT NULL REFERENCES users(id),
  token       VARCHAR(255) NOT NULL UNIQUE,        -- invite link token
  expires_at  TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,                         -- NULL = pending
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_org ON invitations(org_id);
```

### 3.5 Surveys

```sql
CREATE TABLE surveys (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by      UUID NOT NULL REFERENCES users(id),
  title           VARCHAR(500) NOT NULL,
  description     TEXT,
  status          VARCHAR(20) NOT NULL DEFAULT 'draft',
                  -- CHECK (status IN ('draft', 'active', 'paused', 'closed'))
  ui_mode         VARCHAR(20) NOT NULL DEFAULT 'classic',
                  -- CHECK (ui_mode IN ('classic', 'conversational'))

  -- Survey structure stored as JSONB for maximum flexibility
  structure       JSONB NOT NULL DEFAULT '{
    "questions": [],
    "blocks": [],
    "flow": []
  }',

  -- Survey-level settings
  settings        JSONB NOT NULL DEFAULT '{
    "welcomeScreen": { "enabled": false, "title": "", "description": "", "buttonText": "Start" },
    "thankYouScreen": { "enabled": true, "title": "Thank you!", "description": "", "redirectUrl": null },
    "progressBar": true,
    "anonymous": false,
    "responseLimit": null,
    "closesAt": null,
    "partialResponses": false,
    "captcha": false,
    "shuffleQuestions": false
  }',

  -- Theme configuration
  theme           JSONB NOT NULL DEFAULT '{
    "primaryColor": "#4F46E5",
    "secondaryColor": "#7C3AED",
    "fontFamily": "Inter",
    "fontSize": "16px",
    "backgroundColor": "#FFFFFF",
    "textColor": "#111827",
    "borderRadius": "8px",
    "logoUrl": null,
    "faviconUrl": null,
    "customCss": null
  }',

  -- Counters (denormalized for performance)
  response_count  INTEGER NOT NULL DEFAULT 0,
  view_count      INTEGER NOT NULL DEFAULT 0,

  published_at    TIMESTAMPTZ,
  closed_at       TIMESTAMPTZ,
  deleted_at      TIMESTAMPTZ,                    -- soft delete
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_surveys_org ON surveys(org_id);
CREATE INDEX idx_surveys_status ON surveys(status);
CREATE INDEX idx_surveys_created_by ON surveys(created_by);
CREATE INDEX idx_surveys_deleted ON surveys(deleted_at) WHERE deleted_at IS NOT NULL;

-- GIN index for JSONB queries on question types
CREATE INDEX idx_surveys_structure ON surveys USING GIN (structure);
```

#### Survey Structure JSONB Schema

```typescript
interface SurveyStructure {
  questions: QuestionDef[];
  blocks: BlockDef[];
  flow: FlowStep[];
}

interface QuestionDef {
  id: string;                    // UUID
  blockId: string;               // Which block this belongs to
  type: QuestionType;            // 'multiple_choice' | 'text' | 'rating_nps' | ...
  title: string;
  description?: string;
  required: boolean;
  settings: Record<string, any>; // Type-specific configuration
  choices?: Choice[];            // For multiple choice, dropdown, etc.
  validation?: ValidationRule;
  logic?: QuestionLogic;
  scoring?: ScoringConfig;
  position: number;              // Order within block
}

interface BlockDef {
  id: string;
  title?: string;
  description?: string;
  questionIds: string[];
  randomization?: {
    enabled: boolean;
    except?: string[];           // Anchored question IDs
  };
  logic?: BlockLogic;
  position: number;
}

interface FlowStep {
  id: string;
  type: 'block' | 'branch' | 'end';
  blockId?: string;
  condition?: LogicCondition;
  targetId?: string;             // Where to go next
}
```

### 3.6 Responses

```sql
CREATE TABLE responses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id       UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,

  -- Respondent identification
  respondent_email    VARCHAR(255),               -- if collected
  respondent_name     VARCHAR(255),               -- if collected
  respondent_device   VARCHAR(50),                -- desktop, mobile, tablet
  respondent_browser  VARCHAR(100),
  respondent_os       VARCHAR(50),
  respondent_country  VARCHAR(100),
  respondent_ip_hash  VARCHAR(64),                -- SHA-256 hashed IP

  -- Response metadata
  status          VARCHAR(20) NOT NULL DEFAULT 'in_progress',
                  -- CHECK (status IN ('in_progress', 'completed', 'disqualified', 'partial'))
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  duration_ms     INTEGER,                         -- time to complete
  source          VARCHAR(50),                    -- web_link, email, embed, sms, api
  source_detail   VARCHAR(255),                   -- specific source info
  language        VARCHAR(10),                    -- ISO 639-1
  embedded_data   JSONB NOT NULL DEFAULT '{}',    -- from URL params, CRM, etc.

  -- Quality flags
  quality_flags   JSONB NOT NULL DEFAULT '{
    "isSpeeder": false,
    "isStraightLiner": false,
    "isBotSuspect": false,
    "attentionCheckFailed": false
  }',

  -- AI analysis (populated by background job)
  ai_analysis     JSONB,                           -- { sentiment, themes, keyPhrases }

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_responses_survey ON responses(survey_id);
CREATE INDEX idx_responses_status ON responses(survey_id, status);
CREATE INDEX idx_responses_created ON responses(created_at);
CREATE INDEX idx_responses_source ON responses(survey_id, source);
CREATE INDEX idx_responses_quality ON responses USING GIN (quality_flags);
```

### 3.7 Answers

```sql
CREATE TABLE answers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id     UUID NOT NULL REFERENCES responses(id) ON DELETE CASCADE,
  question_id     VARCHAR(36) NOT NULL,            -- references survey structure question ID
  value           JSONB NOT NULL,                  -- flexible: string, number, array, object
  metadata        JSONB NOT NULL DEFAULT '{}',     -- { position, duration_ms, fileRef }
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_answers_response ON answers(response_id);
CREATE INDEX idx_answers_question ON answers(question_id);
CREATE INDEX idx_answers_value ON answers USING GIN (value);
CREATE UNIQUE INDEX idx_answers_unique ON answers(response_id, question_id);
```

#### Answer Value JSONB Examples

```typescript
// Multiple choice (single): "choice_abc123"
// Multiple choice (multi): ["choice_abc123", "choice_def456"]
// Text: "This is my feedback..."
// Rating (Likert): 4
// Rating (NPS): 9
// Rating (Star): 5
// Slider: 72
// Ranking: ["item_a", "item_c", "item_b"]
// Matrix: { "row_1": "col_3", "row_2": "col_1" }
// File upload: { "fileId": "uuid", "fileName": "photo.jpg", "fileUrl": "https://...", "fileSize": 1024000 }
// Date: "2026-03-21"
// Yes/No: true
// Constant sum: { "item_a": 40, "item_b": 35, "item_c": 25 }
// Signature: { "imageUrl": "https://..." }
// Consent: true
// Hidden field: "premium_plan"
```

### 3.8 Templates

```sql
CREATE TABLE templates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID REFERENCES organizations(id) ON DELETE CASCADE,  -- NULL = system template
  category        VARCHAR(50) NOT NULL,
                  -- 'customer_satisfaction', 'employee_engagement', 'market_research',
                  -- 'event_feedback', 'lead_generation', 'product_feedback',
                  -- 'website_feedback', 'education', 'healthcare', 'restaurant'
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  tags            TEXT[] DEFAULT '{}',
  structure       JSONB NOT NULL,                 -- Same schema as surveys.structure
  theme           JSONB NOT NULL,                 -- Same schema as surveys.theme
  cover_image_url TEXT,
  is_featured     BOOLEAN DEFAULT FALSE,
  use_count       INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_templates_category ON templates(category);
CREATE INDEX idx_templates_org ON templates(org_id) WHERE org_id IS NOT NULL;
CREATE INDEX idx_templates_system ON templates(org_id) WHERE org_id IS NULL;
```

### 3.9 Webhooks

```sql
CREATE TABLE webhooks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  survey_id       UUID REFERENCES surveys(id) ON DELETE CASCADE,  -- NULL = all surveys
  name            VARCHAR(255) NOT NULL,
  url             TEXT NOT NULL,
  secret          VARCHAR(255) NOT NULL,           -- for HMAC signature
  events          TEXT[] NOT NULL DEFAULT '{"response.created"}',
                  -- 'response.created', 'response.completed', 'survey.published',
                  -- 'survey.closed', 'survey.limit_reached'
  is_active       BOOLEAN DEFAULT TRUE,
  last_delivery_at TIMESTAMPTZ,
  failure_count   INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_webhooks_org ON webhooks(org_id);
CREATE INDEX idx_webhooks_survey ON webhooks(survey_id);
CREATE INDEX idx_webhooks_active ON webhooks(is_active) WHERE is_active = TRUE;
```

### 3.10 API Keys

```sql
CREATE TABLE api_keys (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            VARCHAR(255) NOT NULL,
  key_prefix      VARCHAR(8) NOT NULL,             -- First 8 chars for identification: "sf_live_"
  key_hash        VARCHAR(255) NOT NULL UNIQUE,    -- SHA-256 hash of full key
  permissions     JSONB NOT NULL DEFAULT '{
    "surveys": ["read", "write"],
    "responses": ["read", "write"],
    "analytics": ["read"],
    "templates": ["read"]
  }',
  last_used_at    TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,
  created_by      UUID NOT NULL REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ                       -- soft delete
);

CREATE INDEX idx_apikeys_org ON api_keys(org_id);
CREATE INDEX idx_apikeys_hash ON api_keys(key_hash);
CREATE INDEX idx_apikeys_prefix ON api_keys(key_prefix);
```

### 3.11 Integrations

```sql
CREATE TABLE integrations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider        VARCHAR(50) NOT NULL,            -- 'slack', 'hubspot', 'salesforce', 'google_sheets', 'zapier'
  config          JSONB NOT NULL,                  -- Provider-specific config (encrypted at rest)
  enabled         BOOLEAN DEFAULT TRUE,
  last_sync_at    TIMESTAMPTZ,
  error_message   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(org_id, provider)
);

CREATE INDEX idx_integrations_org ON integrations(org_id);
CREATE INDEX idx_integrations_provider ON integrations(org_id, provider);
```

### 3.12 Email Lists

```sql
CREATE TABLE email_lists (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            VARCHAR(255) NOT NULL,
  description     TEXT,
  contact_count   INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE email_contacts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id         UUID NOT NULL REFERENCES email_lists(id) ON DELETE CASCADE,
  email           VARCHAR(255) NOT NULL,
  first_name      VARCHAR(255),
  last_name       VARCHAR(255),
  custom_fields   JSONB NOT NULL DEFAULT '{}',    -- { company, role, plan, ... }
  status          VARCHAR(20) DEFAULT 'active',
                  -- 'active', 'unsubscribed', 'bounced'
  unsubscribed_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(list_id, email)
);

CREATE INDEX idx_contacts_list ON email_contacts(list_id);
CREATE INDEX idx_contacts_email ON email_contacts(email);
```

### 3.13 Files

```sql
CREATE TABLE files (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  survey_id       UUID REFERENCES surveys(id) ON DELETE SET NULL,
  response_id     UUID REFERENCES responses(id) ON DELETE SET NULL,
  key             TEXT NOT NULL,                   -- R2 object key
  filename        VARCHAR(500) NOT NULL,
  mime_type       VARCHAR(100) NOT NULL,
  size_bytes      INTEGER NOT NULL,
  purpose         VARCHAR(50) NOT NULL,
                  -- 'survey_logo', 'survey_theme', 'response_upload', 'export', 'avatar'
  uploaded_by     UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_files_org ON files(org_id);
CREATE INDEX idx_files_survey ON files(survey_id);
CREATE INDEX idx_files_response ON files(response_id);
```

### 3.14 AI Credits

```sql
CREATE TABLE ai_credits (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  total           INTEGER NOT NULL,               -- Monthly allocation
  used            INTEGER NOT NULL DEFAULT 0,
  reset_at        TIMESTAMPTZ NOT NULL,            -- When credits reset
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(org_id, reset_at)
);
```

### 3.15 Usage Logs

```sql
CREATE TABLE usage_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  metric          VARCHAR(50) NOT NULL,
                  -- 'responses', 'surveys', 'emails_sent', 'ai_credits_used', 'sms_sent'
  value           INTEGER NOT NULL DEFAULT 1,
  period_start    DATE NOT NULL,                  -- Start of billing period
  period_end      DATE NOT NULL,                  -- End of billing period
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_usage_org_period ON usage_logs(org_id, period_start, period_end);
CREATE INDEX idx_usage_metric ON usage_logs(metric);
```

### 3.16 Audit Logs

```sql
CREATE TABLE audit_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES users(id),
  action          VARCHAR(50) NOT NULL,
                  -- 'survey.create', 'survey.publish', 'survey.delete',
                  -- 'response.delete', 'member.invite', 'member.remove',
                  -- 'settings.update', 'billing.change_plan'
  resource_type   VARCHAR(50) NOT NULL,           -- 'survey', 'response', 'member', 'org'
  resource_id     UUID,
  details         JSONB,                          -- What changed
  ip_address      VARCHAR(45),
  user_agent      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_org ON audit_logs(org_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- Partition by month for performance (if volume is high)
-- PARTITION BY RANGE (created_at)
```

### 3.17 Analytics Cache (Materialized View)

```sql
-- Pre-computed analytics for fast dashboard loading
CREATE TABLE analytics_cache (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id       UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  question_id     VARCHAR(36) NOT NULL,
  metric_type     VARCHAR(50) NOT NULL,
                  -- 'response_count', 'choice_distribution', 'average_rating',
                  -- 'nps_score', 'sentiment_distribution', 'completion_rate'
  data            JSONB NOT NULL,                  -- Pre-computed result
  segment         VARCHAR(100),                   -- Optional segment filter
  computed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(survey_id, question_id, metric_type, COALESCE(segment, ''))
);

CREATE INDEX idx_analytics_survey ON analytics_cache(survey_id);
CREATE INDEX idx_analytics_computed ON analytics_cache(computed_at);
```

---

## 4. Indexes

### Summary of All Indexes

| Table | Index | Type | Purpose |
|---|---|---|---|
| users | email | B-tree | Login lookup |
| organizations | slug | B-tree | Subdomain lookup |
| org_memberships | (org_id, user_id) | B-tree (unique) | Prevent duplicates |
| org_memberships | org_id | B-tree | List members |
| org_memberships | user_id | B-tree | User's orgs |
| surveys | org_id | B-tree | List surveys |
| surveys | status | B-tree | Filter by status |
| surveys | structure | GIN | JSONB queries |
| responses | survey_id | B-tree | List responses |
| responses | (survey_id, status) | B-tree | Filter completed |
| responses | quality_flags | GIN | Quality filtering |
| answers | response_id | B-tree | Load all answers |
| answers | (response_id, question_id) | B-tree (unique) | Prevent duplicates |
| answers | value | GIN | Search answer values |
| audit_logs | (resource_type, resource_id) | B-tree | Audit trail lookup |
| analytics_cache | survey_id | B-tree | Dashboard loading |

---

## 5. Row-Level Security

### RLS Policies (PostgreSQL)

```sql
-- Enable RLS on key tables
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Users can only access data from their organization
CREATE POLICY org_isolation ON surveys
  USING (org_id = get_current_org_id());

CREATE POLICY org_isolation ON responses
  USING (survey_id IN (SELECT id FROM surveys WHERE org_id = get_current_org_id()));

CREATE POLICY org_isolation ON webhooks
  USING (org_id = get_current_org_id());

-- Function to get current org from session context
CREATE OR REPLACE FUNCTION get_current_org_id()
RETURNS UUID AS $$
  SELECT current_setting('app.org_id', true)::UUID;
$$ LANGUAGE SQL STABLE;
```

### Application-Level Isolation

In addition to RLS, every database query includes `org_id` filter:

```typescript
// Drizzle query example
const surveys = await db
  .select()
  .from(surveysTable)
  .where(eq(surveysTable.orgId, organizationId));
```

---

## 6. Migrations Strategy

### Approach

- **Drizzle Kit** for migration generation and management
- **Migrations are never edited** — always generate new ones
- **Backward-compatible** changes only — no destructive operations
- **JSONB schema changes** are versioned inside the JSONB itself

### Migration Workflow

```bash
# 1. Modify schema in packages/db/schema/
# 2. Generate migration
pnpm drizzle-kit generate

# 3. Review generated SQL in packages/db/migrations/
# 4. Apply migration
pnpm drizzle-kit migrate

# 5. Deploy to production
pnpm drizzle-kit push  # For development only
```

### JSONB Versioning

Since questions and answers use JSONB, schema changes are handled via version field:

```typescript
interface SurveyStructure {
  version: 1;  // Increment when adding new question types or changing structure format
  questions: QuestionDef[];
  blocks: BlockDef[];
  flow: FlowStep[];
}
```

The application reads the version and applies any migration logic when loading older structures.
