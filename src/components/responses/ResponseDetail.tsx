import {
  ComposedModal, ModalHeader, ModalBody, ModalFooter,
  Button, Tag, Stack, Heading, Tile,
} from '@carbon/react';
import { useResponse } from '@/hooks/useResponses';
import { Loading } from '@/components/shared/Loading';
import type { QuestionDef } from '@/types/survey';
import type { Answer, QualityFlags } from '@/types/response';

interface ResponseDetailProps {
  responseId: string;
  surveyId: string;
  open: boolean;
  onClose: () => void;
  questions: QuestionDef[];
}

function getQuestionById(questions: QuestionDef[], id: string): QuestionDef | undefined {
  for (const q of questions) {
    if (q.id === id) return q;
  }
  return undefined;
}

function formatAnswerValue(answer: Answer): string {
  if (answer.value === null || answer.value === undefined) return '—';
  if (typeof answer.value === 'string') return answer.value;
  if (typeof answer.value === 'number') return String(answer.value);
  if (Array.isArray(answer.value)) return answer.value.join(', ');
  if (typeof answer.value === 'object') return JSON.stringify(answer.value);
  return String(answer.value);
}

function formatDuration(ms?: number): string {
  if (!ms) return '—';
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainSec = seconds % 60;
  return `${minutes}m ${remainSec}s`;
}

function getSourceTagType(source?: string) {
  switch (source) {
    case 'web': return 'blue' as const;
    case 'email': return 'purple' as const;
    case 'embed': return 'cyan' as const;
    case 'qr': return 'green' as const;
    case 'api': return 'cool-gray' as const;
    default: return 'gray' as const;
  }
}

function getStatusTagType(status?: string) {
  switch (status) {
    case 'completed': return 'green' as const;
    case 'partial': return 'warm-gray' as const;
    case 'disqualified': return 'red' as const;
    default: return 'gray' as const;
  }
}

function QualityFlagsDisplay({ flags }: { flags?: QualityFlags }) {
  if (!flags) return null;
  const items: { label: string; active: boolean }[] = [
    { label: 'Speeder', active: !!flags.isSpeeder },
    { label: 'Bot', active: !!flags.isBot },
    { label: 'Straight-lining', active: !!flags.isStraightLining },
    { label: 'Inconsistent', active: !!flags.isInconsistent },
  ];
  const activeItems = items.filter((i) => i.active);
  if (activeItems.length === 0) return null;
  return (
    <div className="response-detail__flags">
      <p className="response-detail__flags-title">Quality Flags</p>
      <Stack gap={3}>
        {activeItems.map((item) => (
          <Tag key={item.label} type="red" size="sm">{item.label}</Tag>
        ))}
        {flags.flagNote && (
          <span className="response-detail__flags-note">{flags.flagNote}</span>
        )}
      </Stack>
    </div>
  );
}

export function ResponseDetail({ responseId, surveyId, open, onClose, questions }: ResponseDetailProps) {
  const { data: response, isLoading } = useResponse(surveyId, responseId);

  if (!open) return null;

  return (
    <ComposedModal open size="lg" onClose={onClose} preventCloseOnClickOutside>
      <ModalHeader title="Response Details" closeModal={onClose} />
      <ModalBody>
        {isLoading ? (
          <Loading />
        ) : response ? (
          <Stack gap={5}>
            {/* Metadata */}
            <div>
              <Heading className="heading-xs">Response Metadata</Heading>
              <div className="response-detail__metadata">
                <div><strong>Status:</strong> <Tag type={getStatusTagType(response.status)} size="sm">{response.status}</Tag></div>
                <div><strong>Source:</strong> <Tag type={getSourceTagType(response.metadata.source)} size="sm">{response.metadata.source || 'Unknown'}</Tag></div>
                <div><strong>Started:</strong> {new Date(response.startedAt).toLocaleString()}</div>
                <div><strong>Completed:</strong> {response.completedAt ? new Date(response.completedAt).toLocaleString() : '—'}</div>
                <div><strong>Duration:</strong> {formatDuration(response.durationMs)}</div>
                <div><strong>Device:</strong> {response.metadata.device || '—'}</div>
                <div><strong>Browser:</strong> {response.metadata.browser || '—'}</div>
                <div><strong>Country:</strong> {response.metadata.country || '—'}</div>
              </div>
              <QualityFlagsDisplay flags={response.qualityFlags} />
            </div>

            {/* Answers */}
            <div>
              <Heading className="heading-xs">Answers</Heading>
              <Stack gap={4}>
                {response.answers.map((answer, idx) => {
                  const question = getQuestionById(questions, answer.questionId);
                  return (
                    <Tile key={answer.questionId || idx} className="response-detail__answer">
                      <p className="response-detail__answer-title">
                        {question?.title || `Question ${idx + 1}`}
                        {question?.required && <span className="response-detail__answer-required">*</span>}
                      </p>
                      {question?.description && (
                        <p className="response-detail__answer-desc">
                          {question.description}
                        </p>
                      )}
                      <p className="response-detail__answer-value">{formatAnswerValue(answer)}</p>
                    </Tile>
                  );
                })}
                {response.answers.length === 0 && (
                  <p className="response-detail__empty">No answers recorded.</p>
                )}
              </Stack>
            </div>
          </Stack>
        ) : (
          <p className="response-detail__empty">Response not found.</p>
        )}
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={onClose}>Close</Button>
      </ModalFooter>
    </ComposedModal>
  );
}
