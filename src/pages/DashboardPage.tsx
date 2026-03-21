import { Link } from 'react-router-dom';
import {
  Grid, Column, Heading, Button, DataTable, Table, TableHead, TableRow,
  TableHeader, TableBody, TableCell, TableContainer, Tag, Tile,
  ProgressBar, Stack,
} from '@carbon/react';
import { Add } from '@carbon/icons-react';
import { useSurveys } from '@/hooks/useSurvey';
import { useUsage } from '@/hooks/useOrg';
import { DashboardSummaryCards } from '@/components/analytics/DashboardSummary';
import { Loading } from '@/components/shared/Loading';
import type { Survey } from '@/types/survey';
import { Link as CarbonLink } from '@carbon/react';
import { AppPage } from '@/components/layout/AppPage';

export function DashboardPage() {
  const { data: usage, isLoading: usageLoading } = useUsage();
  const { data: surveys, isLoading: surveysLoading } = useSurveys({ limit: 5 });

  return (
    <AppPage>
      <div className="app-page__header">
        <Heading>Dashboard</Heading>
        <Button kind="primary" renderIcon={Add} as={Link} to="/app/surveys/new">
          Create New Survey
        </Button>
      </div>

      <div className="dashboard-page__summary">
        <DashboardSummaryCards />
      </div>

      <Grid className="gap-6 dashboard-page__grid">
        {/* Recent Surveys */}
        <Column sm={4} md={8} lg={8}>
          <Heading>Recent Surveys</Heading>
          {surveysLoading ? (
            <Loading type="table" />
          ) : surveys && surveys.data.length > 0 ? (
            <DataTable
              rows={surveys.data.map((s: Survey) => ({
                id: s.id,
                title: s.title,
                status: s.status,
                responses: s.responseCount,
                modified: new Date(s.updatedAt).toLocaleDateString(),
              }))}
              headers={[
                { key: 'title', header: 'Title' },
                { key: 'status', header: 'Status' },
                { key: 'responses', header: 'Responses' },
                { key: 'modified', header: 'Modified' },
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
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row) => (
                        <TableRow key={row.id}>
                          {row.cells.map((cell) => (
                            <TableCell key={cell.info.header}>
                              {cell.info.header === 'title' ? (
                                <CarbonLink as={Link} to={`/app/surveys/${row.id}/edit`}>
                                  {cell.value}
                                </CarbonLink>
                              ) : cell.info.header === 'status' ? (
                                <Tag type={cell.value === 'active' ? 'green' : 'gray'}>
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
          ) : (
            <Tile>
              <p>No surveys yet. Create your first survey to get started!</p>
              <Button kind="ghost" as={Link} to="/app/surveys/new" className="mt-4">
                Create Survey
              </Button>
            </Tile>
          )}
        </Column>

        {/* Usage Meters */}
        <Column sm={4} md={8} lg={8}>
          <Heading>Usage This Month</Heading>
          {usageLoading ? (
            <Loading />
          ) : usage ? (
            <Stack gap={3}>
              <Tile>
                <ProgressBar
                  value={usage.responses}
                  max={usage.responses || 1}
                  label="Responses"
                  helperText="Unlimited responses"
                  status="active"
                  size="small"
                />
              </Tile>

              <Tile>
                <ProgressBar
                  value={usage.surveys}
                  max={usage.surveys || 1}
                  label="Surveys"
                  helperText="Unlimited surveys"
                  status="active"
                  size="small"
                />
              </Tile>

              <Tile>
                <ProgressBar
                  value={usage.members}
                  max={usage.members || 1}
                  label="Team Members"
                  helperText={`${usage.members} member${usage.members !== 1 ? 's' : ''}`}
                  status="active"
                  size="small"
                />
              </Tile>

              <Tile>
                <ProgressBar
                  value={usage.aiCredits.used}
                  max={usage.aiCredits.total}
                  label="AI Credits"
                  helperText={`${usage.aiCredits.used} of ${usage.aiCredits.total} credits used`}
                  status={usage.aiCredits.used / usage.aiCredits.total >= 0.8 ? 'error' : 'active'}
                  size="small"
                />
              </Tile>
            </Stack>
          ) : null}
        </Column>
      </Grid>
    </AppPage>
  );
}
