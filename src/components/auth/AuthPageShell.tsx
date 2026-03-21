import type { ReactNode } from 'react';

export type AuthPageShellProps = {
  children: ReactNode;
};

/**
 * Centered auth form on a neutral background. Styles in `index.scss` (`.auth-saas`).
 */
export function AuthPageShell({ children }: AuthPageShellProps) {
  return (
    <div className="auth-saas">
      <div className="auth-saas__main">
        <div className="auth-saas__form-wrap">{children}</div>
      </div>
    </div>
  );
}
