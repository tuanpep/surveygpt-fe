import { api } from './api';
import type { SubmitResponseInput, ResponseFilter } from '@/types/response';
import type { PaginatedResponse } from '@/types/api';
import type { Response as SurveyResponse } from '@/types/response';

export async function listResponses(filter: ResponseFilter): Promise<PaginatedResponse<SurveyResponse>> {
  const searchParams: Record<string, string> = {};
  if (filter.surveyId) searchParams.surveyId = filter.surveyId;
  if (filter.status) searchParams.status = filter.status;
  if (filter.startDate) searchParams.startDate = filter.startDate;
  if (filter.endDate) searchParams.endDate = filter.endDate;
  if (filter.cursor) searchParams.cursor = filter.cursor;
  if (filter.limit) searchParams.limit = String(filter.limit);
  if (filter.sortBy) searchParams.sortBy = filter.sortBy;
  if (filter.sortOrder) searchParams.sortOrder = filter.sortOrder;

  return api.get(`surveys/${filter.surveyId}/responses`, { searchParams }).json<PaginatedResponse<SurveyResponse>>();
}

export async function getResponse(surveyId: string, id: string): Promise<SurveyResponse> {
  return api.get(`surveys/${surveyId}/responses/${id}`).json<SurveyResponse>();
}

export async function submitResponse(input: SubmitResponseInput): Promise<SurveyResponse> {
  return api.post(`surveys/${input.surveyId}/responses`, { json: input }).json<SurveyResponse>();
}

export async function deleteResponse(surveyId: string, id: string): Promise<void> {
  await api.delete(`surveys/${surveyId}/responses/${id}`);
}

export async function exportResponses(surveyId: string, format: 'csv' | 'json' | 'xlsx'): Promise<Blob> {
  return api.get(`surveys/${surveyId}/responses/export`, {
    searchParams: { format },
  }).blob();
}
