import { Accordion, AccordionItem, Button, Heading } from '@carbon/react';
import type { QuestionTypeMeta } from '@/types/survey';
import { useSurveyBuilder } from '@/stores/surveyBuilder';

const questionTypes: QuestionTypeMeta[] = [
  // Text
  { type: 'short_text', label: 'Short Text', icon: 'Text', category: 'text', description: 'Single line text input' },
  { type: 'long_text', label: 'Long Text', icon: 'TextArea', category: 'text', description: 'Multi-line text area' },
  { type: 'descriptive_text', label: 'Descriptive Text', icon: 'TextLink', category: 'text', description: 'Static text block' },
  { type: 'hidden_field', label: 'Hidden Field', icon: 'Hash', category: 'text', description: 'Hidden data field' },
  // Choice
  { type: 'multiple_choice', label: 'Multiple Choice', icon: 'List', category: 'choice', description: 'Single answer selection' },
  { type: 'multi_select', label: 'Multi-Select', icon: 'Checkbox', category: 'choice', description: 'Multiple answer selection' },
  { type: 'dropdown', label: 'Dropdown', icon: 'Dropdown', category: 'choice', description: 'Select from dropdown' },
  { type: 'image_choice', label: 'Image Choice', icon: 'Image', category: 'choice', description: 'Select with images' },
  { type: 'yes_no', label: 'Yes/No', icon: 'LetterW', category: 'choice', description: 'Binary yes/no' },
  // Rating
  { type: 'rating_likert', label: 'Likert Scale', icon: 'TableOfContents', category: 'rating', description: 'Agreement scale' },
  { type: 'rating_nps', label: 'NPS', icon: 'DragVertical', category: 'rating', description: 'Net Promoter Score' },
  { type: 'rating_star', label: 'Star Rating', icon: 'Star', category: 'rating', description: 'Star rating scale' },
  { type: 'rating_emoji', label: 'Emoji Rating', icon: 'FaceSatisfied', category: 'rating', description: 'Emoji reaction' },
  { type: 'slider', label: 'Slider', icon: 'Slider', category: 'rating', description: 'Numeric slider' },
  // Advanced
  { type: 'ranking', label: 'Ranking', icon: 'DragVertical', category: 'advanced', description: 'Drag to rank items' },
  { type: 'matrix', label: 'Matrix', icon: 'TableOfContents', category: 'advanced', description: 'Grid of choices' },
  { type: 'constant_sum', label: 'Constant Sum', icon: 'Hash', category: 'advanced', description: 'Allocate points' },
  { type: 'file_upload', label: 'File Upload', icon: 'Upload', category: 'advanced', description: 'Upload files' },
  { type: 'date', label: 'Date', icon: 'Calendar', category: 'advanced', description: 'Date picker' },
  { type: 'contact', label: 'Contact Info', icon: 'AddressBook', category: 'advanced', description: 'Name, email, phone' },
  { type: 'address', label: 'Address', icon: 'AddressBook', category: 'advanced', description: 'Street, city, zip' },
  { type: 'signature', label: 'Signature', icon: 'Signature', category: 'advanced', description: 'Draw signature' },
  { type: 'consent', label: 'Consent', icon: 'LockOn', category: 'advanced', description: 'Consent checkbox' },
];

const categories = [
  { key: 'text', label: 'Text' },
  { key: 'choice', label: 'Choice' },
  { key: 'rating', label: 'Rating' },
  { key: 'advanced', label: 'Advanced' },
] as const;

export function QuestionPalette() {
  const addQuestion = useSurveyBuilder((s) => s.addQuestion);

  const groupedTypes = categories.map((cat) => ({
    ...cat,
    items: questionTypes.filter((t) => t.category === cat.key),
  }));

  return (
    <div className="question-palette">
      <Heading>Add Question</Heading>
      <Accordion size="sm">
        {groupedTypes.map((group) => (
          <AccordionItem key={group.key} title={group.label}>
            <div className="question-palette__items">
              {group.items.map((qt) => (
                <Button
                  key={qt.type}
                  kind="ghost"
                  size="sm"
                  className="question-palette__item"
                  onClick={() => addQuestion(qt.type)}
                >
                  {qt.label}
                </Button>
              ))}
            </div>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
