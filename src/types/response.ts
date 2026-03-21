// ── Response ──────────────────────────────────────────────────────────────────

export interface Response {
  id: string;
  surveyId: string;
  respondentId?: string;
  answers: Answer[];
  status: 'completed' | 'partial' | 'disqualified';
  startedAt: string;
  completedAt?: string;
  metadata: ResponseMetadata;
  durationMs?: number;
  qualityFlags?: QualityFlags;
}

// ── Answer ────────────────────────────────────────────────────────────────────

export interface Answer {
  questionId: string;
  blockId: string;
  value: AnswerValue;
  type: string;
}

export type AnswerValue =
  | string
  | string[]
  | number
  | number[]
  | null
  | Record<string, unknown>;

// ── Response Metadata ─────────────────────────────────────────────────────────

export interface ResponseMetadata {
  ip?: string;
  userAgent?: string;
  referer?: string;
  locale?: string;
  source?: 'web' | 'email' | 'embed' | 'qr' | 'api' | 'link';
  device?: 'desktop' | 'mobile' | 'tablet';
  browser?: string;
  country?: string;
  custom?: Record<string, string>;
}

export interface QualityFlags {
  isSpeeder?: boolean;
  isBot?: boolean;
  isStraightLining?: boolean;
  isInconsistent?: boolean;
  flaggedAt?: string;
  flagNote?: string;
}

// ── Response DTOs ─────────────────────────────────────────────────────────────

export interface SubmitResponseInput {
  surveyId: string;
  answers: Answer[];
  metadata?: ResponseMetadata;
}

export interface ResponseFilter {
  surveyId: string;
  status?: Response['status'];
  startDate?: string;
  endDate?: string;
  source?: ResponseMetadata['source'];
  cursor?: string;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
