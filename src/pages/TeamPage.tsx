import { useState } from 'react';
import {
  Heading, Button, DataTable, Table, TableHead, TableRow, TableHeader,
  TableBody, TableCell, TableContainer, OverflowMenu, OverflowMenuItem,
  Tag, ToastNotification, ComposedModal, ModalHeader, ModalBody, ModalFooter,
  Stack, TextInput, Select, SelectItem,
} from '@carbon/react';
import { useMembers, useInvitations, useInviteMember, useUpdateMemberRole, useRemoveMember } from '@/hooks/useOrg';
import { Loading } from '@/components/shared/Loading';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import type { OrgRole } from '@/types/api';
import { AppPage } from '@/components/layout/AppPage';

export function TeamPage() {
  const { data: members, isLoading: membersLoading } = useMembers();
  const { data: invitations, isLoading: invitationsLoading } = useInvitations();
  const inviteMember = useInviteMember();
  const updateMemberRole = useUpdateMemberRole();
  const removeMember = useRemoveMember();

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<OrgRole>('viewer');
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);
  const [removeTarget, setRemoveTarget] = useState<{ id: string; name: string } | null>(null);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await inviteMember.mutateAsync({ email: inviteEmail, role: inviteRole });
      setToast({ kind: 'success', message: `Invitation sent to ${inviteEmail}` });
      setInviteEmail('');
      setIsInviteModalOpen(false);
    } catch {
      setToast({ kind: 'error', message: 'Failed to send invitation' });
    }
  };

  const handleRoleChange = async (memberId: string, newRole: OrgRole) => {
    try {
      await updateMemberRole.mutateAsync({ memberId, input: { role: newRole } });
      setToast({ kind: 'success', message: 'Member role updated' });
    } catch {
      setToast({ kind: 'error', message: 'Failed to update role' });
    }
  };

  const handleRemoveClick = (memberId: string, memberName: string) => {
    setRemoveTarget({ id: memberId, name: memberName });
  };

  const handleRemoveConfirm = async () => {
    if (!removeTarget) return;
    try {
      await removeMember.mutateAsync(removeTarget.id);
      setToast({ kind: 'success', message: 'Member removed' });
      setRemoveTarget(null);
    } catch {
      setToast({ kind: 'error', message: 'Failed to remove member' });
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'red';
      case 'admin': return 'purple';
      case 'editor': return 'blue';
      case 'viewer': return 'gray';
      default: return 'gray';
    }
  };

  if (membersLoading || invitationsLoading) return <Loading type="table" />;

  return (
    <AppPage>
      <div className="app-page__header">
        <Heading>Team</Heading>
        <Button kind="primary" onClick={() => setIsInviteModalOpen(true)}>
          Invite Member
        </Button>
      </div>

      {toast && (
        <ToastNotification
          kind={toast.kind}
          title={toast.kind === 'success' ? 'Success' : 'Error'}
          subtitle={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <div className="team-page__section">
        <Heading>Members ({members?.length ?? 0})</Heading>
        <DataTable
          rows={members?.map((m) => ({
            id: m.id,
            name: m.user.name,
            email: m.user.email,
            role: m.role,
            joined: new Date(m.joinedAt).toLocaleDateString(),
          })) ?? []}
          headers={[
            { key: 'name', header: 'Name' },
            { key: 'email', header: 'Email' },
            { key: 'role', header: 'Role' },
            { key: 'joined', header: 'Joined' },
          ]}
        >
          {({ rows, headers }) => (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader key={header.key}>{header.header}</TableHeader>
                    ))}
                    <TableHeader>Actions</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.info.header}>
                          {cell.info.header === 'role' ? (
                            <Tag type={getRoleColor(cell.value as string)}>
                              {cell.value}
                            </Tag>
                          ) : (
                            cell.value
                          )}
                        </TableCell>
                      ))}
                      <TableCell>
                        <OverflowMenu size="sm" flipped>
                          <OverflowMenuItem
                            onClick={() => handleRoleChange(row.id, 'admin')}
                          >
                            Make Admin
                          </OverflowMenuItem>
                          <OverflowMenuItem
                            onClick={() => handleRoleChange(row.id, 'editor')}
                          >
                            Make Editor
                          </OverflowMenuItem>
                          <OverflowMenuItem
                            onClick={() => handleRoleChange(row.id, 'viewer')}
                          >
                            Make Viewer
                          </OverflowMenuItem>
                          <OverflowMenuItem
                            hasDivider
                            isDelete
                            onClick={() => handleRemoveClick(row.id, row.cells[0].value as string)}
                          >
                            Remove
                          </OverflowMenuItem>
                        </OverflowMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DataTable>
      </div>

      {invitations && invitations.length > 0 && (
        <div>
          <Heading>Pending Invitations ({invitations.length})</Heading>
          <DataTable
            rows={invitations.map((inv) => ({
              id: inv.id,
              email: inv.email,
              role: inv.role,
              expires: new Date(inv.expiresAt).toLocaleDateString(),
            }))}
            headers={[
              { key: 'email', header: 'Email' },
              { key: 'role', header: 'Role' },
              { key: 'expires', header: 'Expires' },
            ]}
          >
            {({ rows, headers }) => (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      {headers.map((header) => (
                        <TableHeader key={header.key}>{header.header}</TableHeader>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.cells.map((cell) => (
                          <TableCell key={cell.info.header}>
                            {cell.info.header === 'role' ? (
                              <Tag type={getRoleColor(cell.value as string)}>
                                {cell.value}
                              </Tag>
                            ) : (
                              cell.value
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DataTable>
        </div>
      )}

      <ComposedModal
        open={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      >
        <ModalHeader title="Invite Team Member" />
        <ModalBody>
          <form onSubmit={handleInvite}>
            <Stack gap={6}>
              <TextInput
                id="invite-email"
                labelText="Email address"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />
              <Select
                id="invite-role"
                labelText="Role"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as OrgRole)}
                required
              >
                <SelectItem value="viewer" text="Viewer - Can view surveys and results" />
                <SelectItem value="editor" text="Editor - Can edit and manage surveys" />
                <SelectItem value="admin" text="Admin - Full access except billing" />
              </Select>
            </Stack>
          </form>
        </ModalBody>
        <ModalFooter>
          <Button kind="secondary" onClick={() => setIsInviteModalOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={inviteMember.isPending} onClick={handleInvite}>
            {inviteMember.isPending ? 'Sending...' : 'Send Invitation'}
          </Button>
        </ModalFooter>
      </ComposedModal>

      <ConfirmModal
        open={removeTarget !== null}
        onClose={() => setRemoveTarget(null)}
        title="Remove Team Member"
        description={`Are you sure you want to remove "${removeTarget?.name}" from the team? This action cannot be undone.`}
        confirmLabel="Remove"
        danger
        loading={removeMember.isPending}
        onConfirm={handleRemoveConfirm}
      />
    </AppPage>
  );
}
