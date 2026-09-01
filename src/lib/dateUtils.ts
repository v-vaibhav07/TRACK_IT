/**
 * All dates in this app are represented as plain "YYYY-MM-DD" strings
 * (matching Postgres `date` columns) to avoid timezone drift. We derive
 * "today" in the user's profile timezone (default Asia/Kolkata) rather
 * than the browser's local timezone, so streaks are consistent no matter
 * where the user opens the app from.
 */

const DEFAULT_TIMEZONE = "Asia/Kolkata";

export function todayInTimezone(timezone: string = DEFAULT_TIMEZONE): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  // en-CA formats as YYYY-MM-DD
  return formatter.format(new Date());
}

export function formatLongDate(dateStr: string): string {
  const date = parseDate(dateStr);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function toDateStr(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(dateStr: string, amount: number): string {
  const date = parseDate(dateStr);
  date.setUTCDate(date.getUTCDate() + amount);
  return toDateStr(date);
}

export function addMonths(dateStr: string, amount: number): string {
  const date = parseDate(dateStr);
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + amount);
  const daysInMonth = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)
  ).getUTCDate();
  date.setUTCDate(Math.min(day, daysInMonth));
  return toDateStr(date);
}

export function getMonthLabel(dateStr: string): string {
  const date = parseDate(dateStr);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function getMonthKey(dateStr: string): string {
  return dateStr.slice(0, 7); // YYYY-MM
}

/** First day (Monday) through last day (Sunday) grid, including
 * leading/trailing days from neighboring months, Monday-first weeks. */
export function getMonthGrid(dateStr: string): string[] {
  const date = parseDate(dateStr);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();

  const firstOfMonth = new Date(Date.UTC(year, month, 1));
  const lastOfMonth = new Date(Date.UTC(year, month + 1, 0));

  // JS getUTCDay: 0=Sun..6=Sat. We want Monday-first offset.
  const firstWeekday = (firstOfMonth.getUTCDay() + 6) % 7; // 0=Mon..6=Sun
  const lastWeekday = (lastOfMonth.getUTCDay() + 6) % 7;

  const start = new Date(firstOfMonth);
  start.setUTCDate(start.getUTCDate() - firstWeekday);

  const end = new Date(lastOfMonth);
  end.setUTCDate(end.getUTCDate() + (6 - lastWeekday));

  const days: string[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    days.push(toDateStr(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
}

export function isSameMonth(dateStr: string, monthAnchor: string): boolean {
  return getMonthKey(dateStr) === getMonthKey(monthAnchor);
}

export { DEFAULT_TIMEZONE };
