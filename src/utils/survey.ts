import type { BlockDef } from '@/types/survey';

/**
 * Wrap a flat list of questions into a single default block structure.
 */
export function wrapQuestionsIntoBlocks(questions: BlockDef['questions'], title: string): BlockDef[] {
  return [{
    id: 'default',
    title: title || 'Default Block',
    questions,
    order: 0,
  }];
}
