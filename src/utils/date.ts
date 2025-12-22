import { format, parseISO, isToday, isTomorrow, isThisWeek, addDays } from "date-fns";

export function formatEventDate(dateString: string): string {
  const date = parseISO(dateString);

  if (isToday(date)) {
    return `Today at ${format(date, "h:mm a")}`;
  }

  if (isTomorrow(date)) {
    return `Tomorrow at ${format(date, "h:mm a")}`;
  }

  if (isThisWeek(date)) {
    return format(date, "EEEE 'at' h:mm a");
  }

  return format(date, "MMM d 'at' h:mm a");
}

export function formatEventTime(startString: string, endString: string): string {
  const start = parseISO(startString);
  const end = parseISO(endString);

  return `${format(start, "h:mm a")} - ${format(end, "h:mm a")}`;
}

export function getUpcomingDates(days: number = 7): Date[] {
  const dates: Date[] = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    dates.push(addDays(today, i));
  }

  return dates;
}

export function formatDateForInput(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

export function parseDateFromInput(dateString: string): Date {
  return parseISO(dateString);
}
