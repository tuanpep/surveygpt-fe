import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid, Column, Heading, Search, Select, SelectItem, Tile, Tag,
} from '@carbon/react';
import { useCreateFromTemplate } from '@/hooks/useSurvey';
import { useTemplates } from '@/hooks/useTemplates';
import { Loading } from '@/components/shared/Loading';
import { EmptyState } from '@/components/shared/EmptyState';
import type { Template } from '@/services/templates';
import { AppPage } from '@/components/layout/AppPage';

export function AppTemplatesPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useTemplates({ limit: 100 });
  const templates = data?.data ?? [];

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');

  const categories = useMemo(() => {
    return [...new Set(templates.map((t) => t.category || 'Other'))];
  }, [templates]);

  const filtered = useMemo(() => {
    return templates.filter((t) => {
      const matchesCategory = categoryFilter === 'all' || (t.category || 'Other') === categoryFilter;
      const matchesSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || (t.description || '').toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [templates, categoryFilter, search]);

  const grouped = useMemo(() => {
    return filtered.reduce<Record<string, Template[]>>((acc, t) => {
      const cat = t.category || 'Other';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(t);
      return acc;
    }, {});
  }, [filtered]);

  const createFromTemplate = useCreateFromTemplate();

  const handleUseTemplate = async (templateId: string) => {
    try {
      const survey = await createFromTemplate.mutateAsync({ templateId, title: 'Untitled Survey' }) as { id: string };
      navigate(`/app/surveys/${survey.id}/edit`);
    } catch {
      // Error handled by react-query
    }
  };

  if (isLoading) return <Loading />;

  return (
    <AppPage>
      <div className="app-page__header">
        <Heading>Templates</Heading>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Search
          size="md"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search templates..."
          labelText="Search templates"
          style={{ flex: 1, maxWidth: '400px' }}
        />
        <Select
          id="template-category-filter"
          labelText=""
          size="sm"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          hideLabel
        >
          <SelectItem value="all" text="All Categories" />
          {categories.map((cat) => (
            <SelectItem key={cat} value={cat} text={cat} />
          ))}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No templates found" description="Try a different search or category." />
      ) : (
        Object.entries(grouped).map(([category, items]) => (
          <div key={category} style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>{category}</h3>
            <Grid>
              {items.map((template) => (
                <Column sm={2} md={4} lg={4} key={template.id}>
                  <Tile
                    className="template-gallery__tile"
                    onClick={() => handleUseTemplate(template.id)}
                  >
                    <h5 style={{ marginBottom: '0.5rem' }}>{template.name}</h5>
                    <p style={{ fontSize: '0.75rem', color: '#525252', marginBottom: '0.75rem' }}>
                      {template.description}
                    </p>
                    <Tag type="blue" size="sm">{template.questionCount || '?'} questions</Tag>
                  </Tile>
                </Column>
              ))}
            </Grid>
          </div>
        ))
      )}
    </AppPage>
  );
}
