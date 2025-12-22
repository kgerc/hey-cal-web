import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import type { Event } from "@/types";

interface MonthViewProps {
  date: Date;
  events: Event[];
  onEventClick: (event: Event) => void;
  onDayClick: (date: Date) => void;
}

export default function MonthView({
  date,
  events,
  onEventClick,
  onDayClick,
}: MonthViewProps) {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => {
      const eventStart = new Date(event.start_time);
      return isSameDay(eventStart, day);
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border bg-card p-4">
        <h2 className="text-xl font-semibold">{format(date, "MMMM yyyy")}</h2>
      </div>

      {/* Week day headers */}
      <div className="grid grid-cols-7 border-b border-border bg-muted/50">
        {weekDays.map((day) => (
          <div
            key={day}
            className="border-r border-border p-2 text-center text-sm font-semibold text-muted-foreground last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 grid grid-cols-7 grid-rows-5 overflow-hidden">
        {days.map((day) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, date);
          const isDayToday = isToday(day);

          return (
            <div
              key={day.toISOString()}
              onClick={() => onDayClick(day)}
              className={`border-r border-b border-border p-2 hover:bg-muted/50 transition-colors cursor-pointer ${
                !isCurrentMonth ? "bg-muted/20" : ""
              }`}
            >
              {/* Day number */}
              <div
                className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                  isDayToday
                    ? "bg-primary text-white"
                    : !isCurrentMonth
                    ? "text-muted-foreground"
                    : ""
                }`}
              >
                {format(day, "d")}
              </div>

              {/* Events */}
              <div className="mt-1 space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                    className="rounded border-l-2 border-primary bg-primary/10 px-1 py-0.5 text-xs hover:bg-primary/20 transition-colors truncate"
                  >
                    <div className="font-medium truncate">{event.title}</div>
                    {event.start_time && (
                      <div className="text-[10px] text-muted-foreground">
                        {format(new Date(event.start_time), "h:mm a")}
                      </div>
                    )}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-muted-foreground px-1">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
