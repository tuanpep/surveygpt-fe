# SurveyFlow — Detailed Implementation Plan

**Date:** March 2026
**Scope:** MVP (Phase 1 — Sprint 1-8 from Roadmap)
**Status:** Ready for Implementation

---

## Current State Summary

### Backend (Go + Echo)
- **DONE:** Project scaffolding, config, DB schema (8 migrations), Redis/Postgres setup, middleware (auth, CORS, rate limit, logger, recovery, request ID), models, JWT package, pagination, validator, route definitions (all stubs), worker infrastructure, Dockerfile
- **EMPTY:** Repository layer (0 files), Service layer (0 files), All handler implementations, Worker implementations, Tests (0 files)

### Frontend (React + Carbon + Vite)
- **DONE:** Project scaffolding, routing (25 routes), API client (ky), auth hooks/services, survey hooks/services, Zustand survey builder store, survey builder components (palette, items, editor, preview), analytics components (summary, charts), layout components, type definitions, SCSS styling
- **PLACEHOLDER:** Most app pages are empty shell components, Marketing pages are placeholders, No public survey taking UI, No settings/responses/billing pages, No tests

---

## Implementation Order

The implementation follows a bottom-up approach: data layer → business logic → API handlers → frontend pages.

---

## Phase A: Backend — Auth & Org (Sprint 1-2)

### A1. Repository Layer — Auth & Org

#### `be/internal/repository/user_repo.go`
```
- CreateUser(ctx, user) (User, error)
- GetUserByID(ctx, id) (User, error)
- GetUserByEmail(ctx, email) (User, error)
- UpdateUser(ctx, user) (User, error)
- GetUserByPasswordResetToken(ctx, token) (User, error)
- SetPasswordResetToken(ctx, userID, token, expiresAt) error
- ClearPasswordResetToken(ctx, userID) error
- SetEmailVerified(ctx, userID) error
- UpdatePassword(ctx, userID, hash) error
- Set2FASecret(ctx, userID, secret) error
- Enable2FA(ctx, userID) error
- Disable2FA(ctx, userID) error
```

#### `be/internal/repository/org_repo.go`
```
- CreateOrg(ctx, org) (Organization, error)
- GetOrgByID(ctx, id) (Organization, error)
- GetOrgBySlug(ctx, slug) (Organization, error)
- UpdateOrg(ctx, org) (Organization, error)
- GetOrgUsage(ctx, orgID) (OrgUsage, error)

- AddMember(ctx, orgID, userID, role, invitedBy) (OrgMembership, error)
- GetMembership(ctx, orgID, userID) (OrgMembership, error)
- GetMembershipByID(ctx, membershipID) (OrgMembership, error)
- ListMembers(ctx, orgID) ([]OrgMembershipWithUser, error)
- UpdateMemberRole(ctx, orgID, userID, role) error
- RemoveMember(ctx, orgID, userID) error
- GetOwner(ctx, orgID) (OrgMembershipWithUser, error)
- TransferOwnership(ctx, orgID, currentOwnerID, newOwnerID) error

- CreateInvitation(ctx, inv) (Invitation, error)
- GetInvitationByToken(ctx, token) (Invitation, error)
- GetInvitationsByOrg(ctx, orgID) ([]Invitation, error)
- AcceptInvitation(ctx, token, userID) error
- RevokeInvitation(ctx, token) error
- GetPendingInvitation(ctx, email, orgID) (Invitation, error)
```

### A2. Service Layer — Auth & Org

#### `be/internal/services/auth_service.go`
```
- SignUp(ctx, input) (User, TokenPair, error)
  - Validate email/password
  - Hash password (bcrypt cost 12)
  - Create user
  - Create default org ("{name}'s Workspace") with slug
  - Add user as owner
  - Generate JWT pair (access 15m, refresh 7d)
  - Store refresh token hash in Redis (key: refresh:{userID})
  - Return user + tokens

- SignIn(ctx, email, password) (User, TokenPair, error)
  - Find user by email
  - Compare bcrypt hash
  - Check 2FA enabled → return requires2FA flag
  - Update last_login_at
  - Generate JWT pair
  - Store refresh token in Redis

- SignOut(ctx, userID) error
  - Delete refresh token from Redis

- RefreshToken(ctx, refreshToken) (TokenPair, error)
  - Parse and validate refresh token
  - Check exists in Redis
  - Generate new access token
  - Rotate refresh token in Redis

- ForgotPassword(ctx, email) error
  - Find user by email
  - Generate secure token (crypto/rand)
  - Set password_reset_token + expires_at (1 hour)
  - Enqueue email:send task with reset link

- ResetPassword(ctx, token, newPassword) error
  - Find user by reset token (check expiry)
  - Hash new password
  - Update password
  - Clear reset token

- ChangePassword(ctx, userID, currentPassword, newPassword) error
  - Verify current password
  - Hash and update

- Setup2FA(ctx, userID) (secret, qrCodeURL, error)
  - Generate TOTP secret
  - Store in user.two_factor_secret (encrypted)

- Verify2FA(ctx, userID, code) ([]string, error)
  - Validate TOTP code
  - Enable 2FA
  - Generate and return recovery codes

- GetCurrentUser(ctx, userID) (User, error)
  - Return user with org info
```

