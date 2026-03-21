import {
  Stack, FormGroup, TextInput, Toggle, NumberInput,
  Select, SelectItem, RadioButtonGroup, RadioButton, Tile, Button,
} from '@carbon/react';
import { Add, TrashCan, DragVertical } from '@carbon/icons-react';
import type { QuestionDef, Choice } from '@/types/survey';

interface QuestionTypeSettingsProps {
  question: QuestionDef;
  onUpdate: (updates: Partial<QuestionDef>) => void;
}

// -- Choice Editor (shared by multiple_choice, multi_select, dropdown) -------

function ChoiceEditor({ question, onUpdate }: QuestionTypeSettingsProps) {
  const addChoice = () => {
    const id = `c_${Date.now()}`;
    const newChoice: Choice = {
      id,
      label: '',
      value: '',
      order: question.choices.length,
    };
    onUpdate({ choices: [...question.choices, newChoice] });
  };

  const removeChoice = (choiceId: string) => {
    onUpdate({
      choices: question.choices
        .filter((c) => c.id !== choiceId)
        .map((c, i) => ({ ...c, order: i })),
    });
  };

  const updateChoice = (choiceId: string, label: string) => {
    onUpdate({
      choices: question.choices.map((c) =>
        c.id === choiceId
          ? { ...c, label, value: label.toLowerCase().replace(/[^a-z0-9]+/g, '_') }
          : c
      ),
    });
  };

  return (
    <FormGroup legendText="Choices">
      <Stack gap={3}>
        {question.choices.map((choice, index) => (
          <div key={choice.id} className="choice-editor__row">
            <DragVertical size={16} className="choice-editor__drag" />
            <span className="choice-editor__index">{index + 1}</span>
            <TextInput
              id={`choice-${choice.id}`}
              value={choice.label}
              onChange={(e) => updateChoice(choice.id, e.target.value)}
              placeholder={`Choice ${index + 1}`}
              labelText=""
              hideLabel
              size="sm"
            />
            <Button
              kind="ghost"
              size="sm"
              hasIconOnly
              renderIcon={TrashCan}
              onClick={() => removeChoice(choice.id)}
              disabled={question.choices.length <= 1}
              iconDescription="Remove choice"
            />
          </div>
        ))}
        <Button kind="ghost" size="sm" renderIcon={Add} onClick={addChoice}>
          Add choice
        </Button>
      </Stack>
    </FormGroup>
  );
}

// -- Multiple Choice / Multi Select ------------------------------------------

function ChoiceSettings({ question, onUpdate }: QuestionTypeSettingsProps) {
  const props = question.properties as {
    allowOther?: boolean;
    layout?: 'vertical' | 'horizontal';
  };

  return (
    <Stack gap={5}>
      <ChoiceEditor question={question} onUpdate={onUpdate} />
      <Toggle
        id={`${question.id}-allow-other`}
        labelText='Allow "Other" option'
        toggled={props.allowOther ?? false}
        onToggle={(checked) => onUpdate({
          properties: { ...question.properties, allowOther: checked },
        })}
      />
      <FormGroup legendText="Layout">
        <RadioButtonGroup
          name={`${question.id}-layout`}
          valueSelected={props.layout ?? 'vertical'}
          onChange={(value) => onUpdate({
            properties: { ...question.properties, layout: value },
          })}
          orientation="vertical"
        >
          <RadioButton value="vertical" labelText="Vertical (stacked)" />
          <RadioButton value="horizontal" labelText="Horizontal (2 columns)" />
        </RadioButtonGroup>
      </FormGroup>
    </Stack>
  );
}

// -- Dropdown ---------------------------------------------------------------

