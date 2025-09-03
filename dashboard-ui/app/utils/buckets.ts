import { DashboardFilter, DEFAULT_FILTER, Period } from "@/store/dashboardFilter";

export interface Bucket {
  key: string; // ISO date (YYYY-MM-DD) or YYYY-MM for months
  label: string;
  value: number;
  monthIndex?: number;
}

export const MONTH_LABELS = [
  "Янв",
  "Фев",
  "Мар",
  "Апр",
  "Май",
  "Июн",
  "Июл",
  "Авг",
  "Сен",
  "Окт",
  "Ноя",
  "Дек",
];

export function getPeriodRange(filter?: DashboardFilter): { start: Date; end: Date } {
  const f = filter ?? DEFAULT_FILTER
  if (f.period === 'range') {
    if (f.from && f.to) {
      return { start: new Date(f.from), end: new Date(f.to) }
    }
    // fallback to default day when range is incomplete
  }
  const period = f.period === 'range' ? 'day' : f.period
  const now = new Date()
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate()) // local midnight
  switch (period) {
    case 'day': {
      return { start: end, end }
    }
    case 'week': {
      const day = (end.getDay() + 6) % 7 // 0=Mon
      const start = new Date(end)
      start.setDate(end.getDate() - day)
      const weekEnd = new Date(start)
      weekEnd.setDate(start.getDate() + 6)
      return { start, end: weekEnd }
    }
    case 'month': {
      const start = new Date(end.getFullYear(), end.getMonth(), 1)
      const monthEnd = new Date(end.getFullYear(), end.getMonth() + 1, 0)
      return { start, end: monthEnd }
    }
    case 'year': {
      const start = new Date(end.getFullYear(), 0, 1)
      const yearEnd = new Date(end.getFullYear(), 11, 31)
      return { start, end: yearEnd }
    }
    default:
      return { start: end, end }
  }
}

export function buildBuckets(
  range: { start: Date; end: Date },
  period: Period
): Bucket[] {
  const buckets: Bucket[] = [];
  if (period === "year") {
    for (let m = 0; m < 12; m++) {
      const year = range.start.getFullYear();
      buckets.push({
        key: `${year}-${String(m + 1).padStart(2, "0")}`,
        label: MONTH_LABELS[m],
        monthIndex: m,
        value: 0,
      });
    }
    return buckets;
  }
  const current = new Date(range.start);
  current.setHours(0, 0, 0, 0);
  const end = new Date(range.end);
  end.setHours(0, 0, 0, 0);
  while (current <= end) {
    const key = current.toISOString().slice(0, 10);
    buckets.push({
      key,
      label: current.toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
      }),
      value: 0,
    });
    current.setDate(current.getDate() + 1);
  }
  return buckets;
}
