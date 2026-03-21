# SurveyFlow — Product Requirements Document (PRD)

**Date:** March 2026
**Version:** 1.0
**Status:** Draft

---

## Table of Contents

1. [Overview](#1-overview)
2. [User Roles & Permissions](#2-user-roles--permissions)
3. [Functional Requirements](#3-functional-requirements)
4. [Non-Functional Requirements](#4-non-functional-requirements)
5. [Feature Prioritization](#5-feature-prioritization)
6. [User Flows](#6-user-flows)
7. [Page/Screen Inventory](#7-pagescreen-inventory)

---

## 1. Overview

### 1.1 Product Vision

SurveyFlow is an AI-native survey platform that makes it effortless to create engaging surveys, collect responses across channels, and turn data into actionable insights.

### 1.2 Target Platforms

- **Primary:** Web application (responsive, desktop + mobile)
- **Respondent-facing:** Any device with a modern browser
- **Future:** Native mobile app (iOS/Android), offline data collection

### 1.3 Design Principles

1. **Simple by default, powerful when needed** — Basic surveys take 2 minutes; advanced features are discoverable but not intrusive
2. **Mobile-first respondent experience** — 60%+ of responses come from mobile
3. **AI-assisted, not AI-replaced** — AI helps create and analyze; humans make decisions
4. **Speed matters** — Every interaction should feel instant (< 200ms perceived latency)
5. **Privacy by design** — GDPR/CCPA compliant from day 1

---

## 2. User Roles & Permissions

### 2.1 Roles

| Role | Description | Scope |
|---|---|---|
| **Owner** | Account owner, billing, can delete org | Organization |
| **Admin** | Full access to all surveys, settings, members | Organization |
| **Editor** | Create, edit, publish surveys; view responses | Assigned surveys |
| **Viewer** | View surveys and response data (read-only) | Assigned surveys |
| **Respondent** | Takes surveys, submits responses | Survey-specific |

### 2.2 Permissions Matrix

| Permission | Owner | Admin | Editor | Viewer |
|---|---|---|---|---|
| Manage billing | Yes | No | No | No |
| Manage members & roles | Yes | Yes | No | No |
| Create/delete surveys | Yes | Yes | Yes | No |
| Edit survey content | Yes | Yes | Yes (assigned) | No |
| Publish/unpublish surveys | Yes | Yes | Yes (assigned) | No |
| View responses | Yes | Yes | Yes (assigned) | Yes (assigned) |
| Export data | Yes | Yes | Yes (assigned) | Yes (assigned) |
| Access analytics | Yes | Yes | Yes (assigned) | Yes (assigned) |
| Manage integrations | Yes | Yes | No | No |
| Manage API keys | Yes | Yes | No | No |
| Delete organization | Yes | No | No | No |

---

## 3. Functional Requirements

### 3.1 Authentication & Account Management

#### FR-AUTH-001: Sign Up
- Email/password registration
- Google OAuth sign-up
- Microsoft OAuth sign-up
- Email verification required before survey creation

#### FR-AUTH-002: Sign In
- Email/password login
- OAuth login (Google, Microsoft)
- "Remember me" option
- Password reset via email

#### FR-AUTH-003: Organization Management
- Create organization with name and subdomain
- Invite members via email
- Assign roles (Admin, Editor, Viewer)
- Remove members
- Transfer ownership

#### FR-AUTH-004: User Profile
- Edit display name, avatar, email
- Change password
- Manage notification preferences
- Delete account (with data export option)

#### FR-AUTH-005: Security
- Two-factor authentication (TOTP)
- Session management (view/revoke active sessions)
- Login history audit log
- Rate limiting on auth endpoints

---

### 3.2 Survey Builder

#### FR-BLD-001: Dashboard
- List all surveys with status (Draft, Active, Closed)
- Search and filter surveys by status, date, title
- Sort by date created, last modified, response count
- Quick actions: Duplicate, Archive, Delete
- Create new survey button
- Usage stats (responses used / limit)

#### FR-BLD-002: Survey Creation
- Start from blank
- Start from template (library of 50+ templates by category)
- Start from AI prompt ("Create a customer satisfaction survey for a SaaS product")
- Import from file (CSV of questions)
- Choose UI mode: Classic form or Conversational

#### FR-BLD-003: Survey Editor — Core
- Drag-and-drop question placement
- Question reordering (drag & drop or move up/down)
- Question duplication
- Question deletion with confirmation
- Question required/optional toggle
- Real-time preview panel (desktop + mobile toggle)
- Undo/redo (Ctrl+Z / Ctrl+Shift+Z)
- Auto-save every 30 seconds
- Save draft manually
- Survey settings sidebar

#### FR-BLD-004: Survey Settings
- Survey title and description
- Cover image upload
- Welcome message / intro screen
- Thank you / completion screen
- Redirect URL after completion
- Deadline / close date
- Response limit (max number of responses)
- Anonymous responses toggle
- Enable progress bar
- UI mode selection (Classic / Conversational)
- Theme selection (colors, fonts, logo)
- Custom CSS (Pro plan+)

#### FR-BLD-005: Survey Flow
- Visual flowchart of entire survey logic
- Click any node to jump to that question/block
- See logic connections (skip, branch, display)
- Collapse/expand blocks
- Drag blocks to reorder
- Visual indicators for logic conditions

---

### 3.3 Question Types

#### FR-QTYPE-001: Multiple Choice (Single Select)
- Minimum 2, maximum 50 answer options
- Add "Other" option with text input
- Add "None of the above" option
- Horizontal or vertical layout
- Image answer options (clickable images)

#### FR-QTYPE-002: Multiple Choice (Multi-Select)
- All features of single select
- Minimum selections required (configurable)
- Maximum selections allowed (configurable)
- Checkbox display

#### FR-QTYPE-003: Dropdown / Select
- Compact single-select from list
- Search within dropdown (for long lists)
- Placeholder text
- Grouped options (optgroup)

#### FR-QTYPE-004: Short Text
- Single-line text input
- Input validation: text, email, number, URL, phone
- Character limit (configurable)
- Placeholder text

#### FR-QTYPE-005: Long Text / Essay
- Multi-line text area
- Character/word limit (configurable)
- Rich text formatting (optional toggle)
- Placeholder text

#### FR-QTYPE-006: Rating — Likert Scale
- Configurable scale range (e.g., 1-5, 1-7, 1-10)
- Custom labels for min/max (e.g., "Very Dissatisfied" to "Very Satisfied")
- Row labels for matrix variant
- Vertical or horizontal display

#### FR-QTYPE-007: Rating — NPS (Net Promoter Score)
- 0-10 scale with fixed labels: "Not at all likely" to "Extremely likely"
- Question text: "How likely are you to recommend [company] to a friend?"
- Color-coded: Detractors (0-6, red), Passives (7-8, yellow), Promoters (9-10, green)
- Auto-calculated NPS score in analytics

#### FR-QTYPE-008: Rating — Star Rating
- 1-5 or 1-10 star rating
- Half-star option
- Custom labels for each star value

#### FR-QTYPE-009: Rating — Emoji / Smile Rating
- 3, 5, or 7 emoji options (sad to happy)
- Custom emoji set

#### FR-QTYPE-010: Slider
- Draggable slider with configurable range (min/max)
- Step value (e.g., increment by 1, 0.5, 10)
- Min/max labels
- Show current value label

#### FR-QTYPE-011: Ranking
- Drag-and-drop ranking of items
- Minimum 2, maximum 20 items
- Require all items ranked or allow partial ranking

#### FR-QTYPE-012: Matrix / Grid Table
- Rows × Columns grid
- Column types: Likert, bipolar, dropdown, text entry
- Row randomization option
- Force response per row option

#### FR-QTYPE-013: File Upload
- Accepted file types (configurable): images, PDFs, documents
- Max file size (configurable by plan: 5MB free, 25MB pro+)
- Multiple file upload option
- Progress indicator during upload

#### FR-QTYPE-014: Date / Time
- Date picker (calendar)
- Time picker
- Date + time combined
- Date range picker
- Min/max date constraints

#### FR-QTYPE-015: Yes / No
- Simple binary choice
- Optional "Not sure" third option
- Toggle switch or button display

#### FR-QTYPE-016: Image Choice
- Click on image(s) to select
- Single or multi-select mode
- Image + label display
- Grid layout (2-4 columns)

#### FR-QTYPE-017: Contact Information
- Pre-built group: Name, Email, Phone, Company, Job Title
- Configurable which fields to include
- Validation on each field

#### FR-QTYPE-018: Address
- Address field group: Street, City, State/Province, ZIP/Postal, Country
- Google Places autocomplete integration (Pro+)
- Configurable which fields to include

#### FR-QTYPE-019: Scale / Semantic Differential
- Two opposing labels (e.g., "Easy" to "Difficult")
- 5 or 7 point scale between labels

#### FR-QTYPE-020: Constant Sum
- Allocate a fixed total across items
- Configurable total (e.g., 100 points, $1,000)
- Validation: must equal total before submission

#### FR-QTYPE-021: Signature
- Draw signature on canvas (mouse/touch)
- Clear and redo
- Save as image data

#### FR-QTYPE-022: Consent / Agreement
- Checkbox for consent
- Required before proceeding
- Link to terms/privacy policy
- Timestamp and IP recorded

#### FR-QTYPE-023: Descriptive Text / Instructions
- Static text block (not a question)
- Rich text (bold, italic, links, images)
- Section divider / page break

#### FR-QTYPE-024: Hidden Field
- Not visible to respondent
- Pre-populated from URL parameters, embedded data, or CRM
- Used for segmentation and tracking

---

### 3.4 Survey Logic

#### FR-LOGIC-001: Skip Logic
- Skip to a specific question based on answer
- Multiple conditions (AND/OR)
- Condition types: equals, not equals, contains, not contains, greater than, less than, is answered, is not answered
- Apply to: question, block, or end of survey

#### FR-LOGIC-002: Display Logic
- Show/hide individual questions based on conditions
- Show/hide answer choices within a question
- Show/hide entire blocks
- Multiple conditions with AND/OR

#### FR-LOGIC-003: Branch Logic
- Route respondents to different survey paths
- Create branching "trees" in Survey Flow view
- Support for complex multi-level branching
- Default path if no conditions match

#### FR-LOGIC-004: Carry Forward
- Carry forward selected choices from a previous question
- Display only selected items in a later question
- Carry forward all choices or specific subsets

#### FR-LOGIC-005: Text Piping
- Insert a respondent's previous answer into question text
- Insert into answer choice labels
- Insert into section headers
- Supports text, numeric, date answer types

#### FR-LOGIC-006: Loop & Merge
- Repeat a block of questions for each item in a list
- List source: static list, or carry-forward from previous question
- Configurable: loop all items or random subset
- Loop counter display (e.g., "Question 2 of 5")

#### FR-LOGIC-007: Randomization
- Randomize question order within a block
- Randomize answer choice order
- Randomize block order
- Exclude specific items from randomization (anchor items)

#### FR-LOGIC-008: Scoring
- Assign numeric score to each answer choice
- Calculate total score across questions
- Display score to respondent (optional)
- Score-based logic (e.g., "if score > 70, show Thank You; else show follow-up")

#### FR-LOGIC-009: Quota Management
- Set maximum responses per segment (e.g., max 50 per age group)
- Quota-based survey close (stop collecting when all quotas met)
- Quota status visible in distribution panel

#### FR-LOGIC-010: A/B Testing
- Randomly assign respondents to different survey versions
- Configure percentage split (e.g., 50/50)
- Compare response data between variants

---

### 3.5 Distribution & Collection

#### FR-DIST-001: Web Link
- Generate unique shareable URL
- QR code generation
- Option for anonymous link
- Custom URL slug (Business plan+)

#### FR-DIST-002: Email Distribution
- Built-in email composer (rich text)
- Contact list management (upload CSV, manual entry)
- Email variables: first name, last name, custom fields
- Scheduled sending
- Send test email
- Email open and click tracking
- Reminder emails to non-respondents
- Bounce handling and suppression list
- Unsubscribe management

#### FR-DIST-003: Website Embed
- JavaScript embed snippet
- Embed options: inline, popup, slide-in, floating tab
- Trigger rules: time on page, scroll percentage, exit intent, page visit count
- Auto-close after submission
- Responsive sizing

#### FR-DIST-004: Social Media
- Share to Twitter/X, LinkedIn, Facebook
- Pre-populated share text with survey link
- Open Graph meta tags for rich previews

#### FR-DIST-005: SMS Distribution (Pro+)
- Send survey via SMS
- SMS template with short link
- Contact list upload
- Scheduled sending
- SMS credits system

#### FR-DIST-006: QR Code
- Auto-generated QR code for web link
- Download as PNG/SVG
- Customizable color and logo overlay (Pro+)

---

### 3.6 Response Management

#### FR-RESP-001: Response Collection
- Real-time response collection
- Response timestamps
- IP address logging (optional, configurable)
- Geolocation (country/city level, with consent)
- Device type and browser detection
- Response duration tracking
- Partial response capture (save progress)

#### FR-RESP-002: Response Quality
- Bot detection (honeypot fields, CAPTCHA, behavioral analysis)
- Speeder detection (flag responses completed too fast)
- Straight-lining detection (flag identical answers across matrix)
- Attention check questions (configurable)
- Duplicate response detection (cookie + email)

#### FR-RESP-003: Individual Response Viewer
- View each response individually
- Navigate between responses (prev/next)
- Filter by response metadata (date, device, source)
- Flag/edit/delete individual responses
- Add notes/tags to responses

#### FR-RESP-004: Data Export
- Export all responses as CSV
- Export all responses as Excel (.xlsx)
- Export individual response as PDF
- Export summarized data as PDF report
- Scheduled auto-exports (Business+)
- Export via API

---

### 3.7 Analytics & Reporting

#### FR-ANLY-001: Dashboard
- Real-time auto-generated dashboard per survey
- Key metrics: total responses, completion rate, avg. time, NPS score
- Response trend over time (line chart)
- Question-level summary charts
- Filter dashboard by date range, metadata, response source
- Dashboard sharing via public link (read-only)

#### FR-ANLY-002: Question-Level Analysis
- Auto-selected chart type based on question type:
  - Multiple choice: Bar chart + pie chart
  - Rating: Bar chart + average score
  - NPS: NPS gauge + detractor/passive/promoter breakdown
  - Text: Word cloud + response list
  - Matrix: Heatmap
- Toggle between chart types
- Show/hide individual answer choices
- Filter by respondent segments

#### FR-ANLY-003: Cross-Tabulation
- Select two questions to cross-tabulate
- Display as table with counts and percentages
- Chi-square test for statistical significance
- Color-coded cells for high/low values

#### FR-ANLY-004: AI Insights (Pro+)
- **Auto-summary**: AI-generated executive summary of all responses
- **Sentiment analysis**: Classify open-text responses as positive/neutral/negative
- **Theme extraction**: Identify top themes in open-text responses
- **Key findings**: AI-detected patterns and notable insights
- **Recommendations**: AI-suggested actions based on data
- **Response quality report**: AI-flagged low-quality responses

#### FR-ANLY-005: Comparison
- Compare responses across date ranges
- Compare responses across segments (e.g., plan type, region)
- Compare A/B test variants
- Side-by-side charts

#### FR-ANLY-006: Drop-off Analysis
- Funnel visualization showing where respondents abandon
- Per-question drop-off rate
- Average time spent per question
- Identify problematic questions

---

### 3.8 Templates

#### FR-TMPL-001: Template Library
- 50+ pre-built templates organized by category:
  - Customer Satisfaction (CSAT, NPS, CES)
  - Employee Engagement
  - Market Research
  - Event Feedback
  - Lead Generation
  - Product Feedback
  - Website/App Feedback
  - Education/Course Evaluation
  - Healthcare Patient Feedback
  - Restaurant/Service Feedback
- Each template includes questions, logic, and theme
- Templates are fully customizable after selection
- Template preview before use

#### FR-TMPL-002: Custom Templates
- Save any survey as a template
- Shared team template library
- Template categories and tags

---

### 3.9 Branding & Themes

#### FR-THME-001: Theme Builder
- Pre-built theme gallery (20+ themes)
- Custom theme creation:
  - Primary color
  - Secondary color
  - Font family (from curated list)
  - Font size
  - Border radius
  - Background color/image
  - Button style
  - Survey width
- Logo upload (header)
- Favicon upload
- Custom CSS injection (Business+)
- Mobile theme preview

#### FR-THME-002: White-Label (Business+)
- Remove "Powered by SurveyFlow" branding
- Custom domain / CNAME (survey.yourdomain.com)
- Custom email sender domain
- Custom login page branding

---

### 3.10 AI Features

#### FR-AI-001: AI Survey Generator
- Text prompt input: "Create a 10-question customer satisfaction survey for a SaaS product"
- AI generates: title, description, questions, logic, scoring
- Edit and refine generated survey
- Regenerate specific questions
- Choose tone: professional, casual, fun
- Choose length: short (5), medium (10), long (20)

#### FR-AI-002: AI Question Suggestions
- Contextual suggestions while building: "You might want to add a follow-up question about..."
- Suggest question type based on context
- Suggest answer choices for open-ended categories

#### FR-AI-003: AI Text Analysis
- Sentiment analysis for open-text responses
- Topic/theme extraction
- Keyword frequency and word clouds
- Automated response categorization

#### FR-AI-004: AI Summarization
- Generate executive summary of survey results
- Key findings highlight
- Notable quotes from respondents
- Trend identification

#### FR-AI-005: AI Recommendations
- Suggest actions based on survey data
- Identify at-risk segments (e.g., "Detractors in the Enterprise segment have increased 15%")
- Predictive scoring for follow-up prioritization

---

### 3.11 Integrations

#### FR-INTG-001: Native Integrations
- **Slack**: New response notifications, daily/weekly summaries
- **Webhooks**: Real-time push on new response (configurable payload)
- **Zapier**: Trigger on new response, create survey action
- **Google Sheets**: Auto-sync responses to spreadsheet
- **HubSpot**: Sync contacts, trigger surveys from CRM events
- **Salesforce**: Sync contacts, create tasks from survey responses
- **Mailchimp**: Add respondents to email lists

#### FR-INTG-002: API
- RESTful API for all CRUD operations
- API key management (create, revoke, rotate)
- Rate limiting: 100 req/min (Free), 1000 req/min (Pro+)
- Webhook management
- API documentation (OpenAPI/Swagger)
- SDKs: JavaScript, Python (future)

#### FR-INTG-003: Embeddable Widget
- JavaScript SDK for embedding surveys in external websites
- Inline, popup, slide-in, floating button modes
- Trigger rules configuration
- Pass user data (name, email, custom attributes) from host
- Event callbacks (onComplete, onClose, onQuestionChange)

---

### 3.12 Collaboration

#### FR-COLL-001: Team Workspaces
- Shared organization workspace
- Survey ownership and sharing
- Assign surveys to team members
- Shared template library
- Shared theme library

#### FR-COLL-002: Comments & Review
- Add comments on specific questions
- @mention team members
- Comment threads
- Resolve/close comments
- Comment notifications (email + in-app)

#### FR-COLL-003: Version History
- Auto-save version history on every change
- View version diff (what changed)
- Restore previous version
- Version naming (auto + manual)

---

### 3.13 Billing & Subscription

#### FR-BILL-001: Plan Management
- Display current plan and usage
- Upgrade/downgrade plan
- Plan comparison page
- Annual vs. monthly billing (20% discount for annual)
- Prorated billing on mid-cycle changes

#### FR-BILL-002: Payment
- Credit/debit card (Stripe)
- Invoice/bank transfer (Enterprise)
- Payment history
- Download invoices
- Manage payment method
- Cancel subscription (retain data for 90 days)

#### FR-BILL-003: Usage Tracking
- Response count vs. limit (with progress bar)
- Survey count vs. limit
- Team member count vs. limit
- AI credit usage vs. limit
- Email send count vs. limit
- Usage alerts at 80% and 95%

---

## 4. Non-Functional Requirements

### 4.1 Performance

| Metric | Target |
|---|---|
| Page load time (builder) | < 2 seconds |
| Page load time (respondent survey) | < 1 second |
| API response time (p95) | < 500ms |
| Survey submission | < 300ms |
| Dashboard data load | < 3 seconds |
| Concurrent survey respondents | 10,000 per survey |

### 4.2 Scalability

- Horizontal scaling of API servers
- Database read replicas for analytics queries
- CDN for static assets and published survey pages
- Background workers for AI analysis, exports, email sends
- Support 10M+ survey responses without degradation

### 4.3 Availability

- 99.9% uptime SLA (Business/Enterprise)
- Graceful degradation on partial failures
- Database failover
- Automated backups (daily, with point-in-time recovery)

### 4.4 Security

| Requirement | Implementation |
|---|---|
| Data encryption at rest | AES-256 |
| Data encryption in transit | TLS 1.3 |
| Authentication | JWT + refresh tokens, OAuth 2.0 |
| Password storage | bcrypt (cost factor 12) |
| CSRF protection | Double submit cookie pattern |
| XSS prevention | Content Security Policy, input sanitization |
| SQL injection prevention | Parameterized queries via ORM |
| Rate limiting | Per-user and per-IP rate limits |
| Audit logging | Track all data access and changes |

### 4.5 Privacy & Compliance

- GDPR compliant: consent management, right to erasure, data portability, DPA
- CCPA compliant: right to know, delete, opt-out
- Privacy policy generator for survey creators
- Anonymous response mode
- Data retention controls (auto-delete after configurable period)
- Cookie consent banner on published surveys

### 4.6 Accessibility

- WCAG 2.1 Level AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Sufficient color contrast
- Alt text for images
- Focus indicators

### 4.7 Internationalization

- UI available in: English (initial), Vietnamese, Japanese, Spanish, French, German, Portuguese, Chinese (Simplified)
- Survey translation tool for 50+ languages
- RTL (right-to-left) language support
- Date/number/currency formatting by locale

---

## 5. Feature Prioritization

### MVP (v0.1) — Months 1-4

| Feature | Priority |
|---|---|
| Authentication (email, Google OAuth) | P0 |
| Organization + team management | P0 |
| Survey CRUD (create, edit, delete, list) | P0 |
| Question types: Multiple Choice (single/multi), Dropdown, Short Text, Long Text, Rating (Likert, Star, NPS), Yes/No | P0 |
| Basic logic: Skip logic, Display logic | P0 |
| Web link distribution | P0 |
| Response collection + storage | P0 |
| Basic analytics dashboard | P0 |
| CSV/Excel export | P0 |
| 10 templates | P0 |
| Basic theme builder (colors, font, logo) | P0 |
| Responsive design (respondent) | P0 |
| Free + Starter plans | P0 |

### V1.0 — Months 5-8

| Feature | Priority |
|---|---|
| Conversational UI mode | P0 |
| All remaining question types | P0 |
| Text piping + carry forward | P0 |
| Branch logic + loop & merge | P0 |
| Email distribution | P0 |
| AI survey generator | P0 |
| AI text analysis (sentiment + themes) | P0 |
| File upload question type | P1 |
| Website embed widget | P1 |
| Slack integration + Webhooks | P1 |
| 30+ templates | P1 |
| Randomization + scoring | P1 |
| Pro + Business plans | P1 |
| Cross-tabulation | P1 |

### V1.5 — Months 9-12

| Feature | Priority |
|---|
| Full REST API + API keys | P0 |
| Zapier + HubSpot + Salesforce integrations | P0 |
| White-label (custom domain, remove branding) | P0 |
| Team collaboration (comments, sharing) | P0 |
| Version history | P1 |
| A/B testing | P1 |
| Drop-off analysis | P1 |
| AI auto-summary + recommendations | P1 |
| SMS distribution | P1 |
| Quota management | P2 |
| PDF export | P2 |
| 50+ templates | P1 |
| Custom template library | P2 |

### V2.0+ — Months 13+

| Feature | Priority |
|---|
| SSO (SAML/OIDC) | P0 (Enterprise) |
| HIPAA compliance mode | P0 (Enterprise) |
| Conjoint analysis | P1 |
| MaxDiff scaling | P1 |
| Mobile app (offline collection) | P1 |
| Enterprise plan + custom pricing | P0 |
| Template marketplace | P2 |
| API SDKs (JS, Python) | P2 |
| Multi-language UI | P2 |
| Advanced driver analysis | P2 |

---

## 6. User Flows

### 6.1 Create & Publish a Survey (Primary Flow)

```
Sign Up → Verify Email → Dashboard
  → Click "New Survey"
  → Choose: Blank / Template / AI Generate
  → (If AI) Enter prompt → AI generates survey → Edit
  → (If Template) Browse & select → Customize
  → Add/edit questions (drag & drop)
  → Configure logic (skip, display, branch)
  → Customize theme (colors, logo, font)
  → Preview survey (desktop + mobile)
  → Click "Publish"
  → Choose distribution: Web Link / Email / Embed
  → Copy link / Send email / Get embed code
  → View responses in real-time
  → View analytics dashboard
  → Export results
```

### 6.2 AI Survey Generation Flow

```
Dashboard → New Survey → "Generate with AI"
  → Enter prompt: "Customer satisfaction survey for my coffee shop"
  → Select options: Tone (professional), Length (medium), Include NPS (yes)
  → AI generates survey (title + 10 questions + logic + theme)
  → Preview generated survey
  → Edit: Add/remove/regenerate questions
  → Adjust theme
  → Publish
```

### 6.3 Analyze Results Flow

```
Dashboard → Click survey → "Responses" tab
  → View response count, completion rate, avg time
  → Click "Analytics" tab
  → View auto-generated dashboard (charts per question)
  → Click "AI Insights" → View sentiment analysis, themes, summary
  → Click "Cross-Tab" → Select two questions → View cross-tabulation
  → Click "Export" → Choose format → Download
  → (Business+) Click "Schedule Report" → Set frequency → Save
```

---

## 7. Page/Screen Inventory

### Public Pages
| Page | Route | Description |
|---|---|---|
| Landing Page | `/` | Marketing homepage |
| Pricing | `/pricing` | Plan comparison |
| Features | `/features` | Feature overview |
| Templates | `/templates` | Template gallery |
| Sign Up | `/signup` | Registration |
| Sign In | `/signin` | Login |
| Forgot Password | `/forgot-password` | Password reset |
| Survey (Public) | `/s/:surveyId` | Respondent-facing survey |
| Survey Complete | `/s/:surveyId/thank-you` | Thank you page |

### App Pages (Authenticated)
| Page | Route | Description |
|---|---|---|
| Dashboard | `/app` | Survey list + stats |
| Survey Editor | `/app/surveys/:id/edit` | Build/edit survey |
| Survey Responses | `/app/surveys/:id/responses` | Individual responses |
| Survey Analytics | `/app/surveys/:id/analytics` | Charts + insights |
| Survey Settings | `/app/surveys/:id/settings` | Distribution, theme, etc. |
| Survey Flow | `/app/surveys/:id/flow` | Visual logic flowchart |
| Templates | `/app/templates` | Template library |
| Integrations | `/app/integrations` | Manage integrations |
| Team | `/app/team` | Manage members & roles |
| Billing | `/app/billing` | Plan, payment, usage |
| Settings | `/app/settings` | Account settings |
| API Keys | `/app/api-keys` | Manage API keys |