function DropdownSettings({ question, onUpdate }: QuestionTypeSettingsProps) {
  const props = question.properties as {
    searchable?: boolean;
    placeholder?: string;
  };

  return (
    <Stack gap={5}>
      <ChoiceEditor question={question} onUpdate={onUpdate} />
      <Toggle
        id={`${question.id}-searchable`}
        labelText="Enable search"
        toggled={props.searchable ?? false}
        onToggle={(checked) => onUpdate({
          properties: { ...question.properties, searchable: checked },
        })}
      />
      <TextInput
        id={`${question.id}-placeholder`}
        labelText="Placeholder text"
        value={props.placeholder ?? ''}
        onChange={(e) => onUpdate({
          properties: { ...question.properties, placeholder: e.target.value },
        })}
        placeholder="Select an option..."
      />
    </Stack>
  );
}

// -- Short Text -------------------------------------------------------------

function ShortTextSettings({ question, onUpdate }: QuestionTypeSettingsProps) {
  const props = question.properties as {
    inputType?: string;
    charLimit?: number;
    placeholder?: string;
  };

  return (
    <Stack gap={5}>
      <Select
        id={`${question.id}-input-type`}
        labelText="Input type"
        value={props.inputType ?? 'text'}
        onChange={(e) => onUpdate({
          properties: { ...question.properties, inputType: e.target.value },
        })}
      >
        <SelectItem value="text" text="Text" />
        <SelectItem value="email" text="Email" />
        <SelectItem value="number" text="Number" />
        <SelectItem value="url" text="URL" />
        <SelectItem value="tel" text="Phone" />
      </Select>
      <NumberInput
        id={`${question.id}-char-limit`}
        label="Character limit"
        value={props.charLimit || 0}
        onChange={(_e, state) => onUpdate({
          properties: { ...question.properties, charLimit: parseInt(String(state.value), 10) || undefined },
        })}
        min={0}
        max={1000}
        allowEmpty
      />
      <TextInput
        id={`${question.id}-placeholder`}
        labelText="Placeholder"
        value={props.placeholder ?? ''}
        onChange={(e) => onUpdate({
          properties: { ...question.properties, placeholder: e.target.value },
        })}
      />
    </Stack>
  );
}

// -- Long Text --------------------------------------------------------------

function LongTextSettings({ question, onUpdate }: QuestionTypeSettingsProps) {
  const props = question.properties as {
    charLimit?: number;
    wordLimit?: number;
    placeholder?: string;
  };

  return (
    <Stack gap={5}>
      <NumberInput
        id={`${question.id}-char-limit`}
        label="Character limit"
        value={props.charLimit || 0}
        onChange={(_e, state) => onUpdate({
          properties: { ...question.properties, charLimit: parseInt(String(state.value), 10) || undefined },
        })}
        min={0}
        max={10000}
        allowEmpty
      />
      <NumberInput
        id={`${question.id}-word-limit`}
        label="Word limit"
        value={props.wordLimit || 0}
        onChange={(_e, state) => onUpdate({
          properties: { ...question.properties, wordLimit: parseInt(String(state.value), 10) || undefined },
        })}
        min={0}
        allowEmpty
      />
      <TextInput
        id={`${question.id}-placeholder`}
        labelText="Placeholder"
        value={props.placeholder ?? ''}
        onChange={(e) => onUpdate({
          properties: { ...question.properties, placeholder: e.target.value },
        })}
      />
    </Stack>
  );
}

// -- Rating Likert ----------------------------------------------------------

