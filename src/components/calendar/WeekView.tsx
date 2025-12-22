import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addHours,
  isSameHour,
  isSameDay,
  startOfDay,
} from "date-fns";
import type { Event } from "@/types";
import { Clock } from "lucide-react";

interface WeekViewProps {
  date: Date;
  events: Event[];
  onEventClick: (event: Event) => void;
  onTimeSlotClick: (date: Date) => void;
}

export default function WeekView({
  date,
  events,
  onEventClick,
  onTimeSlotClick,
}: WeekViewProps) {
  const weekStart = startOfWeek(date, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(date, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getEventsForDayAndHour = (day: Date, hour: number) => {
    const hourStart = addHours(startOfDay(day), hour);
    return events.filter((event) => {
      const eventStart = new Date(event.start_time);
      return isSameDay(eventStart, day) && isSameHour(eventStart, hourStart);
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with days */}
      <div className="flex border-b border-border bg-card">
        <div className="w-20 flex-shrink-0 border-r border-border p-2"></div>
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className="flex-1 p-3 text-center border-r border-border last:border-r-0"
          >
            <div className="text-xs text-muted-foreground">
              {format(day, "EEE")}
            </div>
            <div
              className={`text-lg font-semibold ${
                isSameDay(day, new Date())
                  ? "text-primary"
                  : ""
              }`}
            >
              {format(day, "d")}
            </div>
          </div>
        ))}
      </div>

      {/* Time slots grid */}
      <div className="flex-1 overflow-y-auto">
        {hours.map((hour) => (
          <div key={hour} className="flex border-b border-border">
            {/* Time label */}
            <div className="w-20 flex-shrink-0 border-r border-border p-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {format(addHours(new Date(0), hour), "h a")}
              </div>
            </div>

            {/* Day columns */}
            {days.map((day) => {
              const dayEvents = getEventsForDayAndHour(day, hour);
              const timeSlot = addHours(startOfDay(day), hour);

              return (
                <div
                  key={`${day.toISOString()}-${hour}`}
                  className="flex-1 min-h-[60px] p-1 border-r border-border last:border-r-0 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => onTimeSlotClick(timeSlot)}
                >
                  <div className="space-y-1">
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                        className="rounded border-l-2 border-primary bg-primary/10 px-1 py-0.5 text-xs hover:bg-primary/20 transition-colors cursor-pointer"
                      >
                        <div className="font-semibold truncate">
                          {event.title}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {format(new Date(event.start_time), "h:mm a")}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
