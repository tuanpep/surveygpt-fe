import { useState } from 'react';
import { useSurveyBuilder } from '@/stores/surveyBuilder';
import {
  TextInput,
  TextArea,
  Toggle,
  FormGroup,
  Button,
  Tag,
  Stack,
} from '@carbon/react';
import { TrashCan, Copy } from '@carbon/icons-react';
import { QuestionTypeSettings } from './QuestionTypeSettings';
import { ConfirmModal } from '@/components/shared/ConfirmModal';

export function QuestionEditor() {
  const questions = useSurveyBuilder((s) => s.questions);
  const selectedQuestionId = useSurveyBuilder((s) => s.selectedQuestionId);
  const updateQuestion = useSurveyBuilder((s) => s.updateQuestion);
  const removeQuestion = useSurveyBuilder((s) => s.removeQuestion);
  const selectQuestion = useSurveyBuilder((s) => s.selectQuestion);
  const duplicateQuestion = useSurveyBuilder((s) => s.duplicateQuestion);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const question = questions.find((q) => q.id === selectedQuestionId);

  if (!question) {
    return (
      <div className="question-editor__empty">
        <p>Select a question to edit its properties.</p>
      </div>
    );
  }

  const handleUpdate = (updates: Parameters<typeof updateQuestion>[1]) => {
    updateQuestion(question.id, updates);
  };

  const handleRemove = () => {
    removeQuestion(question.id);
    selectQuestion(null);
    setDeleteModalOpen(false);
  };

  return (
    <div className="question-editor">
      <div className="question-editor__header">
        <Tag type="purple">{question.type.replace(/_/g, ' ')}</Tag>
        <div className="question-editor__actions">
          <Button
            kind="ghost"
            size="sm"
            hasIconOnly
            renderIcon={Copy}
            iconDescription="Duplicate"
            onClick={() => duplicateQuestion(question.id)}
          />
          <Button
            kind="ghost"
            size="sm"
            hasIconOnly
            renderIcon={TrashCan}
            iconDescription="Delete"
            onClick={() => setDeleteModalOpen(true)}
          />
        </div>
      </div>

      <Stack gap={6}>
        <FormGroup legendText="">
          <TextInput
            id={`question-title-${question.id}`}
            labelText="Question Title"
            value={question.title}
            onChange={(e) => handleUpdate({ title: e.target.value })}
            placeholder="Enter your question..."
          />
        </FormGroup>

        <FormGroup legendText="">
          <TextArea
            id={`question-desc-${question.id}`}
            labelText="Description"
            value={question.description || ''}
            onChange={(e) => handleUpdate({ description: e.target.value })}
            placeholder="Add a description (optional)"
            rows={3}
          />
        </FormGroup>

        <Toggle
          id={`question-required-${question.id}`}
          labelText="Required"
          labelA="Optional"
          labelB="Required"
          toggled={question.required}
          onToggle={(checked) => handleUpdate({ required: checked })}
        />

        <div className="question-type-settings">
          <QuestionTypeSettings question={question} onUpdate={handleUpdate} />
        </div>
      </Stack>

      <ConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Question"
        description={`Are you sure you want to delete "${question.title || 'this question'}"? This action cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleRemove}
      />
    </div>
  );
}
