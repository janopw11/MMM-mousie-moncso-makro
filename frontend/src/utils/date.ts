import { addDays, format, parseISO, startOfWeek } from 'date-fns';

export const DATE_FORMAT = 'yyyy-MM-dd';

export function toDateKey(date: Date): string {
  return format(date, DATE_FORMAT);
}

export function parseDateKey(dateKey: string): Date {
  return parseISO(dateKey);
}

export function getWeekStart(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 });
}

export function getWeekDays(weekStartKey: string): Date[] {
  const start = parseDateKey(weekStartKey);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function shiftWeek(weekStartKey: string, deltaWeeks: number): string {
  const start = parseDateKey(weekStartKey);
  return toDateKey(addDays(start, deltaWeeks * 7));
}

export function formatDayLabel(date: Date): string {
  return format(date, 'EEE');
}

export function formatDayOfMonth(date: Date): string {
  return format(date, 'd MMM');
}

export function isSameDateKey(a: string, b: string): boolean {
  return a === b;
}
