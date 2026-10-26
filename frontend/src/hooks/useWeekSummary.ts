import { useCallback, useEffect, useState } from 'react';
import { summaryApi } from '../api/endpoints';
import type { WeekSummaryDto } from '../types/api';

export function useWeekSummary(userId: number | null, weekStartKey: string) {
  const [summary, setSummary] = useState<WeekSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (userId === null) return;
    setLoading(true);
    setError(null);
    try {
      const data = await summaryApi.getWeek(userId, weekStartKey);
      setSummary(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load week summary');
    } finally {
      setLoading(false);
    }
  }, [userId, weekStartKey]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { summary, loading, error, reload };
}