#### `be/internal/services/org_service.go`
```
- CreateOrganization(ctx, userID, input) (Organization, error)
  - Validate slug uniqueness
  - Create org
  - Add creator as owner
  - Create audit log

- UpdateOrganization(ctx, orgID, input) (Organization, error)
  - Check admin/owner permission
  - Update fields

- GetOrganization(ctx, orgID) (Organization, error)

- InviteMember(ctx, orgID, inviterID, email, role) (Invitation, error)
  - Check admin permission
  - Check not already member
  - Check not already invited
  - Generate token
  - Create invitation
  - Enqueue email:send task

- AcceptInvitation(ctx, token, userID) (OrgMembership, error)
  - Validate token + expiry
  - Check user not already member
  - Create membership
  - Mark invitation accepted

- RemoveMember(ctx, orgID, removerID, targetUserID) error
  - Check admin permission
  - Cannot remove owner
  - Remove membership
  - Create audit log

- UpdateMemberRole(ctx, orgID, updaterID, targetUserID, newRole) error
  - Check admin permission
  - Cannot change owner role
  - Update role

- ListMembers(ctx, orgID) ([]MemberWithUser, error)

- GetUsage(ctx, orgID) (OrgUsage, error)
  - Query usage_logs for current period
  - Return { responses, surveys, members, aiCredits } with limits from org
```

### A3. Handler Implementations — Auth & Org

#### `be/internal/handlers/auth.go`
```
- POST /auth/register → authHandler.Register
- POST /auth/login → authHandler.Login
- POST /auth/logout → authHandler.Logout
- POST /auth/refresh → authHandler.Refresh
- POST /auth/forgot-password → authHandler.ForgotPassword
- POST /auth/reset-password → authHandler.ResetPassword
- POST /auth/change-password → authHandler.ChangePassword (auth required)
- POST /auth/setup-2fa → authHandler.Setup2FA (auth required)
- POST /auth/verify-2fa → authHandler.Verify2FA (auth required)
- GET /me → authHandler.GetMe (auth required)
```

#### `be/internal/handlers/org.go`
```
- POST /organizations → orgHandler.Create
- GET /organizations/me → orgHandler.Get
- PUT /organizations/me → orgHandler.Update
- GET /organizations/me/members → orgHandler.ListMembers
- POST /organizations/me/members/invite → orgHandler.InviteMember
- PUT /organizations/me/members/:userId/role → orgHandler.UpdateRole
- DELETE /organizations/me/members/:userId → orgHandler.RemoveMember
- GET /organizations/me/invitations → orgHandler.ListInvitations
- POST /organizations/me/invitations/:token/accept → orgHandler.AcceptInvitation
- GET /usage → orgHandler.GetUsage
```

### A4. Update routes.go

Wire up all auth and org handlers, removing stubs.

---

## Phase B: Backend — Survey CRUD (Sprint 3-4)

### B1. Repository Layer — Surveys & Templates

#### `be/internal/repository/survey_repo.go`
```
- CreateSurvey(ctx, survey) (Survey, error)
- GetSurveyByID(ctx, id) (Survey, error)
- GetSurveyBySlug(ctx, slug) (Survey, error)
- ListSurveys(ctx, orgID, filter) ([]Survey, Cursor, error)
- UpdateSurvey(ctx, survey) (Survey, error)
- UpdateSurveyStructure(ctx, id, structure) error
- UpdateSurveySettings(ctx, id, settings) error
- UpdateSurveyTheme(ctx, id, theme) error
- PublishSurvey(ctx, id) (Survey, error)
- UnpublishSurvey(ctx, id) (Survey, error)
- CloseSurvey(ctx, id) (Survey, error)
- DeleteSurvey(ctx, id) error (soft delete)
- DuplicateSurvey(ctx, id, newTitle) (Survey, error)
- IncrementViewCount(ctx, id) error
- IncrementResponseCount(ctx, id) error
- CheckPlanLimits(ctx, orgID) error (throw if limits exceeded)
```

#### `be/internal/repository/template_repo.go`
```
- ListTemplates(ctx, filter) ([]Template, error)
- GetTemplateByID(ctx, id) (Template, error)
- GetSystemTemplates(ctx, category) ([]Template, error)
- GetOrgTemplates(ctx, orgID) ([]Template, error)
- CreateTemplate(ctx, template) (Template, error)
- IncrementTemplateUseCount(ctx, id) error
```

