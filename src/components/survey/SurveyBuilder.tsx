import { useCallback, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Grid, Column, Button } from '@carbon/react';
import { Undo, Redo } from '@carbon/icons-react';
import { QuestionPalette } from './QuestionPalette';
import { QuestionItem } from './QuestionItem';
import { QuestionEditor } from './QuestionEditor';
import { useSurveyBuilder } from '@/stores/surveyBuilder';

export function SurveyBuilder() {
  const questions = useSurveyBuilder((s) => s.questions);
  const moveQuestion = useSurveyBuilder((s) => s.moveQuestion);
  const undo = useSurveyBuilder((s) => s.undo);
  const redo = useSurveyBuilder((s) => s.redo);
  const canUndo = useSurveyBuilder((s) => s.canUndo);
  const canRedo = useSurveyBuilder((s) => s.canRedo);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const questionIds = useMemo(
    () => questions.map((q) => q.id),
    [questions]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        moveQuestion(String(active.id), String(over.id));
      }
    },
    [moveQuestion]
  );

  return (
    <div className="survey-builder">
      <div className="survey-builder__toolbar">
        <Button
          kind="ghost"
          size="sm"
          renderIcon={Undo}
          iconDescription="Undo"
          hasIconOnly
          disabled={!canUndo()}
          onClick={undo}
        />
        <Button
          kind="ghost"
          size="sm"
          renderIcon={Redo}
          iconDescription="Redo"
          hasIconOnly
          disabled={!canRedo()}
          onClick={redo}
        />
      </div>

      <Grid className="survey-builder__grid h-full">
        {/* Left Panel - Question Palette */}
        <Column sm={2} md={3} lg={4}>
          <QuestionPalette />
        </Column>

        {/* Center Panel - Question List */}
        <Column sm={4} md={5} lg={8}>
          <div className="survey-builder__canvas">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={questionIds} strategy={verticalListSortingStrategy}>
                {questions.length === 0 ? (
                  <div className="survey-builder__empty">
                    <p>Your survey has no questions yet.</p>
                    <p>Use the panel on the left to add questions.</p>
                  </div>
                ) : (
                  questions.map((question) => (
                    <QuestionItem key={question.id} question={question} />
                  ))
                )}
              </SortableContext>
            </DndContext>
          </div>
        </Column>

        {/* Right Panel - Question Editor */}
        <Column sm={2} md={4} lg={4}>
          <QuestionEditor />
        </Column>
      </Grid>
    </div>
  );
}
