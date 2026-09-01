import { useCallback, useEffect, useMemo, useState } from "react";
import type { DailyActivity } from "../types/database";
import { fetchActivityRange, fetchRecentActivity } from "../services/activityService";
import { addDays, addMonths } from "../lib/dateUtils";
import { useToast } from "./useToast";

/** Loads enough activity history to cover the visible calendar month
 * plus a comfortable lookback window for streak calculation, and keeps
 * it as a Map keyed by date for O(1) lookups. */
export function useActivity(userId: string | null, monthAnchor: string, today: string) {
  const [activity, setActivity] = useState<DailyActivity[]>([]);
  const [recent, setRecent] = useState<DailyActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const rangeStart = useMemo(() => {
    // cover current visible month, plus prior month for streak lookback
    const monthStart = monthAnchor.slice(0, 8) + "01";
    return addDays(addMonths(monthStart, -2), 0);
  }, [monthAnchor]);

  const rangeEnd = useMemo(() => {
    const monthStart = monthAnchor.slice(0, 8) + "01";
    const nextMonthStart = addMonths(monthStart, 1);
    return addDays(nextMonthStart, -1);
  }, [monthAnchor]);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [rangeData, recentData] = await Promise.all([
        fetchActivityRange(userId, rangeStart, rangeEnd),
        fetchRecentActivity(userId, 6),
      ]);
      setActivity(rangeData);
      setRecent(recentData);
    } catch {
      showToast("Couldn't load activity history.", "error");
    } finally {
      setLoading(false);
    }
  }, [userId, rangeStart, rangeEnd, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const activityByDate = useMemo(() => {
    const map = new Map<string, DailyActivity>();
    for (const row of activity) map.set(row.activity_date, row);
    return map;
  }, [activity]);

  return { activityByDate, recent, loading, reload: load, today };
}
