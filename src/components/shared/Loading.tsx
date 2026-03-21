import { SkeletonText, DataTableSkeleton } from '@carbon/react';

interface LoadingProps {
  type?: 'text' | 'table' | 'tile';
  rows?: number;
}

export function Loading({ type = 'text', rows }: LoadingProps) {
  if (type === 'table') {
    return <DataTableSkeleton rowCount={rows ?? 5} />;
  }

  return (
    <div className="loading-text-wrapper">
      <SkeletonText paragraph lineCount={rows ?? 4} width="100%" />
    </div>
  );
}
