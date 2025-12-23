import { format, isToday, isTomorrow, isPast } from "date-fns";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import type { Event } from "@/types";

interface UpcomingEventsProps {
  events: Event[];
  onEventClick: (event: Event) => void;
}

export default function UpcomingEvents({
  events,
  onEventClick,
}: UpcomingEventsProps) {
  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "MMM d");
  };

  const sortedEvents = [...events].sort((a, b) => {
    return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
  });

  const upcomingEvents = sortedEvents.filter(
    (event) => !isPast(new Date(event.end_time))
  );

  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Upcoming Events</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {upcomingEvents.length} event{upcomingEvents.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Events list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {upcomingEvents.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">No upcoming events</p>
            <p className="text-xs text-muted-foreground mt-1">
              Create your first event to get started
            </p>
          </div>
        ) : (
          upcomingEvents.map((event) => {
            const startDate = new Date(event.start_time);
            const endDate = new Date(event.end_time);

            return (
              <div
                key={event.id}
                onClick={() => onEventClick(event)}
                className="rounded-lg border border-border bg-background p-3 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer"
              >
                {/* Date badge */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-primary">
                    {getDateLabel(startDate)}
                  </span>
                  {event.status && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        event.status === "confirmed"
                          ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                          : event.status === "tentative"
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400"
                          : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
                      }`}
                    >
                      {event.status}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="font-semibold mb-2 line-clamp-2">
                  {event.title}
                </h3>

                {/* Time */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    {format(startDate, "h:mm a")} - {format(endDate, "h:mm a")}
                  </span>
                </div>

                {/* Location */}
                {event.location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="truncate">{event.location}</span>
                  </div>
                )}

                {/* Attendees count - TODO: Implement when event_attendees table is synced */}
                {/* {event.attendee_count && event.attendee_count > 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    <span>{event.attendee_count} attendee{event.attendee_count !== 1 ? "s" : ""}</span>
                  </div>
                )} */}

                {/* Description preview */}
                {event.description && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {event.description}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
