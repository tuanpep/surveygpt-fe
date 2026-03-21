import { useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Heading, Button, Tabs, TabList, Tab, TabPanels, TabPanel,
  TextInput, Tag, InlineLoading, Breadcrumb, BreadcrumbItem,
} from '@carbon/react';
import { ArrowLeft, View } from '@carbon/icons-react';
import { useSurvey, usePublishSurvey, useUnpublishSurvey, useAutoSave } from '@/hooks/useSurvey';
import { useAuth } from '@/hooks/useAuth';
import { SurveyBuilder } from '@/components/survey/SurveyBuilder';
import { SurveySettingsPanel } from '@/components/survey/SurveySettingsPanel';
import { DistributionPanel } from '@/components/distribution/DistributionPanel';
import { SurveyResponsesPage } from '@/pages/SurveyResponsesPage';
import { SurveyAnalyticsPage } from '@/pages/SurveyAnalyticsPage';
import { useSurveyBuilder } from '@/stores/surveyBuilder';
import { wrapQuestionsIntoBlocks } from '@/utils/survey';
import { formatTimeAgo, getSurveyStatusTagType } from '@/utils/format';
import { Loading } from '@/components/shared/Loading';
import type { Survey } from '@/types/survey';
import { AppPage } from '@/components/layout/AppPage';

