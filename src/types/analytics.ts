// ── Analytics ─────────────────────────────────────────────────────────────────

export interface SurveyAnalytics {
  surveyId: string;
  totalResponses: number;
  completedResponses: number;
  partialResponses: number;
  completionRate: number;
  averageDurationMs: number;
  dailyResponseCounts: DailyResponseCount[];
  questionStats: QuestionStat[];
}

export interface DailyResponseCount {
  date: string;
  count: number;
  completed: number;
}

export interface QuestionStat {
  questionId: string;
  questionTitle: string;
  questionType: string;
  responseCount: number;
  skipCount: number;
  distribution: DistributionItem[];
  average?: number;
  median?: number;
  npsScore?: number;
  npsBreakdown?: NPSBreakdown;
  textStats?: TextStats;
}

export interface DistributionItem {
  label: string;
  count: number;
  percentage: number;
}

export interface NPSBreakdown {
  promoters: number;
  passives: number;
  detractors: number;
  promoterCount: number;
  passiveCount: number;
  detractorCount: number;
}

export interface TextStats {
  totalResponses: number;
  averageWordCount: number;
  topWords: { word: string; count: number }[];
  sampleResponses: string[];
}

// ── Dashboard Summary ─────────────────────────────────────────────────────────

export interface DashboardSummary {
  totalSurveys: number;
  activeSurveys: number;
  totalResponses: number;
  totalResponsesDelta: number;
  averageCompletionRate: number;
  averageCompletionRateDelta: number;
  recentSurveys: RecentSurveyItem[];
}

export interface RecentSurveyItem {
  id: string;
  title: string;
  status: string;
  responseCount: number;
  createdAt: string;
}
