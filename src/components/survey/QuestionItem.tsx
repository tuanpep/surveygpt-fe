import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useSurveyBuilder } from '@/stores/surveyBuilder';
import { DragVertical, TrashCan } from '@carbon/icons-react';
import { Button, Tag } from '@carbon/react';
import type { QuestionDef } from '@/types/survey';

interface QuestionItemProps {
  question: QuestionDef;
}

export function QuestionItem({ question }: QuestionItemProps) {
  const selectQuestion = useSurveyBuilder((s) => s.selectQuestion);
  const removeQuestion = useSurveyBuilder((s) => s.removeQuestion);
  const selectedQuestionId = useSurveyBuilder((s) => s.selectedQuestionId);
  const isSelected = selectedQuestionId === question.id;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`question-item ${isSelected ? 'question-item--selected' : ''}`}
      onClick={() => selectQuestion(question.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          selectQuestion(question.id);
        }
      }}
    >
      <div className="question-item__drag-handle" {...attributes} {...listeners}>
        <DragVertical size={16} />
      </div>

      <div className="question-item__content">
        <div className="question-item__header">
          <span className="question-item__number">Q{question.order + 1}</span>
          <Tag type="purple" size="sm">{question.type.replace(/_/g, ' ')}</Tag>
          {question.required && <Tag type="red" size="sm">Required</Tag>}
        </div>
        <p className="question-item__title">
          {question.title || 'Untitled Question'}
        </p>
        {question.description && (
          <p className="question-item__description">{question.description}</p>
        )}
      </div>

      <div className="question-item__actions">
        <Button
          kind="ghost"
          size="sm"
          hasIconOnly
          renderIcon={TrashCan}
          iconDescription="Delete"
          onClick={(e) => {
            e.stopPropagation();
            removeQuestion(question.id);
          }}
        />
      </div>
    </div>
  );
}
