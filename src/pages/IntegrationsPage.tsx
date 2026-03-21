import { useState } from 'react';
import {
  Grid,
  Column,
  Heading,
  Button,
  Tile,
  Tag,
  ToastNotification,
  Stack,
  Section,
} from '@carbon/react';
import { AppPage } from '@/components/layout/AppPage';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  connected: boolean;
  connectUrl?: string;
}

const AVAILABLE_INTEGRATIONS: Integration[] = [
  { id: 'slack', name: 'Slack', description: 'Get notified in Slack when surveys receive new responses.', icon: 'Slack', connected: false },
  { id: 'google-sheets', name: 'Google Sheets', description: 'Automatically sync survey responses to a Google Sheet.', icon: 'Google Sheets', connected: false },
  { id: 'zapier', name: 'Zapier', description: 'Connect to 5,000+ apps via Zapier automations.', icon: 'Zapier', connected: false },
  { id: 'hubspot', name: 'HubSpot', description: 'Sync contacts and trigger surveys from HubSpot.', icon: 'HubSpot', connected: false },
  { id: 'webhooks', name: 'Custom Webhooks', description: 'Send response data to any URL via webhooks.', icon: 'Webhooks', connected: false },
];

export function IntegrationsPage() {
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);
  const [connected, setConnected] = useState<Set<string>>(new Set());

  const handleConnect = (integration: Integration) => {
    // In production, this would redirect to OAuth flow
    setConnected((prev) => new Set(prev).add(integration.id));
    setToast({ kind: 'success', message: `${integration.name} connected successfully` });
  };

  const handleDisconnect = (integration: Integration) => {
    setConnected((prev) => {
      const next = new Set(prev);
      next.delete(integration.id);
      return next;
    });
    setToast({ kind: 'success', message: `${integration.name} disconnected` });
  };

  return (
    <AppPage>
      <Heading>Integrations</Heading>
      <p className="integrations-page__intro">
        Connect SurveyFlow with your favorite tools to automate your workflow.
      </p>

      {toast && (
        <ToastNotification
          kind={toast.kind}
          title={toast.kind === 'success' ? 'Success' : 'Error'}
          subtitle={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <Grid>
        {AVAILABLE_INTEGRATIONS.map((integration) => {
          const isConnected = connected.has(integration.id) || integration.connected;
          return (
            <Column sm={4} md={4} lg={4} key={integration.id}>
              <Section as="div">
                <Tile className="integration-tile">
                  <Stack gap={4}>
                    <div className="integration-tile__row">
                      <div className="integration-tile__icon" aria-hidden>
                        {integration.name.charAt(0)}
                      </div>
                      <Tag type={isConnected ? 'green' : 'gray'} size="sm">
                        {isConnected ? 'Connected' : 'Available'}
                      </Tag>
                    </div>
                    <Heading>{integration.name}</Heading>
                    <p className="integration-tile__description">{integration.description}</p>
                    <Button
                      kind={isConnected ? 'danger' : 'primary'}
                      size="sm"
                      onClick={() => (isConnected ? handleDisconnect(integration) : handleConnect(integration))}
                    >
                      {isConnected ? 'Disconnect' : 'Connect'}
                    </Button>
                  </Stack>
                </Tile>
              </Section>
            </Column>
          );
        })}
      </Grid>
    </AppPage>
  );
}
