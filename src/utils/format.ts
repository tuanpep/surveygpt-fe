/**
 * Format a date as a human-readable "time ago" string.
 */
export function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

/**
 * Format duration in milliseconds as a short string (e.g. "45s", "3m").
 */
export function formatDurationShort(ms?: number): string {
  if (!ms) return '—';
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m`;
}

/**
 * Format duration in milliseconds as a detailed string (e.g. "1m 23s").
 */
export function formatDurationMs(ms?: number): string {
  if (!ms) return '—';
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainSec = seconds % 60;
  return `${minutes}m ${remainSec}s`;
}

/**
 * Return the Carbon Tag type for a survey status.
 */
export function getSurveyStatusTagType(status: string) {
  switch (status) {
    case 'active': return 'green' as const;
    case 'closed': return 'red' as const;
    case 'archived': return 'cool-gray' as const;
    default: return 'gray' as const;
  }
}

/**
 * Return the Carbon Tag type for a response status.
 */
export function getResponseStatusType(status: string) {
  switch (status) {
    case 'completed': return 'green' as const;
    case 'partial': return 'warm-gray' as const;
    case 'disqualified': return 'red' as const;
    default: return 'gray' as const;
  }
}

/**
 * Return the Carbon Tag type for a response source.
 */
export function getSourceType(source?: string) {
  switch (source) {
    case 'web': return 'blue' as const;
    case 'email': return 'purple' as const;
    case 'embed': return 'cyan' as const;
    case 'qr': return 'green' as const;
    case 'api': return 'cool-gray' as const;
    default: return 'gray' as const;
  }
}
