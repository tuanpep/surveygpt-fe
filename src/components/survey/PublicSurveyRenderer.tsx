import { useState } from 'react';
import { Button, Stack, ProgressBar, Heading } from '@carbon/react';
import { PublicQuestionRenderer } from './PublicQuestionRenderer';
import type { PublicSurvey } from '@/types/survey';
import type { Answer, AnswerValue } from '@/types/response';

interface PublicSurveyRendererProps {
  survey: PublicSurvey;
  onSubmit: (answers: Answer[]) => void;
  isSubmitting: boolean;
}

export function PublicSurveyRenderer({ survey, onSubmit, isSubmitting }: PublicSurveyRendererProps) {
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showWelcome, setShowWelcome] = useState(true);

  const allQuestions = survey.blocks.flatMap((b) => b.questions);
  const answerableQuestions = allQuestions.filter(
    (q) => q.type !== 'descriptive_text' && q.type !== 'hidden_field'
  );
  const totalQuestions = answerableQuestions.length;
  const answeredCount = Object.entries(answers).filter(
    ([, v]) => v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0)
  ).length;
  const progressPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const handleAnswerChange = (questionId: string, value: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    if (errors[questionId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[questionId];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    for (const q of allQuestions) {
      if (q.required) {
        const answer = answers[q.id];
        if (
          answer === undefined ||
          answer === null ||
          answer === '' ||
          (Array.isArray(answer) && answer.length === 0)
        ) {
          newErrors[q.id] = 'This question is required.';
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const answerArray: Answer[] = allQuestions.map((q) => ({
      questionId: q.id,
      blockId: q.blockId,
      value: answers[q.id] ?? null,
      type: q.type,
    }));
    onSubmit(answerArray);
  };

  if (showWelcome) {
    return (
      <div className="public-survey__welcome">
        <Heading>{survey.title}</Heading>
        {survey.description && (
          <p className="public-survey__welcome-description">{survey.description}</p>
        )}
        <Button kind="primary" size="lg" onClick={() => setShowWelcome(false)}>
          Start Survey
        </Button>
      </div>
    );
  }

  return (
    <div className="public-survey">
      <Heading className="public-survey__form-title">{survey.title}</Heading>

      {survey.settings.showProgressBar && (
        <div className="public-survey__progress">
          <ProgressBar
            value={progressPercent}
            max={100}
            label=""
            helperText={`${answeredCount} of ${totalQuestions} questions`}
          />
        </div>
      )}

      <Stack gap={7}>
        {allQuestions.map((question, index) => {
          if (question.type === 'descriptive_text') {
            return (
              <div key={question.id} className="public-question--descriptive">
                <p className="public-question__title--descriptive">
                  {question.title}
                </p>
                {question.description && (
                  <p className="public-question__description">{question.description}</p>
                )}
              </div>
            );
          }

          return (
            <div key={question.id} className="public-question-wrapper">
              {survey.settings.showQuestionNumbers !== false && (
                <span className="public-question__number">{index + 1}.</span>
              )}
              <div className="public-question-wrapper__content">
                <PublicQuestionRenderer
                  question={question}
                  value={answers[question.id]}
                  onChange={(value) => handleAnswerChange(question.id, value)}
                  error={errors[question.id]}
                />
              </div>
            </div>
          );
        })}
      </Stack>

      <div className="public-survey__submit">
        <Button kind="primary" size="lg" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </div>
    </div>
  );
}
