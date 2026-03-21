import {
  TextInput, TextArea, RadioButtonGroup, RadioButton, Checkbox,
  CheckboxGroup, Select, SelectItem, Tile, Button, Slider,
  InlineNotification, Section, Heading,
} from '@carbon/react';
import { StarFilled, Star } from '@carbon/icons-react';
import type { QuestionDef } from '@/types/survey';
import type { AnswerValue } from '@/types/response';

interface PublicQuestionRendererProps {
  question: QuestionDef;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
  error?: string;
}

function renderInput(question: QuestionDef, value: AnswerValue, onChange: (v: AnswerValue) => void) {
  const props = question.properties as Record<string, any>;

  switch (question.type) {
    case 'short_text':
      return (
        <TextInput
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={props.placeholder}
          maxLength={props.charLimit}
          type={props.inputType || 'text'}
          id={`q-${question.id}`}
          labelText=""
          hideLabel
        />
      );

    case 'long_text':
      return (
        <TextArea
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={props.placeholder}
          maxLength={props.charLimit}
          rows={4}
          id={`q-${question.id}`}
          labelText=""
          hideLabel
        />
      );

    case 'multiple_choice':
      return (
        <RadioButtonGroup
          name={question.id}
          valueSelected={(value as string) ?? ''}
          onChange={(selected) => onChange(selected ?? '')}
          orientation="vertical"
        >
          {question.choices.map((choice) => (
            <RadioButton
              key={choice.id}
              value={choice.value}
              labelText={choice.label}
            />
          ))}
        </RadioButtonGroup>
      );

    case 'multi_select':
      return (
        <CheckboxGroup legendText="">
          {question.choices.map((choice) => {
            const checked = Array.isArray(value) && (value as string[]).includes(choice.value);
            return (
              <Checkbox
                key={choice.id}
                id={`q-${question.id}-${choice.id}`}
                labelText={choice.label}
                checked={checked}
                onChange={(_checked, { checked: isChecked }: { checked: boolean }) => {
                  const current = (Array.isArray(value) ? value : []) as string[];
                  const next = isChecked
                    ? [...current, choice.value]
                    : current.filter((v) => v !== choice.value);
                  onChange(next.length > 0 ? next : []);
                }}
              />
            );
          })}
        </CheckboxGroup>
      );

    case 'dropdown':
      return (
        <Select
          id={`q-${question.id}`}
          labelText=""
          hideLabel
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
        >
          <SelectItem value="" text="Select an option..." />
          {question.choices.map((choice) => (
            <SelectItem value={choice.value} text={choice.label} />
          ))}
        </Select>
      );

    case 'yes_no': {
      const allowNotSure = props.allowNotSure;
      return (
        <RadioButtonGroup
          name={question.id}
          valueSelected={(value as string) ?? ''}
          onChange={(selected) => onChange(selected ?? '')}
          orientation="vertical"
        >
          <RadioButton value="yes" labelText="Yes" />
          <RadioButton value="no" labelText="No" />
          {allowNotSure && <RadioButton value="not_sure" labelText="Not sure" />}
        </RadioButtonGroup>
      );
    }

    case 'rating_star': {
      const maxStars = props.maxStars ?? 5;
      const currentRating = (value as number) ?? 0;
      return (
        <div className="public-star-rating" role="radiogroup" aria-label="Star rating">
          {Array.from({ length: maxStars }, (_, i) => i + 1).map((star) => (
            <span
              key={star}
              className={`public-star-rating__star ${star <= currentRating ? 'public-star-rating__star--filled' : ''}`}
              role="radio"
              aria-checked={star === currentRating}
              tabIndex={0}
              onClick={() => onChange(star)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChange(star); } }}
            >
              {star <= currentRating ? <StarFilled size={24} /> : <Star size={24} />}
            </span>
          ))}
        </div>
      );
    }

    case 'rating_nps': {
      const currentNps = (value as number) ?? -1;
      const getNpsClasses = (score: number, isSelected: boolean) => {
        let cls = 'public-nps__button';
        if (score <= 6) cls += ' public-nps__button--detractor';
        else if (score <= 8) cls += ' public-nps__button--passive';
        else cls += ' public-nps__button--promoter';
        if (isSelected) cls += ' selected';
        return cls;
      };
      return (
        <div className="public-nps" role="radiogroup" aria-label="NPS rating">
          {Array.from({ length: 11 }, (_, i) => i).map((score) => (
            <button
              key={score}
              type="button"
              className={getNpsClasses(score, score === currentNps)}
              onClick={() => onChange(score)}
              aria-label={`Rate ${score}`}
            >
              {score}
            </button>
          ))}
          <div className="public-nps__labels">
            <span>Not likely</span>
            <span>Extremely likely</span>
          </div>
        </div>
      );
    }

    case 'rating_likert': {
      const min = props.min ?? 1;
      const max = props.max ?? 5;
      const minLabel = props.minLabel || '';
      const maxLabel = props.maxLabel || '';
      return (
        <div>
          {(minLabel || maxLabel) && (
            <div className="public-likert__labels">
              <span>{minLabel}</span>
              <span>{maxLabel}</span>
            </div>
          )}
          <RadioButtonGroup
            name={question.id}
            valueSelected={String(value ?? '')}
            onChange={(selected) => onChange(parseInt(String(selected), 10))}
            orientation="horizontal"
          >
            {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((val) => (
              <RadioButton key={val} value={String(val)} labelText={String(val)} />
            ))}
          </RadioButtonGroup>
        </div>
      );
    }

    case 'rating_emoji': {
      const emojiSet = props.emojiSet ?? 'smileys';
      const emojiMap: Record<string, Record<number, string>> = {
        smileys: { 1: '\u{1F629}', 2: '\u{1F615}', 3: '\u{1F610}', 4: '\u{1F60A}', 5: '\u{1F60D}' },
        hearts: { 1: '\u2764\uFE0F', 2: '\uD83E\uDE77', 3: '\uD83E\uDD0D', 4: '\uD83E\uDD0E', 5: '\uD83D\uDC9B' },
        thumbs: { 1: '\uD83D\uDC4E', 2: '\uD83D\uDC26', 3: '\uD83D\uDC4D' },
        stars: { 1: '\u2B50', 2: '\uD83C\uDF1F', 3: '\uD83D\uDCAB', 4: '\uD83C\uDF20', 5: '\u2728' },
      };
      const emojis = emojiMap[emojiSet] || emojiMap.smileys;
      const currentEmoji = (value as number) ?? 0;
      return (
        <div className="public-emoji-rating">
          {Object.entries(emojis).map(([key, emoji]) => {
            const isSelected = parseInt(key) === currentEmoji;
            return (
              <Button
                key={key}
                kind="ghost"
                size="sm"
                className={`public-emoji-rating__item ${isSelected ? 'selected' : ''}`}
                onClick={() => onChange(parseInt(key))}
              >
                {emoji}
              </Button>
            );
          })}
        </div>
      );
    }

    case 'slider': {
      const min = props.min ?? 0;
      const max = props.max ?? 100;
      const step = props.step ?? 1;
      const current = (value as number) ?? min;
      return (
        <div className="public-slider">
          {(props.minLabel || props.maxLabel) && (
            <div className="public-slider__labels">
              <span>{props.minLabel || min}</span>
              <span>{props.maxLabel || max}</span>
            </div>
          )}
          <Slider
            min={min}
            max={max}
            step={step}
            value={current}
            labelText=""
            hideLabel
            onChange={({ value }) => onChange(value)}
            aria-label="Rating slider"
          />
        </div>
      );
    }

    default:
      return (
        <Tile>
          <p>
            This question type ({question.type.replace(/_/g, ' ')}) is not yet supported.
          </p>
        </Tile>
      );
  }
}

export function PublicQuestionRenderer({ question, value, onChange, error }: PublicQuestionRendererProps) {
  return (
    <div className="public-question">
      <div className="public-question__header">
        {question.required && <span className="public-question__required">*</span>}
        <Section level={3}>
          <Heading className="public-question__title">{question.title}</Heading>
        </Section>
      </div>
      {question.description && (
        <p className="public-question__description">{question.description}</p>
      )}
      {renderInput(question, value, onChange)}
      {error && (
        <InlineNotification
          kind="error"
          title={error}
          hideCloseButton
          lowContrast
          className="public-question__notification"
        />
      )}
    </div>
  );
}
