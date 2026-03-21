import { useState } from 'react';
import {
  Grid,
  Column,
  Heading,
  Button,
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableContainer,
  Tile,
  Tag,
  Stack,
  ToastNotification,
  Link,
  ProgressBar,
  Section,
} from '@carbon/react';
import { usePlanInfo, usePlans, useChangePlan, useBillingPortal, useInvoiceHistory } from '@/hooks/useBilling';
import { useUsage } from '@/hooks/useOrg';
import { Loading } from '@/components/shared/Loading';
import type { Plan } from '@/types/billing';
import { AppPage } from '@/components/layout/AppPage';

function UsageBar({ current, limit, label }: { current: number; limit: number; label: string }) {
  const isUnlimited = limit < 0;
  const pct = isUnlimited ? 0 : Math.min((current / limit) * 100, 100);
  const nearLimit = limit > 0 && pct >= 80;

  if (isUnlimited) {
    return (
      <div className="text-sm">
        <strong>{label}:</strong> {current} used (unlimited)
      </div>
    );
  }

  return (
    <ProgressBar
      value={current}
      max={limit}
      label={label}
      helperText={`${current} of ${limit} used`}
      status={nearLimit ? 'error' : 'active'}
      size="small"
    />
  );
}

function PlanCard({ plan, isCurrent, onChange }: { plan: Plan; isCurrent: boolean; onChange: (planId: string) => void }) {
  const changePlan = useChangePlan();
  return (
    <Tile className={`billing-plan-card ${plan.popular ? 'billing-plan-card--popular' : ''}`}>
      {plan.popular && (
        <Tag type="blue" className="billing-plan-card__badge">
          Most Popular
        </Tag>
      )}
      <Stack gap={4}>
        <Heading>{plan.name}</Heading>
        <div className="billing-plan-card__price">
          <span className="billing-plan-card__amount">
            {plan.priceMonthly === 0 ? 'Free' : `$${plan.priceMonthly}`}
          </span>
          {plan.priceMonthly > 0 && <span className="billing-plan-card__period">/month</span>}
        </div>
        <p className="billing-plan-card__description">{plan.description}</p>
        <ul className="billing-plan-card__features">
          {plan.features.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
        <Button
          kind={plan.popular ? 'primary' : 'secondary'}
          className="billing-plan-card__cta"
          disabled={isCurrent || changePlan.isPending}
          onClick={() => onChange(plan.id)}
        >
          {isCurrent ? 'Current Plan' : 'Upgrade'}
        </Button>
      </Stack>
    </Tile>
  );
}

export function BillingPage() {
  const { data: planInfo, isLoading: infoLoading } = usePlanInfo();
  const { data: plans, isLoading: plansLoading } = usePlans();
  const { data: usage } = useUsage();
  const { data: invoices } = useInvoiceHistory();
  const billingPortal = useBillingPortal();
  const changePlan = useChangePlan();
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

  const handleUpgrade = async (planId: string) => {
    try {
      const result = await changePlan.mutateAsync({ planId, billingPeriod: 'monthly' }) as { checkoutUrl: string };
      window.location.href = result.checkoutUrl;
    } catch {
      setToast({ kind: 'error', message: 'Failed to initiate plan change' });
    }
  };

  const handleManageBilling = async () => {
    try {
      const result = await billingPortal.mutateAsync() as { url: string };
      window.open(result.url, '_blank');
    } catch {
      setToast({ kind: 'error', message: 'Failed to open billing portal' });
    }
  };

  if (infoLoading || plansLoading) return <Loading />;

  return (
    <AppPage>
      <div className="app-page__header">
        <Heading>Billing & Subscription</Heading>
        {planInfo && planInfo.currentPlan.priceMonthly > 0 && (
          <Button kind="secondary" onClick={handleManageBilling} disabled={billingPortal.isPending}>
            Manage Subscription
          </Button>
        )}
      </div>

      {toast && (
        <ToastNotification
          kind={toast.kind}
          title={toast.kind === 'success' ? 'Success' : 'Error'}
          subtitle={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Current Plan & Usage */}
      {planInfo && usage && (
        <Section as="div">
          <Tile className="billing-page__current-plan">
            <Heading className="billing-page__current-plan-title">
              Current Plan: {planInfo.currentPlan.name}
            </Heading>
            <Stack gap={4}>
              <UsageBar current={usage.surveys} limit={planInfo.currentPlan.limits.surveys} label="Surveys" />
              <UsageBar current={usage.responses} limit={planInfo.currentPlan.limits.responses} label="Responses" />
              <UsageBar current={usage.members} limit={planInfo.currentPlan.limits.members} label="Team Members" />
              <UsageBar
                current={usage.aiCredits.used}
                limit={planInfo.currentPlan.limits.aiCredits}
                label="AI Credits"
              />
            </Stack>
            {planInfo.billingPeriod && (
              <p className="billing-page__period-note">
                Current billing period: {new Date(planInfo.currentPeriodStart).toLocaleDateString()} —{' '}
                {new Date(planInfo.currentPeriodEnd).toLocaleDateString()}
              </p>
            )}
          </Tile>
        </Section>
      )}

      {/* Available Plans */}
      <Section as="div">
        <Heading className="billing-page__section-heading">Available Plans</Heading>
        <Grid className="billing-page__plans-grid">
          {plans?.map((plan) => (
            <Column sm={4} md={4} lg={4} key={plan.id}>
              <Section as="div">
                <PlanCard
                  plan={plan}
                  isCurrent={planInfo?.currentPlan.id === plan.id}
                  onChange={handleUpgrade}
                />
              </Section>
            </Column>
          ))}
        </Grid>
      </Section>

      {/* Invoice History */}
      {invoices && invoices.length > 0 && (
        <Section as="div">
          <Heading className="billing-page__section-heading">Invoice History</Heading>
          <DataTable
            rows={invoices.map((inv) => ({
              id: inv.id,
              date: new Date(inv.date).toLocaleDateString(),
              plan: inv.plan,
              amount: `$${inv.amount.toFixed(2)}`,
              status: inv.status,
              url: inv.invoiceUrl,
            }))}
            headers={[
              { key: 'date', header: 'Date' },
              { key: 'plan', header: 'Plan' },
              { key: 'amount', header: 'Amount' },
              { key: 'status', header: 'Status' },
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
                      <TableHeader>Invoice</TableHeader>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.cells.map((cell) => (
                          <TableCell key={cell.info.header}>
                            {cell.info.header === 'status' ? (
                              <Tag type={cell.value === 'paid' ? 'green' : cell.value === 'pending' ? 'warm-gray' : 'red'} size="sm">
                                {String(cell.value).charAt(0).toUpperCase() + String(cell.value).slice(1)}
                              </Tag>
                            ) : cell.value}
                          </TableCell>
                        ))}
                        <TableCell>
                          {row.cells.find((c) => c.info.header === 'url')?.value ? (
                            <Link href={(row.cells.find((c) => c.info.header === 'url')?.value as string) || '#'} target="_blank">
                              Download
                            </Link>
                          ) : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DataTable>
        </Section>
      )}
    </AppPage>
  );
}
