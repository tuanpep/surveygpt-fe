import { useState, useEffect } from 'react';
import {
  Heading, Stack, FormGroup, TextInput, TextArea, Toggle, Button,
  Select, SelectItem, NumberInput, DatePicker, DatePickerInput,
  FileUploader, InlineLoading, ToastNotification,
} from '@carbon/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSurvey, updateSurvey as updateSurveyApi } from '@/services/surveys';
import type { SurveySettings, SurveyTheme } from '@/types/survey';

interface SurveySettingsPanelProps {
  surveyId: string;
}

export function SurveySettingsPanel({ surveyId }: SurveySettingsPanelProps) {
  const queryClient = useQueryClient();
  const { data: survey, isLoading } = useQuery({
    queryKey: ['survey', surveyId],
    queryFn: () => getSurvey(surveyId),
    enabled: !!surveyId,
  });

  const updateSurvey = useMutation({
    mutationFn: (input: Record<string, any>) => updateSurveyApi(surveyId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['survey', surveyId] });
    },
  });

  const [toast, setToast] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

  const [settings, setSettings] = useState<Partial<SurveySettings>>({});
  const [theme, setTheme] = useState<Partial<SurveyTheme>>({});
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (survey) {
      setSettings(survey.settings);
      setTheme(survey.theme);
      setTitle(survey.title);
      setDescription(survey.description || '');
    }
  }, [survey]);

  const handleSaveSettings = async () => {
    try {
      await updateSurvey.mutateAsync({ settings, theme, title, description: description || undefined });
      setToast({ kind: 'success', message: 'Settings saved' });
    } catch {
      setToast({ kind: 'error', message: 'Failed to save settings' });
    }
  };

  if (isLoading) return <InlineLoading description="Loading settings..." />;
  if (!survey) return null;

  return (
    <div className="survey-edit-page__settings">
      {toast && (
        <ToastNotification
          kind={toast.kind}
          title={toast.kind === 'success' ? 'Success' : 'Error'}
          subtitle={toast.message}
          onClose={() => setToast(null)}
          className="survey-settings__toast"
        />
      )}

      <Stack gap={7}>
        {/* General */}
        <div className="survey-edit-page__settings-section">
          <Heading className="text-base font-semibold text-neutral-900">General</Heading>
          <FormGroup legendText="">
            <Stack gap={6}>
              <TextInput
                id="settings-title"
                labelText="Survey Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <TextArea
                id="settings-description"
                labelText="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </Stack>
          </FormGroup>
        </div>

        {/* Welcome Screen */}
        <div className="survey-edit-page__settings-section">
          <Heading className="text-base font-semibold text-neutral-900">Welcome Screen</Heading>
          <FormGroup legendText="">
            <Stack gap={6}>
              <Toggle
                id="welcome-toggle"
                labelText="Show welcome screen before survey"
                toggled={settings.showProgressBar === true}
                onToggle={(checked) => setSettings(prev => ({ ...prev, showProgressBar: checked }))}
              />
              <TextArea
                id="welcome-message"
                labelText="Welcome message"
                value={settings.welcomeMessage || ''}
                onChange={(e) => setSettings(prev => ({ ...prev, welcomeMessage: e.target.value }))}
                rows={3}
                placeholder="Welcome to our survey! Your feedback is important to us."
              />
            </Stack>
          </FormGroup>
        </div>

        {/* Thank You Screen */}
        <div className="survey-edit-page__settings-section">
          <Heading className="text-base font-semibold text-neutral-900">Thank You Screen</Heading>
          <FormGroup legendText="">
            <Stack gap={6}>
              <TextArea
                id="thankyou-message"
                labelText="Thank you message"
                value={settings.confirmationMessage || ''}
                onChange={(e) => setSettings(prev => ({ ...prev, confirmationMessage: e.target.value }))}
                rows={3}
                placeholder="Thank you for completing this survey!"
              />
              <TextInput
                id="redirect-url"
                labelText="Redirect URL (optional)"
                value={settings.redirectUrl || ''}
                onChange={(e) => setSettings(prev => ({ ...prev, redirectUrl: e.target.value || undefined }))}
                placeholder="https://example.com"
              />
            </Stack>
          </FormGroup>
        </div>

        {/* Survey Options */}
        <div className="survey-edit-page__settings-section">
          <Heading className="text-base font-semibold text-neutral-900">Options</Heading>
          <FormGroup legendText="">
            <Stack gap={6}>
              <Toggle
                id="progress-bar"
                labelText="Show progress bar"
                toggled={settings.showProgressBar ?? false}
                onToggle={(checked) => setSettings(prev => ({ ...prev, showProgressBar: checked }))}
              />
              <Toggle
                id="question-numbers"
                labelText="Show question numbers"
                toggled={settings.showQuestionNumbers ?? true}
                onToggle={(checked) => setSettings(prev => ({ ...prev, showQuestionNumbers: checked }))}
              />
              <Toggle
                id="anonymous"
                labelText="Anonymous responses"
                toggled={settings.isPublic ?? false}
                onToggle={(checked) => setSettings(prev => ({ ...prev, isPublic: checked }))}
              />
              <Toggle
                id="limit-one"
                labelText="Limit to one response per person"
                toggled={settings.limitOneResponse ?? false}
                onToggle={(checked) => setSettings(prev => ({ ...prev, limitOneResponse: checked }))}
              />
              <DatePicker
                datePickerType="single"
                value={settings.endDate || ''}
                onChange={(date) => {
                  const val = date.length > 0 ? date[0] : '';
                  setSettings(prev => ({ ...prev, endDate: val ? new Date(val).toISOString() : undefined }));
                }}
              >
                <DatePickerInput
                  id="close-date"
                  labelText="Close date (optional)"
                  placeholder="mm/dd/yyyy"
                />
              </DatePicker>
              <NumberInput
                id="max-responses"
                label="Max responses (optional)"
                value={settings.maxResponses || 0}
                onChange={(_e, state) => setSettings(prev => ({
                  ...prev,
                  maxResponses: parseInt(String(state.value), 10) || undefined,
                }))}
                min={0}
                allowEmpty
              />
            </Stack>
          </FormGroup>
        </div>

        {/* Theme */}
        <div className="survey-edit-page__settings-section">
          <Heading className="text-base font-semibold text-neutral-900">Theme</Heading>
          <FormGroup legendText="">
            <Stack gap={6}>
              <div className="survey-edit-page__theme-row">
                <TextInput
                  id="primary-color"
                  labelText="Primary color"
                  value={theme.primaryColor || '#4f46e5'}
                  onChange={(e) => setTheme(prev => ({ ...prev, primaryColor: e.target.value }))}
                  className="flex-1"
                />
                <div
                  className="survey-edit-page__color-swatch"
                  style={{ backgroundColor: theme.primaryColor || '#4f46e5' }}
                />
              </div>
              <Select
                id="font-family"
                labelText="Font family"
                value={theme.fontFamily || 'IBM Plex Sans'}
                onChange={(e) => setTheme(prev => ({ ...prev, fontFamily: e.target.value }))}
              >
                <SelectItem value="IBM Plex Sans" text="IBM Plex Sans" />
                <SelectItem value="Inter" text="Inter" />
                <SelectItem value="Roboto" text="Roboto" />
                <SelectItem value="Open Sans" text="Open Sans" />
                <SelectItem value="Lato" text="Lato" />
              </Select>
              <Select
                id="button-style"
                labelText="Button style"
                value={theme.buttonStyle || 'sharp'}
                onChange={(e) => setTheme(prev => ({ ...prev, buttonStyle: e.target.value as SurveyTheme['buttonStyle'] }))}
              >
                <SelectItem value="rounded" text="Rounded" />
                <SelectItem value="pill" text="Pill" />
                <SelectItem value="sharp" text="Sharp" />
              </Select>
              <Select
                id="question-style"
                labelText="Question style"
                value={theme.questionStyle || 'card'}
                onChange={(e) => setTheme(prev => ({ ...prev, questionStyle: e.target.value as SurveyTheme['questionStyle'] }))}
              >
                <SelectItem value="card" text="Card" />
                <SelectItem value="flat" text="Flat" />
                <SelectItem value="minimal" text="Minimal" />
              </Select>
              <FileUploader
                buttonLabel="Upload logo"
                labelDescription="Max file size 2MB. SVG, PNG, or JPG."
                buttonKind="tertiary"
                size="md"
                filenameStatus="edit"
                accept={['image/svg+xml', 'image/png', 'image/jpeg']}
                onChange={() => {}}
              />
            </Stack>
          </FormGroup>
        </div>

        {/* Save Button */}
        <Button
          kind="primary"
          onClick={handleSaveSettings}
          disabled={updateSurvey.isPending}
          style={{ maxWidth: '200px' }}
        >
          {updateSurvey.isPending ? <InlineLoading description="Saving..." /> : 'Save Settings'}
        </Button>
      </Stack>
    </div>
  );
}
