import { api } from './api';
import type { SurveyAnalytics, DashboardSummary } from '@/types/analytics';

export async function getSurveyAnalytics(surveyId: string): Promise<SurveyAnalytics> {
  return api.get(`surveys/${surveyId}/analytics/summary`).json<SurveyAnalytics>();
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  return api.get('analytics/dashboard').json<DashboardSummary>();
}
