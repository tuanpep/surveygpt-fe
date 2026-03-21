import { useParams } from 'react-router-dom';
import { Heading } from '@carbon/react';
import { AppPage } from '@/components/layout/AppPage';

export function SurveySettingsPage() {
  const { id } = useParams<{ id: string }>();
  void id;
  return (
    <AppPage>
      <Heading>Survey Settings</Heading>
      <p>Configure survey settings, theme, and sharing options.</p>
    </AppPage>
  );
}
