import type { ReactNode } from 'react';
import { Stack } from '@carbon/react';

type AppPageProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Vertical page shell for authenticated app routes — Carbon `Stack` spacing.
 */
export function AppPage({ children, className }: AppPageProps) {
  return (
    <Stack gap={6} className={['app-page', className].filter(Boolean).join(' ')}>
      {children}
    </Stack>
  );
}
