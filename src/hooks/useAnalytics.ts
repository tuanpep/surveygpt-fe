import { useQuery } from '@tanstack/react-query';
import { getSurveyAnalytics, getDashboardSummary } from '@/services/analytics';

export function useSurveyAnalytics(surveyId: string) {
  return useQuery({
    queryKey: ['analytics', surveyId],
    queryFn: () => getSurveyAnalytics(surveyId),
    enabled: !!surveyId,
  });
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: getDashboardSummary,
  });
}