function LikertSettings({ question, onUpdate }: QuestionTypeSettingsProps) {
  const props = question.properties as {
    min?: number;
    max?: number;
    minLabel?: string;
    maxLabel?: string;
    layout?: 'vertical' | 'horizontal';
  };

  return (
    <Stack gap={5}>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <NumberInput
          id={`${question.id}-min`}
          label="Min value"
          value={props.min ?? 1}
          onChange={(_e, state) => onUpdate({
            properties: { ...question.properties, min: parseInt(String(state.value), 10) || 1 },
          })}
          min={1}
          max={10}
          hideLabel
          style={{ maxWidth: '120px' }}
        />
        <NumberInput
          id={`${question.id}-max`}
          label="Max value"
          value={props.max ?? 5}
          onChange={(_e, state) => onUpdate({
            properties: { ...question.properties, max: parseInt(String(state.value), 10) || 5 },
          })}
          min={2}
          max={10}
          hideLabel
          style={{ maxWidth: '120px' }}
        />
      </div>
      <TextInput
        id={`${question.id}-min-label`}
        labelText="Min label (e.g., Strongly Disagree)"
        value={props.minLabel ?? ''}
        onChange={(e) => onUpdate({
          properties: { ...question.properties, minLabel: e.target.value },
        })}
      />
      <TextInput
        id={`${question.id}-max-label`}
        labelText="Max label (e.g., Strongly Agree)"
        value={props.maxLabel ?? ''}
        onChange={(e) => onUpdate({
          properties: { ...question.properties, maxLabel: e.target.value },
        })}
      />
      <FormGroup legendText="Display layout">
        <RadioButtonGroup
          name={`${question.id}-likert-layout`}
          valueSelected={props.layout ?? 'horizontal'}
          onChange={(value) => onUpdate({
            properties: { ...question.properties, layout: value },
          })}
          orientation="vertical"
        >
          <RadioButton value="horizontal" labelText="Horizontal" />
          <RadioButton value="vertical" labelText="Vertical" />
        </RadioButtonGroup>
      </FormGroup>
    </Stack>
  );
}

// -- Rating Star ------------------------------------------------------------

function StarSettings({ question, onUpdate }: QuestionTypeSettingsProps) {
  const props = question.properties as {
    maxStars?: number;
    allowHalf?: boolean;
  };

  return (
    <Stack gap={5}>
      <FormGroup legendText="Max stars">
        <RadioButtonGroup
          name={`${question.id}-max-stars`}
          valueSelected={String(props.maxStars ?? 5)}
          onChange={(value) => onUpdate({
            properties: { ...question.properties, maxStars: parseInt(String(value), 10) },
          })}
          orientation="vertical"
        >
          <RadioButton value="5" labelText="5 stars" />
          <RadioButton value="10" labelText="10 stars" />
        </RadioButtonGroup>
      </FormGroup>
      <Toggle
        id={`${question.id}-half-star`}
        labelText="Allow half-star ratings"
        toggled={props.allowHalf ?? false}
        onToggle={(checked) => onUpdate({
          properties: { ...question.properties, allowHalf: checked },
        })}
      />
    </Stack>
  );
}

// -- Rating NPS (read-only) -------------------------------------------------

function NpsSettings() {
  return (
    <Tile>
      <p className="m-0">
        <strong>NPS (Net Promoter Score)</strong> uses a fixed 0-10 scale.
      </p>
      <p className="mt-2 text-sm text-neutral-600">
        Respondents select a number from 0 (Not likely at all) to 10 (Extremely likely).
      </p>
    </Tile>
  );
}

// -- Yes/No -----------------------------------------------------------------

function YesNoSettings({ question, onUpdate }: QuestionTypeSettingsProps) {
  const props = question.properties as { allowNotSure?: boolean };

  return (
    <Toggle
      id={`${question.id}-not-sure`}
      labelText='Include "Not sure" option'
      toggled={props.allowNotSure ?? false}
      onToggle={(checked) => onUpdate({
        properties: { ...question.properties, allowNotSure: checked },
      })}
    />
  );
}

// -- Emoji Rating -----------------------------------------------------------

