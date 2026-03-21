import { Outlet } from 'react-router-dom';
import { Content } from '@carbon/react';

/**
 * Auth routes (`/signin`, `/signup`, …) — Carbon UI Shell `Content` region.
 */
export function AuthLayout() {
  return (
    <Content id="main-content" className="auth-layout">
      <Outlet />
    </Content>
  );
}
