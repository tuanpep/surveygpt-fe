import { useQuery } from '@tanstack/react-query';
import {
  getQRCode,
  getEmbedCode,
  getEmailLists,
  createEmailList,
  deleteEmailList,
  sendSurveyEmails,
} from '@/services/distribution';
import { useOptimisticMutation } from './createMutation';

export function useQRCode(surveyId: string) {
  return useQuery({
    queryKey: ['distribution', 'qr', surveyId],
    queryFn: () => getQRCode(surveyId),
    enabled: !!surveyId,
  });
}

export function useEmbedCode(surveyId: string, mode: 'popup' | 'embedded' | 'fullpage' = 'popup') {
  return useQuery({
    queryKey: ['distribution', 'embed', surveyId, mode],
    queryFn: () => getEmbedCode(surveyId, mode),
    enabled: !!surveyId,
  });
}

export function useEmailLists() {
  return useQuery({
    queryKey: ['distribution', 'email-lists'],
    queryFn: getEmailLists,
  });
}

export function useCreateEmailList() {
  return useOptimisticMutation<{
    name: string;
    contacts: { email: string; firstName?: string; lastName?: string }[];
  }>({
    mutationFn: ({ name, contacts }) => createEmailList(name, contacts),
    invalidateKeys: [['distribution', 'email-lists']],
  });
}

export function useDeleteEmailList() {
  return useOptimisticMutation<string>({
    mutationFn: (id) => deleteEmailList(id),
    invalidateKeys: [['distribution', 'email-lists']],
  });
}

export function useSendSurveyEmails() {
  return useOptimisticMutation<{
    surveyId: string;
    listId: string;
    subject: string;
    body: string;
    scheduleAt?: string;
  }>({
    mutationFn: ({ surveyId, ...input }) => sendSurveyEmails(surveyId, input),
  });
}