function EmojiSettings({ question, onUpdate }: QuestionTypeSettingsProps) {
  const props = question.properties as {
    emojiSet?: string;
    layout?: 'vertical' | 'horizontal';
  };

  return (
    <Stack gap={5}>
      <Select
        id={`${question.id}-emoji-set`}
        labelText="Emoji set"
        value={props.emojiSet ?? 'smileys'}
        onChange={(e) => onUpdate({
          properties: { ...question.properties, emojiSet: e.target.value },
        })}
      >
        <SelectItem value="smileys" text="Smileys" />
        <SelectItem value="hearts" text="Hearts" />
        <SelectItem value="thumbs" text="Thumbs" />
        <SelectItem value="stars" text="Stars" />
      </Select>
      <FormGroup legendText="Display layout">
        <RadioButtonGroup
          name={`${question.id}-emoji-layout`}
          valueSelected={props.layout ?? 'horizontal'}
          onChange={(value) => onUpdate({
            properties: { ...question.properties, layout: value },
          })}
          orientation="vertical"
        >
          <RadioButton value="horizontal" labelText="Horizontal" />
          <RadioButton value="vertical" labelText="Vertical" />
        </RadioButtonGroup>
      </FormGroup>
    </Stack>
  );
}

// -- Slider -----------------------------------------------------------------

function SliderSettings({ question, onUpdate }: QuestionTypeSettingsProps) {
  const props = question.properties as {
    min?: number;
    max?: number;
    step?: number;
    minLabel?: string;
    maxLabel?: string;
  };

  return (
    <Stack gap={5}>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <NumberInput
          id={`${question.id}-slider-min`}
          label="Min"
          value={props.min ?? 0}
          onChange={(_e, state) => onUpdate({
            properties: { ...question.properties, min: parseInt(String(state.value), 10) || 0 },
          })}
          hideLabel
          style={{ maxWidth: '120px' }}
        />
        <NumberInput
          id={`${question.id}-slider-max`}
          label="Max"
          value={props.max ?? 100}
          onChange={(_e, state) => onUpdate({
            properties: { ...question.properties, max: parseInt(String(state.value), 10) || 100 },
          })}
          hideLabel
          style={{ maxWidth: '120px' }}
        />
        <NumberInput
          id={`${question.id}-slider-step`}
          label="Step"
          value={props.step ?? 1}
          onChange={(_e, state) => onUpdate({
            properties: { ...question.properties, step: parseInt(String(state.value), 10) || 1 },
          })}
          min={1}
          hideLabel
          style={{ maxWidth: '120px' }}
        />
      </div>
      <TextInput
        id={`${question.id}-slider-min-label`}
        labelText="Min label"
        value={props.minLabel ?? ''}
        onChange={(e) => onUpdate({
          properties: { ...question.properties, minLabel: e.target.value },
        })}
      />
      <TextInput
        id={`${question.id}-slider-max-label`}
        labelText="Max label"
        value={props.maxLabel ?? ''}
        onChange={(e) => onUpdate({
          properties: { ...question.properties, maxLabel: e.target.value },
        })}
      />
    </Stack>
  );
}

// -- Main Component ---------------------------------------------------------

export function QuestionTypeSettings({ question, onUpdate }: QuestionTypeSettingsProps) {
  switch (question.type) {
    case 'multiple_choice':
    case 'multi_select':
      return <ChoiceSettings question={question} onUpdate={onUpdate} />;
    case 'dropdown':
      return <DropdownSettings question={question} onUpdate={onUpdate} />;
    case 'short_text':
      return <ShortTextSettings question={question} onUpdate={onUpdate} />;
    case 'long_text':
      return <LongTextSettings question={question} onUpdate={onUpdate} />;
    case 'rating_likert':
      return <LikertSettings question={question} onUpdate={onUpdate} />;
    case 'rating_star':
      return <StarSettings question={question} onUpdate={onUpdate} />;
    case 'rating_nps':
      return <NpsSettings />;
    case 'yes_no':
      return <YesNoSettings question={question} onUpdate={onUpdate} />;
    case 'rating_emoji':
      return <EmojiSettings question={question} onUpdate={onUpdate} />;
    case 'slider':
      return <SliderSettings question={question} onUpdate={onUpdate} />;
    default:
      return null;
  }
}
