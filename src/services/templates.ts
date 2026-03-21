import { api } from './api';
import type { PaginatedResponse } from '@/types/api';

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  questionCount: number;
  blocks: string; // JSON string of blocks structure
  theme: string; // JSON string of theme
  createdAt: string;
}

export interface ListTemplatesParams {
  category?: string;
  cursor?: string;
  limit?: number;
}

export async function listTemplates(
  params: ListTemplatesParams = {}
): Promise<PaginatedResponse<Template>> {
  const searchParams: Record<string, string> = {};
  if (params.category) searchParams.category = params.category;
  if (params.cursor) searchParams.cursor = params.cursor;
  if (params.limit) searchParams.limit = String(params.limit);

  return api.get('templates', { searchParams }).json<PaginatedResponse<Template>>();
}

export async function getTemplate(id: string): Promise<Template> {
  return api.get(`templates/${id}`).json<Template>();
}
