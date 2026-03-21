import { api } from './api';
import type { Survey, CreateSurveyInput, UpdateSurveyInput, PublicSurvey, BlockDef, SurveySettings, SurveyTheme } from '@/types/survey';
import type { PaginatedResponse } from '@/types/api';

interface ListSurveysParams {
  cursor?: string;
  limit?: number;
  status?: Survey['status'];
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export async function listSurveys(params: ListSurveysParams = {}): Promise<PaginatedResponse<Survey>> {
  const searchParams: Record<string, string> = {};
  if (params.cursor) searchParams.cursor = params.cursor;
  if (params.limit) searchParams.limit = String(params.limit);
  if (params.status) searchParams.status = params.status;
  if (params.search) searchParams.search = params.search;
  if (params.sortBy) searchParams.sortBy = params.sortBy;
  if (params.sortOrder) searchParams.sortOrder = params.sortOrder;

  return api.get('surveys', { searchParams }).json<PaginatedResponse<Survey>>();
}

export async function getSurvey(id: string): Promise<Survey> {
  return api.get(`surveys/${id}`).json<Survey>();
}

export async function getSurveyBySlug(slug: string): Promise<Survey> {
  return api.get(`surveys/slug/${slug}`).json<Survey>();
}

export async function createSurvey(input: CreateSurveyInput): Promise<Survey> {
  return api.post('surveys', { json: input }).json<Survey>();
}

export async function updateSurvey(id: string, input: UpdateSurveyInput): Promise<Survey> {
  return api.patch(`surveys/${id}`, { json: input }).json<Survey>();
}

export async function deleteSurvey(id: string): Promise<void> {
  await api.delete(`surveys/${id}`);
}

export async function publishSurvey(id: string): Promise<Survey> {
  return api.post(`surveys/${id}/publish`).json<Survey>();
}

export async function unpublishSurvey(id: string): Promise<Survey> {
  return api.post(`surveys/${id}/unpublish`).json<Survey>();
}

export async function duplicateSurvey(id: string): Promise<Survey> {
  return api.post(`surveys/${id}/duplicate`).json<Survey>();
}

export async function getPublicSurvey(id: string): Promise<PublicSurvey> {
  return api.get(`surveys/${id}/public`).json<PublicSurvey>();
}

export async function updateSurveyStructure(id: string, blocks: BlockDef[]): Promise<Survey> {
  return api.put(`surveys/${id}/structure`, { json: { blocks } }).json<Survey>();
}

export async function updateSurveySettings(id: string, settings: Partial<SurveySettings>): Promise<Survey> {
  return api.put(`surveys/${id}/settings`, { json: settings }).json<Survey>();
}

export async function updateSurveyTheme(id: string, theme: Partial<SurveyTheme>): Promise<Survey> {
  return api.put(`surveys/${id}/theme`, { json: theme }).json<Survey>();
}

export async function createSurveyFromTemplate(templateId: string, title: string): Promise<Survey> {
  return api.post('surveys', { json: { templateId, title } }).json<Survey>();
}