### B2. Service Layer — Surveys

#### `be/internal/services/survey_service.go`
```
- CreateSurvey(ctx, orgID, userID, input) (Survey, error)
  - Validate title
  - Check plan limits (survey count)
  - Create with default structure/settings/theme
  - Create audit log

- GetSurvey(ctx, orgID, id) (Survey, error)
  - Verify ownership (org_id match)

- UpdateSurvey(ctx, orgID, id, input) (Survey, error)
  - Verify ownership
  - Update fields

- UpdateStructure(ctx, orgID, id, structure) error
  - Verify ownership
  - Validate structure (question types, logic refs)
  - Invalidate Redis cache

- PublishSurvey(ctx, orgID, id) (Survey, error)
  - Verify ownership
  - Validate: has questions, settings valid
  - Check plan limits
  - Set status = active, published_at
  - Cache in Redis

- CloseSurvey(ctx, orgID, id) (Survey, error)

- DuplicateSurvey(ctx, orgID, id) (Survey, error)
  - Deep copy survey
  - New title: "{title} (Copy)"
  - New UUIDs for all questions
  - Check plan limits

- DeleteSurvey(ctx, orgID, id) error
  - Soft delete

- ListSurveys(ctx, orgID, filter) (PaginatedSurveys, error)
  - Support: status filter, search, sort, cursor pagination

- GetPublicSurvey(ctx, id) (PublicSurvey, error)
  - Check status = active
  - Check not closed (closes_at)
  - Check response limit
  - Return: title, description, structure, theme, settings (public fields only)
  - Increment view_count

- CreateFromTemplate(ctx, orgID, userID, templateID) (Survey, error)
  - Load template
  - Copy structure + theme
  - Create survey

- SaveAsTemplate(ctx, orgID, surveyID, name, category) (Template, error)
  - Load survey
  - Copy structure + theme to template
  - Set org_id (custom template)
```

### B3. Handler Implementations — Surveys & Templates

#### `be/internal/handlers/survey.go`
```
- POST /surveys → Create
- GET /surveys → List
- GET /surveys/:id → GetByID
- PUT /surveys/:id → Update
- PUT /surveys/:id/structure → UpdateStructure
- PUT /surveys/:id/settings → UpdateSettings
- PUT /surveys/:id/theme → UpdateTheme
- POST /surveys/:id/publish → Publish
- POST /surveys/:id/unpublish → Unpublish
- POST /surveys/:id/close → Close
- POST /surveys/:id/duplicate → Duplicate
- DELETE /surveys/:id → Delete
- GET /surveys/:slug/public → GetPublic (no auth)
```

#### `be/internal/handlers/template.go`
```
- GET /templates → List (system + org custom)
- GET /templates/:id → GetByID
- GET /templates/org → GetOrgTemplates
- POST /surveys/:id/save-as-template → SaveFromSurvey
```

---

## Phase C: Backend — Responses & Analytics (Sprint 5-6)

### C1. Repository Layer — Responses

#### `be/internal/repository/response_repo.go`
```
- CreateResponse(ctx, resp) (Response, error)
- GetResponseByID(ctx, id) (Response, error)
- ListResponses(ctx, surveyID, filter) ([]Response, Cursor, error)
- CreateAnswers(ctx, answers) error (batch insert)
- GetAnswersByResponseID(ctx, responseID) ([]Answer, error)
- UpdateResponseStatus(ctx, id, status) error
- DeleteResponse(ctx, id) error
- FlagResponse(ctx, id, flag, note) error
- GetResponseCount(ctx, surveyID, status) (int, error)
- GetCompletionRate(ctx, surveyID) (float64, error)
- GetAverageDuration(ctx, surveyID) (int, error)
- GetResponsesByDay(ctx, surveyID, days) ([]DailyCount, error)
- GetResponsesBySource(ctx, surveyID) (map[string]int, error)
- GetResponsesByDevice(ctx, surveyID) (map[string]int, error)
```

#### `be/internal/repository/analytics_repo.go`
```
- GetQuestionChoiceDistribution(ctx, surveyID, questionID) ([]ChoiceStat, error)
- GetQuestionAverageRating(ctx, surveyID, questionID) (float64, error)
- GetQuestionNPSScore(ctx, surveyID, questionID) (int, error)
- GetQuestionNPSBreakdown(ctx, surveyID, questionID) (NPSBreakdown, error)
- GetQuestionTextStats(ctx, surveyID, questionID) (TextStats, error)
- GetCrossTabulation(ctx, surveyID, qA, qB) (CrossTabResult, error)
- GetDropoffRates(ctx, surveyID) ([]DropoffStep, error)
- UpsertAnalyticsCache(ctx, entry) error
- GetAnalyticsCache(ctx, surveyID, questionID, metric) (JSON, error)
```

