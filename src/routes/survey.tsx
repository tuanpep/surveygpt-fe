import { useParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Button, Heading } from '@carbon/react';
import { CheckmarkFilled } from '@carbon/icons-react';
import { usePublicSurvey } from '@/hooks/useSurvey';
import { submitResponse } from '@/services/responses';
import { PublicSurveyRenderer } from '@/components/survey/PublicSurveyRenderer';
import { Loading } from '@/components/shared/Loading';
import type { Answer } from '@/types/response';

// Extend CSS properties to include custom properties
declare module 'react' {
  interface CSSProperties {
    '--survey-primary'?: string;
  }
}

export function PublicSurveyPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: survey, isLoading, error } = usePublicSurvey(id!);

  const submitMutation = useMutation({
    mutationFn: (answers: Answer[]) =>
      submitResponse({ surveyId: id!, answers }),
    onSuccess: () => {
      navigate(`/s/${id}/thank-you`);
    },
  });

  if (isLoading) {
    return (
      <div className="public-survey public-survey--loading">
        <Loading />
      </div>
    );
  }

  if (error || !survey) {
    return (
      <div className="public-survey__error">
        <Heading>Survey Not Available</Heading>
        <p>This survey may have been closed or the link is invalid.</p>
        <Button kind="secondary" onClick={() => navigate('/')}>
          Go to SurveyFlow
        </Button>
      </div>
    );
  }

  return (
    <div
      className="public-survey"
      style={{ '--survey-primary': survey.theme.primaryColor || '#4f46e5' }}
    >
      <PublicSurveyRenderer
        survey={survey}
        onSubmit={(answers) => submitMutation.mutate(answers)}
        isSubmitting={submitMutation.isPending}
      />
    </div>
  );
}

export function ThankYouPage() {
  const { id } = useParams<{ id: string }>();
  const { data: survey } = usePublicSurvey(id!);

  const message = survey?.settings.confirmationMessage || 'Thank you for completing this survey!';
  const redirectUrl = survey?.settings.redirectUrl;

  return (
    <div className="public-survey public-survey__thank-you">
      <div className="public-survey__thank-you-icon">
        <CheckmarkFilled size={48} />
      </div>
      <Heading>Thank You!</Heading>
      <p className="public-survey__thank-you-message">{message}</p>
      {redirectUrl && (
        <Button kind="secondary" className="public-survey__thank-you-action" as="a" href={redirectUrl}>
          Continue
        </Button>
      )}
    </div>
  );
}
