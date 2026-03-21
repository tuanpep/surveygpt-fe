# SurveyFlow — API Design

**Date:** March 2026
**Version:** 1.0
**Status:** Draft

---

## Table of Contents

1. [Overview](#1-overview)
2. [Authentication](#2-authentication)
3. [tRPC API (Internal)](#3-trpc-api-internal)
4. [REST API (External)](#4-rest-api-external)
5. [Webhooks (Outgoing)](#5-webhooks-outgoing)
6. [Embed SDK](#6-embed-sdk)
7. [Error Handling](#7-error-handling)
8. [Rate Limiting](#8-rate-limiting)
9. [Pagination](#9-pagination)

---

## 1. Overview

SurveyFlow has two API layers:

| API | Protocol | Audience | Auth |
|---|---|---|---|
| **tRPC API** | tRPC (TypeScript RPC over HTTP) | Internal (Next.js frontend) | JWT session |
| **REST API v1** | HTTP REST (JSON) | External (third-party integrations, API key) | Bearer token (API key) |

Both APIs share the same business logic layer and database access.

---

## 2. Authentication

### 2.1 Session Auth (tRPC)

```
Cookie: next-auth.session-token=<jwt>
```

All tRPC calls from the Next.js frontend use HTTP-only cookies for authentication.

### 2.2 API Key Auth (REST)

```
Authorization: Bearer sf_live_<64-char-key>
```

API keys are scoped to an organization and have configurable permissions.

### 2.3 API Key Format

```
sf_live_a1b2c3d4e5f6g7h8...  (production)
sf_test_a1b2c3d4e5f6g7h8...  (test/sandbox)
```

---

## 3. tRPC API (Internal)

### Base URL: `/api/trpc`

### 3.1 Auth Router

```typescript
// auth.signUp
auth.signUp.mutate({
  email: "user@example.com",
  password: "SecurePass123!",
  name: "John Doe"
})
// Returns: { user, session }

// auth.signIn
auth.signIn.mutate({
  email: "user@example.com",
  password: "SecurePass123!"
})
// Returns: { user, session }

// auth.signOut
auth.signOut.mutate()
// Returns: { success: true }

// auth.forgotPassword
auth.forgotPassword.mutate({ email: "user@example.com" })
// Returns: { success: true }

// auth.resetPassword
auth.resetPassword.mutate({
  token: "reset-token-from-email",
  password: "NewSecurePass123!"
})
// Returns: { success: true }

// auth.changePassword
auth.changePassword.mutate({
  currentPassword: "OldPass123!",
  newPassword: "NewSecurePass123!"
})
// Returns: { success: true }

// auth.setup2FA
auth.setup2FA.mutate()
// Returns: { secret, qrCodeUrl }

// auth.verify2FA
auth.verify2FA.mutate({ code: "123456" })
// Returns: { recoveryCodes }
```

### 3.2 Organization Router

```typescript
// organization.create
organization.create.mutate({
  name: "My Company",
  slug: "mycompany"
})
// Returns: { organization, membership }

// organization.get
organization.get.query()
// Returns: { id, name, slug, plan, memberCount, ... }

// organization.update
organization.update.mutate({
  name: "Updated Name",
  settings: { timezone: "America/New_York" }
})
// Returns: { organization }

// organization.getMembers
organization.getMembers.query()
// Returns: Membership[]

// organization.inviteMember
organization.inviteMember.mutate({
  email: "newuser@example.com",
  role: "editor"
})
// Returns: { invitation }

// organization.updateMemberRole
organization.updateMemberRole.mutate({
  userId: "user-uuid",
  role: "admin"
})
// Returns: { membership }

// organization.removeMember
organization.removeMember.mutate({ userId: "user-uuid" })
// Returns: { success: true }

// organization.getUsage
organization.getUsage.query()
// Returns: {
//   responses: { used: 450, limit: 1000 },
//   surveys: { used: 8, limit: 25 },
//   members: { used: 3, limit: 10 },
//   aiCredits: { used: 12, limit: 100 }
// }
```

### 3.3 Survey Router

```typescript
// survey.list
survey.list.query({
  status?: "draft" | "active" | "closed",
  search?: string,
  sortBy?: "createdAt" | "updatedAt" | "responseCount",
  sortOrder?: "asc" | "desc",
  cursor?: string,
  limit?: number
})
// Returns: { surveys: Survey[], nextCursor: string | null }

// survey.getById
survey.getById.query({ id: "survey-uuid" })
// Returns: Survey

// survey.create
survey.create.mutate({
  title: "Customer Satisfaction Survey",
  description: "Help us improve our service",
  uiMode: "classic" | "conversational"
})
// Returns: Survey

// survey.createFromTemplate
survey.createFromTemplate.mutate({
  templateId: "template-uuid"
})
// Returns: Survey

// survey.createFromAI
survey.createFromAI.mutate({
  prompt: "Create a 10-question NPS survey for a SaaS product",
  tone: "professional" | "casual" | "fun",
  length: "short" | "medium" | "long",
  includeNPS: true
})
// Returns: Survey (with AI-generated structure)

// survey.update
survey.update.mutate({
  id: "survey-uuid",
  title: "Updated Title",
  description: "Updated description",
  settings: { progressBar: true, anonymous: false },
  theme: { primaryColor: "#4F46E5" }
})
// Returns: Survey

// survey.addQuestion
survey.addQuestion.mutate({
  surveyId: "survey-uuid",
  blockId: "block-uuid",
  question: {
    type: "multiple_choice",
    title: "How satisfied are you?",
    required: true,
    choices: [
      { label: "Very satisfied" },
      { label: "Satisfied" },
      { label: "Neutral" },
      { label: "Dissatisfied" },
      { label: "Very dissatisfied" }
    ]
  }
})
// Returns: Survey (updated structure)

// survey.updateQuestion
survey.updateQuestion.mutate({
  surveyId: "survey-uuid",
  questionId: "question-uuid",
  updates: { title: "Updated question?", required: false }
})
// Returns: Survey

// survey.removeQuestion
survey.removeQuestion.mutate({
  surveyId: "survey-uuid",
  questionId: "question-uuid"
})
// Returns: Survey

// survey.reorderQuestions
survey.reorderQuestions.mutate({
  surveyId: "survey-uuid",
  blockId: "block-uuid",
  questionIds: ["q1", "q3", "q2"]  // New order
})
// Returns: Survey

// survey.duplicateQuestion
survey.duplicateQuestion.mutate({
  surveyId: "survey-uuid",
  questionId: "question-uuid"
})
// Returns: Survey

// survey.addBlock
survey.addBlock.mutate({
  surveyId: "survey-uuid",
  title: "Section 2: Demographics"
})
// Returns: Survey

// survey.updateLogic
survey.updateLogic.mutate({
  surveyId: "survey-uuid",
  logic: { /* full logic config */ }
})
// Returns: Survey

// survey.publish
survey.publish.mutate({ id: "survey-uuid" })
// Returns: { survey, shareUrl }

// survey.unpublish
survey.unpublish.mutate({ id: "survey-uuid" })
// Returns: Survey

// survey.close
survey.close.mutate({ id: "survey-uuid" })
// Returns: Survey

// survey.duplicate
survey.duplicate.mutate({ id: "survey-uuid" })
// Returns: Survey (new copy)

// survey.archive
survey.archive.mutate({ id: "survey-uuid" })
// Returns: { success: true }

// survey.delete
survey.delete.mutate({ id: "survey-uuid" })
// Returns: { success: true }

// survey.saveAsTemplate
survey.saveAsTemplate.mutate({
  surveyId: "survey-uuid",
  name: "My Custom Template",
  category: "customer_satisfaction"
})
// Returns: Template
```

### 3.4 Response Router

```typescript
// response.getPublicSurvey
response.getPublicSurvey.query({ surveyId: "survey-uuid" })
// No auth required — used by respondent UI
// Returns: { survey (public fields only: title, description, structure, theme, settings) }

// response.submit
response.submit.mutate({
  surveyId: "survey-uuid",
  answers: [
    { questionId: "q1", value: "Very satisfied" },
    { questionId: "q2", value: "Great service!" },
    { questionId: "q3", value: 9 }
  ],
  metadata: {
    duration: 45000,
    source: "web_link",
    embeddedData: { utm_source: "twitter" }
  }
})
// No auth required
// Returns: { success: true, redirectUrl: "/s/uuid/thank-you" }

// response.savePartial
response.savePartial.mutate({
  surveyId: "survey-uuid",
  answers: [...],
  responseToken: "partial-response-token"  // from initial page load
})
// No auth required
// Returns: { responseToken }

// response.resumePartial
response.resumePartial.query({
  surveyId: "survey-uuid",
  responseToken: "partial-response-token"
})
// No auth required
// Returns: { answers: [...] }

// response.list (authenticated)
response.list.query({
  surveyId: "survey-uuid",
  status?: "completed" | "in_progress" | "disqualified",
  source?: "web_link" | "email" | "embed" | "sms",
  dateFrom?: "2026-01-01",
  dateTo?: "2026-03-31",
  cursor?: string,
  limit?: number
})
// Returns: { responses: ResponseSummary[], nextCursor }

// response.getById (authenticated)
response.getById.query({
  surveyId: "survey-uuid",
  responseId: "response-uuid"
})
// Returns: Response (with all answers)

// response.delete (authenticated)
response.delete.mutate({
  surveyId: "survey-uuid",
  responseId: "response-uuid"
})
// Returns: { success: true }

// response.flag (authenticated)
response.flag.mutate({
  responseId: "response-uuid",
  reason: "duplicate" | "spam" | "incomplete",
  note: "Optional note"
})
// Returns: { success: true }

// response.export (authenticated)
response.export.mutate({
  surveyId: "survey-uuid",
  format: "csv" | "xlsx" | "pdf",
  filters?: {
    dateFrom?: string,
    dateTo?: string,
    status?: string,
    source?: string
  },
  includeMetadata?: boolean
})
// Returns: { downloadUrl, expiresAt }
// (Async: generates file in background, returns download URL)
```

### 3.5 Analytics Router

```typescript
// analytics.getSummary
analytics.getSummary.query({ surveyId: "survey-uuid" })
// Returns: {
//   totalResponses: 450,
//   completionRate: 0.82,
//   averageDuration: 45000,
//   npsScore: 42,
//   responsesByDay: [{ date: "2026-03-20", count: 25 }, ...],
//   responsesBySource: { web_link: 300, email: 100, embed: 50 },
//   responsesByDevice: { desktop: 250, mobile: 180, tablet: 20 }
// }

// analytics.getQuestionStats
analytics.getQuestionStats.query({
  surveyId: "survey-uuid",
  questionId: "question-uuid",
  segment?: string  // optional filter
})
// Returns: {
//   questionId: "...",
//   type: "multiple_choice",
//   totalResponses: 440,
//   stats: {
//     // For multiple_choice:
//     distribution: [
//       { choice: "Very satisfied", count: 120, percentage: 27.3 },
//       { choice: "Satisfied", count: 180, percentage: 40.9 },
//       ...
//     ]
//     // For rating:
//     // average: 4.2, distribution: [{ value: 5, count: 200 }, ...]
//     // For NPS:
//     // score: 42, promoters: 55%, passives: 25%, detractors: 20%
//     // For text:
//     // responseCount: 300, avgWordCount: 15, topWords: [...]
//   }
// }

// analytics.getCrossTab
analytics.getCrossTab.query({
  surveyId: "survey-uuid",
  questionIdA: "q1",
  questionIdB: "q5"
})
// Returns: {
//   rows: ["Very satisfied", "Satisfied", ...],
//   columns: ["Promoter", "Passive", "Detractor"],
//   data: [[45, 20, 10], [80, 30, 15], ...],
//   totalRow: [...],
//   totalColumn: [...],
//   chiSquare: { value: 12.4, pValue: 0.002, significant: true }
// }

// analytics.getDropoff
analytics.getDropoff.query({ surveyId: "survey-uuid" })
// Returns: {
//   steps: [
//     { questionId: "q1", title: "...", views: 500, dropoffs: 20, dropoffRate: 0.04, avgTime: 5000 },
//     { questionId: "q2", title: "...", views: 480, dropoffs: 80, dropoffRate: 0.17, avgTime: 12000 },
//     ...
//   ],
//   totalDropoffRate: 0.18
// }

// analytics.getAIInsights
analytics.getAIInsights.query({ surveyId: "survey-uuid" })
// Returns: {
//   summary: "Overall satisfaction is high with 82% of respondents...",
//   keyFindings: [
//     "Customer support quality is the top driver of satisfaction",
//     "Mobile users report lower satisfaction than desktop users",
//     ...
//   ],
//   sentiments: {
//     positive: 65, neutral: 25, negative: 10,
//     themes: [
//       { theme: "Customer Support", sentiment: "positive", count: 45, quotes: ["..."] },
//       { theme: "Pricing", sentiment: "negative", count: 30, quotes: ["..."] },
//       ...
//     ]
//   },
//   recommendations: [
//     "Focus on improving mobile experience based on lower satisfaction scores",
//     ...
//   ]
// }

// analytics.getComparison
analytics.getComparison.query({
  surveyId: "survey-uuid",
  segmentA: { field: "source", value: "email" },
  segmentB: { field: "source", value: "web_link" }
})
// Returns: { segmentA: { ... }, segmentB: { ... }, differences: [...] }
```

### 3.6 AI Router

```typescript
// ai.generateSurvey
ai.generateSurvey.mutate({
  prompt: "Create a customer satisfaction survey for my coffee shop",
  tone: "professional" | "casual" | "fun",
  length: "short" | "medium" | "long",
  options: {
    includeNPS: true,
    includeDemographics: false,
    includeOpenText: true
  }
})
// Returns: {
//   title: "...",
//   description: "...",
//   questions: QuestionDef[],
//   theme: ThemeConfig
// }

// ai.suggestQuestions
ai.suggestQuestions.query({
  surveyId: "survey-uuid",
  context: "I want to add questions about pricing"
})
// Returns: {
//   suggestions: [
//     { type: "rating", title: "How would you rate our pricing?", ... },
//     { type: "multiple_choice", title: "Which pricing plan do you use?", ... },
//     ...
//   ]
// }

// ai.regenerateQuestion
ai.regenerateQuestion.mutate({
  surveyId: "survey-uuid",
  questionId: "question-uuid",
  instruction: "Make this question more specific about customer support"
})
// Returns: QuestionDef

// ai.analyzeText
ai.analyzeText.mutate({
  surveyId: "survey-uuid",
  questionId: "question-uuid"  // text/essay question
})
// Returns: {
//   sentiment: { overall: "positive", score: 0.72, distribution: {...} },
//   themes: [{ name: "...", count: 30, percentage: 15, keywords: [...], quotes: [...] }],
//   keyPhrases: [{ phrase: "great service", count: 25 }, ...],
//   wordCloud: [{ text: "service", weight: 80 }, ...]
// }

// ai.summarizeResponses
ai.summarizeResponses.mutate({ surveyId: "survey-uuid" })
// Returns: {
//   summary: "...",
//   keyFindings: [...],
//   notableQuotes: [...],
//   recommendations: [...]
// }
```

### 3.7 Template Router

```typescript
// template.list
template.list.query({
  category?: "customer_satisfaction" | "employee_engagement" | ...,
  search?: string
})
// Returns: Template[]

// template.getById
template.getById.query({ id: "template-uuid" })
// Returns: Template

// template.getOrgTemplates
template.getOrgTemplates.query()
// Returns: Template[] (custom templates for this org)
```

### 3.8 Distribution Router

```typescript
// distribution.getEmailLists
distribution.getEmailLists.query()
// Returns: EmailList[]

// distribution.createEmailList
distribution.createEmailList.mutate({
  name: "Q1 Customers",
  contacts: [
    { email: "a@example.com", firstName: "Alice", lastName: "Smith" },
    { email: "b@example.com", firstName: "Bob", lastName: "Jones" }
  ]
})
// Returns: EmailList

// distribution.sendEmails
distribution.sendEmails.mutate({
  surveyId: "survey-uuid",
  listId: "list-uuid",
  subject: "We'd love your feedback!",
  body: "Hi {{firstName}},\n\nPlease take 2 minutes to share your thoughts...",
  senderName: "Acme Corp",
  scheduleAt?: "2026-04-01T09:00:00Z"
})
// Returns: { jobId, estimatedRecipients: 500 }

// distribution.getQRCode
distribution.getQRCode.query({ surveyId: "survey-uuid" })
// Returns: { svg: "...", pngUrl: "..." }

// distribution.getEmbedCode
distribution.getEmbedCode.query({
  surveyId: "survey-uuid",
  mode: "inline" | "popup" | "slide-in" | "floating",
  trigger?: { type: "exit_intent" | "time_on_page", value: 30 }
})
// Returns: { htmlSnippet: "<script>...</script>" }
```

### 3.9 Integration Router

```typescript
// integration.list
integration.list.query()
// Returns: Integration[]

// integration.connect
integration.connect.mutate({
  provider: "slack",
  config: { /* OAuth callback data */ }
})
// Returns: Integration

// integration.disconnect
integration.disconnect.mutate({ provider: "slack" })
// Returns: { success: true }
```

### 3.10 Webhook Router

```typescript
// webhook.list
webhook.list.query({ surveyId?: "survey-uuid" })
// Returns: Webhook[]

// webhook.create
webhook.create.mutate({
  name: "New Response Webhook",
  url: "https://myapp.com/webhooks/surveyflow",
  events: ["response.created", "response.completed"],
  surveyId?: "survey-uuid"
})
// Returns: Webhook (includes secret)

// webhook.update
webhook.update.mutate({
  id: "webhook-uuid",
  url: "https://new-url.com/webhook",
  events: ["response.created"],
  isActive: true
})
// Returns: Webhook

// webhook.delete
webhook.delete.mutate({ id: "webhook-uuid" })
// Returns: { success: true }

// webhook.getDeliveryLog
webhook.getDeliveryLog.query({ webhookId: "webhook-uuid" })
// Returns: WebhookDelivery[]
```

### 3.11 Billing Router

```typescript
// billing.getPlan
billing.getPlan.query()
// Returns: { plan, currentPeriod, usage, nextBillingDate }

// billing.getPlans
billing.getPlans.query()
// Returns: Plan[] (all available plans with features)

// billing.changePlan
billing.changePlan.mutate({
  newPlan: "pro",
  billingPeriod: "monthly" | "annual"
})
// Returns: { checkoutUrl } (Stripe Checkout)

// billing.getPortalUrl
billing.getPortalUrl.query()
// Returns: { url } (Stripe Customer Portal)

// billing.getHistory
billing.getHistory.query({ limit?: number })
// Returns: Invoice[]
```

### 3.12 API Key Router

```typescript
// apiKey.list
apiKey.list.query()
// Returns: ApiKey[]

// apiKey.create
apiKey.create.mutate({
  name: "My Integration",
  permissions: {
    surveys: ["read", "write"],
    responses: ["read"],
    analytics: ["read"]
  },
  expiresAt?: "2027-03-21T00:00:00Z"
})
// Returns: { key: "sf_live_... (full key, only shown once)" }

// apiKey.revoke
apiKey.revoke.mutate({ id: "api-key-uuid" })
// Returns: { success: true }
```

---

## 4. REST API (External)

### Base URL: `https://api.surveyflow.io/v1`

All requests require `Authorization: Bearer sf_live_<key>` header.

### 4.1 Surveys

```
GET    /v1/surveys                    List surveys
POST   /v1/surveys                    Create survey
GET    /v1/surveys/:id                Get survey details
PUT    /v1/surveys/:id                Update survey
DELETE /v1/surveys/:id                Delete survey
POST   /v1/surveys/:id/publish        Publish survey
POST   /v1/surveys/:id/close          Close survey
```

**Example: Create Survey**
```json
POST /v1/surveys
{
  "title": "Customer Satisfaction Survey",
  "ui_mode": "classic",
  "structure": {
    "questions": [
      {
        "id": "q1",
        "type": "rating_nps",
        "title": "How likely are you to recommend us?",
        "required": true,
        "position": 0
      },
      {
        "id": "q2",
        "type": "text",
        "title": "What could we improve?",
        "required": false,
        "position": 1
      }
    ]
  }
}

Response 201:
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Customer Satisfaction Survey",
  "status": "draft",
  "created_at": "2026-03-21T10:00:00Z",
  "share_url": null
}
```

### 4.2 Responses

```
GET    /v1/surveys/:id/responses              List responses
GET    /v1/surveys/:id/responses/:rid         Get single response
DELETE /v1/surveys/:id/responses/:rid         Delete response
POST   /v1/surveys/:id/responses/export       Request export
```

**Example: List Responses**
```json
GET /v1/surveys/550e8400.../responses?status=completed&limit=20&offset=0

Response 200:
{
  "data": [
    {
      "id": "resp-1",
      "status": "completed",
      "duration_ms": 45000,
      "source": "web_link",
      "created_at": "2026-03-21T10:05:00Z"
    }
  ],
  "pagination": {
    "total": 450,
    "limit": 20,
    "offset": 0,
    "has_more": true
  }
}
```

### 4.3 Analytics

```
GET /v1/surveys/:id/analytics/summary          Get summary stats
GET /v1/surveys/:id/analytics/questions/:qid   Get question stats
GET /v1/surveys/:id/analytics/cross-tab        Cross-tabulation
GET /v1/surveys/:id/analytics/dropoff          Drop-off analysis
```

### 4.4 Error Responses (REST)

```json
{
  "error": {
    "code": "SURVEY_NOT_FOUND",
    "message": "Survey with ID 'xxx' not found",
    "status": 404,
    "details": {}
  }
}
```

| HTTP Status | Error Code | Description |
|---|---|---|
| 400 | VALIDATION_ERROR | Invalid request body/params |
| 401 | UNAUTHORIZED | Missing or invalid API key |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Duplicate resource |
| 422 | UNPROCESSABLE | Business logic violation |
| 429 | RATE_LIMITED | Too many requests |
| 500 | INTERNAL_ERROR | Server error |

---

## 5. Webhooks (Outgoing)

### 5.1 Events

| Event | Trigger | Payload |
|---|---|---|
| `response.created` | New response started | Response metadata |
| `response.completed` | Response submitted | Full response + answers |
| `survey.published` | Survey status → active | Survey details |
| `survey.closed` | Survey status → closed | Survey details |
| `survey.limit_reached` | Response limit hit | Survey + count |
| `ai.analysis_completed` | AI analysis finished | Survey + analysis results |

### 5.2 Webhook Payload

```json
POST https://yourapp.com/webhook

Headers:
  X-SurveyFlow-Signature: sha256=abc123...
  X-SurveyFlow-Event: response.completed
  X-SurveyFlow-Delivery: delivery-uuid

Body:
{
  "event": "response.completed",
  "timestamp": "2026-03-21T10:05:00Z",
  "delivery_id": "del-uuid",
  "data": {
    "survey_id": "550e8400...",
    "response": {
      "id": "resp-1",
      "status": "completed",
      "duration_ms": 45000,
      "source": "web_link",
      "answers": {
        "q1": 9,
        "q2": "Great service!"
      },
      "metadata": {
        "device": "mobile",
        "country": "US"
      }
    }
  }
}
```

### 5.3 Signature Verification

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expected = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}
```

### 5.4 Retry Logic

- Retry on 5xx, network errors, or timeout (5 second timeout)
- Exponential backoff: 1min, 5min, 30min, 2h, 5h, 10h (6 retries max)
- After 6 failures: mark webhook as failed, notify org admin
- Webhook delivery log viewable in dashboard

---

## 6. Embed SDK

### 6.1 Installation

```html
<script src="https://cdn.surveyflow.io/embed.js" data-survey-id="550e8400..."></script>
```

### 6.2 Configuration

```html
<script>
  window.SurveyFlow = window.SurveyFlow || {};
  window.SurveyFlow.config = {
    surveyId: "550e8400...",
    mode: "popup",           // "inline" | "popup" | "slide-in" | "floating"
    trigger: {
      type: "exit_intent",   // "time_on_page" | "scroll" | "manual" | "always"
      value: 30              // seconds / percentage
    },
    autoClose: true,
    defaultOpen: false,
    // Pass user data for personalization
    user: {
      email: "user@example.com",
      name: "John Doe",
      custom: { plan: "premium" }
    },
    // Event callbacks
    onComplete: function(response) {
      console.log("Survey completed!", response);
    },
    onClose: function() {
      console.log("Survey closed");
    },
    onQuestionChange: function(questionId, answer) {
      console.log("Answer:", questionId, answer);
    }
  };
</script>
```

### 6.3 Programmatic Control

```javascript
// Open survey programmatically
SurveyFlow.open();

// Close survey
SurveyFlow.close();

// Pre-fill answers
SurveyFlow.setAnswers({ q1: "prefilled value" });

// Check if survey has been completed
SurveyFlow.isCompleted(); // true/false
```

---

## 7. Error Handling

### tRPC Errors

```typescript
// All errors use TRPCError with standardized codes
throw new TRPCError({
  code: "NOT_FOUND",
  message: "Survey not found"
});

throw new TRPCError({
  code: "FORBIDDEN",
  message: "You don't have permission to edit this survey"
});

throw new TRPCError({
  code: "BAD_REQUEST",
  message: "Invalid question type"
});
```

### Error Code Mapping

| tRPC Code | HTTP Status | When |
|---|---|---|
| `UNAUTHORIZED` | 401 | Not logged in / invalid API key |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `BAD_REQUEST` | 400 | Validation failure |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected error |
| `TOO_MANY_REQUESTS` | 429 | Rate limited |

---

## 8. Rate Limiting

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1647890400
```

### Limits by Plan

| Endpoint | Free | Starter | Pro+ | API Key |
|---|---|---|---|---|
| General API | 60/min | 120/min | 300/min | 1000/min |
| AI endpoints | 10/min | 20/min | 50/min | 100/min |
| File upload | 5/min | 10/min | 20/min | 20/min |
| Survey submit | 10/min/IP | 10/min/IP | 10/min/IP | 100/min |
| Auth endpoints | 5/min/IP | 5/min/IP | 5/min/IP | N/A |

---

## 9. Pagination

### Cursor-Based Pagination

All list endpoints use cursor-based pagination for consistency and performance.

```typescript
// Request
GET /v1/surveys?limit=20&cursor=eyJpZCI6InN1cnZleS0xMjMifQ==

// Response
{
  "data": [...],
  "pagination": {
    "next_cursor": "eyJpZCI6InN1cnZleS05OCJ9",
    "has_more": true,
    "total": 450
  }
}
```

Cursor is a base64-encoded JSON object containing the last item's sort key. This is more efficient than offset-based pagination for large datasets.