### C2. Service Layer — Responses

#### `be/internal/services/response_service.go`
```
- SubmitResponse(ctx, surveyID, input) (Response, error)
  - Load survey structure (from Redis cache or DB)
  - Validate survey is active and accepting responses
  - Validate answers:
    - Check required questions answered
    - Validate answer types against question types
    - Check custom validation rules
  - Run bot detection:
    - Check honeypot field (if enabled)
    - Check timing (speeder detection)
  - Create response + answers in transaction
  - Increment response_count on survey
  - Enqueue background tasks (async):
    - webhook:dispatch
    - analytics:update-cache
    - ai:text-analysis (if text answers exist)
  - Publish Redis event (for SSE)
  - Return response with redirect URL

- SavePartialResponse(ctx, surveyID, answers, responseToken) (string, error)
  - Load or create partial response
  - Upsert answers
  - Return response token

- ResumePartialResponse(ctx, surveyID, responseToken) ([]Answer, error)

- ListResponses(ctx, orgID, surveyID, filter) (PaginatedResponses, error)
  - Verify ownership
  - Apply filters (date, status, source)
  - Cursor-based pagination

- GetResponse(ctx, orgID, surveyID, responseID) (ResponseWithAnswers, error)

- DeleteResponse(ctx, orgID, surveyID, responseID) error

- FlagResponse(ctx, orgID, surveyID, responseID, flag, note) error

- ExportResponses(ctx, orgID, surveyID, format, filter) (downloadURL, error)
  - Load all matching responses
  - Generate CSV or XLSX
  - Upload to R2
  - Return presigned URL
  - Enqueue export job for large datasets
```

#### `be/internal/services/analytics_service.go`
```
- GetSummary(ctx, orgID, surveyID) (AnalyticsSummary, error)
  - Verify ownership
  - Try analytics_cache first
  - Compute: totalResponses, completionRate, avgDuration
  - responsesByDay (last 30 days), responsesBySource, responsesByDevice

- GetQuestionStats(ctx, orgID, surveyID, questionID) (QuestionStats, error)
  - Try analytics_cache first
  - Switch on question type:
    - multiple_choice/multi_select → choice distribution
    - rating_likert/rating_star → average + distribution
    - rating_nps → NPS score + breakdown
    - text/long_text → word count, top words

- GetCrossTab(ctx, orgID, surveyID, qA, qB) (CrossTabResult, error)

- GetDropoff(ctx, orgID, surveyID) ([]DropoffStep, error)

- GetAIInsights(ctx, orgID, surveyID) (AIInsights, error)
  - Load pre-computed AI analysis from responses
  - Aggregate sentiments, themes
  - Return summary + key findings + recommendations
```

### C3. Handler Implementations — Responses & Analytics

#### `be/internal/handlers/response.go`
```
- POST /surveys/:id/responses → Submit (no auth)
- POST /surveys/:id/responses/partial → SavePartial (no auth)
- GET /surveys/:id/responses/partial → ResumePartial (no auth)
- GET /surveys/:id/responses → List (auth)
- GET /surveys/:id/responses/:rid → GetByID (auth)
- DELETE /surveys/:id/responses/:rid → Delete (auth)
- POST /surveys/:id/responses/export → Export (auth)
```

#### `be/internal/handlers/analytics.go`
```
- GET /surveys/:id/analytics/summary → GetSummary (auth)
- GET /surveys/:id/analytics/questions/:qid → GetQuestionStats (auth)
- GET /surveys/:id/analytics/cross-tab → GetCrossTab (auth)
- GET /surveys/:id/analytics/dropoff → GetDropoff (auth)
- GET /surveys/:id/analytics/ai-insights → GetAIInsights (auth)
```

---

## Phase D: Backend — Distribution, Billing, SSE (Sprint 7-8)

### D1. Service Layer — Distribution

#### `be/internal/services/distribution_service.go`
```
- GenerateQRCode(ctx, orgID, surveyID) (svg, pngURL, error)
- GetEmbedCode(ctx, orgID, surveyID, mode, trigger) (htmlSnippet, error)
- GetEmailLists(ctx, orgID) ([]EmailList, error)
- CreateEmailList(ctx, orgID, name, contacts) (EmailList, error)
- SendSurveyEmails(ctx, orgID, surveyID, listID, subject, body, scheduleAt) (jobID, error)
  - Load contacts from list
  - For each contact: enqueue email:send task
  - Return job ID for tracking
```

### D2. Service Layer — Billing

