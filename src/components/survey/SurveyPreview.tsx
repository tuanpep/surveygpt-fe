import { useState } from 'react';
import { Toggle } from '@carbon/react';

export function SurveyPreview() {
  const [isDesktop, setIsDesktop] = useState(true);

  return (
    <div className="survey-preview">
      <div className="survey-preview__toolbar">
        <Toggle
          id="preview-viewport-toggle"
          size="sm"
          labelText="Viewport"
          labelA="Mobile"
          labelB="Desktop"
          toggled={isDesktop}
          onToggle={() => setIsDesktop(!isDesktop)}
        />
      </div>

      <div className="flex justify-center p-4">
        <div
          className={`survey-preview__frame ${isDesktop ? 'survey-preview__frame--desktop' : 'survey-preview__frame--mobile'}`}
        >
          <div className="survey-preview__content">
            <p style={{ color: '#525252', textAlign: 'center' }}>
              Survey preview will render here when the survey is loaded.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
