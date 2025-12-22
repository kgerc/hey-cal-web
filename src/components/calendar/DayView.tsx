import { format, startOfDay, addHours, isSameHour } from "date-fns";
import type { Event } from "@/types";
import { Clock } from "lucide-react";

interface DayViewProps {
  date: Date;
  events: Event[];
  onEventClick: (event: Event) => void;
  onTimeSlotClick: (date: Date) => void;
}

export default function DayView({
  date,
  events,
  onEventClick,
  onTimeSlotClick,
}: DayViewProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const dayStart = startOfDay(date);

  const getEventsForHour = (hour: number) => {
    const hourStart = addHours(dayStart, hour);
    return events.filter((event) => {
      const eventStart = new Date(event.start_time);
      return isSameHour(eventStart, hourStart);
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-card p-4">
        <h2 className="text-xl font-semibold">{format(date, "EEEE, MMMM d, yyyy")}</h2>
      </div>

      {/* Time slots */}
      <div className="flex-1 overflow-y-auto">
        <div className="relative">
          {hours.map((hour) => {
            const hourEvents = getEventsForHour(hour);
            const timeSlot = addHours(dayStart, hour);

            return (
              <div
                key={hour}
                className="flex border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => onTimeSlotClick(timeSlot)}
              >
                {/* Time label */}
                <div className="w-20 flex-shrink-0 p-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    {format(timeSlot, "h:mm a")}
                  </div>
                </div>

                {/* Events */}
                <div className="flex-1 min-h-[60px] p-2 space-y-1">
                  {hourEvents.map((event) => (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      className="rounded-lg border-l-4 border-primary bg-primary/10 p-2 hover:bg-primary/20 transition-colors cursor-pointer"
                    >
                      <div className="font-semibold text-sm">{event.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(event.start_time), "h:mm a")} -{" "}
                        {format(new Date(event.end_time), "h:mm a")}
                      </div>
                      {event.location && (
                        <div className="text-xs text-muted-foreground mt-1">
                          📍 {event.location}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