#### `be/internal/services/billing_service.go`
```
- GetPlan(ctx, orgID) (PlanInfo, error)
- GetPlans() []Plan
- ChangePlan(ctx, orgID, newPlan, billingPeriod) (checkoutURL, error)
  - Create/update Stripe checkout session
- GetPortalURL(ctx, orgID) (url, error)
  - Create Stripe customer portal session
- GetHistory(ctx, orgID) ([]Invoice, error)
- HandleStripeWebhook(ctx, payload, signature) error
  - Verify signature
  - Handle events: checkout.completed, customer.subscription.updated, invoice.paid
  - Update org plan, limits, billing period
```

### D3. SSE Endpoint

#### `be/internal/handlers/sse.go`
```
- GET /surveys/:id/live → LiveUpdates (auth required)
  - Set SSE headers
  - Subscribe to Redis pub/sub: survey:{id}:events
  - Stream events to client
  - Handle disconnect
```

### D4. Handler Implementations — Distribution & Billing

#### `be/internal/handlers/distribution.go`
```
- GET /surveys/:id/qr-code → GetQRCode
- GET /surveys/:id/embed-code → GetEmbedCode
- GET /email-lists → GetEmailLists
- POST /email-lists → CreateEmailList
- POST /surveys/:id/send-emails → SendEmails
```

#### `be/internal/handlers/billing.go`
```
- GET /billing/plan → GetPlan
- GET /billing/plans → GetPlans
- POST /billing/change-plan → ChangePlan
- GET /billing/portal → GetPortalURL
- GET /billing/history → GetHistory
- POST /webhooks/stripe → HandleStripeWebhook (no auth, signature verified)
```

---

## Phase E: Frontend — Auth & Dashboard (Sprint 1-2)

### E1. Auth Pages Implementation

#### `fe/src/routes/auth.tsx` — SignInPage
- Carbon Form with email TextInput + password TextInput + remember me Checkbox
- Submit → auth.signIn → redirect to /app/dashboard
- "Forgot password?" link
- "Don't have an account? Sign up" link
- Error handling with Toast notifications
- Loading state on submit button

#### `fe/src/routes/auth.tsx` — SignUpPage
- Carbon Form with name + email + password + confirm password
- Password strength indicator
- Submit → auth.signUp → redirect to /app/dashboard
- "Already have an account? Sign in" link

#### `fe/src/routes/auth.tsx` — ForgotPasswordPage
- Email input + submit
- Success message "Check your email"
- "Back to sign in" link

### E2. App Layout Enhancement

#### `fe/src/components/layout/AppLayout.tsx`
- Fetch current user on mount (useAuth hook)
- Header: user avatar dropdown with profile, settings, sign out
- SideNav: active state based on current route
- Redirect to /signin if not authenticated (useAuth)
- Org selector if user belongs to multiple orgs (future)

### E3. Dashboard Page

#### `fe/src/routes/app.tsx` — DashboardPage
- DashboardSummary component (already exists)
- Recent surveys list (Carbon DataTable: title, status, responses, last modified)
- Quick actions: "Create New Survey" button
- Usage meters (responses used / limit, surveys used / limit)

### E4. Team Management Page

#### `fe/src/routes/app.tsx` — TeamPage
- Member list (Carbon DataTable: avatar, name, email, role, joined date)
- Invite member button → ComposedModal with email + role selector
- Role dropdown (admin, editor, viewer) for each member
- Remove member button with confirmation Modal
- Pending invitations list

---

## Phase F: Frontend — Survey Builder (Sprint 3-4)

### F1. Survey List Page

#### `fe/src/routes/app.tsx` — SurveysListPage
- Carbon DataTable with columns: Title, Status (Tag), Responses, Created, Modified
- Search input (ToolbarSearch)
- Status filter dropdown (All, Draft, Active, Closed)
- Sort dropdown (Created, Modified, Response Count)
- Row actions: Edit, Duplicate, Archive, Delete (overflow menu)
- "New Survey" primary button
- Empty state when no surveys
- Pagination (cursor-based)

### F2. New Survey Wizard

#### `fe/src/routes/app.tsx` — NewSurveyPage
- ComposedModal with 3 options:
  - Start from blank → create empty survey → redirect to editor
  - Start from template → template gallery → select → create from template → redirect to editor
  - Generate with AI (placeholder for V1.0)
- Template gallery: grid of Tiles grouped by category
- Template preview on click

### F3. Survey Editor Page (Enhance existing)

