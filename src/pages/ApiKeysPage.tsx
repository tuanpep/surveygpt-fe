import { useState, useEffect } from 'react';
import {
  Heading, Button, DataTable, Table, TableHead, TableRow, TableHeader,
  TableBody, TableCell, TableContainer, OverflowMenu, OverflowMenuItem,
  ComposedModal, ModalHeader, ModalBody, ModalFooter, TextInput, ToastNotification,
  CodeSnippet,
} from '@carbon/react';
import { api } from '@/services/api';
import { Loading } from '@/components/shared/Loading';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { EmptyState } from '@/components/shared/EmptyState';
import { AppPage } from '@/components/layout/AppPage';

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt?: string;
}

export function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const fetchKeys = async () => {
    try {
      const data = await api.get('api-keys').json<ApiKey[]>();
      setKeys(data);
    } catch {
      // Silently fail — API may not be available
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchKeys(); }, []);

  const handleCreate = async () => {
    if (!newKeyName.trim()) return;
    try {
      const data = await api.post('api-keys', { json: { name: newKeyName.trim() } }).json<{ key: string }>();
      setNewKeyValue(data.key);
      setNewKeyName('');
      fetchKeys();
      setToast({ kind: 'success', message: 'API key created. Copy it now — it won\'t be shown again.' });
    } catch {
      setToast({ kind: 'error', message: 'Failed to create API key' });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`api-keys/${deleteTarget}`);
      setToast({ kind: 'success', message: 'API key deleted' });
      setDeleteTarget(null);
      fetchKeys();
    } catch {
      setToast({ kind: 'error', message: 'Failed to delete API key' });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setToast({ kind: 'success', message: 'Copied to clipboard' });
  };

  return (
    <AppPage>
      <div className="app-page__header">
        <Heading>API Keys</Heading>
        <Button kind="primary" onClick={() => setShowCreateModal(true)}>
          Create API Key
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

      {isLoading ? (
        <Loading type="table" />
      ) : keys.length === 0 ? (
        <EmptyState
          title="No API keys"
          description="Create an API key to access the SurveyFlow API programmatically."
          actionLabel="Create API Key"
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <DataTable
          rows={keys.map((k) => ({
            id: k.id,
            name: k.name,
            prefix: k.prefix + '...',
            created: new Date(k.createdAt).toLocaleDateString(),
            lastUsed: k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : 'Never',
          }))}
          headers={[
            { key: 'name', header: 'Name' },
            { key: 'prefix', header: 'Key' },
            { key: 'created', header: 'Created' },
            { key: 'lastUsed', header: 'Last Used' },
          ]}
        >
          {({ rows, headers }) => (
            <TableContainer>
              <Table size="sm">
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
                          {cell.info.header === 'prefix' ? (
                            <CodeSnippet type="inline">
                              {String(cell.value)}
                            </CodeSnippet>
                          ) : cell.value}
                        </TableCell>
                      ))}
                      <TableCell>
                        <OverflowMenu size="sm" flipped>
                          <OverflowMenuItem onClick={() => copyToClipboard(row.cells[1].value as string)}>
                            Copy prefix
                          </OverflowMenuItem>
                          <OverflowMenuItem hasDivider isDelete onClick={() => setDeleteTarget(row.id)}>
                            Delete
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
      )}

      {/* Create Key Modal */}
      <ComposedModal open={showCreateModal} onClose={() => { setShowCreateModal(false); setNewKeyValue(''); }}>
        <ModalHeader title="Create API Key" closeModal={() => { setShowCreateModal(false); setNewKeyValue(''); }} />
        <ModalBody>
          {newKeyValue ? (
            <div>
              <p style={{ marginBottom: '0.5rem' }}>Your new API key (copy it now — it won't be shown again):</p>
              <CodeSnippet type="multi" feedback="Copied!">
                {newKeyValue}
              </CodeSnippet>
            </div>
          ) : (
            <TextInput
              id="new-api-key-name"
              labelText="Key Name"
              placeholder="e.g., Production API"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
            />
          )}
        </ModalBody>
        <ModalFooter>
          <Button kind="secondary" onClick={() => { setShowCreateModal(false); setNewKeyValue(''); }}>
            {newKeyValue ? 'Done' : 'Cancel'}
          </Button>
          {!newKeyValue && (
            <Button kind="primary" onClick={handleCreate} disabled={!newKeyName.trim()}>
              Create Key
            </Button>
          )}
        </ModalFooter>
      </ComposedModal>

      <ConfirmModal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete API Key"
        description="Are you sure? This will immediately revoke access for this key."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
      />
    </AppPage>
  );
}
