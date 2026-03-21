import type { ComponentType } from 'react';
import { Button, Tile } from '@carbon/react';
import { Document } from '@carbon/icons-react';

interface EmptyStateProps {
  icon?: ComponentType<{ size?: number; className?: string }>;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon = Document,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <Tile className="empty-state">
      <Icon size={48} className="empty-state__icon" />
      <h3 className="empty-state__title">{title}</h3>
      {description && <p className="empty-state__description">{description}</p>}
      {actionLabel && onAction && (
        <Button kind="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Tile>
  );
}
