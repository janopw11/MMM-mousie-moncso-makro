import { useCallback, useEffect, useState } from 'react';
import { summaryApi } from '../api/endpoints';
import type { DaySummaryDto } from '../types/api';

export function useDaySummary(userId: number | null, dateKey: string) {
  const [summary, setSummary] = useState<DaySummaryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (userId === null) return;
    setLoading(true);
    setError(null);
    try {
      const data = await summaryApi.getDay(userId, dateKey);
      setSummary(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load day summary');
    } finally {
      setLoading(false);
    }
  }, [userId, dateKey]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { summary, loading, error, reload };
}
