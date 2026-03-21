import { Grid, Column, Tile } from '@carbon/react';
import { useQuery } from '@tanstack/react-query';
import { Document, Activity, ChartBar, Growth } from '@carbon/icons-react';
import { getDashboardSummary } from '@/services/analytics';
import { Loading } from '@/components/shared/Loading';

export function DashboardSummaryCards() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: getDashboardSummary,
  });

  if (isLoading) return <Loading type="tile" />;

  const summary = data ?? {
    totalSurveys: 0,
    activeSurveys: 0,
    totalResponses: 0,
    totalResponsesDelta: 0,
    averageCompletionRate: 0,
    averageCompletionRateDelta: 0,
  };

  const cards = [
    {
      title: 'Total Surveys',
      value: summary.totalSurveys,
      icon: Document,
    },
    {
      title: 'Active Surveys',
      value: summary.activeSurveys,
      icon: Activity,
    },
    {
      title: 'Total Responses',
      value: summary.totalResponses,
      delta: summary.totalResponsesDelta,
      icon: ChartBar,
    },
    {
      title: 'Avg. Completion Rate',
      value: `${summary.averageCompletionRate}%`,
      delta: summary.averageCompletionRateDelta,
      icon: Growth,
    },
  ];

  return (
    <Grid>
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Column sm={2} md={4} lg={4} key={card.title}>
            <Tile className="dashboard-summary-card">
              <div className="dashboard-summary-card__icon">
                <Icon size={24} />
              </div>
              <div className="dashboard-summary-card__content">
                <p className="dashboard-summary-card__title">{card.title}</p>
                <p className="dashboard-summary-card__value">{card.value}</p>
                {card.delta !== undefined && (
                  <p className={`dashboard-summary-card__delta ${card.delta >= 0 ? 'positive' : 'negative'}`}>
                    {card.delta >= 0 ? '+' : ''}{card.delta} from last period
                  </p>
                )}
              </div>
            </Tile>
          </Column>
        );
      })}
    </Grid>
  );
}
