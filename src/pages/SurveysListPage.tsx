import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Heading, Button, DataTable, Table, TableHead, TableRow, TableHeader,
  TableBody, TableCell, TableContainer, OverflowMenu, OverflowMenuItem, Tag, ToastNotification,
  Search, Select, SelectItem,
} from '@carbon/react';
import { Add } from '@carbon/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSurveys, useDeleteSurvey, useDuplicateSurvey } from '@/hooks/useSurvey';
import { updateSurvey as updateSurveyApi } from '@/services/surveys';
import { Loading } from '@/components/shared/Loading';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmModal as ConfirmModalComponent } from '@/components/shared/ConfirmModal';
import type { Survey } from '@/types/survey';
import { getSurveyStatusTagType } from '@/utils/format';
import { AppPage } from '@/components/layout/AppPage';

export function SurveysListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [allSurveys, setAllSurveys] = useState<Survey[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Survey | null>(null);
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

  const { data, isLoading } = useSurveys({
    search: search || undefined,
    status: statusFilter === 'all' ? undefined : (statusFilter as Survey['status']),
    sortBy,
    sortOrder: 'desc',
    cursor,
    limit: 20,
  });

  const deleteSurvey = useDeleteSurvey();
  const duplicateSurvey = useDuplicateSurvey();
  const queryClient = useQueryClient();

  const archiveSurvey = useMutation({
    mutationFn: (id: string) => updateSurveyApi(id, { status: 'archived' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['surveys'] }),
  });

  // Accumulate surveys for cursor-based pagination
  useEffect(() => {
    if (data?.data) {
      if (cursor === undefined) {
        // First page - replace all surveys
        setAllSurveys(data.data);
      } else {
        // Next page - append surveys
        setAllSurveys((prev) => [...prev, ...data.data]);
      }
    }
  }, [data, cursor]);

  const surveys = allSurveys;

  // Reset cursor and accumulated surveys when filters change
  useEffect(() => {
    setCursor(undefined);
    setAllSurveys([]);
  }, [search, statusFilter, sortBy]);

  const handleLoadMore = () => {
    if (data?.nextCursor) {
      setCursor(data.nextCursor);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateSurvey.mutateAsync(id);
      setToast({ kind: 'success', message: 'Survey duplicated' });
    } catch {
      setToast({ kind: 'error', message: 'Failed to duplicate survey' });
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await archiveSurvey.mutateAsync(id);
      setToast({ kind: 'success', message: 'Survey archived' });
    } catch {
      setToast({ kind: 'error', message: 'Failed to archive survey' });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteSurvey.mutateAsync(deleteTarget.id);
      setToast({ kind: 'success', message: 'Survey deleted' });
      setDeleteTarget(null);
    } catch {
      setToast({ kind: 'error', message: 'Failed to delete survey' });
    }
  };

  if (isLoading) return <Loading type="table" />;

  return (
    <AppPage>
      <div className="app-page__header">
        <Heading>Surveys</Heading>
        <Button kind="primary" renderIcon={Add} as={Link} to="/app/surveys/new">
          New Survey
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

      <div className="surveys-list__toolbar">
        <Search
          className="surveys-list__toolbar-search"
          size="md"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search surveys..."
          labelText="Search surveys"
        />
        <Select
          id="status-filter"
          labelText=""
          size="sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          hideLabel
        >
          <SelectItem value="all" text="All Status" />
          <SelectItem value="draft" text="Draft" />
          <SelectItem value="active" text="Active" />
          <SelectItem value="closed" text="Closed" />
          <SelectItem value="archived" text="Archived" />
        </Select>
        <Select
          id="sort-by"
          labelText=""
          size="sm"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          hideLabel
        >
          <SelectItem value="updatedAt" text="Last Modified" />
          <SelectItem value="createdAt" text="Created Date" />
          <SelectItem value="responseCount" text="Response Count" />
        </Select>
      </div>

      {surveys.length === 0 ? (
        <EmptyState
          title="No surveys yet"
          description="Create your first survey to get started"
          actionLabel="Create Survey"
          onAction={() => navigate('/app/surveys/new')}
        />
      ) : (
        <>
          <DataTable
            rows={surveys.map((s: Survey) => ({
              id: s.id,
              title: s.title,
              status: s.status,
              responses: s.responseCount,
              createdAt: new Date(s.createdAt).toLocaleDateString(),
              updatedAt: new Date(s.updatedAt).toLocaleDateString(),
            }))}
            headers={[
              { key: 'title', header: 'Title' },
              { key: 'status', header: 'Status' },
              { key: 'responses', header: 'Responses' },
              { key: 'createdAt', header: 'Created' },
              { key: 'updatedAt', header: 'Modified' },
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
                      <TableRow key={row.id} onClick={() => navigate(`/app/surveys/${row.id}/edit`)}>
                        {row.cells.map((cell) => (
                          <TableCell key={cell.info.header}>
                            {cell.info.header === 'title' ? (
                              <Link to={`/app/surveys/${row.id}/edit`} className="surveys-list__title-link">
                                {cell.value}
                              </Link>
                            ) : cell.info.header === 'status' ? (
                              <Tag type={getSurveyStatusTagType(cell.value as string)}>
                                {String(cell.value).charAt(0).toUpperCase() + String(cell.value).slice(1)}
                              </Tag>
                            ) : (
                              cell.value
                            )}
                          </TableCell>
                        ))}
                        <TableCell>
                          <OverflowMenu size="sm" flipped>
                            <OverflowMenuItem
                              onClick={(e: React.MouseEvent) => { e.stopPropagation(); navigate(`/app/surveys/${row.id}/edit`); }}
                            >
                              Edit
                            </OverflowMenuItem>
                            <OverflowMenuItem
                              onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleDuplicate(row.id); }}
                            >
                              Duplicate
                            </OverflowMenuItem>
                            <OverflowMenuItem
                              hasDivider
                              onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleArchive(row.id); }}
                            >
                              Archive
                            </OverflowMenuItem>
                            <OverflowMenuItem
                              hasDivider
                              isDelete
                              onClick={(e: React.MouseEvent) => { e.stopPropagation(); setDeleteTarget(surveys.find((s) => s.id === row.id) || null); }}
                            >
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

          {data?.hasMore && (
            <div className="surveys-list__load-more">
              <Button kind="tertiary" onClick={handleLoadMore} disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </>
      )}

      <ConfirmModalComponent
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete Survey"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={deleteSurvey.isPending}
        onConfirm={handleDelete}
      />
    </AppPage>
  );
}
