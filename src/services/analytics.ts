import { api } from './api';
import type { SurveyAnalytics, DashboardSummary } from '@/types/analytics';

export async function getSurveyAnalytics(surveyId: string): Promise<SurveyAnalytics> {
  return api.get(`surveys/${surveyId}/analytics/summary`).json<SurveyAnalytics>();
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  return api.get('analytics/dashboard').json<DashboardSummary>();
}

export async function getQuestionStats(surveyId: string, questionId: string) {
  return api.get(`surveys/${surveyId}/analytics/questions/${questionId}`).json();
}

export async function getCrossTab(surveyId: string, questionIdA: string, questionIdB: string) {
  return api.get(`surveys/${surveyId}/analytics/cross-tab`, {
    searchParams: { questionIdA, questionIdB },
  }).json();
}

export async function getDropoff(surveyId: string) {
  return api.get(`surveys/${surveyId}/analytics/dropoff`).json();
}
