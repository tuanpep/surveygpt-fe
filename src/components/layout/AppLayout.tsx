import { useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Header,
  HeaderGlobalBar,
  HeaderGlobalAction,
  HeaderMenu,
  HeaderMenuItem,
  HeaderName,
  SideNav,
  SideNavItems,
  SideNavLink,
  SkipToContent,
  Content,
  InlineLoading,
} from '@carbon/react';
import {
  Dashboard,
  Document,
  Template,
  Plug,
  Group,
  Currency,
  Api,
  Settings,
  Notification,
} from '@carbon/icons-react';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { label: 'Dashboard', icon: Dashboard, to: '/app/dashboard' },
  { label: 'Surveys', icon: Document, to: '/app/surveys' },
  { label: 'Templates', icon: Template, to: '/app/templates' },
  { label: 'Integrations', icon: Plug, to: '/app/integrations' },
  { label: 'Team', icon: Group, to: '/app/team' },
  { label: 'Billing', icon: Currency, to: '/app/billing' },
  { label: 'API Keys', icon: Api, to: '/app/api-keys' },
  { label: 'Settings', icon: Settings, to: '/app/settings' },
];

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, isLoading, isAuthenticated } = useAuth();

  const handleSignOut = () => {
    signOut();
    navigate('/signin');
  };

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/signin');
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="app-layout app-layout--loading">
        <InlineLoading description="Loading..." />
      </div>
    );
  }

  // Don't render layout if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="app-layout">
      <Header aria-label="SurveyFlow Application">
        <SkipToContent />
        <HeaderName element={Link} href="/app/dashboard" prefix="IBM">
          SurveyFlow
        </HeaderName>
        <HeaderGlobalBar>
          <HeaderGlobalAction
            aria-label="Notifications"
            onClick={() => {}}
            tooltipAlignment="end"
          >
            <Notification size={20} />
          </HeaderGlobalAction>
          <HeaderMenu aria-label="User menu" menuLinkName={user?.name || 'User'}>
            <HeaderMenuItem onClick={() => navigate('/app/settings')}>
              Account Settings
            </HeaderMenuItem>
            <HeaderMenuItem onClick={handleSignOut}>
              Sign out
            </HeaderMenuItem>
          </HeaderMenu>
        </HeaderGlobalBar>
      </Header>

      <div className="app-layout__body">
        <SideNav aria-label="Main navigation" isFixedNav expanded>
          <SideNavItems>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.to);
              return (
                <SideNavLink
                  key={item.to}
                  renderIcon={Icon}
                  isActive={isActive}
                  onClick={() => navigate(item.to)}
                >
                  {item.label}
                </SideNavLink>
              );
            })}
          </SideNavItems>
        </SideNav>

        <Content id="main-content" className="app-layout__content">
          <Outlet />
        </Content>
      </div>
    </div>
  );
}
