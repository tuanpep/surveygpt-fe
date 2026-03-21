import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { GuestLayout } from '@/components/layout/GuestLayout';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { useAuth } from '@/hooks/useAuth';
import { Loading } from '@/components/shared/Loading';

// Marketing pages
const HomePage = lazy(() => import('./marketing').then(m => ({ default: m.HomePage })));

// Auth pages
const SignInPage = lazy(() => import('./auth').then(m => ({ default: m.SignInPage })));
const SignUpPage = lazy(() => import('./auth').then(m => ({ default: m.SignUpPage })));
const ForgotPasswordPage = lazy(() => import('./auth').then(m => ({ default: m.ForgotPasswordPage })));

// App pages
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const SurveysListPage = lazy(() => import('@/pages/SurveysListPage').then(m => ({ default: m.SurveysListPage })));
const NewSurveyPage = lazy(() => import('@/pages/NewSurveyPage').then(m => ({ default: m.NewSurveyPage })));
const SurveyEditPage = lazy(() => import('@/pages/SurveyEditPage').then(m => ({ default: m.SurveyEditPage })));
const SurveyResponsesPage = lazy(() => import('@/pages/SurveyResponsesPage').then(m => ({ default: m.SurveyResponsesPage })));
const SurveyAnalyticsPage = lazy(() => import('@/pages/SurveyAnalyticsPage').then(m => ({ default: m.SurveyAnalyticsPage })));
const SurveySettingsPage = lazy(() => import('@/pages/SurveySettingsPage').then(m => ({ default: m.SurveySettingsPage })));
const AppTemplatesPage = lazy(() => import('@/pages/AppTemplatesPage').then(m => ({ default: m.AppTemplatesPage })));
const IntegrationsPage = lazy(() => import('@/pages/IntegrationsPage').then(m => ({ default: m.IntegrationsPage })));
const TeamPage = lazy(() => import('@/pages/TeamPage').then(m => ({ default: m.TeamPage })));
const BillingPage = lazy(() => import('@/pages/BillingPage').then(m => ({ default: m.BillingPage })));
const ApiKeysPage = lazy(() => import('@/pages/ApiKeysPage').then(m => ({ default: m.ApiKeysPage })));
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then(m => ({ default: m.SettingsPage })));

// Public survey pages
const PublicSurveyPage = lazy(() => import('./survey').then(m => ({ default: m.PublicSurveyPage })));
const ThankYouPage = lazy(() => import('./survey').then(m => ({ default: m.ThankYouPage })));

// Wrapper component for Suspense fallback
function LazyRouteWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<Loading />}>{children}</Suspense>;
}

// Layout that renders AppLayout for authed users, GuestLayout for guests
function SurveyBuilderLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="app-layout app-layout--loading">
        <div className="app-layout__loading-spinner" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <AppLayout />;
  }

  return <GuestLayout />;
}

export const router = createBrowserRouter([
  // ── Marketing / Public Layout ──────────────────────────────────────────────
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <LazyRouteWrapper><HomePage /></LazyRouteWrapper> },
    ],
  },

  // ── Auth (Carbon `Content`) ────────────────────────────────────────────────
  {
    element: <AuthLayout />,
    children: [
      { path: 'signin', element: <LazyRouteWrapper><SignInPage /></LazyRouteWrapper> },
      { path: 'signup', element: <LazyRouteWrapper><SignUpPage /></LazyRouteWrapper> },
      { path: 'forgot-password', element: <LazyRouteWrapper><ForgotPasswordPage /></LazyRouteWrapper> },
    ],
  },

  // ── Survey Builder (guest + authed) ────────────────────────────────────────
  {
    element: <SurveyBuilderLayout />,
    path: 'surveys',
    children: [
      { path: 'new', element: <LazyRouteWrapper><NewSurveyPage /></LazyRouteWrapper> },
      { path: ':id/edit', element: <LazyRouteWrapper><SurveyEditPage /></LazyRouteWrapper> },
    ],
  },

  // ── Authenticated App ──────────────────────────────────────────────────────
  {
    element: <AppLayout />,
    path: 'app',
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <LazyRouteWrapper><DashboardPage /></LazyRouteWrapper> },
      { path: 'surveys', element: <LazyRouteWrapper><SurveysListPage /></LazyRouteWrapper> },
      { path: 'surveys/new', element: <LazyRouteWrapper><NewSurveyPage /></LazyRouteWrapper> },
      { path: 'surveys/:id/edit', element: <LazyRouteWrapper><SurveyEditPage /></LazyRouteWrapper> },
      { path: 'surveys/:id/responses', element: <LazyRouteWrapper><SurveyResponsesPage /></LazyRouteWrapper> },
      { path: 'surveys/:id/analytics', element: <LazyRouteWrapper><SurveyAnalyticsPage /></LazyRouteWrapper> },
      { path: 'surveys/:id/settings', element: <LazyRouteWrapper><SurveySettingsPage /></LazyRouteWrapper> },
      { path: 'templates', element: <LazyRouteWrapper><AppTemplatesPage /></LazyRouteWrapper> },
      { path: 'integrations', element: <LazyRouteWrapper><IntegrationsPage /></LazyRouteWrapper> },
      { path: 'team', element: <LazyRouteWrapper><TeamPage /></LazyRouteWrapper> },
      { path: 'billing', element: <LazyRouteWrapper><BillingPage /></LazyRouteWrapper> },
      { path: 'api-keys', element: <LazyRouteWrapper><ApiKeysPage /></LazyRouteWrapper> },
      { path: 'settings', element: <LazyRouteWrapper><SettingsPage /></LazyRouteWrapper> },
    ],
  },

  // ── Public Survey (no layout) ──────────────────────────────────────────────
  { path: 's/:id', element: <LazyRouteWrapper><PublicSurveyPage /></LazyRouteWrapper> },
  { path: 's/:id/thank-you', element: <LazyRouteWrapper><ThankYouPage /></LazyRouteWrapper> },
]);