export function SurveyEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const isGuest = !isAuthenticated || searchParams.get('guest') === 'true';

  // For authenticated users, fetch survey from API
  const { data: survey, isLoading } = useSurvey(id!, { enabled: !isGuest });
  const publishSurvey = usePublishSurvey();
  const unpublishSurvey = useUnpublishSurvey();

  // Use selectors to avoid unnecessary re-renders
  const questions = useSurveyBuilder((s) => s.questions);
  const surveyTitle = useSurveyBuilder((s) => s.surveyTitle);
  const isDirty = useSurveyBuilder((s) => s.isDirty);
  const initFromSurvey = useSurveyBuilder((s) => s.initFromSurvey);
  const reset = useSurveyBuilder((s) => s.reset);
  const setSurveyTitle = useSurveyBuilder((s) => s.setSurveyTitle);
  const clearDirty = useSurveyBuilder((s) => s.clearDirty);

  // Disable auto-save for guests
  const { isSaving, lastSaved, saveError, save, flushSave } = useAutoSave(id!, !isGuest);

  // Load survey into Zustand store on mount
  useEffect(() => {
    if (isGuest) {
      // Guest: init from URL params with a blank survey
      const title = searchParams.get('title') || 'Untitled Survey';
      const guestSurvey: Survey = {
        id: id!,
        title,
        status: 'draft',
        blocks: [],
        flow: [],
        settings: {
          isPublic: false,
          requireAuth: false,
          limitOneResponse: false,
          allowEditResponse: false,
          shuffleQuestions: false,
          showProgressBar: true,
          showQuestionNumbers: true,
        },
        theme: {
          primaryColor: '#4f46e5',
          fontFamily: 'sans-serif',
          fontSize: 16,
          backgroundColor: '#ffffff',
          textColor: '#161616',
          buttonStyle: 'sharp',
          questionStyle: 'card',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ownerId: 'guest',
        responseCount: 0,
        tags: [],
      };
      initFromSurvey(guestSurvey);
    } else if (survey) {
      initFromSurvey(survey);
    }
    return () => {
      reset();
    };
  }, [isGuest, survey, id, searchParams, initFromSurvey, reset]);

  // Auto-save on changes (only for authed users)
  const handleSave = useCallback(() => {
    if (isGuest) return;
    if (isDirty && id && questions.length >= 0) {
      const blocks = wrapQuestionsIntoBlocks(questions, surveyTitle);
      save(blocks);
      clearDirty();
    }
  }, [isGuest, isDirty, id, questions, surveyTitle, save, clearDirty]);

  useEffect(() => {
    handleSave();
  }, [handleSave]);

  // Flush pending save on unmount / navigation (only for authed)
  useEffect(() => {
    return () => {
      flushSave();
    };
  }, [flushSave]);

  if (isLoading && !isGuest) return <Loading />;

  const handleSignUp = () => navigate('/signup');

  return (
    <AppPage>
      <Breadcrumb noTrailingSlash>
        <BreadcrumbItem href={isAuthenticated ? '/app/surveys' : '/'}>
          Surveys
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>{surveyTitle || 'Untitled Survey'}</BreadcrumbItem>
      </Breadcrumb>
      <div className="survey-edit-page__header">
        <div className="survey-edit-page__title-section">
          <Button kind="ghost" size="sm" renderIcon={ArrowLeft} onClick={() => navigate(isAuthenticated ? '/app/surveys' : '/')}>
            Back
          </Button>
          <TextInput
            id="survey-title-input"
            value={surveyTitle}
            onChange={(e) => setSurveyTitle(e.target.value)}
            labelText=""
            hideLabel
            className="survey-edit-page__title-input"
            placeholder="Untitled Survey"
          />
          {survey && (
            <Tag type={getSurveyStatusTagType(survey.status)}>
              {survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
            </Tag>
          )}
          {isGuest ? (
            <Tag type="purple" size="sm">Preview Mode</Tag>
          ) : (
            <>
              {isSaving && <InlineLoading description="Saving..." />}
              {saveError && (
                <Tag type="red" size="sm">Save failed — retrying</Tag>
              )}
              {lastSaved && !isSaving && !saveError && (
                <span className="survey-edit-page__saved">Saved {formatTimeAgo(lastSaved)}</span>
              )}
            </>
          )}
        </div>
        <div className="survey-edit-page__actions">
          <Button
            kind="secondary"
            size="sm"
            renderIcon={View}
            onClick={() => window.open(`/s/${id}`, '_blank')}
          >
            Preview
          </Button>
          {isGuest ? (
            <Button
              kind="primary"
              size="sm"
              onClick={handleSignUp}
            >
              Sign Up to Save
            </Button>
          ) : (
            <>
              {survey?.status === 'draft' && (
                <Button
                  kind="primary"
                  size="sm"
                  onClick={() => publishSurvey.mutate(id!)}
                  disabled={publishSurvey.isPending}
                >
                  Publish
                </Button>
              )}
              {survey?.status === 'active' && (
                <Button
                  kind="danger"
                  size="sm"
                  onClick={() => unpublishSurvey.mutate(id!)}
                  disabled={unpublishSurvey.isPending}
                >
                  Unpublish
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <Tabs>
        <TabList aria-label="Survey editor tabs">
          <Tab>Edit</Tab>
          <Tab>Flow</Tab>
          <Tab>Settings</Tab>
          <Tab>Distribute</Tab>
          <Tab>Responses</Tab>
          <Tab>Analytics</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <SurveyBuilder />
          </TabPanel>
          <TabPanel>
            <div style={{ padding: '2rem 0' }}>
              <Heading>Survey Flow</Heading>
              <p>Design the logic and branching for your survey.</p>
            </div>
          </TabPanel>
          <TabPanel>
            {isGuest ? (
              <div style={{ padding: '2rem 0', textAlign: 'center' }}>
                <Heading>Survey Settings</Heading>
                <p style={{ color: '#64748b', marginBottom: '1rem' }}>
                  Sign up to customize your survey settings, theme, and more.
                </p>
                <Button kind="primary" onClick={handleSignUp}>Sign Up Free</Button>
              </div>
            ) : (
              <SurveySettingsPanel surveyId={id!} />
            )}
          </TabPanel>
          <TabPanel>
            {isGuest ? (
              <div style={{ padding: '2rem 0', textAlign: 'center' }}>
                <Heading>Distribute</Heading>
                <p style={{ color: '#64748b', marginBottom: '1rem' }}>
                  Sign up to share your survey via link, email, QR code, or embed.
                </p>
                <Button kind="primary" onClick={handleSignUp}>Sign Up Free</Button>
              </div>
            ) : (
              <DistributionPanel surveyId={id!} surveyTitle={surveyTitle} />
            )}
          </TabPanel>
          <TabPanel>
            {isGuest ? (
              <div style={{ padding: '2rem 0', textAlign: 'center' }}>
                <Heading>Responses</Heading>
                <p style={{ color: '#64748b', marginBottom: '1rem' }}>
                  Sign up to view and manage survey responses.
                </p>
                <Button kind="primary" onClick={handleSignUp}>Sign Up Free</Button>
              </div>
            ) : (
              <SurveyResponsesPage embedded />
            )}
          </TabPanel>
          <TabPanel>
            {isGuest ? (
              <div style={{ padding: '2rem 0', textAlign: 'center' }}>
                <Heading>Analytics</Heading>
                <p style={{ color: '#64748b', marginBottom: '1rem' }}>
                  Sign up to access AI-powered analytics and insights.
                </p>
                <Button kind="primary" onClick={handleSignUp}>Sign Up Free</Button>
              </div>
            ) : (
              <SurveyAnalyticsPage embedded />
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </AppPage>
  );
}
