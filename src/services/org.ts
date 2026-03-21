import { api } from './api';
import type {
  Organization,
  OrgMember,
  Invitation,
  InviteMemberInput,
  UpdateMemberRoleInput,
  OrgUsage,
} from '@/types/api';

export async function getOrganization(): Promise<Organization> {
  return api.get('organizations/me').json<Organization>();
}

export async function updateOrganization(data: Partial<Pick<Organization, 'name'>>): Promise<Organization> {
  return api.put('organizations/me', { json: data }).json<Organization>();
}

export async function getMembers(): Promise<OrgMember[]> {
  return api.get('organizations/me/members').json<OrgMember[]>();
}

export async function inviteMember(input: InviteMemberInput): Promise<Invitation> {
  return api.post('organizations/me/members/invite', { json: input }).json<Invitation>();
}

export async function updateMemberRole(memberId: string, input: UpdateMemberRoleInput): Promise<void> {
  await api.patch(`organizations/me/members/${memberId}/role`, { json: input });
}

export async function removeMember(memberId: string): Promise<void> {
  await api.delete(`organizations/me/members/${memberId}`);
}

export async function getInvitations(): Promise<Invitation[]> {
  return api.get('organizations/me/invitations').json<Invitation[]>();
}

export async function getUsage(): Promise<OrgUsage> {
  return api.get('usage').json<OrgUsage>();
}