#### `fe/src/routes/app.tsx` — SurveyEditPage
- Tabs: Edit, Flow, Settings, Responses, Analytics (Carbon Tabs)
- Edit tab: existing SurveyBuilder component
- Auto-save: debounce 2s → PUT /surveys/:id/structure
- Survey title editable inline at top
- Settings tab:
  - Title, Description (TextInput, TextArea)
  - Welcome screen toggle + content
  - Thank you screen toggle + content + redirect URL
  - Progress bar toggle
  - Anonymous responses toggle
  - Close date (DatePicker)
  - Response limit (NumberInput)
  - UI mode selector (RadioButtonGroup: classic/conversational)
  - Theme section: primary color (ColorPicker), font (Select), logo upload (FileUploader)
- Publish/Unpublish button in header
- Preview button → open preview panel/modal

### F4. Question Editor Enhancement

#### `fe/src/components/survey/QuestionEditor.tsx`
Enhance existing editor with:
- Question type-specific settings:
  - Multiple choice: choice editor (add/remove/reorder choices), "Other" option toggle, layout (horizontal/vertical)
  - Dropdown: search toggle, placeholder
  - Text: input type (text/email/number/url/phone), character limit, placeholder
  - Long text: character/word limit, placeholder
  - Rating: scale range, labels, display (horizontal/vertical)
  - Star: 1-5 or 1-10, half-star toggle
  - NPS: read-only (0-10 fixed)
  - Yes/No: "Not sure" option toggle
- Validation section: required toggle
- Delete confirmation Modal

### F5. Public Survey Page (Respondent UI)

#### `fe/src/routes/survey.tsx` — PublicSurveyPage
- Load survey: GET /surveys/:id/public (no auth)
- Welcome screen (if enabled) with start button
- Classic mode: all questions in form layout
- Conversational mode: one question at a time with transitions (stretch goal for V1.0)
- Progress bar (if enabled)
- Question components matching the builder types (MVP: 8 types)
- Validation on submit
- Submit → POST /surveys/:id/responses
- Redirect to thank you page

#### `fe/src/routes/survey.tsx` — ThankYouPage
- Display thank you message from survey settings
- Redirect URL link (if configured)

---

## Phase G: Frontend — Responses & Analytics (Sprint 5-6)

### G1. Survey Responses Page

#### `fe/src/routes/app.tsx` — SurveyResponsesPage
- Summary row: Total responses, Completion rate, Avg duration
- Carbon DataTable: #, Submitted date, Duration, Source (Tag), Status (Tag), Quality flags
- Row click → expand to show individual answers
- Filter bar: date range, status, source, quality flags
- Pagination (cursor-based)
- Actions: Delete response, Flag response (overflow menu)
- Export button → dropdown (CSV, Excel)

### G2. Individual Response Viewer (inline expand or side panel)

- Show each question + answer
- Metadata: device, browser, country, duration, source
- Quality flags display

### G3. Survey Analytics Page

#### `fe/src/routes/app.tsx` — SurveyAnalyticsPage
- DashboardSummary at top (already exists, enhance with per-survey data)
- Date range filter for analytics period
- Question-level charts:
  - Each question gets its own card
  - Auto-select chart type based on question type:
    - Multiple choice → Bar chart + Pie chart (toggle)
    - Rating → Bar chart with average line
    - NPS → Gauge chart with promoter/passive/detractor breakdown
    - Text → Word cloud + response list
  - Use existing QuestionChart component, enhance
- Filter by segment (stretch)

---

## Phase H: Frontend — Distribution & Billing (Sprint 7-8)

### H1. Distribution Panel (in Survey Settings or separate tab)

#### `fe/src/routes/app.tsx` — SurveySettingsPage (Distribution section)
- Web Link: shareable URL with copy button
- QR Code: generated QR image with download button
- Embed Code: HTML snippet with CodeSnippet + copy button
- Email Distribution:
  - Select email list (Dropdown)
  - Email composer (subject, body with variables)
  - Schedule toggle (DatePicker)
  - Send button
- Social sharing buttons (Twitter, LinkedIn, Facebook)

### H2. Email List Management

- New email list → ComposedModal
- Upload CSV button
- Manual contact entry
- Contact list within each email list

### H3. Billing Page

#### `fe/src/routes/app.tsx` — BillingPage
- Current plan display with Card
- Plan comparison (3 plans: Free, Starter, Pro) with Tile/Column
- Upgrade button → Stripe Checkout redirect
- Manage subscription → Stripe Portal redirect
- Usage meters: responses, surveys, members, AI credits
- Invoice history table

### H4. Settings Page

#### `fe/src/routes/app.tsx` — SettingsPage
- Profile section: name, email, avatar upload
- Password section: change password form
- 2FA section: setup/verify/disable
- Notifications: toggle preferences (email, in-app)

### H5. Marketing Pages

#### `fe/src/routes/marketing.tsx`
- Landing page: hero section, features, CTA, testimonials
- Pricing page: 3 plan cards with comparison table
- Features page: feature grid with icons
- Templates page: template gallery

