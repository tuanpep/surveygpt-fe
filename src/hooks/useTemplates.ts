import { useQuery } from '@tanstack/react-query';
import { listTemplates, getTemplate } from '@/services/templates';

interface ListTemplatesParams {
  category?: string;
  cursor?: string;
  limit?: number;
}

export function useTemplates(params: ListTemplatesParams = {}) {
  return useQuery({
    queryKey: ['templates', params],
    queryFn: () => listTemplates(params),
  });
}

export function useTemplate(id: string) {
  return useQuery({
    queryKey: ['template', id],
    queryFn: () => getTemplate(id),
    enabled: !!id,
  });
}
