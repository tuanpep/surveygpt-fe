import { useQuery } from '@tanstack/react-query';
import {
  getMembers,
  inviteMember,
  updateMemberRole,
  removeMember,
  getInvitations,
  getUsage,
} from '@/services/org';
import type { InviteMemberInput, UpdateMemberRoleInput } from '@/types/api';
import { useOptimisticMutation } from './createMutation';

export function useMembers() {
  return useQuery({
    queryKey: ['members'],
    queryFn: getMembers,
  });
}

export function useInviteMember() {
  return useOptimisticMutation<InviteMemberInput>({
    mutationFn: (input) => inviteMember(input),
    invalidateKeys: [['members'], ['invitations']],
  });
}

export function useUpdateMemberRole() {
  return useOptimisticMutation<{ memberId: string; input: UpdateMemberRoleInput }>({
    mutationFn: ({ memberId, input }) => updateMemberRole(memberId, input),
    invalidateKeys: [['members']],
  });
}

export function useRemoveMember() {
  return useOptimisticMutation<string>({
    mutationFn: (memberId) => removeMember(memberId),
    invalidateKeys: [['members']],
  });
}

export function useInvitations() {
  return useQuery({
    queryKey: ['invitations'],
    queryFn: getInvitations,
  });
}

export function useUsage() {
  return useQuery({
    queryKey: ['usage'],
    queryFn: getUsage,
  });
}
