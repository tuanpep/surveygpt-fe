import { useLiveResponseCount } from '@/hooks/useSSE';

interface LiveResponseCounterProps {
  surveyId: string;
  initialCount?: number;
  showLabel?: boolean;
}

export function LiveResponseCounter({
  surveyId,
  initialCount = 0,
  showLabel = true,
}: LiveResponseCounterProps) {
  const { responseCount, isConnected } = useLiveResponseCount(surveyId, true);

  const displayCount = responseCount ?? initialCount;

  return (
    <div className="live-counter">
      {isConnected && <span className="live-counter__dot" />}
      <span className="live-counter__count">{displayCount}</span>
      {showLabel && <span className="live-counter__label">responses</span>}
    </div>
  );
}
