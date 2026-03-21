import { useRef, useCallback, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Survey, CreateSurveyInput, UpdateSurveyInput, BlockDef } from '@/types/survey';
import {
  listSurveys,
  getSurvey,
  createSurvey,
  updateSurvey,
  deleteSurvey,
  publishSurvey,
  unpublishSurvey,
  duplicateSurvey,
  getPublicSurvey,
  updateSurveyStructure,
  createSurveyFromTemplate,
} from '@/services/surveys';
import { useOptimisticMutation } from './createMutation';

interface ListSurveysParams {
  cursor?: string;
  limit?: number;
  pageSize?: number;
  status?: Survey['status'];
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function useSurveys(params: ListSurveysParams = {}) {
  return useQuery({
    queryKey: ['surveys', params],
    queryFn: () => listSurveys(params),
  });
}

export function useSurvey(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['survey', id],
    queryFn: () => getSurvey(id),
    enabled: options?.enabled !== false && !!id,
  });
}

export function useCreateSurvey() {
  return useOptimisticMutation<CreateSurveyInput>({
    mutationFn: (input) => createSurvey(input),
    invalidateKeys: [['surveys']],
  });
}

export function useUpdateSurvey(id: string) {
  return useOptimisticMutation<UpdateSurveyInput>({
    mutationFn: (input) => updateSurvey(id, input),
    invalidateKeys: [['survey', id], ['surveys']],
  });
}

export function useDeleteSurvey() {
  return useOptimisticMutation<string>({
    mutationFn: (id) => deleteSurvey(id),
    invalidateKeys: [['surveys']],
  });
}

export function usePublishSurvey() {
  return useOptimisticMutation<string>({
    mutationFn: (id) => publishSurvey(id),
    invalidateKeys: (id) => [['survey', id], ['surveys']],
  });
}

export function useUnpublishSurvey() {
  return useOptimisticMutation<string>({
    mutationFn: (id) => unpublishSurvey(id),
    invalidateKeys: (id) => [['survey', id], ['surveys']],
  });
}

export function useDuplicateSurvey() {
  return useOptimisticMutation<string>({
    mutationFn: (id) => duplicateSurvey(id),
    invalidateKeys: [['surveys']],
  });
}

export function usePublicSurvey(id: string) {
  return useQuery({
    queryKey: ['public-survey', id],
    queryFn: () => getPublicSurvey(id),
    enabled: !!id,
    retry: false,
  });
}

export function useAutoSave(surveyId: string, enabled = true) {
  const queryClient = useQueryClient();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingBlocksRef = useRef<BlockDef[] | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState(false);

  const mutation = useMutation({
    mutationFn: (blocks: BlockDef[]) => updateSurveyStructure(surveyId, blocks),
    onSuccess: () => {
      setLastSaved(new Date());
      setSaveError(false);
      pendingBlocksRef.current = null;
      queryClient.invalidateQueries({ queryKey: ['survey', surveyId] });
    },
    onError: () => {
      setSaveError(true);
      // Retry once after 5 seconds
      if (pendingBlocksRef.current) {
        setTimeout(() => {
          mutation.mutate(pendingBlocksRef.current!);
        }, 5000);
      }
    },
  });

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      // Fire any pending save on unmount
      if (pendingBlocksRef.current && enabled) {
        mutation.mutate(pendingBlocksRef.current);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const save = useCallback(
    (blocks: BlockDef[]) => {
      if (!enabled) return;
      pendingBlocksRef.current = blocks;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        mutation.mutate(blocks);
      }, 2000);
    },
    [enabled, mutation]
  );

  const flushSave = useCallback(() => {
    if (!enabled) return;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (pendingBlocksRef.current) {
      mutation.mutate(pendingBlocksRef.current);
    }
  }, [enabled, mutation]);

  return {
    isSaving: mutation.isPending,
    lastSaved,
    saveError,
    save,
    flushSave,
  };
}

export function useCreateFromTemplate() {
  return useOptimisticMutation<{ templateId: string; title: string }>({
    mutationFn: ({ templateId, title }) => createSurveyFromTemplate(templateId, title),
    invalidateKeys: [['surveys']],
  });
}
