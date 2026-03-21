import type { ApiError } from '@/types/api';

/**
 * Error messages for common error codes
 */
const ERROR_MESSAGES: Record<string, string> = {
  // Auth errors
  UNAUTHORIZED: 'You need to sign in to continue.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists.',
  TOKEN_EXPIRED: 'Your session has expired. Please sign in again.',
  PASSWORD_TOO_WEAK: 'Password must be at least 8 characters.',
  INVALID_RESET_TOKEN: 'This password reset link has expired or is invalid.',

  // Survey errors
  SURVEY_NOT_FOUND: 'Survey not found.',
  SURVEY_CLOSED: 'This survey is no longer accepting responses.',
  SURVEY_NOT_ACTIVE: 'This survey is not yet active.',
  SURVEY_LIMIT_REACHED: 'You have reached your survey limit.',
  RESPONSE_LIMIT_REACHED: 'This survey has reached its response limit.',

  // Organization errors
  ORG_NOT_FOUND: 'Organization not found.',
  MEMBER_NOT_FOUND: 'Team member not found.',
  INVITATION_FAILED: 'Failed to send invitation.',
  ALREADY_MEMBER: 'This user is already a team member.',

  // Billing errors
  PAYMENT_FAILED: 'Payment failed. Please try a different payment method.',
  SUBSCRIPTION_CANCELLED: 'Your subscription has been cancelled.',
  PLAN_NOT_AVAILABLE: 'This plan is not available.',

  // Generic errors
  VALIDATION_ERROR: 'Please check your input and try again.',
  RATE_LIMITED: 'Too many requests. Please wait a moment and try again.',
  NETWORK_ERROR: 'Unable to connect to the server. Please check your connection.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
};

/**
 * Parse an API error and return a user-friendly message
 */
export function getErrorMessage(error: unknown, fallback = 'An error occurred'): string {
  // Handle API errors with code
  if (isApiError(error)) {
    return ERROR_MESSAGES[error.code] || error.message || fallback;
  }

  // Handle Axios/fetch errors with response
  if (isResponseError(error)) {
    const apiError = error.response?.data as ApiError | undefined;
    if (apiError?.code) {
      return ERROR_MESSAGES[apiError.code] || apiError.message || fallback;
    }
    const status = error.response?.status;
    if (status === 401) {
      return ERROR_MESSAGES.UNAUTHORIZED;
    }
    if (status === 429) {
      return ERROR_MESSAGES.RATE_LIMITED;
    }
    if (status !== undefined && status >= 500) {
      return 'Server error. Please try again later.';
    }
  }

  // Handle network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  // Handle generic Error objects
  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}

/**
 * Type guard for API errors
 */
function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  );
}

/**
 * Type guard for response errors (Axios/Ky style)
 */
interface ResponseError {
  response?: {
    status?: number;
    data?: unknown;
  };
}

function isResponseError(error: unknown): error is ResponseError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  );
}

/**
 * Log error to console in development, or to error tracking service in production
 */
export function logError(error: unknown, context?: string): void {
  if (import.meta.env.DEV) {
    console.error(`[${context || 'Error'}]`, error);
  }
  // In production, send to error tracking service
  // Example: Sentry.captureException(error, { tags: { context } });
}

/**
 * Create a toast message from an error
 */
export function getErrorToast(error: unknown): { kind: 'error'; message: string } {
  return {
    kind: 'error',
    message: getErrorMessage(error),
  };
}

/**
 * Create a success toast message
 */
export function getSuccessToast(message: string): { kind: 'success'; message: string } {
  return { kind: 'success', message };
}
