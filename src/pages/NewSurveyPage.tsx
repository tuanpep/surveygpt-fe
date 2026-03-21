import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heading, Button, Stack, TextInput, TextArea,
  ComposedModal, ModalHeader, ModalBody, ModalFooter, Grid, Column, InlineLoading, Tag,
  ClickableTile, SelectableTile,
} from '@carbon/react';
import { useCreateSurvey, useCreateFromTemplate } from '@/hooks/useSurvey';
import { useTemplates } from '@/hooks/useTemplates';
import { useAuth } from '@/hooks/useAuth';
import { EmptyState } from '@/components/shared/EmptyState';
import type { Template } from '@/services/templates';
import { AppPage } from '@/components/layout/AppPage';

export function NewSurveyPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const createSurvey = useCreateSurvey();
  const createFromTemplate = useCreateFromTemplate();
  const [step, setStep] = useState<'choose' | 'blank' | 'template'>('choose');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const { data: templatesData } = useTemplates({ limit: 50 });
  const templates = templatesData?.data ?? [];

  const handleCreateBlank = async () => {
    if (!title.trim()) return;
    if (isAuthenticated) {
      try {
        const survey = await createSurvey.mutateAsync({ title: title.trim(), description: description.trim() || undefined }) as { id: string };
        navigate(`/app/surveys/${survey.id}/edit`);
      } catch {
        // error handled by react-query
      }
    } else {
      const guestId = crypto.randomUUID();
      navigate(`/surveys/${guestId}/edit?guest=true&title=${encodeURIComponent(title.trim())}`);
    }
  };

  const handleCreateFromTemplate = async () => {
    if (!selectedTemplate) return;
    if (isAuthenticated) {
      try {
        const survey = await createFromTemplate.mutateAsync({ templateId: selectedTemplate, title: title.trim() || 'Untitled Survey' }) as { id: string };
        navigate(`/app/surveys/${survey.id}/edit`);
      } catch {
        // error handled by react-query
      }
    } else {
      const guestId = crypto.randomUUID();
      navigate(`/surveys/${guestId}/edit?guest=true&title=${encodeURIComponent(title.trim() || 'Untitled Survey')}&template=${selectedTemplate}`);
    }
  };

  const groupedTemplates = useMemo(() => {
    return templates.reduce<Record<string, Template[]>>((acc, t) => {
      const cat = t.category || 'Other';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(t);
      return acc;
    }, {});
  }, [templates]);

  return (
    <AppPage>
      <Heading>Create New Survey</Heading>

      {step === 'choose' && (
        <Stack gap={6} className="new-survey__content">
          <div className="new-survey__options">
            <ClickableTile onClick={() => setStep('blank')}>
              <Heading>Add</Heading>
              <h3>Start from blank</h3>
              <p>Create a survey from scratch with your own questions.</p>
            </ClickableTile>
            <ClickableTile onClick={() => setStep('template')}>
              <Heading>Template</Heading>
              <h3>Use a template</h3>
              <p>Get started faster with a pre-built template.</p>
            </ClickableTile>
            <ClickableTile className="new-survey__option-card--disabled">
              <Heading>WatsonxAI</Heading>
              <h3>Generate with AI</h3>
              <p>Let AI create a survey based on your description. Coming soon.</p>
            </ClickableTile>
          </div>
        </Stack>
      )}

      {step === 'blank' && (
        <ComposedModal open onClose={() => setStep('choose')} size="sm">
          <ModalHeader title="Create Blank Survey" closeModal={() => setStep('choose')} />
          <ModalBody>
            <Stack gap={6}>
              <TextInput
                id="blank-title"
                labelText="Survey title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Customer Satisfaction Survey"
                required
              />
              <TextArea
                id="blank-description"
                labelText="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this survey about?"
                rows={3}
              />
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button kind="secondary" onClick={() => setStep('choose')}>Cancel</Button>
            <Button kind="primary" onClick={handleCreateBlank} disabled={!title.trim() || createSurvey.isPending}>
              {createSurvey.isPending ? <InlineLoading description="Creating..." /> : 'Create Survey'}
            </Button>
          </ModalFooter>
        </ComposedModal>
      )}

      {step === 'template' && (
        <ComposedModal open onClose={() => setStep('choose')} size="lg">
          <ModalHeader title="Choose a Template" closeModal={() => setStep('choose')} />
          <ModalBody>
            <Stack gap={6}>
              <TextInput
                id="template-title"
                labelText="Survey title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Customer Satisfaction Survey"
              />
              <div className="template-gallery">
                {Object.entries(groupedTemplates).map(([category, items]) => (
                  <div key={category} className="template-gallery__category">
                    <h4>{category}</h4>
                    <Grid>
                      {items.map((template) => (
                        <Column sm={2} md={4} lg={4} key={template.id}>
                          <SelectableTile
                            className="template-gallery__tile"
                            selected={selectedTemplate === template.id}
                            onClick={() => setSelectedTemplate(template.id)}
                            name={`template-${template.id}`}
                            value={template.id}
                          >
                            <h5>{template.name}</h5>
                            <p>{template.description}</p>
                            <Tag type="blue" size="sm">{template.questionCount} questions</Tag>
                          </SelectableTile>
                        </Column>
                      ))}
                    </Grid>
                  </div>
                ))}
                {templates.length === 0 && (
                  <EmptyState title="No templates available" description="Templates will be available soon" />
                )}
              </div>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button kind="secondary" onClick={() => setStep('choose')}>Cancel</Button>
            <Button kind="primary" onClick={handleCreateFromTemplate} disabled={!selectedTemplate || createFromTemplate.isPending}>
              {createFromTemplate.isPending ? <InlineLoading description="Creating..." /> : 'Use Template'}
            </Button>
          </ModalFooter>
        </ComposedModal>
      )}
    </AppPage>
  );
}