---

## Phase I: Backend Workers & Integrations (Sprint 5-8)

### I1. Worker Implementations

#### `be/internal/workers/email.go`
- HandleSendEmail: integrate Resend API
- HandleSendBulkEmail: batch sending with rate limiting (50/min)

#### `be/internal/workers/webhook.go`
- HandleWebhookDispatch: HTTP POST with HMAC-SHA256 signature
- Retry logic: exponential backoff, max 6 retries
- Log delivery status

#### `be/internal/workers/analytics_cache.go`
- HandleAnalyticsCache: compute and cache question stats after each response

#### `be/internal/workers/ai_analysis.go`
- HandleAIAnalysis: call Claude API for sentiment + theme extraction
- HandleAISentiment: batch sentiment analysis

### I2. Export Workers

#### `be/internal/workers/export.go`
- HandleExportCSV: generate CSV, upload to R2, return URL
- HandleExportExcel: generate XLSX, upload to R2, return URL

### I3. Webhook Handler

#### `be/internal/handlers/webhook.go`
- CRUD for webhooks (list, create, update, delete)
- GetDeliveryLog for viewing webhook delivery history

### I4. File Upload

#### `be/internal/handlers/file.go`
- POST /files/upload-url → GeneratePresignedURL
- POST /files/confirm → Record file metadata in DB

---

## Phase J: Templates Data (Sprint 5-6)

### J1. Seed 10 System Templates

Create SQL migration to seed system templates:

1. **Customer Satisfaction (CSAT)** — 5 questions
2. **Net Promoter Score (NPS)** — 3 questions
3. **Employee Engagement** — 8 questions
4. **Event Feedback** — 6 questions
5. **Product Feedback** — 7 questions
6. **Website/App Feedback** — 6 questions
7. **Market Research** — 8 questions
8. **Lead Generation** — 5 questions
9. **Course Evaluation** — 7 questions
10. **Restaurant Feedback** — 6 questions

Each template includes: title, description, category, structure (questions), theme.

---

## File Creation Checklist

### Backend Files to Create/Modify

| # | File | Action |
|---|------|--------|
| 1 | `internal/repository/user_repo.go` | Create |
| 2 | `internal/repository/org_repo.go` | Create |
| 3 | `internal/repository/survey_repo.go` | Create |
| 4 | `internal/repository/template_repo.go` | Create |
| 5 | `internal/repository/response_repo.go` | Create |
| 6 | `internal/repository/analytics_repo.go` | Create |
| 7 | `internal/services/auth_service.go` | Create |
| 8 | `internal/services/org_service.go` | Create |
| 9 | `internal/services/survey_service.go` | Create |
| 10 | `internal/services/response_service.go` | Create |
| 11 | `internal/services/analytics_service.go` | Create |
| 12 | `internal/services/distribution_service.go` | Create |
| 13 | `internal/services/billing_service.go` | Create |
| 14 | `internal/services/email_service.go` | Create (Resend integration) |
| 15 | `internal/services/storage_service.go` | Create (R2 integration) |
| 16 | `internal/services/webhook_service.go` | Create |
| 17 | `internal/handlers/auth.go` | Modify (implement stubs) |
| 18 | `internal/handlers/org.go` | Create |
| 19 | `internal/handlers/survey.go` | Modify (implement stubs) |
| 20 | `internal/handlers/template.go` | Modify (implement stubs) |
| 21 | `internal/handlers/response.go` | Modify (implement stubs) |
| 22 | `internal/handlers/analytics.go` | Modify (implement stubs) |
| 23 | `internal/handlers/distribution.go` | Create |
| 24 | `internal/handlers/billing.go` | Create |
| 25 | `internal/handlers/file.go` | Create |
| 26 | `internal/handlers/webhook.go` | Create |
| 27 | `internal/handlers/sse.go` | Create |
| 28 | `internal/handlers/routes.go` | Modify (wire real handlers) |
| 29 | `internal/workers/email.go` | Modify (implement) |
| 30 | `internal/workers/ai_analysis.go` | Modify (implement) |
| 31 | `internal/workers/analytics_cache.go` | Modify (implement) |
| 32 | `internal/workers/webhook.go` | Modify (implement) |
| 33 | `internal/workers/export.go` | Create |
| 34 | `internal/db/migrations/009_seed_templates.up.sql` | Create |
| 35 | `internal/db/migrations/009_seed_templates.down.sql` | Create |

### Frontend Files to Create/Modify

