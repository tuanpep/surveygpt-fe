// ── Question Types ────────────────────────────────────────────────────────────

export type QuestionType =
  | 'multiple_choice'
  | 'multi_select'
  | 'dropdown'
  | 'short_text'
  | 'long_text'
  | 'rating_likert'
  | 'rating_nps'
  | 'rating_star'
  | 'rating_emoji'
  | 'slider'
  | 'ranking'
  | 'matrix'
  | 'file_upload'
  | 'date'
  | 'yes_no'
  | 'image_choice'
  | 'contact'
  | 'address'
  | 'constant_sum'
  | 'signature'
  | 'consent'
  | 'descriptive_text'
  | 'hidden_field';

// ── Choice ────────────────────────────────────────────────────────────────────

export interface Choice {
  id: string;
  label: string;
  value: string;
  image?: string;
  description?: string;
  isCorrect?: boolean;
  order: number;
}

// ── Question Definition (Builder) ────────────────────────────────────────────

export interface QuestionDef {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  choices: Choice[];
  properties: Record<string, unknown>;
  order: number;
  blockId: string;
}

// ── Block ─────────────────────────────────────────────────────────────────────

export interface BlockDef {
  id: string;
  title: string;
  description?: string;
  questions: QuestionDef[];
  order: number;
  logic?: BlockLogic[];
}

export interface BlockLogic {
  id: string;
  sourceQuestionId: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'answered' | 'not_answered';
  value?: string | string[];
  targetBlockId: string;
}

// ── Flow Step ─────────────────────────────────────────────────────────────────

export interface FlowStep {
  id: string;
  blockId: string;
  order: number;
  nextStepId?: string;
  conditions?: BlockLogic[];
}

// ── Survey Settings ───────────────────────────────────────────────────────────

export interface SurveySettings {
  isPublic: boolean;
  requireAuth: boolean;
  limitOneResponse: boolean;
  allowEditResponse: boolean;
  shuffleQuestions: boolean;
  showProgressBar: boolean;
  showQuestionNumbers: boolean;
  welcomeMessage?: string;
  startDate?: string;
  endDate?: string;
  maxResponses?: number;
  confirmationMessage?: string;
  redirectUrl?: string;
  closedMessage?: string;
}

// ── Survey Theme ──────────────────────────────────────────────────────────────

export interface SurveyTheme {
  primaryColor: string;
  fontFamily: string;
  fontSize: number;
  backgroundColor: string;
  textColor: string;
  buttonStyle: 'rounded' | 'pill' | 'sharp';
  questionStyle: 'card' | 'flat' | 'minimal';
  logo?: string;
  backgroundImage?: string;
  customCSS?: string;
}

// ── Survey (persisted) ───────────────────────────────────────────────────────

export interface Survey {
  id: string;
  title: string;
  description?: string;
  slug?: string;
  status: 'draft' | 'active' | 'closed' | 'archived';
  blocks: BlockDef[];
  flow: FlowStep[];
  settings: SurveySettings;
  theme: SurveyTheme;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  ownerId: string;
  responseCount: number;
  tags: string[];
}

// ── Survey DTOs ───────────────────────────────────────────────────────────────

export interface CreateSurveyInput {
  title: string;
  description?: string;
  tags?: string[];
}

export interface UpdateSurveyInput {
  title?: string;
  description?: string;
  status?: Survey['status'];
  blocks?: BlockDef[];
  flow?: FlowStep[];
  settings?: Partial<SurveySettings>;
  theme?: Partial<SurveyTheme>;
  tags?: string[];
}

// ── Template Types ────────────────────────────────────────────────────────────

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  questionCount: number;
  blocks: BlockDef[];
  isSystem: boolean;
  createdAt: string;
}

export interface TemplateListInput {
  cursor?: string;
  limit?: number;
  category?: string;
  search?: string;
}

// ── Public Survey (respondent view) ───────────────────────────────────────────

export interface PublicSurvey {
  id: string;
  title: string;
  description?: string;
  blocks: BlockDef[];
  settings: SurveySettings;
  theme: SurveyTheme;
}

// ── Question Type Metadata (for palette) ──────────────────────────────────────

export interface QuestionTypeMeta {
  type: QuestionType;
  label: string;
  icon: string;
  category: 'text' | 'choice' | 'rating' | 'advanced';
  description: string;
}
