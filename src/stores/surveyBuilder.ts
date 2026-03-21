import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import type { QuestionDef, QuestionType, Survey } from '@/types/survey';

interface HistoryEntry {
  questions: QuestionDef[];
  selectedQuestionId: string | null;
}

interface SurveyBuilderState {
  // State
  questions: QuestionDef[];
  selectedQuestionId: string | null;
  surveyId: string | null;
  surveyTitle: string;
  isDirty: boolean;
  questionCounter: number;

  // History for undo/redo
  history: HistoryEntry[];
  historyIndex: number;

  // Actions
  setQuestions: (questions: QuestionDef[]) => void;
  addQuestion: (type: QuestionType, blockId?: string) => void;
  duplicateQuestion: (id: string) => void;
  removeQuestion: (id: string) => void;
  updateQuestion: (id: string, updates: Partial<QuestionDef>) => void;
  moveQuestion: (activeId: string, overId: string) => void;
  selectQuestion: (id: string | null) => void;

  // Survey tracking
  setSurveyId: (id: string | null) => void;
  setSurveyTitle: (title: string) => void;
  clearDirty: () => void;
  initFromSurvey: (survey: Survey) => void;

  // Undo/Redo
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Internal
  pushHistory: () => void;
  reset: () => void;
}

const MAX_HISTORY = 50;

function deepClone<T>(obj: T): T {
  return structuredClone(obj);
}

function createDefaultQuestion(type: QuestionType, blockId: string, id: string): QuestionDef {
  const base: QuestionDef = {
    id,
    type,
    title: '',
    description: '',
    required: false,
    choices: [],
    properties: {},
    order: 0,
    blockId,
  };

  switch (type) {
    case 'multiple_choice':
    case 'multi_select':
    case 'dropdown':
      return {
        ...base,
        choices: [
          { id: `${id}_c1`, label: 'Option 1', value: 'option_1', order: 0 },
          { id: `${id}_c2`, label: 'Option 2', value: 'option_2', order: 1 },
          { id: `${id}_c3`, label: 'Option 3', value: 'option_3', order: 2 },
        ],
      };
    case 'yes_no':
      return {
        ...base,
        choices: [
          { id: `${id}_c1`, label: 'Yes', value: 'yes', order: 0 },
          { id: `${id}_c2`, label: 'No', value: 'no', order: 1 },
        ],
      };
    case 'rating_likert':
      return { ...base, properties: { min: 1, max: 5, minLabel: '', maxLabel: '' } };
    case 'rating_star':
      return { ...base, properties: { maxStars: 5, allowHalf: false } };
    case 'rating_nps':
      return { ...base, properties: {} };
    case 'slider':
      return { ...base, properties: { min: 0, max: 100, step: 1 } };
    case 'rating_emoji':
      return { ...base, properties: { emojiSet: 'smileys', layout: 'horizontal' } };
    default:
      return base;
  }
}

