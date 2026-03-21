import { useParams } from 'react-router-dom';
import { Grid, Column, Tile, Heading } from '@carbon/react';
import { useSurveyAnalytics } from '@/hooks/useAnalytics';
import { Loading } from '@/components/shared/Loading';
import { EmptyState } from '@/components/shared/EmptyState';
import { QuestionChart } from '@/components/analytics/QuestionChart';
import { ResponseOverTime } from '@/components/analytics/ResponseOverTime';
import { LiveResponseCounter } from '@/components/shared/LiveResponseCounter';
import { formatDurationMs } from '@/utils/format';
import { AppPage } from '@/components/layout/AppPage';

export type SurveyAnalyticsPageProps = { embedded?: boolean };

export function SurveyAnalyticsPage({ embedded = false }: SurveyAnalyticsPageProps) {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useSurveyAnalytics(id!);

  if (isLoading) return <Loading />;

  const analytics = data;

  const page = (
    <>
      {/* Summary Cards */}
      <div className="analytics-page__summary">
        <Tile>
          <div className="analytics-page__card-header">
            <p className="analytics-page__card-value">{analytics?.totalResponses ?? 0}</p>
            {id && <LiveResponseCounter surveyId={id} initialCount={analytics?.totalResponses ?? 0} />}
          </div>
          <p className="analytics-page__card-label">Total Responses</p>
        </Tile>
        <Tile>
          <p className="analytics-page__card-value">
            {analytics?.completionRate != null ? `${analytics.completionRate}%` : '—'}
          </p>
          <p className="analytics-page__card-label">Completion Rate</p>
        </Tile>
        <Tile>
          <p className="analytics-page__card-value">
            {analytics?.averageDurationMs != null ? formatDurationMs(analytics.averageDurationMs) : '—'}
          </p>
          <p className="analytics-page__card-label">Avg. Duration</p>
        </Tile>
        <Tile>
          <p className="analytics-page__card-value">{analytics?.partialResponses ?? 0}</p>
          <p className="analytics-page__card-label">Partial</p>
        </Tile>
      </div>

      {/* Response Over Time */}
      <div className="analytics-page__section">
        <ResponseOverTime data={analytics?.dailyResponseCounts ?? []} />
      </div>

      {/* Question-level Charts */}
      <div className="analytics-page__section analytics-page__section--charts">
        <Heading>Question Breakdown</Heading>
        {(!analytics?.questionStats || analytics.questionStats.length === 0) ? (
          <EmptyState
            title="No analytics data"
            description="Analytics will appear once responses are collected."
          />
        ) : (
          <Grid>
            {analytics.questionStats.map((stat) => (
              <Column sm={4} md={8} lg={8} key={stat.questionId}>
                <Tile>
                  <QuestionChart stat={stat} />
                </Tile>
              </Column>
            ))}
          </Grid>
        )}
      </div>
    </>
  );

  return embedded ? page : <AppPage>{page}</AppPage>;
}
