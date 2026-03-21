import { Component, type ReactNode, type ErrorInfo } from 'react';
import { Button, InlineNotification, Tile } from '@carbon/react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // In development, log to console for debugging
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught:', error, errorInfo);
    }
    // In production, send to error tracking service (e.g., Sentry)
    // Example: Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Tile className="error-boundary">
          <InlineNotification
            kind="error"
            title="Something went wrong"
            subtitle={this.state.error?.message ?? 'An unexpected error occurred.'}
            hideCloseButton
          />
          <div className="error-boundary__action">
            <Button kind="ghost" size="sm" onClick={this.handleReset}>
              Try again
            </Button>
          </div>
        </Tile>
      );
    }

    return this.props.children;
  }
}
