import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  DataTable, Table, TableHead, TableRow, TableHeader, TableBody, TableCell,
  TableContainer, OverflowMenu, OverflowMenuItem,
  Tag, Button, Select, SelectItem,
  DatePicker, DatePickerInput, Tile,
  ToastNotification,
} from '@carbon/react';
import { Download } from '@carbon/icons-react';
import { useSurvey } from '@/hooks/useSurvey';
import { useResponses, useDeleteResponse, useExportResponses } from '@/hooks/useResponses';
import { useSurveyAnalytics } from '@/hooks/useAnalytics';
import { Loading } from '@/components/shared/Loading';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { ResponseDetail } from '@/components/responses/ResponseDetail';
import { formatDurationShort, getResponseStatusType, getSourceType } from '@/utils/format';
import type { Response, ResponseFilter } from '@/types/response';
import { AppPage } from '@/components/layout/AppPage';

export type SurveyResponsesPageProps = { embedded?: boolean };

export function SurveyResponsesPage({ embedded = false }: SurveyResponsesPageProps) {
  const { id } = useParams<{ id: string }>();
  const { data: survey } = useSurvey(id!);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [allResponses, setAllResponses] = useState<Response[]>([]);
  const [selectedResponseId, setSelectedResponseId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

  const filter: ResponseFilter = {
    surveyId: id!,
    status: statusFilter === 'all' ? undefined : (statusFilter as Response['status']),
    source: sourceFilter === 'all' ? undefined : (sourceFilter as ResponseFilter['source']),
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    cursor,
    limit: 20,
    sortBy: 'startedAt',
    sortOrder: 'desc',
  };

  const { data, isLoading } = useResponses(filter);
  const { data: analytics } = useSurveyAnalytics(id!);
  const deleteResponse = useDeleteResponse(id!);
  const exportResponses = useExportResponses();

  // Accumulate responses for cursor-based pagination
  useEffect(() => {
    if (data?.data) {
      if (cursor === undefined) {
        // First page - replace all responses
        setAllResponses(data.data);
      } else {
        // Next page - append responses
        setAllResponses((prev) => [...prev, ...data.data]);
      }
    }
  }, [data, cursor]);

  const responses = allResponses;

  // Reset cursor and accumulated responses when filters change
  useEffect(() => {
    setCursor(undefined);
    setAllResponses([]);
  }, [statusFilter, sourceFilter, startDate, endDate]);

  const handleLoadMore = () => {
    if (data?.nextCursor) {
      setCursor(data.nextCursor);
    }
  };

  const questions = survey?.blocks.flatMap((b) => b.questions) ?? [];

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteResponse.mutateAsync(deleteTarget);
      setToast({ kind: 'success', message: 'Response deleted' });
      setDeleteTarget(null);
    } catch {
      setToast({ kind: 'error', message: 'Failed to delete response' });
    }
  };

  const handleExport = async (format: 'csv' | 'xlsx') => {
    try {
      const blob = await exportResponses.mutateAsync({ surveyId: id!, format });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${survey?.title || 'responses'}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      setToast({ kind: 'success', message: `Exported as ${format.toUpperCase()}` });
    } catch {
      setToast({ kind: 'error', message: 'Export failed' });
    }
  };

  if (isLoading) return <Loading type="table" />;

  const page = (
    <>
      {/* Summary Row */}
      <div className="responses-page__summary">
        <Tile>
          <p className="responses-page__stat-value">{analytics?.totalResponses ?? 0}</p>
          <p className="responses-page__stat-label">Total Responses</p>
        </Tile>
        <Tile>
          <p className="responses-page__stat-value">
            {analytics?.completionRate != null ? `${analytics.completionRate}%` : '—'}
          </p>
          <p className="responses-page__stat-label">Completion Rate</p>
        </Tile>
        <Tile>
          <p className="responses-page__stat-value">
            {analytics?.averageDurationMs != null ? formatDurationShort(analytics.averageDurationMs) : '—'}
          </p>
          <p className="responses-page__stat-label">Avg. Duration</p>
        </Tile>
        <Tile>
          <p className="responses-page__stat-value">{analytics?.completedResponses ?? 0}</p>
          <p className="responses-page__stat-label">Completed</p>
        </Tile>
      </div>

      {/* Toast */}
      {toast && (
        <ToastNotification
          kind={toast.kind}
          title={toast.kind === 'success' ? 'Success' : 'Error'}
          subtitle={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Toolbar */}
      <div className="responses-page__toolbar">
        <div className="responses-page__filters">
          <Select
            id="resp-status-filter"
            labelText=""
            size="sm"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); }}
            hideLabel
          >
            <SelectItem value="all" text="All Status" />
            <SelectItem value="completed" text="Completed" />
            <SelectItem value="partial" text="Partial" />
            <SelectItem value="disqualified" text="Disqualified" />
          </Select>
          <Select
            id="resp-source-filter"
            labelText=""
            size="sm"
            value={sourceFilter}
            onChange={(e) => { setSourceFilter(e.target.value); }}
            hideLabel
          >
            <SelectItem value="all" text="All Sources" />
            <SelectItem value="web" text="Web" />
            <SelectItem value="email" text="Email" />
            <SelectItem value="embed" text="Embed" />
            <SelectItem value="qr" text="QR Code" />
            <SelectItem value="api" text="API" />
          </Select>
          <DatePicker
            datePickerType="range"
            dateFormat="m/d/Y"
            onChange={(dates: Array<Date | string>) => {
              const toStr = (d: Date | string) =>
                typeof d === 'string' ? d : d.toISOString().split('T')[0];
              setStartDate(dates[0] ? toStr(dates[0]) : '');
              setEndDate(dates[1] ? toStr(dates[1]) : '');
            }}
          >
            <DatePickerInput id="resp-start-date" labelText="From" placeholder="mm/dd/yyyy" />
            <DatePickerInput id="resp-end-date" labelText="To" placeholder="mm/dd/yyyy" />
          </DatePicker>
        </div>
        <div className="responses-page__actions">
          <Button
            kind="secondary"
            size="sm"
            renderIcon={Download}
            onClick={() => handleExport('csv')}
            disabled={exportResponses.isPending}
          >
            CSV
          </Button>
          <Button
            kind="secondary"
            size="sm"
            renderIcon={Download}
            onClick={() => handleExport('xlsx')}
            disabled={exportResponses.isPending}
          >
            Excel
          </Button>
        </div>
      </div>

      {/* Responses Table */}
      {responses.length === 0 ? (
        <EmptyState
          title="No responses yet"
          description="Share your survey to start collecting responses."
        />
      ) : (
        <>
          <DataTable
            rows={responses.map((r: Response, idx: number) => ({
              id: r.id,
              num: idx + 1,
              submitted: r.completedAt
                ? new Date(r.completedAt).toLocaleString()
                : new Date(r.startedAt).toLocaleString(),
              duration: formatDurationShort(r.durationMs),
              source: r.metadata.source || '—',
              status: r.status,
              flags: r.qualityFlags?.isBot || r.qualityFlags?.isSpeeder || r.qualityFlags?.isStraightLining
                ? 'Flagged'
                : 'Clean',
            }))}
            headers={[
              { key: 'num', header: '#' },
              { key: 'submitted', header: 'Submitted' },
              { key: 'duration', header: 'Duration' },
              { key: 'source', header: 'Source' },
              { key: 'status', header: 'Status' },
              { key: 'flags', header: 'Quality' },
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
                            {cell.info.header === 'status' ? (
                              <Tag type={getResponseStatusType(cell.value as string)} size="sm">
                                {cell.value}
                              </Tag>
                            ) : cell.info.header === 'source' ? (
                              <Tag type={getSourceType(cell.value as string)} size="sm">
                                {cell.value}
                              </Tag>
                            ) : cell.info.header === 'flags' ? (
                              <Tag
                                type={cell.value === 'Clean' ? 'green' : 'red'}
                                size="sm"
                              >
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
                              onClick={() => setSelectedResponseId(row.id)}
                            >
                              View
                            </OverflowMenuItem>
                            <OverflowMenuItem
                              hasDivider
                              onClick={() => setToast({ kind: 'success', message: 'Response flagged' })}
                            >
                              Flag
                            </OverflowMenuItem>
                            <OverflowMenuItem
                              hasDivider
                              isDelete
                              onClick={() => setDeleteTarget(row.id)}
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

      {/* Response Detail Modal */}
      {selectedResponseId && (
        <ResponseDetail
          responseId={selectedResponseId}
          surveyId={id!}
          open={!!selectedResponseId}
          onClose={() => setSelectedResponseId(null)}
          questions={questions}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete Response"
        description="Are you sure you want to delete this response? This action cannot be undone."
        confirmLabel="Delete"
        danger
        loading={deleteResponse.isPending}
        onConfirm={handleDelete}
      />
    </>
  );

  return embedded ? page : <AppPage>{page}</AppPage>;
}
