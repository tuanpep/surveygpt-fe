import { useQuery } from '@tanstack/react-query';
import {
  listResponses,
  getResponse,
  deleteResponse,
  exportResponses,
} from '@/services/responses';
import { useOptimisticMutation } from './createMutation';
import type { ResponseFilter } from '@/types/response';

export function useResponses(filter: ResponseFilter) {
  return useQuery({
    queryKey: ['responses', filter],
    queryFn: () => listResponses(filter),
    enabled: !!filter.surveyId,
  });
}

export function useResponse(surveyId: string, id: string) {
  return useQuery({
    queryKey: ['response', surveyId, id],
    queryFn: () => getResponse(surveyId, id),
    enabled: !!surveyId && !!id,
  });
}

export function useDeleteResponse(surveyId: string) {
  return useOptimisticMutation<string>({
    mutationFn: (id) => deleteResponse(surveyId, id),
    invalidateKeys: () => [['responses'], ['analytics', surveyId]],
  });
}

export function useExportResponses() {
  return useOptimisticMutation<{ surveyId: string; format: 'csv' | 'json' | 'xlsx' }, Blob>({
    mutationFn: ({ surveyId, format }) => exportResponses(surveyId, format),
  });
}