| # | File | Action |
|---|------|--------|
| 1 | `src/routes/auth.tsx` | Modify (implement pages) |
| 2 | `src/routes/app.tsx` | Modify (implement 13 pages) |
| 3 | `src/routes/marketing.tsx` | Modify (implement pages) |
| 4 | `src/routes/survey.tsx` | Modify (implement pages) |
| 5 | `src/components/layout/AppLayout.tsx` | Modify (user menu, org) |
| 6 | `src/components/survey/SurveyBuilder.tsx` | Modify (auto-save, toolbar) |
| 7 | `src/components/survey/QuestionEditor.tsx` | Modify (type-specific settings) |
| 8 | `src/components/survey/QuestionPalette.tsx` | Modify (MVP filter) |
| 9 | `src/components/survey/PublicSurveyRenderer.tsx` | Create (respondent UI) |
| 10 | `src/components/survey/PublicQuestionRenderer.tsx` | Create (per-question) |
| 11 | `src/components/analytics/DashboardSummary.tsx` | Modify (per-survey data) |
| 12 | `src/components/analytics/QuestionChart.tsx` | Modify (NPS, text, more types) |
| 13 | `src/components/analytics/NPSGauge.tsx` | Create |
| 14 | `src/components/analytics/CrossTabView.tsx` | Create |
| 15 | `src/components/analytics/DropoffFunnel.tsx` | Create |
| 16 | `src/components/shared/SurveyDataTable.tsx` | Create (reusable) |
| 17 | `src/components/shared/EmptyState.tsx` | Create |
| 18 | `src/components/shared/ConfirmModal.tsx` | Create |
| 19 | `src/components/shared/UsageMeter.tsx` | Create |
| 20 | `src/components/billing/PlanCard.tsx` | Create |
| 21 | `src/components/billing/UsagePanel.tsx` | Create |
| 22 | `src/components/distribution/ShareLink.tsx` | Create |
| 23 | `src/components/distribution/QRCodeDisplay.tsx` | Create |
| 24 | `src/components/distribution/EmbedCodeSnippet.tsx` | Create |
| 25 | `src/components/distribution/EmailComposer.tsx` | Create |
| 26 | `src/components/team/MemberList.tsx` | Create |
| 27 | `src/components/team/InviteMemberModal.tsx` | Create |
| 28 | `src/hooks/useAuth.ts` | Modify (add 2FA, profile) |
| 29 | `src/hooks/useResponses.ts` | Create |
| 30 | `src/hooks/useAnalytics.ts` | Create |
| 31 | `src/hooks/useBilling.ts` | Create |
| 32 | `src/hooks/useTeam.ts` | Create |
| 33 | `src/services/responses.ts` | Modify (add more methods) |
| 34 | `src/services/analytics.ts` | Modify (add more methods) |
| 35 | `src/services/billing.ts` | Create |
| 36 | `src/services/team.ts` | Create |
| 37 | `src/services/distribution.ts` | Create |
| 38 | `src/services/templates.ts` | Create |
| 39 | `src/types/survey.ts` | Modify (add DTOs) |
| 40 | `src/types/response.ts` | Modify (add filters) |
| 41 | `src/types/billing.ts` | Create |
| 42 | `src/types/team.ts` | Create |

---

## Implementation Priority (Recommended Order)

### Week 1-2: Backend Auth + Org
1. user_repo.go + org_repo.go
2. auth_service.go + org_service.go
3. auth.go + org.go handlers
4. Wire routes, test with curl/Postman

### Week 3-4: Backend Surveys + Templates
5. survey_repo.go + template_repo.go
6. survey_service.go
7. survey.go + template.go handlers
8. Seed templates migration

### Week 5-6: Backend Responses + Analytics
9. response_repo.go + analytics_repo.go
10. response_service.go + analytics_service.go
11. response.go + analytics.go handlers

### Week 7-8: Frontend Auth + Dashboard + Survey List
12. Implement auth pages (sign in, sign up, forgot password)
13. Enhance AppLayout with user menu
14. Implement DashboardPage
15. Implement TeamPage

### Week 9-10: Frontend Survey Builder
16. Implement SurveysListPage
17. Implement NewSurveyPage
18. Enhance SurveyEditPage (tabs, settings, auto-save)
19. Enhance QuestionEditor (type-specific settings)

### Week 11-12: Frontend Public Survey + Responses
20. Create PublicSurveyRenderer + PublicQuestionRenderer
21. Implement ThankYouPage
22. Implement SurveyResponsesPage

### Week 13-14: Frontend Analytics + Distribution + Billing
23. Enhance SurveyAnalyticsPage
24. Implement distribution components
25. Implement BillingPage
26. Implement SettingsPage
27. Implement marketing pages

### Week 15-16: Backend Workers + Polish
28. Implement worker handlers (email, webhook, analytics cache)
29. Implement billing service (Stripe)
30. Implement distribution service
31. Implement file upload service
32. SSE endpoint
33. End-to-end testing