export const useSurveyBuilder = create<SurveyBuilderState>((set, get) => ({
  questions: [],
  selectedQuestionId: null,
  surveyId: null,
  surveyTitle: '',
  isDirty: false,
  questionCounter: 0,
  history: [],
  historyIndex: -1,

  setQuestions: (questions) => {
    const state = get();
    const entry: HistoryEntry = {
      questions: deepClone(questions),
      selectedQuestionId: state.selectedQuestionId,
    };
    const newHistory = [...state.history.slice(0, state.historyIndex + 1), entry];
    let newIndex = newHistory.length - 1;
    if (newHistory.length > MAX_HISTORY) {
      newHistory.shift();
      newIndex = MAX_HISTORY - 1;
    }
    set({
      questions,
      isDirty: true,
      history: newHistory,
      historyIndex: newIndex,
    });
  },

  addQuestion: (type, blockId = 'default') => {
    const state = get();
    const id = uuid();
    const newQuestion = createDefaultQuestion(type, blockId, id);
    newQuestion.order = state.questions.length;
    const questions = [...state.questions, newQuestion];
    set({
      questions,
      selectedQuestionId: newQuestion.id,
      isDirty: true,
    });
    get().pushHistory();
  },

  duplicateQuestion: (id) => {
    const state = get();
    const question = state.questions.find((q) => q.id === id);
    if (!question) return;
    const newId = uuid();
    const clone: QuestionDef = {
      ...deepClone(question),
      id: newId,
      title: `${question.title} (copy)`,
      choices: question.choices.map((c) => ({ ...c, id: uuid() })),
      order: state.questions.length,
    };
    const questions = [...state.questions, clone];
    set({
      questions,
      selectedQuestionId: newId,
      isDirty: true,
    });
    get().pushHistory();
  },

  removeQuestion: (id) => {
    const state = get();
    const questions = state.questions
      .filter((q) => q.id !== id)
      .map((q, i) => ({ ...q, order: i }));
    set({
      questions,
      selectedQuestionId: state.selectedQuestionId === id ? null : state.selectedQuestionId,
      isDirty: true,
    });
    get().pushHistory();
  },

  updateQuestion: (id, updates) => {
    const state = get();
    const questions = state.questions.map((q) =>
      q.id === id ? { ...q, ...updates } : q
    );
    set({ questions, isDirty: true });
    get().pushHistory();
  },

  moveQuestion: (activeId, overId) => {
    const state = get();
    const questions = [...state.questions];
    const activeIndex = questions.findIndex((q) => q.id === activeId);
    const overIndex = questions.findIndex((q) => q.id === overId);
    if (activeIndex === -1 || overIndex === -1) return;

    const [moved] = questions.splice(activeIndex, 1);
    questions.splice(overIndex, 0, moved);
    const reordered = questions.map((q, i) => ({ ...q, order: i }));
    set({ questions: reordered, isDirty: true });
    get().pushHistory();
  },

  selectQuestion: (id) => {
    set({ selectedQuestionId: id });
  },

  setSurveyId: (id) => {
    set({ surveyId: id });
  },

  setSurveyTitle: (title) => {
    set({ surveyTitle: title, isDirty: true });
  },

  clearDirty: () => {
    set({ isDirty: false });
  },

  initFromSurvey: (survey) => {
    const questions = survey.blocks.length > 0
      ? survey.blocks.flatMap((b) => b.questions.map((q) => ({ ...q, blockId: b.id })))
      : [];
    set({
      questions,
      surveyId: survey.id,
      surveyTitle: survey.title,
      selectedQuestionId: null,
      isDirty: false,
      questionCounter: 0,
      history: [deepClone({ questions, selectedQuestionId: null })],
      historyIndex: 0,
    });
  },

  undo: () => {
    const state = get();
    if (state.historyIndex <= 0) return;
    const newIndex = state.historyIndex - 1;
    const entry = state.history[newIndex];
    set({
      questions: deepClone(entry.questions),
      selectedQuestionId: entry.selectedQuestionId,
      historyIndex: newIndex,
      isDirty: true,
    });
  },

  redo: () => {
    const state = get();
    if (state.historyIndex >= state.history.length - 1) return;
    const newIndex = state.historyIndex + 1;
    const entry = state.history[newIndex];
    set({
      questions: deepClone(entry.questions),
      selectedQuestionId: entry.selectedQuestionId,
      historyIndex: newIndex,
      isDirty: true,
    });
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  pushHistory: () => {
    const state = get();
    const entry: HistoryEntry = {
      questions: deepClone(state.questions),
      selectedQuestionId: state.selectedQuestionId,
    };
    const newHistory = [...state.history.slice(0, state.historyIndex + 1), entry];
    let newIndex = newHistory.length - 1;
    if (newHistory.length > MAX_HISTORY) {
      newHistory.shift();
      newIndex = MAX_HISTORY - 1;
    }
    set({
      history: newHistory,
      historyIndex: newIndex,
    });
  },

  reset: () => {
    set({
      questions: [],
      selectedQuestionId: null,
      surveyId: null,
      surveyTitle: '',
      isDirty: false,
      questionCounter: 0,
      history: [],
      historyIndex: -1,
    });
  },
}));
